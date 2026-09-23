// CHANGE_REQUEST_014 section C — the move layer, v3 (22 September 2026).
//
// `generatePlan` is not touched: the rules keep producing the standard week
// and the moves are applied on top of the result, every time a plan is built.
// A move changes `date` and `dayLabel` only; `id`, `recipeId`, `load`,
// `phase` and `volumeFactor` stay exactly as the generator wrote them.
//
// v3: every day of the week can be dragged and can receive a session,
// including days already past — the athlete fixes the week after the fact so
// it matches what she actually did. Only the two fixed events stay locked.
// `weekly_shape.md` v4 carries the matching R-WS-14.
import { generatePlan } from './planner';
import type { DayMove, PlannedSession, SessionResult, TrainingWeek } from './types';

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// A session the athlete may pick up. The only session she may not is a
// `fixed_event`: the trail race of 11 October and the police test of
// 20 November keep their dates. A day already past is no longer a reason.
export function isMovable(session: PlannedSession): boolean {
  return session.status !== 'fixed_event';
}

// A day that can receive a drop. The only refused targets are the two
// fixed-event dates; a day already past accepts a drop like any other.
export function canReceive(week: TrainingWeek, date: string): boolean {
  return !week.sessions.some((session) => session.status === 'fixed_event' && session.date === date);
}

/**
 * Applies the stored moves to a freshly generated plan. Never throws and
 * never asks: a move it cannot honour is dropped silently, which is what
 * keeps an old move harmless after a later change request regenerates a week.
 *
 * Dropped silently:
 *  - a `sessionId` that no longer exists;
 *  - a `toDate` outside the session's own week;
 *  - a move of a `fixed_event`, or onto a date a fixed event already holds.
 *
 * A `toDate` already past is kept (v3): that is how the week comes to match
 * what the athlete actually did.
 *
 * One move per `sessionId`: when several are present, the last one wins, so a
 * new move simply replaces the previous one.
 *
 * `_reference` is the "today" the v2 signature took. Nothing in the layer is
 * relative to today any more; the parameter is kept so existing call sites
 * and tests read unchanged.
 */
export function applyDayMoves(
  weeks: TrainingWeek[],
  moves: DayMove[] | undefined,
  _reference: string = today()
): TrainingWeek[] {
  if (!moves || moves.length === 0) return weeks;

  const lastPerSession = new Map<string, DayMove>();
  for (const move of moves) lastPerSession.set(move.sessionId, move);

  const changedWeeks = new Map<number, PlannedSession[]>();
  const sessionsOf = (index: number) => changedWeeks.get(index) ?? weeks[index]!.sessions;

  for (const move of lastPerSession.values()) {
    const weekIndex = weeks.findIndex((week) => week.sessions.some((session) => session.id === move.sessionId));
    if (weekIndex === -1) continue;

    const week = weeks[weekIndex]!;
    const sessions = sessionsOf(weekIndex);
    const session = sessions.find((item) => item.id === move.sessionId)!;

    if (!isMovable(session)) continue;
    if (move.toDate < week.startDate || move.toDate > week.endDate) continue;
    if (!canReceive(week, move.toDate)) continue;
    if (move.toDate === session.date) continue;

    changedWeeks.set(
      weekIndex,
      sessions.map((item) => (item.id === move.sessionId ? { ...item, date: move.toDate, dayLabel: dayName(move.toDate) } : item))
    );
  }

  if (changedWeeks.size === 0) return weeks;
  return weeks.map((week, index) => {
    const sessions = changedWeeks.get(index);
    if (!sessions) return week;
    return { ...week, sessions: [...sessions].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)) };
  });
}

// The one call every screen uses: build the plan from the rules, then lay the
// athlete's moves on top of it.
export function planWithMoves(
  results: Record<string, SessionResult> = {},
  moves: DayMove[] | undefined = undefined,
  reference: string = today()
): TrainingWeek[] {
  return applyDayMoves(generatePlan(results), moves, reference);
}

// Replaces any earlier move of the same session, so `dayMoves` never holds
// two entries for one session.
export function withMove(moves: DayMove[] | undefined, sessionId: string, toDate: string, movedAt = new Date().toISOString()): DayMove[] {
  return [...(moves ?? []).filter((move) => move.sessionId !== sessionId), { sessionId, toDate, movedAt }];
}

function dayName(date: string): string {
  return ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'][new Date(`${date}T12:00:00Z`).getUTCDay()] ?? '';
}
