import { recipeById, recipes } from './recipes';
import type { PlanPhase, PlannedSession, SessionResult, TrainingWeek } from './types';

const DAY_MS = 86_400_000;
const start = new Date('2026-09-07T12:00:00Z');
const finalDate = '2026-11-20';

export function phaseFor(date: string): PlanPhase {
  if (date <= '2026-09-20') return 'learn';
  if (date <= '2026-10-04') return 'combine';
  if (date <= '2026-10-11') return 'trail_event';
  if (date <= '2026-10-18') return 'reset';
  if (date <= '2026-11-01') return 'integrate';
  if (date <= '2026-11-15') return 'peak';
  return 'taper';
}

export function generatePlan(results: Record<string, SessionResult> = {}): TrainingWeek[] {
  const weeks: TrainingWeek[] = [];
  for (let offset = 0; offset <= 70; offset += 7) {
    const weekStart = addDays(start, offset);
    if (weekStart > finalDate) break;
    const weekEnd = minDate(addDays(start, offset + 6), finalDate);
    const phase = phaseFor(weekStart);
    const sessions = sessionsForWeek(weekStart, weekEnd, phase);
    adaptCurrentWeek(sessions, results);
    adaptFromPreviousWeek(sessions, weeks.at(-1), results);
    weeks.push({ id: `week-${weekStart}`, startDate: weekStart, endDate: weekEnd, phase, sessions });
  }
  return weeks;
}

// CHANGE_REQUEST_001 — weekly template aligned with weekly_shape.md v2 and
// TRAINING_ENGINE.md: 1 CrossFit + 3 police sessions (police_technique,
// police_strength_transitions, police_integration — R-WS-07) + 1 weekend
// trail_maintenance run (R-WS-03/04/05) + 2 empty days (R-WS-01). Race week
// (5-11 Oct) swaps the weekend run for the fixed trail_event without adding a
// sixth day (R-WS-06). The taper week (16-20 Nov) drops the two hard police
// sessions before the fixed police_event (unchanged from the previous
// template, kind names only updated).
function sessionsForWeek(weekStart: string, weekEnd: string, phase: PlanPhase): PlannedSession[] {
  const planned: PlannedSession[] = [];
  const add = (dayOffset: number, recipeKey: keyof typeof recipes, load: PlannedSession['load'], status: PlannedSession['status'] = 'proposed') => {
    const date = addDays(new Date(`${weekStart}T12:00:00Z`), dayOffset);
    if (date > weekEnd || date > finalDate) return;
    const recipe = recipes[recipeKey]!;
    planned.push({ id: `${date}:${recipe.kind}`, date, dayLabel: dayName(date), kind: recipe.kind, recipeId: recipe.id, status, phase: phaseFor(date), load, volumeFactor: phase === 'reset' ? 0.75 : phase === 'taper' ? 0.6 : 1 });
  };

  add(0, 'crossfit', 'hard', 'coached');
  add(1, 'coordination', 'low'); // police_technique
  add(2, 'room', 'hard'); // police_integration
  add(4, 'outdoor', 'hard'); // police_strength_transitions

  // CHANGE_REQUEST_003 — Week 1 (7-13 Sep 2026) as trained/finalised, per WEEK_1_FINAL v3.
  // Data-only override for Thursday/Friday/Saturday; the generic weekly template above
  // (and every other week) is untouched. Mon-Wed of this week are untouched too.
  if (weekStart === '2026-09-07') {
    return week1Override(planned);
  }

  if (weekStart === '2026-10-05') {
    // R-WS-06: trail_event replaces the weekend run on its fixed date; it
    // never creates a sixth day, so no `trailMaintenance` is added this week.
    add(6, 'trailEvent', 'event', 'fixed_event');
  } else if (weekStart === '2026-11-16') {
    return planned
      .filter((session) => session.kind !== 'police_integration' && session.kind !== 'police_strength_transitions')
      .concat({
        id: '2026-11-20:police_event', date: '2026-11-20', dayLabel: 'VEN', kind: 'police_event',
        recipeId: recipes.policeEvent!.id, status: 'fixed_event', phase: 'taper', load: 'event', volumeFactor: 1
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  } else {
    add(5, 'trailMaintenance', 'moderate');
  }

  return planned.sort((a, b) => a.date.localeCompare(b.date));
}

const WEEK1_OVERRIDE_DATES = ['2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12'] as const;

function week1Override(generated: PlannedSession[]): PlannedSession[] {
  const kept = generated.filter((session) => !(WEEK1_OVERRIDE_DATES as readonly string[]).includes(session.date));
  const overrides: PlannedSession[] = [
    // CHANGE_REQUEST_007 — Tuesday 8 Sep as trained (running intervals, documented exception).
    // Wednesday 9 Sep has no override entry: it renders as a rest day (WEEK_1_FINAL v3).
    {
      id: '2026-09-08:running_intervals_exception', date: '2026-09-08', dayLabel: 'MAR',
      kind: 'running_intervals_exception', recipeId: recipes.week1Tue8Sep!.id,
      status: 'proposed', phase: phaseFor('2026-09-08'), load: 'moderate', volumeFactor: 1
    },
    {
      id: '2026-09-10:police_strength_transitions', date: '2026-09-10', dayLabel: 'JEU',
      kind: 'police_strength_transitions', recipeId: recipes.week1Thu10Sep!.id,
      status: 'proposed', phase: phaseFor('2026-09-10'), load: 'hard', volumeFactor: 1
    },
    {
      id: '2026-09-11:police_technique', date: '2026-09-11', dayLabel: 'VEN',
      kind: 'police_technique', recipeId: recipes.week1Fri11Sep!.id,
      status: 'proposed', phase: phaseFor('2026-09-11'), load: 'moderate', volumeFactor: 1
    },
    {
      id: '2026-09-12:trail_maintenance', date: '2026-09-12', dayLabel: 'SAM',
      kind: 'trail_maintenance', recipeId: recipes.week1Sat12Sep!.id,
      status: 'proposed', phase: phaseFor('2026-09-12'), load: 'moderate', volumeFactor: 1
    }
  ];
  return [...kept, ...overrides].sort((a, b) => a.date.localeCompare(b.date));
}

function adaptFromPreviousWeek(current: PlannedSession[], previous: TrainingWeek | undefined, results: Record<string, SessionResult>) {
  if (!previous) return;
  // 'room' now carries kind `police_integration` (CHANGE_REQUEST_001); the
  // adaptation still targets the same recipe by its recipe id, which is
  // stabler than matching on kind now that police_integration can also be
  // reached from other recipes in the future.
  const room = current.find((session) => session.recipeId === recipes.room!.id);
  const previousRoom = previous.sessions.find((session) => session.recipeId === recipes.room!.id);
  if (previousRoom && room) {
    const result = results[previousRoom.id];
    if (result?.movementQuality === 'degraded' || result?.boxHesitation) {
      room.volumeFactor = Math.min(room.volumeFactor, 0.75);
      room.adaptationNote = 'Revenir à une hauteur ou une limite au sol qui permet des réceptions stables, avec récupération complète.';
    }
  }
}

function adaptCurrentWeek(current: PlannedSession[], results: Record<string, SessionResult>) {
  const crossfit = current.find((session) => session.kind === 'crossfit_class');
  const room = current.find((session) => session.recipeId === recipes.room!.id);
  if (!crossfit || !room) return;
  const result = results[crossfit.id];
  if (result && (result.effort >= 4 || result.overlapTags?.includes('heavy_legs'))) {
    room.volumeFactor = Math.min(room.volumeFactor, 0.75);
    room.adaptationNote = 'Volume réduit après un cours du lundi exigeant ou des jambes lourdes.';
  }
}

// CHANGE_REQUEST_001 — validates the hard rules of weekly_shape.md v2
// (R-WS-01 … R-WS-15; R-WS-16/17/18 are CR-002's HIIT-block rules, out of
// scope here). `running_intervals_exception` is deliberately excluded from
// the run count (R-WS-08): it is a floating block inside a police session,
// never a run, and Week 1's Tuesday is its only documented occurrence.
export function validateWeek(week: TrainingWeek): string[] {
  const errors: string[] = [];
  const isTaperEventWeek = week.startDate === '2026-11-16';
  // R-WS-15: Week 1 is frozen as approved, including its Tuesday interval
  // session — it does not follow the ordinary 3-police-kind template.
  const isWeek1 = week.startDate === '2026-09-07';

  // R-WS-03 / R-WS-06: exactly one run per week (trail_maintenance or, in
  // race week, trail_event), never more.
  const runs = week.sessions.filter((session) => session.kind === 'trail_maintenance' || session.kind === 'trail_event');
  if (!isTaperEventWeek && runs.length !== 1) errors.push('Une semaine complète doit compter exactement une course (trail_maintenance ou trail_event).');
  if (runs.length > 1) errors.push('Une seule course est autorisée par semaine.');
  for (const run of runs) {
    if (run.kind === 'trail_maintenance' && !['SAM', 'DIM'].includes(dayName(run.date))) {
      errors.push('La course de maintien doit être le samedi ou le dimanche.');
    }
  }

  // R-WS-01: 5 principal sessions + 2 empty days (the taper/event week is a
  // documented exception, as it already was before this change request).
  if (!isTaperEventWeek && week.sessions.length !== 5) errors.push('Une semaine complète doit compter cinq séances principales.');

  // R-WS-02: Monday is the coached CrossFit class.
  if (!isTaperEventWeek && !week.sessions.some((session) => session.kind === 'crossfit_class')) errors.push('Le CrossFit coaché du lundi manque.');

  // R-WS-07: three distinct police session kinds per week (mock test may
  // stand in for integration once the exact-room gate passes, R-SEL-11 —
  // not modelled by the generator yet, so only the three base kinds are
  // checked here).
  if (!isTaperEventWeek && !isWeek1) {
    for (const required of ['police_technique', 'police_strength_transitions', 'police_integration'] as const) {
      if (!week.sessions.some((session) => session.kind === required)) {
        errors.push(`La séance police « ${required} » manque.`);
      }
    }
  }

  // R-WS-08: a floating interval block never becomes its own run/session
  // outside Week 1's documented exception.
  if (week.startDate !== '2026-09-07' && week.sessions.some((session) => session.kind === 'running_intervals_exception')) {
    errors.push('Un bloc d’intervalles ne peut pas devenir une séance en dehors de l’exception documentée de la semaine 1.');
  }

  // R-WS-10 / R-WS-11: no three consecutive hard days (hard), avoid two
  // adjacent hard days (soft, kept as a warning-style error for now — the
  // generator has no separate warnings channel yet).
  for (let index = 1; index < week.sessions.length; index += 1) {
    const previous = week.sessions[index - 1];
    const current = week.sessions[index];
    if (previous?.load === 'hard' && current?.load === 'hard' && daysBetween(previous.date, current.date) === 1) errors.push('Deux journées explosives sont adjacentes.');
  }
  for (let index = 2; index < week.sessions.length; index += 1) {
    const [a, b, c] = [week.sessions[index - 2], week.sessions[index - 1], week.sessions[index]];
    if (a?.load === 'hard' && b?.load === 'hard' && c?.load === 'hard' && daysBetween(a.date, c.date) === 2) {
      errors.push('Trois journées explosives consécutives.');
    }
  }

  // R-WS-13: no session after 20 November 2026.
  if (week.sessions.some((session) => session.date > '2026-11-20')) errors.push('Aucune séance ne peut être générée après le 20 novembre 2026.');

  return errors;
}

// CHANGE_REQUEST_001 — R-WS-12: four memory exposures per complete week,
// attached to sessions A-D (crossfit, police_technique,
// police_strength_transitions, police_integration). The taper/event week is
// exempt, matching its existing exemption from the 5-session rule above.
export function countMemoryExposures(week: TrainingWeek): number {
  return week.sessions.filter((session) => recipeById[session.recipeId]?.memory).length;
}

function addDays(date: Date, count: number): string {
  return new Date(date.getTime() + count * DAY_MS).toISOString().slice(0, 10);
}
function minDate(a: string, b: string) { return a < b ? a : b; }
function daysBetween(a: string, b: string) { return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / DAY_MS); }
function dayName(date: string) { return ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'][new Date(`${date}T12:00:00Z`).getUTCDay()] ?? ''; }
