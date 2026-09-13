// CHANGE_REQUEST_008 — Week 1 test.
//
// Asserts that the Week 1 (7-13 Sep 2026) data produced by src/coach/planner.ts
// matches handoffs/WEEK_1_FINAL_2026-09-07_to_13.md v3 (Mon-Sun): 7 calendar
// days, 5 sessions (2 rest days), the kind/recipe/order per day, the recorded
// durations, and that Saturday is the only "week's run" slot (the
// running_intervals_exception on Tuesday is an explicitly documented
// exception that does not count as the week's run — see its own `purpose`
// text in src/coach/recipes.ts and the handoff's design-rules section).
//
// No behaviour is changed by this file: it only describes what the current
// code already does.
import { describe, expect, it } from 'vitest';
import { generatePlan } from '../coach/planner';
import { recipes } from '../coach/recipes';

const WEEK1_START = '2026-09-07';
const WEEK1_END = '2026-09-13';

describe('week 1 (2026-09-07 to 2026-09-13), per WEEK_1_FINAL v3', () => {
  const weeks = generatePlan();
  const week1 = weeks.find((week) => week.startDate === WEEK1_START);

  it('exists and spans exactly the 7 calendar days Mon-Sun', () => {
    expect(week1).toBeDefined();
    expect(week1!.endDate).toBe(WEEK1_END);
    const days =
      (Date.parse(`${WEEK1_END}T12:00:00Z`) - Date.parse(`${WEEK1_START}T12:00:00Z`)) / 86_400_000 + 1;
    expect(days).toBe(7);
  });

  it('has exactly 5 sessions and 2 rest days (Wed 9, Sun 13)', () => {
    expect(week1!.sessions).toHaveLength(5);
    expect(week1!.sessions.find((session) => session.date === '2026-09-09')).toBeUndefined();
    expect(week1!.sessions.find((session) => session.date === '2026-09-13')).toBeUndefined();
  });

  it('has the right kind and recipe, in date order, for each trained day', () => {
    const byDate = Object.fromEntries(week1!.sessions.map((session) => [session.date, session]));

    expect(byDate['2026-09-07']?.kind).toBe('crossfit_class');
    expect(byDate['2026-09-07']?.status).toBe('coached');

    expect(byDate['2026-09-08']?.kind).toBe('running_intervals_exception');
    expect(byDate['2026-09-08']?.recipeId).toBe(recipes.week1Tue8Sep!.id);

    expect(byDate['2026-09-10']?.kind).toBe('room_explosive_intervals');
    expect(byDate['2026-09-10']?.recipeId).toBe(recipes.week1Thu10Sep!.id);

    expect(byDate['2026-09-11']?.kind).toBe('police_technique');
    expect(byDate['2026-09-11']?.recipeId).toBe(recipes.week1Fri11Sep!.id);

    expect(byDate['2026-09-12']?.kind).toBe('trail_event');
    expect(byDate['2026-09-12']?.recipeId).toBe(recipes.week1Sat12Sep!.id);

    expect(week1!.sessions.map((session) => session.date)).toEqual([
      '2026-09-07',
      '2026-09-08',
      '2026-09-10',
      '2026-09-11',
      '2026-09-12'
    ]);
  });

  it('has Saturday as the only "week run" slot (trail_event/outdoor_explosive_intervals)', () => {
    const runSlots = week1!.sessions.filter(
      (session) => session.kind === 'trail_event' || session.kind === 'outdoor_explosive_intervals'
    );
    expect(runSlots).toHaveLength(1);
    expect(runSlots[0]?.date).toBe('2026-09-12');
  });

  it('records Tuesday running as a documented exception, not the week run', () => {
    // The handoff and the recipe text are both explicit that Tuesday does not
    // count as the week's run (Saturday does).
    expect(recipes.week1Tue8Sep!.purpose).toContain('Ne compte pas comme la course de la semaine');
  });

  it('has the durations recorded in WEEK_1_FINAL v3', () => {
    expect(recipes.week1Tue8Sep!.durationMin).toBe(47);
    expect(recipes.week1Thu10Sep!.durationMin).toBe(37);
    expect(recipes.week1Fri11Sep!.durationMin).toBe(40);
    // Coached CrossFit and the Saturday trail outing have no fixed duration:
    // CrossFit content is set by the coach, the trail run is measured after.
    expect(recipes.crossfit.durationMin).toBeNull();
    expect(recipes.week1Sat12Sep!.durationMin).toBeNull();
  });

  it('has the block count and order recorded for Thursday (rope, box, EMOM, racket, rope)', () => {
    const titles = recipes.week1Thu10Sep!.blocks.map((block) => block.title);
    expect(titles).toEqual([
      'Échauffement corde à sauter — 10 min',
      'Box jump, frais — 10 min',
      'Conditioning EMOM — 10 min',
      'Raquette et balle, facile — 3 min',
      'Corde EMOM — 4 min'
    ]);
  });

  it('has the block count and order recorded for Friday v3 (memory, station 2, racket ref, AMRAP, station 8)', () => {
    const titles = recipes.week1Fri11Sep!.blocks.map((block) => block.title);
    expect(titles).toEqual([
      'Mémoire du circuit — 4 min',
      'Poste 2, franchissement à la balle de tennis — 8 min',
      'Référence précision raquette-balle, fraîche — 5 min',
      'AMRAP 10 min',
      'Poste 8, couleurs sous fatigue — 5 min'
    ]);
  });

  it('has the 3-block structure recorded for Tuesday (warm-up, 2x6min, easy)', () => {
    const titles = recipes.week1Tue8Sep!.blocks.map((block) => block.title);
    expect(titles).toEqual([
      'Échauffement course facile — 20 min',
      '2 × 6 min à 6:00 min/km',
      'Course facile — 15 min'
    ]);
  });

  it('has the single-block structure recorded for Saturday (≈8 km, ≈150 m D+)', () => {
    expect(recipes.week1Sat12Sep!.blocks).toHaveLength(1);
    expect(recipes.week1Sat12Sep!.blocks[0]?.title).toBe('Sortie facile — ≈ 8 km, ≈ 150 m D+');
  });
});
