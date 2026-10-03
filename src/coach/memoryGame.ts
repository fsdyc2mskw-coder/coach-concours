// CHANGE_REQUEST_018 — the memory game: the rules of play of the four cards,
// kept free of React so every move and every score can be tested directly.
// The screens (`MemoryGame.tsx`) only translate a finger into these calls.
//
// Nothing here keeps progress between games (every game starts fresh), and
// nothing here measures time: there is no timer, no streak and no prediction.
import { MEMORY_CARD_MAX, memoryCardDrill, memoryCycleOf, type MemoryCard } from './memoryCycle';
import { FLOOR_PLAN, GAME_STATIONS, MISSING_ROUNDS, RULES_PICTURES, type StationId } from './memoryGameAssets';
import { weekNumberOf } from './planner';
import { isSessionShape } from './sessionShapes';
import type { DrillScore, SessionRecipe, SessionResult, TrainingWeek } from './types';

export const STATION_BY_ID: Readonly<Record<StationId, (typeof GAME_STATIONS)[number]>> =
  Object.fromEntries(GAME_STATIONS.map((station) => [station.id, station])) as Record<StationId, (typeof GAME_STATIONS)[number]>;

// ---------- PLAN and ORDRE: tiles dropped into slots ----------

/**
 * Which tile sits in which slot. PLAN's slots are the 11 boxes, each named
 * after the station that belongs there (box `s4` is Mannequin's place);
 * ORDRE's slots are the lines 1 to 11. A tile absent from every slot is in
 * the tray.
 */
export type Placement<Slot extends string | number> = Partial<Record<Slot, StationId>>;

/**
 * Drops `tile` into `slot`. The tile leaves the slot it came from; a different
 * tile already in `slot` goes back to the tray (CR section A, PLAN and ORDRE).
 */
export function placeTile<Slot extends string | number>(placement: Placement<Slot>, tile: StationId, slot: Slot): Placement<Slot> {
  const next: Placement<Slot> = {};
  for (const [key, value] of Object.entries(placement) as Array<[Slot, StationId | undefined]>) {
    if (value !== undefined && value !== tile && key !== slot) next[key] = value;
  }
  next[slot] = tile;
  return next;
}

/** Sends `tile` back to the tray. */
export function returnToTray<Slot extends string | number>(placement: Placement<Slot>, tile: StationId): Placement<Slot> {
  const next: Placement<Slot> = {};
  for (const [key, value] of Object.entries(placement) as Array<[Slot, StationId | undefined]>) {
    if (value !== undefined && value !== tile) next[key] = value;
  }
  return next;
}

export function slotOf<Slot extends string | number>(placement: Placement<Slot>, tile: StationId): Slot | undefined {
  return (Object.entries(placement) as Array<[Slot, StationId | undefined]>).find(([, value]) => value === tile)?.[0];
}

export function placedCount<Slot extends string | number>(placement: Placement<Slot>): number {
  return Object.values(placement).filter((value) => value !== undefined).length;
}

// ---------- PLAN ----------

export const PLAN_BOX_PX = 62;
export const PLAN_SNAP_PX = 42;

/**
 * The centre of each box on a room drawn `width` × `height` px, from the floor
 * plan's fractions. A box that would cross the room border is shifted inside
 * it (the assets file: s5 on a 366 px room).
 */
export function planBoxCentres(width: number, height: number, box = PLAN_BOX_PX): Record<StationId, { x: number; y: number }> {
  const half = box / 2;
  const clamp = (value: number, max: number) => Math.min(Math.max(value, half), max - half);
  return Object.fromEntries(GAME_STATIONS.map(({ id }) => [id, {
    x: clamp(FLOOR_PLAN[id].nx * width, width),
    y: clamp(FLOOR_PLAN[id].ny * height, height)
  }])) as Record<StationId, { x: number; y: number }>;
}

/** The box whose centre is nearest to the drop point, within ~42 px; null otherwise. */
export function snapBox(point: { x: number; y: number }, centres: Partial<Record<StationId, { x: number; y: number }>>, radius = PLAN_SNAP_PX): StationId | null {
  let best: StationId | null = null;
  let bestDistance = Infinity;
  for (const [id, centre] of Object.entries(centres) as Array<[StationId, { x: number; y: number }]>) {
    const distance = Math.hypot(point.x - centre.x, point.y - centre.y);
    if (distance <= radius && distance < bestDistance) { best = id; bestDistance = distance; }
  }
  return best;
}

/** PLAN's verdict per filled box: true when the right station sits in it. */
export function checkPlan(placement: Placement<StationId>): Partial<Record<StationId, boolean>> {
  const verdict: Partial<Record<StationId, boolean>> = {};
  for (const [box, tile] of Object.entries(placement) as Array<[StationId, StationId | undefined]>) {
    if (tile !== undefined) verdict[box] = tile === box;
  }
  return verdict;
}

/** Right boxes, out of 11. */
export function scorePlan(placement: Placement<StationId>): number {
  return Object.values(checkPlan(placement)).filter(Boolean).length;
}

// ---------- ORDRE ----------

export const ORDER_LINES: readonly number[] = GAME_STATIONS.map((station) => station.number);
export const TAP_MAX_MOVE_PX = 6;

/** The first line, 1 to 11, with no tile on it; null when all are taken. */
export function nextFreeLine(placement: Placement<number>): number | null {
  return ORDER_LINES.find((line) => placement[line] === undefined) ?? null;
}

/** ORDRE's verdict per filled line: true when the station of that number sits on it. */
export function checkOrder(placement: Placement<number>): Partial<Record<number, boolean>> {
  const verdict: Partial<Record<number, boolean>> = {};
  for (const line of ORDER_LINES) {
    const tile = placement[line];
    if (tile !== undefined) verdict[line] = STATION_BY_ID[tile].number === line;
  }
  return verdict;
}

/** Right places, out of 11. */
export function scoreOrder(placement: Placement<number>): number {
  return Object.values(checkOrder(placement)).filter(Boolean).length;
}

// ---------- QUI MANQUE ----------

/** Right answers, out of 3. `answers[i]` is the station picked in round i. */
export function scoreMissing(answers: readonly StationId[]): number {
  return answers.filter((answer, index) => MISSING_ROUNDS[index]?.missing === answer).length;
}

// ---------- RÈGLES ----------

/** Right answers, out of 10. `answers[i]` is what was said about picture i. */
export function scoreRules(answers: readonly ('correct' | 'faux')[]): number {
  return answers.filter((answer, index) => RULES_PICTURES[index]?.answer === answer).length;
}

/** The feedback line after an answer, word for word from CR section A: "Juste." when right, else what the picture was. */
export function rulesFeedback(answer: 'correct' | 'faux', truth: 'correct' | 'faux'): string {
  if (answer === truth) return 'Juste.';
  return truth === 'correct' ? "C'était correct." : "C'était faux.";
}

// ---------- the session side ----------

/**
 * CHANGE_REQUEST_018 section C, R-MM-05 — the video reminder sits in the
 * memory block of the week's FIRST police session, whichever shape comes
 * first once the athlete's day moves are applied, in the weeks the cycle
 * marks. It cannot be written into the recipe, which is shared by the whole
 * week and knows nothing of moves; it is laid on per session here, the way
 * CR-017's baseline is.
 */
export function withMemoryVideo(recipe: SessionRecipe, sessionId: string, weeks: readonly TrainingWeek[]): SessionRecipe {
  const week = weeks.find((item) => item.sessions.some((session) => session.id === sessionId));
  if (!week || !memoryCycleOf(weekNumberOf(week.startDate))?.video) return recipe;
  const first = week.sessions.find((session) => isSessionShape(session.kind));
  if (first?.id !== sessionId) return recipe;
  if (!recipe.blocks.some((block) => block.spec?.kind === 'memory' && block.spec.game)) return recipe;
  return {
    ...recipe,
    blocks: recipe.blocks.map((block) => (block.spec?.kind === 'memory' && block.spec.game
      ? { ...block, spec: { ...block.spec, game: { ...block.spec.game, video: true } } }
      : block))
  };
}

/**
 * Writes a finished game's score into a session's Retour record as its
 * `memory_card` value. A record that does not exist yet is created as a draft;
 * an existing one keeps its status and every other number, and its previous
 * `memory_card` score (if any) is replaced. Only ever called for a game opened
 * from a session: free play from the MÉMOIRE home records nothing (R-MM-07).
 */
export function withMemoryCardScore(
  results: Record<string, SessionResult>,
  sessionId: string,
  card: MemoryCard,
  score: number,
  completedAt: string = new Date().toISOString()
): Record<string, SessionResult> {
  const existing = results[sessionId];
  const entry: DrillScore = { drillId: memoryCardDrill(card).drillId, measure: 'memory_card', value: score, card, max: MEMORY_CARD_MAX[card] };
  const drillScores = [...(existing?.drillScores ?? []).filter((item) => item.measure !== 'memory_card'), entry];
  const base: SessionResult = existing ?? { sessionId, status: 'draft', note: '', completedAt };
  return { ...results, [sessionId]: { ...base, drillScores, completedAt } };
}

/**
 * The card the MÉMOIRE home puts first: the card of the current week's first
 * police session that has no game score yet, else the week's skill card,
 * else PLAN (before week 5 and after the test).
 */
export function featuredCard(weeks: readonly TrainingWeek[], results: Record<string, SessionResult>, today: string): MemoryCard {
  const week = weeks.find((item) => today >= item.startDate && today <= item.endDate);
  const cycle = week ? memoryCycleOf(weekNumberOf(week.startDate)) : null;
  if (!week || !cycle) return 'plan';
  for (const session of week.sessions) {
    if (!isSessionShape(session.kind)) continue;
    const card = session.kind === 'skill_session' ? cycle.skill : cycle.chain;
    if (card && !(results[session.id]?.drillScores ?? []).some((item) => item.measure === 'memory_card')) return card;
  }
  return cycle.skill;
}
