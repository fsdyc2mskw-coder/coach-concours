import { recipes } from './recipes';
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

function sessionsForWeek(weekStart: string, weekEnd: string, phase: PlanPhase): PlannedSession[] {
  const planned: PlannedSession[] = [];
  const add = (dayOffset: number, recipeKey: keyof typeof recipes, load: PlannedSession['load'], status: PlannedSession['status'] = 'proposed') => {
    const date = addDays(new Date(`${weekStart}T12:00:00Z`), dayOffset);
    if (date > weekEnd || date > finalDate) return;
    const recipe = recipes[recipeKey]!;
    planned.push({ id: `${date}:${recipe.kind}`, date, dayLabel: dayName(date), kind: recipe.kind, recipeId: recipe.id, status, phase: phaseFor(date), load, volumeFactor: phase === 'reset' ? 0.75 : phase === 'taper' ? 0.6 : 1 });
  };

  add(0, 'crossfit', 'hard', 'coached');
  add(1, 'coordination', 'low');
  add(2, 'room', 'hard');
  if (weekStart === '2026-10-05') add(6, 'trailEvent', 'event', 'fixed_event');
  else add(4, 'outdoor', 'hard');
  add(5, 'technique', phase === 'peak' ? 'moderate' : 'low');

  // CHANGE_REQUEST_003 — Week 1 (7-13 Sep 2026) as trained/finalised, per WEEK_1_FINAL v3.
  // Data-only override for Thursday/Friday/Saturday; the generic weekly template above
  // (and every other week) is untouched. Mon-Wed of this week are untouched too.
  if (weekStart === '2026-09-07') {
    return week1Override(planned);
  }

  if (weekStart === '2026-11-16') {
    return planned
      .filter((session) => session.kind !== 'room_explosive_intervals' && session.kind !== 'outdoor_explosive_intervals')
      .concat({
        id: '2026-11-20:police_event', date: '2026-11-20', dayLabel: 'VEN', kind: 'police_event',
        recipeId: recipes.policeEvent!.id, status: 'fixed_event', phase: 'taper', load: 'event', volumeFactor: 1
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  return planned;
}

const WEEK1_OVERRIDE_DATES = ['2026-09-10', '2026-09-11', '2026-09-12'] as const;

function week1Override(generated: PlannedSession[]): PlannedSession[] {
  const kept = generated.filter((session) => !(WEEK1_OVERRIDE_DATES as readonly string[]).includes(session.date));
  const overrides: PlannedSession[] = [
    {
      id: '2026-09-10:room_explosive_intervals', date: '2026-09-10', dayLabel: 'JEU',
      kind: 'room_explosive_intervals', recipeId: recipes.week1Thu10Sep!.id,
      status: 'proposed', phase: phaseFor('2026-09-10'), load: 'hard', volumeFactor: 1
    },
    {
      id: '2026-09-11:police_technique', date: '2026-09-11', dayLabel: 'VEN',
      kind: 'police_technique', recipeId: recipes.week1Fri11Sep!.id,
      status: 'proposed', phase: phaseFor('2026-09-11'), load: 'moderate', volumeFactor: 1
    },
    {
      id: '2026-09-12:trail_event', date: '2026-09-12', dayLabel: 'SAM',
      kind: 'trail_event', recipeId: recipes.week1Sat12Sep!.id,
      status: 'proposed', phase: phaseFor('2026-09-12'), load: 'moderate', volumeFactor: 1
    }
  ];
  return [...kept, ...overrides].sort((a, b) => a.date.localeCompare(b.date));
}

function adaptFromPreviousWeek(current: PlannedSession[], previous: TrainingWeek | undefined, results: Record<string, SessionResult>) {
  if (!previous) return;
  const room = current.find((session) => session.kind === 'room_explosive_intervals');
  const previousRoom = previous.sessions.find((session) => session.kind === 'room_explosive_intervals');
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
  const room = current.find((session) => session.kind === 'room_explosive_intervals');
  if (!crossfit || !room) return;
  const result = results[crossfit.id];
  if (result && (result.effort >= 4 || result.overlapTags?.includes('heavy_legs'))) {
    room.volumeFactor = Math.min(room.volumeFactor, 0.75);
    room.adaptationNote = 'Volume réduit après un cours du lundi exigeant ou des jambes lourdes.';
  }
}

export function validateWeek(week: TrainingWeek): string[] {
  const errors: string[] = [];
  const runs = week.sessions.filter((session) => session.kind === 'outdoor_explosive_intervals' || session.kind === 'trail_event');
  if (runs.length > 1) errors.push('Une seule course est autorisée par semaine.');
  if (week.startDate !== '2026-11-16' && week.sessions.length !== 5) errors.push('Une semaine complète doit compter cinq séances principales.');
  if (week.startDate !== '2026-11-16' && !week.sessions.some((session) => session.kind === 'crossfit_class')) errors.push('Le CrossFit coaché du lundi manque.');
  for (let index = 1; index < week.sessions.length; index += 1) {
    const previous = week.sessions[index - 1];
    const current = week.sessions[index];
    if (previous?.load === 'hard' && current?.load === 'hard' && daysBetween(previous.date, current.date) === 1) errors.push('Deux journées explosives sont adjacentes.');
  }
  return errors;
}

function addDays(date: Date, count: number): string {
  return new Date(date.getTime() + count * DAY_MS).toISOString().slice(0, 10);
}
function minDate(a: string, b: string) { return a < b ? a : b; }
function daysBetween(a: string, b: string) { return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / DAY_MS); }
function dayName(date: string) { return ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'][new Date(`${date}T12:00:00Z`).getUTCDay()] ?? ''; }
