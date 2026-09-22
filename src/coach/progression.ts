// CHANGE_REQUEST_013 section D — progression from the baseline.
//
// Two read-only numbers, both derived, neither ever typed by the athlete:
//
//  · the cardio baseline: the same session shape's recorded cardio number
//    from the previous week, shown beside this week's cardio block. No
//    target, no prediction, no coaching text (R-WS-31, R-PC-04).
//
//  · the fresh-to-fatigued gap: tail B's score minus the fresh reference's
//    score, in the same session, and that gap's history over the weeks. "The
//    gap between fresh and fatigued is the number the athlete actually
//    tracks. It is computed, never typed."
import { recipeById } from './recipes';
import { freshReferenceOf, tailBOf } from './sessionShapes';
import type { DrillScore, SessionResult, SessionShape, TrainingWeek } from './types';

export interface CardioBaseline {
  value: number;
  note?: string;
  fromDate: string;
}

function scoreValue(scores: DrillScore[] | undefined, drillId: string): number | undefined {
  return scores?.find((score) => score.drillId === drillId)?.value;
}

function mean(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

/**
 * The cardio number recorded for the same session shape in the previous week,
 * or null when there is none. Read only: "A block with no baseline to compare
 * against is a measure, not a block" (R-WS-33).
 */
export function cardioBaseline(
  weeks: TrainingWeek[],
  results: Record<string, SessionResult>,
  sessionId: string
): CardioBaseline | null {
  const weekIndex = weeks.findIndex((week) => week.sessions.some((session) => session.id === sessionId));
  if (weekIndex <= 0) return null;
  const session = weeks[weekIndex]!.sessions.find((item) => item.id === sessionId)!;
  const previous = weeks[weekIndex - 1]!.sessions.find((item) => item.kind === session.kind);
  if (!previous) return null;
  const result = results[previous.id];
  if (result?.cardioValue === undefined) return null;
  return { value: result.cardioValue, ...(result.cardioNote ? { note: result.cardioNote } : {}), fromDate: previous.date };
}

export interface FreshToFatiguedGap {
  /** Mean tail-B score minus mean fresh-reference score. Higher is worse. */
  overall: number;
  freshMean: number;
  tailMean: number;
  /** Per card, so "planche" and "obstacles" can be read apart. */
  perCard: Array<{ cardId: string; label: string; fresh: number; tail: number; gap: number }>;
}

/**
 * The gap for one session. Returns null until both the fresh reference and at
 * least one tail-B minute have been scored — a shortened tail still counts
 * (R-WS-38), so this never waits for all four minutes.
 */
export function freshToFatiguedGap(recipeId: string, result: SessionResult | undefined): FreshToFatiguedGap | null {
  const recipe = recipeById[recipeId];
  if (!recipe || !result) return null;
  const fresh = freshReferenceOf(recipe);
  const tail = tailBOf(recipe);
  if (!fresh || !tail) return null;

  const freshValues: number[] = [];
  const perCard: FreshToFatiguedGap['perCard'] = [];
  for (const drill of fresh.drills) {
    const value = scoreValue(result.drillScores, drill.drillId);
    if (value === undefined) continue;
    freshValues.push(value);
    const tailValues = tail.minutes
      .filter((minute) => minute.drill.cardId === drill.cardId)
      .map((minute) => scoreValue(result.drillScores, minute.drill.drillId))
      .filter((item): item is number => item !== undefined);
    if (tailValues.length > 0) {
      perCard.push({ cardId: drill.cardId, label: drill.label, fresh: value, tail: mean(tailValues), gap: mean(tailValues) - value });
    }
  }

  const tailValues = tail.minutes
    .map((minute) => scoreValue(result.drillScores, minute.drill.drillId))
    .filter((item): item is number => item !== undefined);
  if (freshValues.length === 0 || tailValues.length === 0) return null;

  const freshMean = mean(freshValues);
  const tailMean = mean(tailValues);
  return { overall: tailMean - freshMean, freshMean, tailMean, perCard };
}

export interface GapHistoryEntry {
  weekStart: string;
  date: string;
  gap: number;
}

/**
 * The gap week after week, oldest first — "It should shrink week after week."
 * Only weeks whose tail session has both numbers recorded appear.
 */
export function gapHistory(
  weeks: TrainingWeek[],
  results: Record<string, SessionResult>,
  kind: SessionShape = 'chain_session'
): GapHistoryEntry[] {
  const history: GapHistoryEntry[] = [];
  for (const week of weeks) {
    for (const session of week.sessions) {
      if (session.kind !== kind) continue;
      const gap = freshToFatiguedGap(session.recipeId, results[session.id]);
      if (gap) history.push({ weekStart: week.startDate, date: session.date, gap: gap.overall });
    }
  }
  return history;
}
