import { buildRunIntervalsRecipe, recipeById, recipes } from './recipes';
import type { PlanPhase, PlannedSession, SessionRecipe, SessionResult, TrainingWeek } from './types';
import { nextRow, runIntervalsProgression, type RunIntervalsRow } from '../data/runIntervalsProgression';
// CHANGE_REQUEST_013 — the two session shapes and their readers.
import {
  buildChainSessionRecipe,
  buildSkillSessionRecipe,
  blockSequence,
  cardioBlocksOf,
  cardioDurationForWeek,
  chainBlockOf,
  drillsOf,
  freshReferenceOf,
  isSessionShape,
  memoryModulesOf,
  skillBlockOf,
  tailBOf
} from './sessionShapes';
import { isFreshOnly } from '../data/exerciseCards';

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

// CHANGE_REQUEST_013 — `weekly_shape.md` v4 states its own week shape "from
// week 3 on", and CR-013 section E seeds week 3 from the two locked Drive
// sessions. Weeks 1 and 2 are already trained and stay as they are: week 1 is
// frozen by R-WS-15, week 2 keeps the v3 template it was generated with, so
// the record matches what was really done (R-WS-14).
const V4_FIRST_WEEK_START = '2026-09-21';

export function isV4Week(weekStart: string): boolean {
  return weekStart >= V4_FIRST_WEEK_START;
}

export function weekNumberOf(weekStart: string): number {
  return Math.round((Date.parse(`${weekStart}T12:00:00Z`) - start.getTime()) / DAY_MS / 7) + 1;
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
        const sessions = sessionsForWeek(weekStart, weekEnd, phase, weekNumber, runIntervalsRows.get(weekNumber));
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

  // CHANGE_REQUEST_013 — a recipe built on the fly for this week (the two
  // session shapes), registered into `recipeById` by its builder exactly like
  // CR-011's run_intervals recipe.
  const addBuilt = (dayOffset: number, recipe: SessionRecipe, load: PlannedSession['load']) => {
    const date = addDays(new Date(`${weekStart}T12:00:00Z`), dayOffset);
    if (date > weekEnd || date > finalDate) return;
    recipeById[recipe.id] = recipe;
    planned.push({ id: `${date}:${recipe.kind}`, date, dayLabel: dayName(date), kind: recipe.kind, recipeId: recipe.id, status: 'proposed', phase: phaseFor(date), load, volumeFactor: phase === 'reset' ? 0.75 : phase === 'taper' ? 0.6 : 1 });
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
  // CHANGE_REQUEST_013 — R-WS-07 v4: the two police days are one SKILL
  // session (Thursday) and one CHAIN session (Friday), in that order.
  // `weekly_shape.md` v4 states its own week shape "from week 3 on", and
  // CR-013 section E seeds week 3; weeks 1 and 2 are past weeks and keep what
  // they were generated/trained with (R-WS-14, R-WS-15) — see the APP_REPORT.
  if (isV4Week(weekStart)) {
    addBuilt(3, buildSkillSessionRecipe(weekNumber), 'low');
    addBuilt(4, buildChainSessionRecipe(weekNumber), 'hard');
  } else {
    add(3, 'coordination', 'low'); // police_technique, Thursday
    // R-WS-07 v3: integration and strength_transitions alternate by week
    // parity, integration on even weeks.
    add(4, weekNumber % 2 === 0 ? 'room' : 'outdoor', 'hard');
  }

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
      .filter((session) => session.kind !== 'police_integration' && session.kind !== 'police_strength_transitions' && session.kind !== 'chain_session')
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

// CHANGE_REQUEST_013 — the week's one hard police day. It used to be the
// `room` recipe (police_integration, Friday); from week 3 it is the CHAIN
// session, which occupies the same Friday slot with the same `hard` load.
// Both are matched so the adaptation keeps working across the v3/v4 boundary.
function hardPoliceSession(sessions: PlannedSession[]): PlannedSession | undefined {
  return sessions.find((session) => session.kind === 'chain_session')
    ?? sessions.find((session) => session.recipeId === recipes.room!.id);
}

function adaptFromPreviousWeek(current: PlannedSession[], previous: TrainingWeek | undefined, results: Record<string, SessionResult>) {
  if (!previous) return;
  const room = hardPoliceSession(current);
  const previousRoom = hardPoliceSession(previous.sessions);
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
  const room = hardPoliceSession(current);
  if (!crossfit || !room) return;
  const result = results[crossfit.id];
  if (result && ((result.effort ?? 0) >= 4 || result.overlapTags?.includes('heavy_legs'))) {
    room.volumeFactor = Math.min(room.volumeFactor, 0.75);
    room.adaptationNote = 'Volume réduit après un cours du lundi exigeant ou des jambes lourdes.';
  }
}

// CHANGE_REQUEST_013 — the v3 police kinds, kept for the weeks that were
// generated under v3 (weeks 1 and 2) and for the bank recipes. `police_mock_test`
// is gone from the union entirely (R-PC-04). The v4 shapes have their own
// rules, in `validateV4PoliceSessions` below.
const POLICE_KINDS = ['police_technique', 'police_strength_transitions', 'police_integration'] as const;

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
  // and exactly one of integration / strength_transitions on Friday (they
  // alternate). The mock-test option is dead: R-PC-04 forbids it and
  // CHANGE_REQUEST_013 removed `police_mock_test` from `SessionKind`.
  // CHANGE_REQUEST_013 — from week 3 on, R-WS-07 v4 and the whole v4 block
  // model replace the v3 police rules below.
  if (!isWeek1 && isV4Week(week.startDate)) {
    errors.push(...validateV4PoliceSessions(week));
  } else if (!isTaperEventWeek && !isWeek1) {
    const technique = week.sessions.find((session) => session.kind === 'police_technique');
    if (!technique) errors.push('La séance « police_technique » du jeudi manque (R-WS-07).');
    else if (dayName(technique.date) !== 'JEU') errors.push('« police_technique » doit être le jeudi (R-WS-07).');

    const fridayKinds = ['police_integration', 'police_strength_transitions'] as const;
    const fridayPolice = week.sessions.filter((session) => (fridayKinds as readonly string[]).includes(session.kind));
    if (fridayPolice.length !== 1) {
      errors.push('Exactement une séance police (integration ou strength_transitions) doit avoir lieu le vendredi (R-WS-07).');
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
  // CHANGE_REQUEST_013 — v4 renames the HIIT block the CARDIO block and
  // replaces R-WS-17/18 outright, so this loop only runs on the weeks that
  // were generated under v3 (weeks 1 and 2).
  if (!isWeek1 && !isV4Week(week.startDate)) {
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

// CHANGE_REQUEST_013 sections A and B — the hard rules of weekly_shape.md v4
// for the two session shapes, one check per line of the change request's own
// "Rules the generator must enforce" list, plus R-WS-25/26/29/30/31/32/34/35/
// 36/37/38 and R-PC-04/R-PC-05 from the rule files.
//
// The change request writes "one cardio block per session, always". Taken
// literally that would also bind the Monday CrossFit class (content written
// by the coach, R-WS-02), the Tuesday run_intervals and the weekend trail
// run — and R-WS-04 forbids any conditioning finisher on a run. The two
// locked sessions are both police sessions, so the rule is applied to the two
// police shapes and the conflict is raised as a question in APP_REPORT_013.md
// rather than resolved here.
export function validateV4PoliceSessions(week: TrainingWeek): string[] {
  const errors: string[] = [];
  const isTaperEventWeek = week.startDate === '2026-11-16';
  const weekNumber = weekNumberOf(week.startDate);
  const police = week.sessions.filter((session) => isSessionShape(session.kind));
  const skill = police.find((session) => session.kind === 'skill_session');
  const chain = police.find((session) => session.kind === 'chain_session');

  // R-WS-07 v4: two police sessions, one of each shape, skill before chain.
  if (!isTaperEventWeek) {
    if (police.length !== 2 || !skill || !chain) {
      errors.push('Une semaine complète doit compter une séance compétence et une séance enchaînement, une de chaque (R-WS-07).');
    } else if (skill.date >= chain.date) {
      errors.push('La séance compétence doit précéder la séance enchaînement (R-WS-07).');
    }
  }

  // R-WS-29: the station excluded from every cardio block of the week is the
  // week's skill focus, not merely the skill session's own block.
  const skillRecipe = skill ? recipeById[skill.recipeId] : undefined;
  const focusStation = skillRecipe ? skillBlockOf(skillRecipe)?.stationId ?? null : null;

  for (const session of police) {
    const recipe = recipeById[session.recipeId];
    if (!recipe) continue;
    const label = `« ${recipe.title} » (${session.date})`;
    const sequence = blockSequence(recipe);

    // R-WS-16: exactly one cardio block. A chain block carries kind
    // `chain_block`, so it structurally cannot satisfy this count.
    const cardioBlocks = cardioBlocksOf(recipe);
    if (cardioBlocks.length !== 1) {
      errors.push(`${label} : exactement un bloc cardio par séance ; un bloc d’enchaînement n’en est pas un (R-WS-16).`);
    }
    for (const cardio of cardioBlocks) {
      if (cardio.atoms.length < 1 || cardio.atoms.length > 3) {
        errors.push(`${label} : le bloc cardio compte au maximum trois atomes (R-WS-30).`);
      }
      if (cardio.atoms.length > 0 && cardio.atoms.every((atom) => atom.stationId === 0)) {
        errors.push(`${label} : le bloc cardio ne peut pas n’être fait que d’atomes de remplissage (R-WS-28).`);
      }
      if (focusStation !== null && cardio.atoms.some((atom) => atom.stationId === focusStation)) {
        errors.push(`${label} : le bloc cardio ne peut pas contenir le poste travaillé en compétence cette semaine (R-WS-29).`);
      }
      if (cardio.atoms.some((atom) => isFreshOnly(atom.cardId))) {
        errors.push(`${label} : le bloc cardio ne peut pas contenir une carte réservée au travail à froid (R-WS-29).`);
      }
      if (cardio.target !== null) {
        errors.push(`${label} : le bloc cardio ne porte aucune cible (R-WS-31).`);
      }
      const expectedCardioMin = cardioDurationForWeek(weekNumber);
      if (cardio.durationMin !== expectedCardioMin) {
        errors.push(`${label} : le bloc cardio doit durer ${expectedCardioMin} min en semaine ${weekNumber} (R-WS-32).`);
      }
    }

    // R-WS-12 / R-WS-40: memory at index 1 (skill session) or 2 (chain
    // session) of the full sequence, never last; M5 never selected.
    const memoryIndex = sequence.indexOf('memory');
    const expectedMemoryIndex = session.kind === 'skill_session' ? 1 : 2;
    if (memoryIndex !== expectedMemoryIndex) {
      errors.push(`${label} : le bloc mémoire doit être en position ${expectedMemoryIndex} de la séance (R-WS-12).`);
    }
    if (memoryIndex !== -1 && memoryIndex === sequence.length - 1) {
      errors.push(`${label} : le bloc mémoire n’est jamais le dernier de la séance (R-WS-12).`);
    }
    if (memoryModulesOf(recipe).includes('M5')) {
      errors.push(`${label} : le module M5 n’est jamais sélectionné (R-WS-40).`);
    }

    const tailB = tailBOf(recipe);
    const chainBlock = chainBlockOf(recipe);
    const fresh = freshReferenceOf(recipe);

    // R-WS-37: a session with any tail carries a fresh reference, before the
    // first hard block.
    if (tailB || chainBlock) {
      if (!fresh) {
        errors.push(`${label} : une séance avec une tail doit porter une référence fraîche prise le même jour (R-WS-37).`);
      } else {
        const freshIndex = sequence.indexOf('fresh_reference');
        const hardIndexes = (['chain_block', 'cardio', 'skill_block'] as const)
          .map((kind) => sequence.indexOf(kind))
          .filter((index) => index !== -1);
        const firstHard = hardIndexes.length ? Math.min(...hardIndexes) : sequence.length;
        if (freshIndex === -1 || freshIndex > firstHard) {
          errors.push(`${label} : la référence fraîche doit venir avant le premier bloc dur (R-WS-37).`);
        }
      }
    }

    // R-WS-35: tail B is the only block allowed after the cardio block, and
    // the last one before the cool-down.
    const cardioIndex = sequence.indexOf('cardio');
    const afterCardio = cardioIndex === -1 ? [] : sequence.slice(cardioIndex + 1).filter((kind) => kind !== 'cooldown');
    if (afterCardio.some((kind) => kind !== 'tail_b')) {
      errors.push(`${label} : seule la tail B peut suivre le bloc cardio (R-WS-35).`);
    }
    if (tailB) {
      if (afterCardio.length !== 1 || afterCardio[0] !== 'tail_b') {
        errors.push(`${label} : la tail B doit être le dernier bloc avant le retour au calme (R-WS-35).`);
      }
      if (tailB.minutes.length < 4 || tailB.minutes.length > 5) {
        errors.push(`${label} : la tail B compte 4 ou 5 minutes (R-WS-35).`);
      }
      if (!tailB.stopRule) {
        errors.push(`${label} : toute tail porte une règle d’arrêt (R-WS-38).`);
      }
      if (!fresh || tailB.referenceBlockId !== fresh.blockId) {
        errors.push(`${label} : la tail B doit pointer sur la référence fraîche de la même séance (R-WS-37).`);
      }
      if (focusStation !== null && tailB.minutes.some((minute) => minute.drill.stationId === focusStation)) {
        errors.push(`${label} : une tail n’utilise jamais le poste travaillé en compétence cette semaine (R-WS-36).`);
      }
    }

    if (chainBlock) {
      // R-PC-05: at least two stations linked, transition trained.
      if (chainBlock.stations.length < 2) {
        errors.push(`${label} : un bloc d’enchaînement relie au moins deux postes (R-PC-05).`);
      }
      if (!chainBlock.transitionNote) {
        errors.push(`${label} : la transition entre les postes doit être décrite, c’est elle qui est entraînée (R-PC-05).`);
      }
      // R-WS-34: tail A closes every round, 30 to 45 s, the same drill.
      if (chainBlock.tailASeconds < 30 || chainBlock.tailASeconds > 45) {
        errors.push(`${label} : la tail A dure 30 à 45 s (R-WS-34).`);
      }
      if (chainBlock.intensity !== 'moderate') {
        errors.push(`${label} : le bloc d’enchaînement se fait à allure modérée (R-WS-34).`);
      }
      if (focusStation !== null && chainBlock.tailA.stationId === focusStation) {
        errors.push(`${label} : une tail n’utilise jamais le poste travaillé en compétence cette semaine (R-WS-36).`);
      }
    }

    // R-WS-25: one station, two drills at most, 16-20 min, first block after
    // the memory block, and that station in no other block of the session.
    if (session.kind === 'skill_session') {
      const skillBlock = skillBlockOf(recipe);
      if (!skillBlock) {
        errors.push(`${label} : une séance compétence porte un bloc compétence (R-WS-25).`);
      } else {
        if (skillBlock.drills.length < 1 || skillBlock.drills.length > 2) {
          errors.push(`${label} : le bloc compétence porte un ou deux exercices, pas plus (R-WS-25).`);
        }
        if (skillBlock.durationMin < 16 || skillBlock.durationMin > 20) {
          errors.push(`${label} : le bloc compétence dure 16 à 20 min (R-WS-25).`);
        }
        if (sequence.indexOf('skill_block') !== memoryIndex + 1) {
          errors.push(`${label} : le bloc compétence est le premier bloc après la mémoire (R-WS-25).`);
        }
        const otherStations = recipe.blocks
          .filter((item) => item.kind !== 'skill_block')
          .flatMap((item) => item.stationMappings);
        if (otherStations.includes(skillBlock.stationId)) {
          errors.push(`${label} : le poste du bloc compétence n’apparaît dans aucun autre bloc de la séance (R-WS-25).`);
        }
      }
    }

    // R-WS-26: every scored drill has its own score field, so no two share an
    // id inside one session.
    const drillIds = drillsOf(recipe).map((item) => item.drillId);
    if (new Set(drillIds).size !== drillIds.length) {
      errors.push(`${label} : deux exercices notés partagent le même identifiant de score (R-WS-26).`);
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
