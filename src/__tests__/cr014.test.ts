// CHANGE_REQUEST_014 section F — one test per line of the change request's
// test list, plus two light screen tests for the edit-mode button and the
// locked past day (the drag itself is pointer geometry, which jsdom has no
// layout for: `document.elementFromPoint` always returns null there, so the
// drop path is covered through `applyDayMoves` rather than through a
// synthetic pointer gesture).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CoachConcoursApp from '../CoachConcoursApp';
import { applyDayMoves, planWithMoves, withMove } from '../coach/dayMoves';
import { generatePlan } from '../coach/planner';
import { checkWeek } from '../coach/weekChecker';
import { recipes } from '../coach/recipes';
import type { DayMove, PlannedSession, TrainingWeek } from '../coach/types';

// A date inside week 2 (2026-09-14 … 2026-09-20), the first fully generic
// week under the current template. Every move test uses it as "today" so the
// past/future split is the same whatever the wall clock says.
const TODAY = '2026-09-14';
const WEEK2 = '2026-09-14';

const weekOf = (weeks: TrainingWeek[], startDate: string) => weeks.find((week) => week.startDate === startDate)!;
const sessionOn = (week: TrainingWeek, date: string) => week.sessions.find((session) => session.date === date)!;

describe('CR-014 applyDayMoves', () => {
  it('a move survives a reload (generatePlan then apply)', () => {
    const friday = sessionOn(weekOf(generatePlan(), WEEK2), '2026-09-18');
    const moves: DayMove[] = [{ sessionId: friday.id, toDate: '2026-09-20', movedAt: '2026-09-14T08:00:00.000Z' }];

    // Two independent "reloads": each rebuilds the plan from the rules and
    // lays the same stored move back on top of it.
    for (const attempt of [1, 2]) {
      const week = weekOf(planWithMoves({}, moves, TODAY), WEEK2);
      const moved = week.sessions.find((session) => session.id === friday.id)!;
      expect(moved.date, `reload ${attempt}`).toBe('2026-09-20');
      expect(moved.dayLabel).toBe('DIM');
      expect(week.sessions.some((session) => session.date === '2026-09-18')).toBe(false);
    }
  });

  it('the session id and the recorded result stay bound after a move', () => {
    const friday = sessionOn(weekOf(generatePlan(), WEEK2), '2026-09-18');
    const results = {
      [friday.id]: { sessionId: friday.id, status: 'done' as const, effort: 3 as const, note: '', completedAt: '2026-09-18T18:00:00.000Z' }
    };
    const moves: DayMove[] = [{ sessionId: friday.id, toDate: '2026-09-20', movedAt: '2026-09-14T08:00:00.000Z' }];
    const moved = weekOf(planWithMoves(results, moves, TODAY), WEEK2).sessions.find((session) => session.date === '2026-09-20')!;

    expect(moved.id).toBe(friday.id);
    expect(results[moved.id]).toBeDefined();
    // Only `date` and `dayLabel` change; everything the generator wrote stays.
    expect(moved.recipeId).toBe(friday.recipeId);
    expect(moved.kind).toBe(friday.kind);
    expect(moved.load).toBe(friday.load);
    expect(moved.phase).toBe(friday.phase);
    expect(moved.volumeFactor).toBe(friday.volumeFactor);
  });

  it('a move into the past is dropped', () => {
    const saturday = sessionOn(weekOf(generatePlan(), WEEK2), '2026-09-19');
    const moves: DayMove[] = [{ sessionId: saturday.id, toDate: '2026-09-15', movedAt: '2026-09-16T08:00:00.000Z' }];
    // "Today" is the Thursday of that week, so Tuesday 15 has passed.
    const week = weekOf(planWithMoves({}, moves, '2026-09-17'), WEEK2);
    expect(sessionOn(week, '2026-09-19').id).toBe(saturday.id);
    // Tuesday 15 keeps its own generated session and nothing else.
    expect(week.sessions.filter((session) => session.date === '2026-09-15')).toHaveLength(1);
    expect(week.sessions.find((session) => session.id === saturday.id)!.date).toBe('2026-09-19');
  });

  it('a move outside the session own week is dropped', () => {
    const saturday = sessionOn(weekOf(generatePlan(), WEEK2), '2026-09-19');
    const moves: DayMove[] = [{ sessionId: saturday.id, toDate: '2026-09-22', movedAt: '2026-09-14T08:00:00.000Z' }];
    const weeks = planWithMoves({}, moves, TODAY);
    expect(sessionOn(weekOf(weeks, WEEK2), '2026-09-19').id).toBe(saturday.id);
    expect(weeks.every((week) => !week.sessions.some((session) => session.id === saturday.id && session.date === '2026-09-22'))).toBe(true);
  });

  it('a move of an unknown sessionId is dropped', () => {
    const before = generatePlan();
    const moves: DayMove[] = [{ sessionId: '2026-09-18:kind_that_no_longer_exists', toDate: '2026-09-20', movedAt: '2026-09-14T08:00:00.000Z' }];
    expect(applyDayMoves(before, moves, TODAY)).toEqual(before);
  });

  it('two sessions may sit on one date', () => {
    const friday = sessionOn(weekOf(generatePlan(), WEEK2), '2026-09-18');
    const moves: DayMove[] = [{ sessionId: friday.id, toDate: '2026-09-19', movedAt: '2026-09-14T08:00:00.000Z' }];
    const week = weekOf(planWithMoves({}, moves, TODAY), WEEK2);
    const saturday = week.sessions.filter((session) => session.date === '2026-09-19');
    expect(saturday).toHaveLength(2);
    expect(saturday.map((session) => session.id)).toContain(friday.id);
    // The count of 5 principal sessions is never touched by a move.
    expect(week.sessions).toHaveLength(5);
  });

  it('a fixed_event (11 Oct trail race, 20 Nov police test) is never moved', () => {
    const raceWeek = weekOf(generatePlan(), '2026-10-05');
    const race = sessionOn(raceWeek, '2026-10-11');
    expect(race.status).toBe('fixed_event');
    const movedRace = weekOf(planWithMoves({}, [{ sessionId: race.id, toDate: '2026-10-10', movedAt: '2026-10-05T08:00:00.000Z' }], '2026-10-05'), '2026-10-05');
    expect(sessionOn(movedRace, '2026-10-11').id).toBe(race.id);

    const taperWeek = weekOf(generatePlan(), '2026-11-16');
    const test = sessionOn(taperWeek, '2026-11-20');
    expect(test.status).toBe('fixed_event');
    const movedTest = weekOf(planWithMoves({}, [{ sessionId: test.id, toDate: '2026-11-19', movedAt: '2026-11-16T08:00:00.000Z' }], '2026-11-16'), '2026-11-16');
    expect(sessionOn(movedTest, '2026-11-20').id).toBe(test.id);
  });

  it('a move onto a fixed_event date is refused like a past day', () => {
    const raceWeek = weekOf(generatePlan(), '2026-10-05');
    const monday = sessionOn(raceWeek, '2026-10-05');
    const moved = weekOf(planWithMoves({}, [{ sessionId: monday.id, toDate: '2026-10-11', movedAt: '2026-10-05T08:00:00.000Z' }], '2026-10-05'), '2026-10-05');
    expect(sessionOn(moved, '2026-10-05').id).toBe(monday.id);
    expect(moved.sessions.filter((session) => session.date === '2026-10-11')).toHaveLength(1);
  });

  it('one move per sessionId: a new move replaces the previous one', () => {
    const friday = sessionOn(weekOf(generatePlan(), WEEK2), '2026-09-18');
    const first = withMove(undefined, friday.id, '2026-09-19', '2026-09-14T08:00:00.000Z');
    const second = withMove(first, friday.id, '2026-09-20', '2026-09-14T09:00:00.000Z');
    expect(second).toHaveLength(1);
    const week = weekOf(planWithMoves({}, second, TODAY), WEEK2);
    expect(week.sessions.find((session) => session.id === friday.id)!.date).toBe('2026-09-20');
    expect(week.sessions.filter((session) => session.date === '2026-09-19')).toHaveLength(1);
  });
});

// ---------- the checker ----------
//
// The checker is a pure function over a week, so most cases are built as
// fixtures rather than reached through a chain of moves: one fixture per
// check, with only the property under test set.

let fixtureSeed = 0;
function session(date: string, kind: PlannedSession['kind'], load: PlannedSession['load'], recipeId: string): PlannedSession {
  fixtureSeed += 1;
  return { id: `${date}:${kind}:${fixtureSeed}`, date, dayLabel: '', kind, recipeId, status: 'proposed', phase: 'learn', load, volumeFactor: 1 };
}
function fixtureWeek(sessions: PlannedSession[]): TrainingWeek {
  return { id: 'week-2026-09-14', startDate: '2026-09-14', endDate: '2026-09-20', phase: 'learn', sessions: [...sessions].sort((a, b) => a.date.localeCompare(b.date)) };
}
const codes = (week: TrainingWeek) => checkWeek(week).map((flag) => flag.code);

describe('CR-014 checkWeek', () => {
  it('the generated standard week returns no flag at all', () => {
    // The test that matters most: the checker is silent until she moves
    // something. Checked on every generated week, not only week 2.
    for (const week of generatePlan()) {
      expect(checkWeek(week), `flags on ${week.startDate}`).toEqual([]);
    }
  });

  it('a stacked day silences every other check', () => {
    const week = fixtureWeek([
      session('2026-09-14', 'crossfit_class', 'hard', recipes.crossfit!.id),
      session('2026-09-15', 'police_integration', 'hard', recipes.room!.id),
      session('2026-09-15', 'police_strength_transitions', 'hard', recipes.outdoor!.id),
      session('2026-09-16', 'trail_maintenance', 'moderate', recipes.trailMaintenance!.id)
    ]);
    // Without the stack this week would raise C1 and C6 at least.
    expect(codes(week)).toEqual(['STACK']);
    expect(checkWeek(week)[0]!.date).toBe('2026-09-15');
  });

  it('C1 is not raised for crossfit next to run_intervals', () => {
    const accepted = fixtureWeek([
      session('2026-09-14', 'crossfit_class', 'hard', recipes.crossfit!.id),
      session('2026-09-15', 'running_intervals_exception', 'hard', recipes.week1Tue8Sep!.id)
    ]);
    expect(codes(accepted)).not.toContain('C1');

    // Any other pair of hard days side by side does raise it.
    const other = fixtureWeek([
      session('2026-09-14', 'crossfit_class', 'hard', recipes.crossfit!.id),
      session('2026-09-15', 'police_integration', 'hard', recipes.room!.id)
    ]);
    expect(codes(other)).toContain('C1');
    expect(checkWeek(other).find((flag) => flag.code === 'C1')!.date).toBe('2026-09-15');
  });

  it('C1 is suppressed inside a C2 window', () => {
    const week = fixtureWeek([
      session('2026-09-14', 'crossfit_class', 'hard', recipes.crossfit!.id),
      session('2026-09-15', 'police_integration', 'hard', recipes.room!.id),
      session('2026-09-16', 'police_strength_transitions', 'hard', recipes.outdoor!.id)
    ]);
    const flags = checkWeek(week);
    expect(flags.map((flag) => flag.code)).toEqual(['C2']);
    expect(flags[0]!.hard).toBe(true);
  });

  it('C2 fires on three hard days in a row and not otherwise', () => {
    const three = fixtureWeek([
      session('2026-09-14', 'crossfit_class', 'hard', recipes.crossfit!.id),
      session('2026-09-15', 'police_integration', 'hard', recipes.room!.id),
      session('2026-09-16', 'police_strength_transitions', 'hard', recipes.outdoor!.id)
    ]);
    expect(codes(three)).toContain('C2');

    const twoThenGap = fixtureWeek([
      session('2026-09-14', 'crossfit_class', 'hard', recipes.crossfit!.id),
      session('2026-09-15', 'police_integration', 'hard', recipes.room!.id),
      session('2026-09-17', 'police_strength_transitions', 'hard', recipes.outdoor!.id)
    ]);
    expect(codes(twoThenGap)).not.toContain('C2');
  });

  it('C3 fires on more than three training days in a row and not otherwise', () => {
    const four = fixtureWeek([
      session('2026-09-14', 'crossfit_class', 'low', recipes.crossfit!.id),
      session('2026-09-15', 'police_technique', 'low', recipes.coordination!.id),
      session('2026-09-16', 'police_technique', 'low', recipes.technique!.id),
      session('2026-09-17', 'police_technique', 'low', recipes.coordination!.id)
    ]);
    const flag = checkWeek(four).find((item) => item.code === 'C3')!;
    expect(flag).toBeDefined();
    expect(flag.date).toBe('2026-09-17');

    const three = fixtureWeek([
      session('2026-09-14', 'crossfit_class', 'low', recipes.crossfit!.id),
      session('2026-09-15', 'police_technique', 'low', recipes.coordination!.id),
      session('2026-09-16', 'police_technique', 'low', recipes.technique!.id)
    ]);
    expect(codes(three)).not.toContain('C3');
  });

  it('C4 fires on a police session with an intervals HIIT the day after the run intervals, and not otherwise', () => {
    const dayAfter = fixtureWeek([
      session('2026-09-14', 'running_intervals_exception', 'moderate', recipes.week1Tue8Sep!.id),
      session('2026-09-15', 'police_integration', 'hard', recipes.room!.id)
    ]);
    expect(recipes.room!.blocks.filter((block) => block.hiit).map((block) => block.hiit!.format)).toEqual(['intervals']);
    expect(codes(dayAfter)).toContain('C4');

    // The same police session two days later says nothing.
    const twoDaysAfter = fixtureWeek([
      session('2026-09-14', 'running_intervals_exception', 'moderate', recipes.week1Tue8Sep!.id),
      session('2026-09-16', 'police_integration', 'hard', recipes.room!.id)
    ]);
    expect(codes(twoDaysAfter)).not.toContain('C4');

    // A police session whose HIIT is not running intervals says nothing either.
    const emomNextDay = fixtureWeek([
      session('2026-09-14', 'running_intervals_exception', 'moderate', recipes.week1Tue8Sep!.id),
      session('2026-09-15', 'police_technique', 'low', recipes.coordination!.id)
    ]);
    expect(recipes.coordination!.blocks.filter((block) => block.hiit).map((block) => block.hiit!.format)).toEqual(['emom']);
    expect(codes(emomNextDay)).not.toContain('C4');
  });

  it('C5 fires on the two runs side by side and not otherwise', () => {
    const adjacent = fixtureWeek([
      session('2026-09-18', 'running_intervals_exception', 'moderate', recipes.week1Tue8Sep!.id),
      session('2026-09-19', 'trail_maintenance', 'moderate', recipes.trailMaintenance!.id)
    ]);
    const flag = checkWeek(adjacent).find((item) => item.code === 'C5')!;
    expect(flag).toBeDefined();
    expect(flag.date).toBe('2026-09-19');

    const apart = fixtureWeek([
      session('2026-09-17', 'running_intervals_exception', 'moderate', recipes.week1Tue8Sep!.id),
      session('2026-09-19', 'trail_maintenance', 'moderate', recipes.trailMaintenance!.id)
    ]);
    expect(codes(apart)).not.toContain('C5');
  });

  it('C6 fires when the trail leaves the weekend and not otherwise', () => {
    const midweek = fixtureWeek([session('2026-09-16', 'trail_maintenance', 'moderate', recipes.trailMaintenance!.id)]);
    const flag = checkWeek(midweek).find((item) => item.code === 'C6')!;
    expect(flag).toBeDefined();
    expect(flag.date).toBe('2026-09-16');

    for (const weekendDay of ['2026-09-19', '2026-09-20']) {
      const weekend = fixtureWeek([session(weekendDay, 'trail_maintenance', 'moderate', recipes.trailMaintenance!.id)]);
      expect(codes(weekend), weekendDay).not.toContain('C6');
    }
  });
});

// ---------- the week screen in edit mode ----------

describe('CR-014 week screen', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    // Thursday of Week 1, the same anchor screens.test.ts uses.
    vi.setSystemTime(new Date('2026-09-10T12:00:00Z'));
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("Modifier l'ordre becomes Terminer and reveals one handle per movable session", async () => {
    const { container } = render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);
    expect(container.querySelectorAll('.handle').length).toBe(0);

    const edit = screen.getByRole('button', { name: "Modifier l'ordre" });
    fireEvent.click(edit);
    await screen.findByRole('button', { name: 'Terminer' });

    // Week 1 holds 5 sessions. On 10 September, Monday 7, Tuesday 8 and
    // Wednesday 9 have passed (three locked days); Thursday 10 is today and
    // still movable, so Thursday, Friday 11 and Saturday 12 carry a handle.
    expect(container.querySelectorAll('.card').length).toBe(5);
    expect(container.querySelectorAll('.handle').length).toBe(3);
    expect(container.querySelectorAll('.day .lock').length).toBe(3);
  });

  it('a week with no flag shows the silent line, not the banner', async () => {
    const { container } = render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);
    fireEvent.click(screen.getByRole('button', { name: "Modifier l'ordre" }));
    await screen.findByRole('button', { name: 'Terminer' });
    expect(container.querySelector('.banner')).toBeNull();
    expect(container.querySelector('.okline')!.textContent).toContain('aucun signalement');
  });
});
