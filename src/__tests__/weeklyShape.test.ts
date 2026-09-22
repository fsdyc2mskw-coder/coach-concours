// CHANGE_REQUEST_001/002/011/013 — one test per hard rule in weekly_shape.md
// (R-WS-01 … R-WS-23; R-WS-16/17/18 have their own describe block below).
// Uses week 2 (2026-09-14), the last week generated under the v3 police
// template (Thursday = police_technique, Friday = police_integration), plus
// the race week (2026-10-05) and the taper/event week (2026-11-16) for the
// rules that only show up there.
//
// CHANGE_REQUEST_013 — week 3 (2026-09-21) is the first week of the v4
// shapes, so `v4Week` below replaces what used to be the "odd week" fixture
// here. Everything about the two shapes themselves is tested in cr013.test.ts;
// this file only keeps what it already checked: that the week still validates
// clean, and that the v3 rules are not applied to it.
import { describe, expect, it } from 'vitest';
import { countMemoryExposures, generatePlan, hiitShortFormNotes, validateWeek } from '../coach/planner';
import { memoryPromptsAskingToExplain, recipeById, recipes } from '../coach/recipes';
import type { TrainingWeek } from '../coach/types';

const weeks = generatePlan();
const genericWeek = weeks.find((week) => week.startDate === '2026-09-14')!;
const v4Week = weeks.find((week) => week.startDate === '2026-09-21')!;
const raceWeek = weeks.find((week) => week.startDate === '2026-10-05')!;
const taperWeek = weeks.find((week) => week.startDate === '2026-11-16')!;

describe('weekly_shape.md v3 hard rules, on a generic week (2026-09-14)', () => {
  it('R-WS-01: exactly 5 principal sessions and 2 empty days', () => {
    expect(genericWeek.sessions).toHaveLength(5);
    const days = new Set(genericWeek.sessions.map((session) => session.date));
    expect(7 - days.size).toBe(2);
    expect(validateWeek(genericWeek)).not.toContain('Une semaine complète doit compter cinq séances principales.');
  });

  it('R-WS-02: Monday is the coached CrossFit class, content unwritten by the app', () => {
    const monday = genericWeek.sessions.find((session) => session.date === '2026-09-14')!;
    expect(monday.kind).toBe('crossfit_class');
    expect(monday.status).toBe('coached');
    expect(recipeById[monday.recipeId]?.blocks).toHaveLength(0);
  });

  it('R-WS-03 v3: run_intervals on Tuesday, one trail run on Saturday or Sunday', () => {
    const runIntervals = genericWeek.sessions.filter((session) => session.kind === 'run_intervals');
    expect(runIntervals).toHaveLength(1);
    expect(runIntervals[0]?.date).toBe('2026-09-15');
    const trailRuns = genericWeek.sessions.filter((session) => session.kind === 'trail_maintenance');
    expect(trailRuns).toHaveLength(1);
    expect(['2026-09-19', '2026-09-20']).toContain(trailRuns[0]?.date);
    expect(validateWeek(genericWeek)).toHaveLength(0);
  });

  it('R-WS-04: the trail run is run-only, no police/balance/memory finisher attached', () => {
    const run = genericWeek.sessions.find((session) => session.kind === 'trail_maintenance')!;
    const recipe = recipeById[run.recipeId]!;
    expect(recipe.blocks).toHaveLength(1);
    expect(recipe.blocks[0]!.stationMappings).toHaveLength(0);
    expect(recipe.memory).toBeUndefined();
  });

  it('R-WS-07 v3: two police sessions per week (technique on Thursday, one of integration/strength on Friday)', () => {
    const technique = genericWeek.sessions.find((session) => session.kind === 'police_technique');
    expect(technique?.date).toBe('2026-09-17');
    const fridayPolice = genericWeek.sessions.filter((session) => ['police_integration', 'police_strength_transitions'].includes(session.kind));
    expect(fridayPolice).toHaveLength(1);
    expect(fridayPolice[0]?.date).toBe('2026-09-18');
    expect(validateWeek(genericWeek)).toHaveLength(0);
  });

  it('R-WS-07 v3 applies to week 2, the last week under the v3 template; week 3 is already v4', () => {
    expect(genericWeek.sessions.some((session) => session.kind === 'police_integration')).toBe(true);
    // CHANGE_REQUEST_013 — from week 3 the Friday session is the chain
    // session, not police_strength_transitions.
    expect(v4Week.sessions.some((session) => session.kind === 'police_strength_transitions')).toBe(false);
    expect(v4Week.sessions.some((session) => session.kind === 'chain_session')).toBe(true);
    expect(validateWeek(v4Week)).toHaveLength(0);
  });

  it('R-WS-08: no interval block becomes its own session, and Thursday never uses the running-intervals hiit form', () => {
    expect(genericWeek.sessions.some((session) => session.kind === 'running_intervals_exception')).toBe(false);
    expect(validateWeek(genericWeek).some((error) => error.includes('R-WS-08'))).toBe(false);
  });

  it('R-WS-10: never three consecutive hard days', () => {
    const hardDates = genericWeek.sessions.filter((session) => session.load === 'hard').map((session) => session.date).sort();
    for (let index = 2; index < hardDates.length; index += 1) {
      const span = (Date.parse(`${hardDates[index]}T12:00:00Z`) - Date.parse(`${hardDates[index - 2]}T12:00:00Z`)) / 86_400_000;
      expect(span).not.toBe(2);
    }
  });

  it('R-WS-11: Monday → Tuesday (crossfit → run_intervals) is an accepted adjacent-hard exception', () => {
    const monday = genericWeek.sessions.find((session) => session.date === '2026-09-14')!;
    const tuesday = genericWeek.sessions.find((session) => session.date === '2026-09-15')!;
    expect(monday.load).toBe('hard');
    expect(tuesday.load).toBe('hard');
    expect(validateWeek(genericWeek)).not.toContain('Deux journées explosives sont adjacentes.');
  });

  it('R-WS-12: memory-bearing sessions (engine still one prompt per session — see APP_REPORT_011.md)', () => {
    // weekly_shape.md v3 amends R-WS-12 to "four exposures, two per police
    // session"; the recipe content that would carry a second prompt per
    // police session is out of CR-011's scope, so the generated week still
    // exposes one prompt per memory-bearing session (crossfit + the two
    // police sessions here).
    expect(countMemoryExposures(genericWeek)).toBe(3);
    const runSession = genericWeek.sessions.find((session) => session.kind === 'trail_maintenance')!;
    expect(recipeById[runSession.recipeId]?.memory).toBeUndefined();
    const runIntervalsSession = genericWeek.sessions.find((session) => session.kind === 'run_intervals')!;
    expect(recipeById[runIntervalsSession.recipeId]?.memory).toBeUndefined();
  });

  it('R-WS-13: no session after 20 November 2026', () => {
    for (const week of weeks) {
      for (const session of week.sessions) {
        expect(session.date <= '2026-11-20').toBe(true);
      }
    }
  });

  it('R-WS-14: adaptation never adds a session (no compensation)', () => {
    const withoutResults = generatePlan();
    const withResults = generatePlan({
      '2026-09-14:crossfit_class': {
        sessionId: '2026-09-14:crossfit_class',
        status: 'done',
        effort: 5,
        note: '',
        overlapTags: ['heavy_legs'],
        completedAt: new Date().toISOString()
      }
    });
    const before = withoutResults.find((week) => week.startDate === '2026-09-14')!;
    const after = withResults.find((week) => week.startDate === '2026-09-14')!;
    expect(after.sessions).toHaveLength(before.sessions.length);
  });
});

describe('weekly_shape.md v3, R-WS-15 (Week 1 frozen, documented exception)', () => {
  it('is exempt from the ordinary weekly template', () => {
    const week1 = weeks.find((week) => week.startDate === '2026-09-07')!;
    expect(validateWeek(week1)).toHaveLength(0);
  });
});

describe('weekly_shape.md v3 (race week, 2026-10-05)', () => {
  it('trail_event replaces trail_maintenance and adds no sixth day; run_intervals keeps its Tuesday slot', () => {
    expect(raceWeek.sessions.filter((session) => session.kind === 'trail_maintenance')).toHaveLength(0);
    const events = raceWeek.sessions.filter((session) => session.kind === 'trail_event');
    expect(events).toHaveLength(1);
    expect(events[0]?.date).toBe('2026-10-11');
    expect(raceWeek.sessions).toHaveLength(5);
    expect(raceWeek.sessions.some((session) => session.kind === 'run_intervals')).toBe(true);
    expect(validateWeek(raceWeek)).toHaveLength(0);
  });
});

describe('weekly_shape.md v3, taper/event week (2026-11-16)', () => {
  it('drops the Friday police session before the fixed police_event; run_intervals stays (R-WS-22, Week 11 never moves)', () => {
    expect(taperWeek.sessions.some((session) => session.kind === 'police_integration')).toBe(false);
    expect(taperWeek.sessions.some((session) => session.kind === 'police_strength_transitions')).toBe(false);
    const event = taperWeek.sessions.find((session) => session.kind === 'police_event');
    expect(event?.date).toBe('2026-11-20');
    expect(event?.status).toBe('fixed_event');
    expect(taperWeek.sessions.some((session) => session.kind === 'run_intervals')).toBe(true);
  });
});

// CHANGE_REQUEST_002 — R-WS-16/17/18 (every police session, exactly one hiit
// block; ≤ 10 min and last before cool-down in police_technique; 10-20 min
// in police_strength_transitions/police_integration), plus the two short-form
// checks from R-WS-09 and the memory-prompt "no explain" rule.
describe('weekly_shape.md v2/v3, R-WS-16/17/18 (CR-002 hiit block)', () => {
  it('R-WS-16/18: police_integration (room, even week) has exactly one 10-20 min hiit block', () => {
    const session = genericWeek.sessions.find((session) => session.kind === 'police_integration')!;
    const recipe = recipeById[session.recipeId]!;
    const hiitBlocks = recipe.blocks.filter((block) => block.hiit);
    expect(hiitBlocks).toHaveLength(1);
    expect(hiitBlocks[0]!.hiit!.durationMin).toBeGreaterThanOrEqual(10);
    expect(hiitBlocks[0]!.hiit!.durationMin).toBeLessThanOrEqual(20);
  });

  it('R-WS-16/18/09: the bank recipe `outdoor` still carries its ≤ 10 min hiit block (no longer scheduled from week 3 — CR-013)', () => {
    const recipe = recipes.outdoor!;
    const hiitBlocks = recipe.blocks.filter((block) => block.hiit);
    expect(hiitBlocks).toHaveLength(1);
    expect(hiitBlocks[0]!.hiit!.durationMin).toBeLessThanOrEqual(10);
    // R-WS-09's "day before the run" check now only ever fires on the weeks
    // generated under v3; v4 drops R-WS-09 outright (see APP_REPORT_013.md).
    expect(v4Week.sessions.some((session) => session.recipeId === recipe.id)).toBe(false);
  });

  it('R-WS-16/17: police_technique (coordination, now Thursday) has its hiit block last, ≤ 10 min ("Corde EMOM — 6 min")', () => {
    const session = genericWeek.sessions.find((session) => session.kind === 'police_technique')!;
    expect(session.date).toBe('2026-09-17');
    const recipe = recipeById[session.recipeId]!;
    const hiitBlocks = recipe.blocks.filter((block) => block.hiit);
    expect(hiitBlocks).toHaveLength(1);
    expect(hiitBlocks[0]!.title).toBe('Corde EMOM — 6 min');
    expect(hiitBlocks[0]!.hiit!.durationMin).toBeLessThanOrEqual(10);
    expect(recipe.blocks.at(-1)).toBe(hiitBlocks[0]);
    expect(validateWeek(genericWeek).some((error) => error.includes('R-WS-16') || error.includes('R-WS-17'))).toBe(false);
  });

  it('R-WS-17: Week 1 Friday (already built to the rule) has its hiit block last, ≤ 10 min — exempt from the check but true anyway', () => {
    const recipe = recipeById['week1-fri-2026-09-11-v3']!;
    const hiitBlocks = recipe.blocks.filter((block) => block.hiit);
    expect(hiitBlocks).toHaveLength(1);
    expect(hiitBlocks[0]!.hiit!.durationMin).toBeLessThanOrEqual(10);
  });

  it('is exempt for Week 1 (R-WS-15), same as R-WS-07', () => {
    const week1 = generatePlan().find((week) => week.startDate === '2026-09-07')!;
    const errors = validateWeek(week1).filter((error) => error.includes('R-WS-16') || error.includes('R-WS-17') || error.includes('R-WS-18'));
    expect(errors).toHaveLength(0);
  });

  it("R-WS-16 fails for a police session whose recipe has no hiit block at all (fixture, the unused 'technique' bank recipe)", () => {
    const recipe = recipes.technique!;
    expect(recipe.blocks.some((block) => block.hiit)).toBe(false);
    const fixtureWeek: TrainingWeek = {
      id: 'fixture-week', startDate: '2026-09-14', endDate: '2026-09-20', phase: 'learn',
      sessions: [{
        id: 'fixture:police_technique', date: '2026-09-15', dayLabel: 'MAR', kind: 'police_technique',
        recipeId: recipe.id, status: 'proposed', phase: 'learn', load: 'low', volumeFactor: 1
      }]
    };
    expect(validateWeek(fixtureWeek).some((error) => error.includes('R-WS-16'))).toBe(true);
  });

  it('R-WS-09: the day after a CrossFit class rated effort 4-5, the next police session should shorten its hiit block', () => {
    const week = generatePlan().find((week) => week.startDate === '2026-09-14')!;
    const crossfit = week.sessions.find((session) => session.kind === 'crossfit_class')!;
    const notes = hiitShortFormNotes(week, {
      [crossfit.id]: { sessionId: crossfit.id, status: 'done', effort: 5, note: '', completedAt: new Date().toISOString() }
    });
    // Monday is now followed by run_intervals, not a police session (v3
    // shape), so there is no next-day police session to shorten.
    expect(notes).toHaveLength(0);
  });

  it('memory prompts never ask to explain', () => {
    expect(memoryPromptsAskingToExplain()).toHaveLength(0);
  });
});
