// CHANGE_REQUEST_001 — one test per hard rule in weekly_shape.md v2
// (R-WS-01 … R-WS-15; R-WS-16/17/18 are CR-002's HIIT-block rules, out of
// scope here). Uses week 2 (2026-09-14), a fully generic week under the new
// template, plus the race week (2026-10-05) and the taper/event week
// (2026-11-16) for the rules that only show up there.
import { describe, expect, it } from 'vitest';
import { countMemoryExposures, generatePlan, validateWeek } from '../coach/planner';
import { recipeById } from '../coach/recipes';

const weeks = generatePlan();
const genericWeek = weeks.find((week) => week.startDate === '2026-09-14')!;
const raceWeek = weeks.find((week) => week.startDate === '2026-10-05')!;
const taperWeek = weeks.find((week) => week.startDate === '2026-11-16')!;

describe('weekly_shape.md v2 hard rules, on a generic week (2026-09-14)', () => {
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

  it('R-WS-03: exactly one run, type trail_maintenance, on Saturday or Sunday', () => {
    const runs = genericWeek.sessions.filter((session) => session.kind === 'trail_maintenance');
    expect(runs).toHaveLength(1);
    expect(['2026-09-19', '2026-09-20']).toContain(runs[0]?.date);
    expect(validateWeek(genericWeek)).not.toContain('La course de maintien doit être le samedi ou le dimanche.');
  });

  it('R-WS-04: the run is run-only, no police/balance/memory finisher attached', () => {
    const run = genericWeek.sessions.find((session) => session.kind === 'trail_maintenance')!;
    const recipe = recipeById[run.recipeId]!;
    expect(recipe.blocks).toHaveLength(1);
    expect(recipe.blocks[0]!.stationMappings).toHaveLength(0);
    expect(recipe.memory).toBeUndefined();
  });

  it('R-WS-07: three police sessions per week (technique, strength_transitions, integration)', () => {
    for (const kind of ['police_technique', 'police_strength_transitions', 'police_integration'] as const) {
      expect(genericWeek.sessions.filter((session) => session.kind === kind)).toHaveLength(1);
    }
    expect(validateWeek(genericWeek)).toHaveLength(0);
  });

  it('R-WS-08: no interval block becomes its own run or session', () => {
    expect(genericWeek.sessions.some((session) => session.kind === 'running_intervals_exception')).toBe(false);
  });

  it('R-WS-10: never three consecutive hard days', () => {
    const hardDates = genericWeek.sessions.filter((session) => session.load === 'hard').map((session) => session.date).sort();
    for (let index = 2; index < hardDates.length; index += 1) {
      const span = (Date.parse(`${hardDates[index]}T12:00:00Z`) - Date.parse(`${hardDates[index - 2]}T12:00:00Z`)) / 86_400_000;
      expect(span).not.toBe(2);
    }
  });

  it('R-WS-12: four memory exposures per week, attached to sessions A-D', () => {
    expect(countMemoryExposures(genericWeek)).toBe(4);
    const runSession = genericWeek.sessions.find((session) => session.kind === 'trail_maintenance')!;
    expect(recipeById[runSession.recipeId]?.memory).toBeUndefined();
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

describe('weekly_shape.md v2, R-WS-15 (Week 1 frozen, documented exception)', () => {
  it('is exempt from the ordinary 3-police-kind template', () => {
    const week1 = weeks.find((week) => week.startDate === '2026-09-07')!;
    expect(validateWeek(week1)).toHaveLength(0);
  });
});

describe('weekly_shape.md v2, R-WS-06 (race week, 2026-10-05)', () => {
  it('trail_event replaces trail_maintenance and adds no sixth day', () => {
    expect(raceWeek.sessions.filter((session) => session.kind === 'trail_maintenance')).toHaveLength(0);
    const events = raceWeek.sessions.filter((session) => session.kind === 'trail_event');
    expect(events).toHaveLength(1);
    expect(events[0]?.date).toBe('2026-10-11');
    expect(raceWeek.sessions).toHaveLength(5);
    expect(validateWeek(raceWeek)).toHaveLength(0);
  });
});

describe('weekly_shape.md v2, taper/event week (2026-11-16)', () => {
  it('drops the two hard police sessions before the fixed police_event', () => {
    expect(taperWeek.sessions.some((session) => session.kind === 'police_integration')).toBe(false);
    expect(taperWeek.sessions.some((session) => session.kind === 'police_strength_transitions')).toBe(false);
    const event = taperWeek.sessions.find((session) => session.kind === 'police_event');
    expect(event?.date).toBe('2026-11-20');
    expect(event?.status).toBe('fixed_event');
  });
});
