import { buildRunIntervalsRecipe, recipeById, recipes } from './recipes';
import type { PlanPhase, PlannedSession, SessionResult, TrainingWeek } from './types';
import { nextRow, runIntervalsProgression, type RunIntervalsRow } from '../data/runIntervalsProgression';

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
  const runIntervalsRows = computeRunIntervalsRows(results);
  for (let offset = 0; offset <= 70; offset += 7) {
    const weekStart = addDays(start, offset);
    if (weekStart > finalDate) break;
    const weekEnd = minDate(addDays(start, offset + 6), finalDate);
    const phase = phaseFor(weekStart);
    const weekNumber = offset / 7 + 1;
    const sessions = sessionsForWeek(weekStart, weekEnd, phase, runIntervalsRows.get(weekNumber));
    adaptCurrentWeek(sessions, results);
    adaptFromPreviousWeek(sessions, weeks.at(-1), results);
    weeks.push({ id: `week-${weekStart}`, startDate: weekStart, endDate: weekEnd, phase, sessions });
  }
  return weeks;
}

// CHANGE_REQUEST_011 section C — picks the progression-table row for each
// week 2-11 before any week is generated, applying R-WS-22 sequentially: a
// week with no saved Tuesday result advances the table normally; `repeat`
// keeps the following week on the same row (the table shifts by one, as
// `run_intervals_progression.md` describes); `advanceFaster` moves on but
// with the pace 10 s/km faster than the table's own value. Week 11 (taper)
// is never moved, per the CR.
function computeRunIntervalsRows(results: Record<string, SessionResult>): Map<number, RunIntervalsRow> {
  const rows = new Map<number, RunIntervalsRow>();
  let cursor = 0;
  let pendingPaceAdjustSec = 0;
  for (let weekNumber = 2; weekNumber <= 11; weekNumber += 1) {
    const tableRow = runIntervalsProgression[Math.min(cursor, runIntervalsProgression.length - 1)]!;
    const row: RunIntervalsRow = {
      ...tableRow,
      week: weekNumber,
      paceSec: tableRow.paceSec + pendingPaceAdjustSec
    };
    rows.set(weekNumber, row);
    pendingPaceAdjustSec = 0;
    if (weekNumber === 11) break;

    const tuesdayDate = addDays(new Date(`${addDays(start, (weekNumber - 1) * 7)}T12:00:00Z`), 1);
    const result = results[`${tuesdayDate}:run_intervals`];
    if (result?.repPacesSec?.length) {
      const outcome = nextRow(row, result.repPacesSec);
      if (outcome === 'repeat') {
        // cursor stays put: next week repeats this same row.
      } else {
        cursor += 1;
        if (outcome === 'advanceFaster') pendingPaceAdjustSec = -10;
      }
    } else {
      cursor += 1;
    }
  }
  return rows;
}

// CHANGE_REQUEST_011 — weekly template aligned with weekly_shape.md v3:
// 1 CrossFit + run_intervals (Tue, R-WS-19/20) + 2 police sessions
// (police_technique on Thu, police_integration/police_strength_transitions
// alternating on Fri — R-WS-07) + 1 weekend trail_maintenance run
// (R-WS-03/04/05) + 2 empty days (Wed, Sun — R-WS-01). Race week (5-11 Oct)
// swaps the weekend run for the fixed trail_event without adding a sixth day
// (R-WS-06). The taper week (16-20 Nov) drops the Friday police session
// before the fixed police_event (Tuesday's run_intervals stays: R-WS-22,
// Week 11 is never moved).
function sessionsForWeek(weekStart: string, weekEnd: string, phase: PlanPhase, weekNumber: number, runIntervalsRow: RunIntervalsRow | undefined): PlannedSession[] {
  const planned: PlannedSession[] = [];
  const add = (dayOffset: number, recipeKey: keyof typeof recipes, load: PlannedSession['load'], status: PlannedSession['status'] = 'proposed') => {
    const date = addDays(new Date(`${weekStart}T12:00:00Z`), dayOffset);
    if (date > weekEnd || date > finalDate) return;
    const recipe = recipes[recipeKey]!;
    planned.push({ id: `${date}:${recipe.kind}`, date, dayLabel: dayName(date), kind: recipe.kind, recipeId: recipe.id, status, phase: phaseFor(date), load, volumeFactor: phase === 'reset' ? 0.75 : phase === 'taper' ? 0.6 : 1 });
  };

  add(0, 'crossfit', 'hard', 'coached');
  if (runIntervalsRow) {
    const recipe = buildRunIntervalsRecipe(runIntervalsRow);
    const date = addDays(new Date(`${weekStart}T12:00:00Z`), 1);
    if (date <= weekEnd && date <= finalDate) {
      planned.push({
        id: `${date}:run_intervals`, date, dayLabel: dayName(date), kind: 'run_intervals', recipeId: recipe.id,
        status: 'proposed', phase: phaseFor(date), load: 'hard',
        volumeFactor: phase === 'reset' ? 0.75 : phase === 'taper' ? 0.6 : 1
      });
    }
  }
  add(3, 'coordination', 'low'); // police_technique, Thursday
  // R-WS-07: integration and strength_transitions alternate by week parity,
  // integration on even weeks (a mock test would stand in once the
  // exact-room gate passes — that gate is not modelled by the generator yet,
  // see APP_REPORT_011.md).
  add(4, weekNumber % 2 === 0 ? 'room' : 'outdoor', 'hard'); // police_integration or police_strength_transitions, Friday

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
  if (result && ((result.effort ?? 0) >= 4 || result.overlapTags?.includes('heavy_legs'))) {
    room.volumeFactor = Math.min(room.volumeFactor, 0.75);
    room.adaptationNote = 'Volume réduit après un cours du lundi exigeant ou des jambes lourdes.';
  }
}

const POLICE_KINDS = ['police_technique', 'police_strength_transitions', 'police_integration', 'police_mock_test'] as const;

// CHANGE_REQUEST_002 — R-WS-16: the recipe's one hiit block (AMRAP, EMOM,
// running intervals, for-time or chipper). Returns null when there is none
// or more than one — both are R-WS-16 violations, reported by the caller.
function hiitBlock(recipeId: string) {
  const blocks = (recipeById[recipeId]?.blocks ?? []).filter((block) => block.hiit);
  return blocks.length === 1 ? blocks[0]! : null;
}

// CHANGE_REQUEST_001/002 — validates the hard rules of weekly_shape.md v2
// (R-WS-01 … R-WS-18). `running_intervals_exception` is deliberately excluded
// from the run count (R-WS-08): it is a floating block inside a police
// session, never a run, and Week 1's Tuesday is its only documented
// occurrence. R-WS-16/17/18 (CR-002) are skipped for Week 1 (frozen, R-WS-15)
// exactly like R-WS-07 above.
export function validateWeek(week: TrainingWeek): string[] {
  const errors: string[] = [];
  const isTaperEventWeek = week.startDate === '2026-11-16';
  // R-WS-15: Week 1 is frozen as approved, including its Tuesday interval
  // session — it does not follow the ordinary 3-police-kind template.
  const isWeek1 = week.startDate === '2026-09-07';

  // R-WS-03 v3 / R-WS-06: exactly two runs per week — run_intervals on
  // Tuesday and trail_maintenance (or, in race week, trail_event) on
  // Saturday or Sunday, never more of either.
  const runIntervalsSessions = week.sessions.filter((session) => session.kind === 'run_intervals');
  if (!isTaperEventWeek && !isWeek1 && runIntervalsSessions.length !== 1) errors.push('Une semaine complète doit compter une séance run_intervals le mardi (R-WS-03).');
  for (const session of runIntervalsSessions) {
    if (dayName(session.date) !== 'MAR') errors.push('La séance run_intervals doit être le mardi (R-WS-03).');
  }

  const runs = week.sessions.filter((session) => session.kind === 'trail_maintenance' || session.kind === 'trail_event');
  if (!isTaperEventWeek && runs.length !== 1) errors.push('Une semaine complète doit compter exactement une course (trail_maintenance ou trail_event).');
  if (runs.length > 1) errors.push('Une seule course est autorisée par semaine.');
  for (const run of runs) {
    if (run.kind === 'trail_maintenance' && !['SAM', 'DIM'].includes(dayName(run.date))) {
      errors.push('La course de maintien doit être le samedi ou le dimanche.');
    }
  }

  // R-WS-04: run_intervals is run-only, the fixed frame of R-WS-19 — one
  // main-set block, an actual warm-up and an actual cool-down, nothing else
  // attached.
  for (const session of runIntervalsSessions) {
    const recipe = recipeById[session.recipeId];
    if (recipe && (recipe.blocks.length !== 1 || !recipe.warmup || !recipe.cooldown)) {
      errors.push(`« ${recipe.title} » (${session.date}) : run_intervals doit garder le cadre fixe échauffement + bloc principal + retour au calme (R-WS-04/19).`);
    }
  }

  // R-WS-01: 5 principal sessions + 2 empty days (the taper/event week is a
  // documented exception, as it already was before this change request).
  if (!isTaperEventWeek && week.sessions.length !== 5) errors.push('Une semaine complète doit compter cinq séances principales.');

  // R-WS-02: Monday is the coached CrossFit class.
  if (!isTaperEventWeek && !week.sessions.some((session) => session.kind === 'crossfit_class')) errors.push('Le CrossFit coaché du lundi manque.');

  // R-WS-07 v3: two police sessions per week — police_technique on Thursday,
  // and exactly one of integration / strength_transitions / mock_test on
  // Friday (they alternate; the mock-test gate is not modelled by the
  // generator yet, see APP_REPORT_011.md).
  if (!isTaperEventWeek && !isWeek1) {
    const technique = week.sessions.find((session) => session.kind === 'police_technique');
    if (!technique) errors.push('La séance « police_technique » du jeudi manque (R-WS-07).');
    else if (dayName(technique.date) !== 'JEU') errors.push('« police_technique » doit être le jeudi (R-WS-07).');

    const fridayKinds = ['police_integration', 'police_strength_transitions', 'police_mock_test'] as const;
    const fridayPolice = week.sessions.filter((session) => (fridayKinds as readonly string[]).includes(session.kind));
    if (fridayPolice.length !== 1) {
      errors.push('Exactement une séance police (integration, strength_transitions ou mock_test) doit avoir lieu le vendredi (R-WS-07).');
    } else if (dayName(fridayPolice[0]!.date) !== 'VEN') {
      errors.push('La séance police du vendredi doit être le vendredi (R-WS-07).');
    }
  }

  // R-WS-08: a floating interval block never becomes its own run/session
  // outside Week 1's documented exception, and Thursday's hiit block (the
  // day after run_intervals's rest day) is never itself a running-intervals
  // form.
  if (week.startDate !== '2026-09-07' && week.sessions.some((session) => session.kind === 'running_intervals_exception')) {
    errors.push('Un bloc d’intervalles ne peut pas devenir une séance en dehors de l’exception documentée de la semaine 1.');
  }
  const thursday = week.sessions.find((session) => session.kind === 'police_technique' && dayName(session.date) === 'JEU');
  if (thursday) {
    const thursdayHiit = hiitBlock(thursday.recipeId);
    if (thursdayHiit?.hiit?.format === 'intervals') {
      errors.push('Le bloc hiit du jeudi ne peut pas prendre la forme d’intervalles de course (R-WS-08).');
    }
  }

  // R-WS-10 / R-WS-11: no three consecutive hard days (hard), avoid two
  // adjacent hard days (soft, kept as a warning-style error for now — the
  // generator has no separate warnings channel yet). Monday → Tuesday
  // (crossfit → run_intervals) is an accepted exception: it is the athlete's
  // explicit 15 Sep decision (CR-011's "Why"), even though weekly_shape.md
  // v3's own R-WS-11 text still lists only Thursday/Friday — flagged as an
  // apparent gap in the rule text, not silently resolved, in
  // handoffs/APP_REPORT_011.md.
  for (let index = 1; index < week.sessions.length; index += 1) {
    const previous = week.sessions[index - 1];
    const current = week.sessions[index];
    const isMondayTuesday = previous?.kind === 'crossfit_class' && current?.kind === 'run_intervals';
    if (!isMondayTuesday && previous?.load === 'hard' && current?.load === 'hard' && daysBetween(previous.date, current.date) === 1) {
      errors.push('Deux journées explosives sont adjacentes.');
    }
  }
  for (let index = 2; index < week.sessions.length; index += 1) {
    const [a, b, c] = [week.sessions[index - 2], week.sessions[index - 1], week.sessions[index]];
    if (a?.load === 'hard' && b?.load === 'hard' && c?.load === 'hard' && daysBetween(a.date, c.date) === 2) {
      errors.push('Trois journées explosives consécutives.');
    }
  }

  // R-WS-13: no session after 20 November 2026.
  if (week.sessions.some((session) => session.date > '2026-11-20')) errors.push('Aucune séance ne peut être générée après le 20 novembre 2026.');

  // R-WS-16/17/18 (CR-002): every police session has exactly one hiit block;
  // in police_technique it is ≤ 10 min and the last block before the
  // cool-down; in police_strength_transitions/police_integration it is
  // 10-20 min. Skipped for Week 1 (R-WS-15, same exemption as R-WS-07 above).
  if (!isWeek1) {
    for (const session of week.sessions) {
      if (!(POLICE_KINDS as readonly string[]).includes(session.kind)) continue;
      const recipe = recipeById[session.recipeId];
      if (!recipe) continue;
      const hiit = hiitBlock(session.recipeId);
      if (!hiit) {
        errors.push(`« ${recipe.title} » (${session.date}) n’a pas exactement un bloc hiit (R-WS-16).`);
        continue;
      }
      if (session.kind === 'police_technique') {
        if (hiit.hiit!.durationMin > 10) {
          errors.push(`« ${recipe.title} » (${session.date}) : le bloc hiit d’une séance police_technique doit durer 10 min maximum (R-WS-17).`);
        }
        if (recipe.blocks.at(-1) !== hiit) {
          errors.push(`« ${recipe.title} » (${session.date}) : le bloc hiit doit être le dernier bloc avant le retour au calme (R-WS-17).`);
        }
      } else if (session.kind === 'police_strength_transitions' || session.kind === 'police_integration') {
        if (hiit.hiit!.durationMin < 10 || hiit.hiit!.durationMin > 20) {
          errors.push(`« ${recipe.title} » (${session.date}) : le bloc hiit doit durer entre 10 et 20 min (R-WS-18).`);
        }
      }
    }
  }

  // R-WS-09/18 short form: the police session the day before the week's run
  // (trail_maintenance or trail_event) keeps its hiit block ≤ 10 min.
  const runDate = week.sessions.find((session) => session.kind === 'trail_maintenance' || session.kind === 'trail_event')?.date;
  if (runDate) {
    const dayBefore = week.sessions.find((session) => (POLICE_KINDS as readonly string[]).includes(session.kind) && daysBetween(session.date, runDate) === 1);
    const hiit = dayBefore ? hiitBlock(dayBefore.recipeId) : null;
    if (dayBefore && hiit && hiit.hiit!.durationMin > 10) {
      errors.push(`« ${recipeById[dayBefore.recipeId]?.title} » (${dayBefore.date}) : la veille de la course, le bloc hiit doit rester court, 10 min maximum (R-WS-09).`);
    }
  }

  return errors;
}

// CHANGE_REQUEST_002 — R-WS-09 short-form check that depends on feedback, not
// on the fixed weekly template: the police session immediately after a
// CrossFit class recorded with effort 4-5 should use the short (≤ 10 min)
// hiit form. The recipe library is static text, so the engine cannot shorten
// it by itself; this returns an adaptation note for the athlete/coach rather
// than silently rewriting the session, the same pattern as
// `adaptCurrentWeek`'s existing volumeFactor notes.
export function hiitShortFormNotes(week: TrainingWeek, results: Record<string, SessionResult>): string[] {
  const notes: string[] = [];
  const crossfit = week.sessions.find((session) => session.kind === 'crossfit_class');
  if (!crossfit) return notes;
  const result = results[crossfit.id];
  if (!result || (result.effort ?? 0) < 4) return notes;
  const next = week.sessions.find((session) => (POLICE_KINDS as readonly string[]).includes(session.kind) && daysBetween(crossfit.date, session.date) === 1);
  if (!next) return notes;
  const hiit = hiitBlock(next.recipeId);
  if (hiit && hiit.hiit!.durationMin > 10) {
    notes.push(`R-WS-09 : cours de CrossFit noté effort ${result.effort} → le bloc hiit de « ${recipeById[next.recipeId]?.title} » (${next.date}) devrait passer en forme courte, 10 min maximum.`);
  }
  return notes;
}

// CHANGE_REQUEST_001 — R-WS-12: counts sessions that carry a memory prompt.
// weekly_shape.md v3 amends R-WS-12 to "four exposures, two per police
// session" now that only two police sessions remain per week; today's
// `SessionRecipe.memory` still holds a single prompt per session (recipe
// content, out of CR-011's scope — see APP_REPORT_011.md), so a generated
// week currently counts one exposure per memory-bearing session, not two per
// police session. The taper/event week is exempt, matching its existing
// exemption from the 5-session rule above.
export function countMemoryExposures(week: TrainingWeek): number {
  return week.sessions.filter((session) => recipeById[session.recipeId]?.memory).length;
}

function addDays(date: Date, count: number): string {
  return new Date(date.getTime() + count * DAY_MS).toISOString().slice(0, 10);
}
function minDate(a: string, b: string) { return a < b ? a : b; }
function daysBetween(a: string, b: string) { return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / DAY_MS); }
function dayName(date: string) { return ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'][new Date(`${date}T12:00:00Z`).getUTCDay()] ?? ''; }
