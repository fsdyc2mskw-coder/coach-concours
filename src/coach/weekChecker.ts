// CHANGE_REQUEST_014 section D — the checker.
//
// It reads the intensity the app already draws: `load === 'hard' | 'event'`
// is a hard day (three bars), `moderate` is two bars, `low` is one. It is a
// pure function: it never blocks a move, never rewrites the plan and never
// writes a file. The athlete decides.
//
// Order of the flags follows the mockup (`handoffs/MOCKUP_CR014.html`): the
// stack flags alone when any day is stacked, then C2, then the neighbour
// checks day by day (C1, C5, C4), then C3, then C6.
import { recipeById } from './recipes';
import type { PlannedSession, TrainingWeek } from './types';

export type FlagCode = 'STACK' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';

export interface Flag {
  code: FlagCode;
  // `true` only for C2 (R-WS-10), the one hard rule among these checks: shown
  // in red instead of amber.
  hard: boolean;
  // The day the ⚠ is drawn on.
  date: string;
  // Rendered as `<b>{lead}</b> {text}` — the mockup's bold lead-in, kept as
  // two fields so the app never has to inject HTML.
  lead: string;
  text: string;
}

// CHANGE_REQUEST_014 names `run_intervals` (CR-011). CR-011 is not on `main`
// (it was reverted, see the APP_REPORT), so the kind the running-intervals
// session carries today is `running_intervals_exception`. Both names are
// listed and matched as plain strings, so the checks are already live the day
// CR-011 lands and stay live for Week 1's documented Tuesday exception.
const RUN_INTERVAL_KINDS: readonly string[] = ['run_intervals', 'running_intervals_exception'];
const RUN_KINDS: readonly string[] = [...RUN_INTERVAL_KINDS, 'trail_maintenance', 'trail_event'];
const POLICE_KINDS: readonly string[] = ['police_technique', 'police_strength_transitions', 'police_integration', 'police_mock_test'];

const isHard = (session: PlannedSession) => session.load === 'hard' || session.load === 'event';
const isRun = (session: PlannedSession) => RUN_KINDS.includes(session.kind);
const isRunIntervals = (session: PlannedSession) => RUN_INTERVAL_KINDS.includes(session.kind);

// C4 reads the session's own HIIT block: a police session whose one hiit
// block has format `intervals` is a second running stimulus (R-WS-08).
function hasIntervalHiit(session: PlannedSession): boolean {
  if (!POLICE_KINDS.includes(session.kind)) return false;
  const blocks = (recipeById[session.recipeId]?.blocks ?? []).filter((block) => block.hiit);
  return blocks.length === 1 && blocks[0]!.hiit!.format === 'intervals';
}

export function checkWeek(week: TrainingWeek): Flag[] {
  const flags: Flag[] = [];
  const dates = daysOf(week);
  const sessionsOn = (date: string) => week.sessions.filter((session) => session.date === date);

  // STACK: while any day holds two sessions or more, the checker returns only
  // the stack flags. Every other check is silent until the second session is
  // moved on.
  const stacked = dates.filter((date) => sessionsOn(date).length > 1);
  if (stacked.length > 0) {
    for (const date of stacked) {
      const titles = sessionsOn(date).map((session) => recipeById[session.recipeId]?.title ?? session.kind).join(' + ');
      flags.push({
        code: 'STACK', hard: false, date,
        lead: `Deux séances le ${label(date)}`,
        text: `: ${titles}. Déplace la seconde quand tu veux, rien d’autre n’est vérifié tant qu’elles sont ensemble.`
      });
    }
    return flags;
  }

  const filled = dates.map((date) => ({ date, session: sessionsOn(date)[0] ?? null }));

  // C2 first: when three hard days in a row are flagged, the pair flag inside
  // that window would only repeat it, so those pairs are suppressed.
  const covered = new Set<number>();
  for (let index = 0; index + 2 < filled.length; index += 1) {
    const window = [filled[index]!, filled[index + 1]!, filled[index + 2]!];
    if (window.every((day) => day.session && isHard(day.session))) {
      flags.push({
        code: 'C2', hard: true, date: window[2]!.date,
        lead: 'Trois journées fortes d’affilée',
        text: `(${window.map((day) => label(day.date)).join(', ')}). Règle dure R-WS-10.`
      });
      covered.add(index); covered.add(index + 1); covered.add(index + 2);
    }
  }

  for (let index = 0; index + 1 < filled.length; index += 1) {
    const first = filled[index]!;
    const second = filled[index + 1]!;
    if (!first.session || !second.session) continue;

    // C1: two hard days side by side. The accepted pair, never flagged, is
    // crossfit_class next to run_intervals in either order (her decision of
    // 15 September, the change of stimulus).
    const acceptedPair = [first.session, second.session].some((session) => session.kind === 'crossfit_class')
      && [first.session, second.session].some(isRunIntervals);
    if (isHard(first.session) && isHard(second.session) && !acceptedPair && !(covered.has(index) && covered.has(index + 1))) {
      flags.push({
        code: 'C1', hard: false, date: second.date,
        lead: `${label(first.date)} et ${label(second.date)} sont deux journées fortes qui se suivent`,
        text: `(${title(first.session)}, ${title(second.session)}).`
      });
    }

    // C5: the two runs side by side.
    if (isRun(first.session) && isRun(second.session)) {
      flags.push({
        code: 'C5', hard: false, date: second.date,
        lead: 'Les deux courses se suivent',
        text: `(${label(first.date)}, ${label(second.date)}).`
      });
    }

    // C4: a police session whose HIIT block has format `intervals`, the day
    // after the running intervals (R-WS-08).
    if (isRunIntervals(first.session) && hasIntervalHiit(second.session)) {
      flags.push({
        code: 'C4', hard: false, date: second.date,
        lead: 'Séance police avec un HIIT en course le lendemain des intervalles',
        text: '(règle R-WS-08).'
      });
    }
  }

  // C3: more than three training days in a row with no free day.
  let run = 0;
  let startIndex = 0;
  filled.forEach((day, index) => {
    if (day.session) {
      if (run === 0) startIndex = index;
      run += 1;
      return;
    }
    if (run > 3) flags.push(consecutiveFlag(filled, startIndex, index, run));
    run = 0;
  });
  if (run > 3) flags.push(consecutiveFlag(filled, startIndex, filled.length, run));

  // C6: the trail is no longer on Saturday or Sunday (R-WS-03). The fixed
  // trail_event keeps its own date and is not checked here.
  const trail = week.sessions.find((session) => session.kind === 'trail_maintenance');
  if (trail && !['SAM', 'DIM'].includes(dayName(trail.date))) {
    flags.push({
      code: 'C6', hard: false, date: trail.date,
      lead: 'Le trail n’est plus sur le week-end',
      text: '(règle R-WS-03).'
    });
  }

  return flags;
}

function consecutiveFlag(filled: Array<{ date: string; session: PlannedSession | null }>, startIndex: number, endIndex: number, run: number): Flag {
  const days = filled.slice(startIndex, endIndex);
  return {
    code: 'C3', hard: false, date: days.at(-1)!.date,
    lead: `${run} jours d’entraînement sans repos`,
    text: `(${days.map((day) => label(day.date)).join(', ')}).`
  };
}

function daysOf(week: TrainingWeek): string[] {
  const dates: string[] = [];
  for (let date = week.startDate; date <= week.endDate; date = addDay(date)) dates.push(date);
  return dates;
}

function addDay(date: string): string {
  return new Date(Date.parse(`${date}T12:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
}

function dayName(date: string): string {
  return ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'][new Date(`${date}T12:00:00Z`).getUTCDay()] ?? '';
}

// The same label the week screen prints beside each day ("VEN 18").
function label(date: string): string {
  return `${dayName(date)} ${new Date(`${date}T12:00:00Z`).getUTCDate()}`;
}

function title(session: PlannedSession): string {
  return recipeById[session.recipeId]?.title ?? session.kind;
}
