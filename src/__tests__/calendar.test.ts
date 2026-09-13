// CHANGE_REQUEST_008 — Calendar test.
//
// Asserts the boundaries of the generated plan: it starts 2026-09-07 (the
// planStartDate frozen in src/coach/types.ts's CoachState), no session is
// ever dated after 2026-11-20 (the weekly_shape rule R-WS-13 the CR names —
// that rule document itself lives in the Drive "training brain" world, not
// in this repository; here it shows up structurally as `finalDate` in
// src/coach/planner.ts, which is what this test actually exercises), and
// the police event on 2026-11-20 carries status `fixed_event` — that exact
// string is a real member of `PlannedSession['status']` in src/coach/types.ts.
import { describe, expect, it } from 'vitest';
import { generatePlan } from '../coach/planner';
import { recipes } from '../coach/recipes';

const PLAN_START = '2026-09-07';
const TEST_DATE = '2026-11-20';

describe('calendar bounds of the generated plan', () => {
  const weeks = generatePlan();
  const allSessions = weeks.flatMap((week) => week.sessions);

  it('starts 2026-09-07', () => {
    expect(weeks[0]?.startDate).toBe(PLAN_START);
  });

  it('never dates a session after 2026-11-20', () => {
    for (const session of allSessions) {
      expect(session.date <= TEST_DATE).toBe(true);
    }
    // Also true of the week boundaries themselves.
    for (const week of weeks) {
      expect(week.endDate <= TEST_DATE).toBe(true);
    }
  });

  it('has the police event on 2026-11-20 with status fixed_event', () => {
    const policeEvent = allSessions.find((session) => session.kind === 'police_event');
    expect(policeEvent).toBeDefined();
    expect(policeEvent!.date).toBe(TEST_DATE);
    expect(policeEvent!.status).toBe('fixed_event');
    expect(policeEvent!.recipeId).toBe(recipes.policeEvent!.id);
  });
});
