// CHANGE_REQUEST_011 — Tuesday run_intervals: progression table, generator,
// R-WS-22 adjustment rule, and the Retour tab's per-rep pace group.
// `.test.ts`, not `.tsx`: the Retour-tab tests build the app element with
// `createElement` so the file parses without the JSX loader (same pattern as
// retour.test.ts).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CoachConcoursApp from '../CoachConcoursApp';
import { generatePlan, validateWeek } from '../coach/planner';
import { recipeById } from '../coach/recipes';
import { nextRow, runIntervalsProgression } from '../data/runIntervalsProgression';

const weeks = generatePlan();
function runIntervalsSession(startDate: string) {
  const week = weeks.find((w) => w.startDate === startDate)!;
  const session = week.sessions.find((s) => s.kind === 'run_intervals')!;
  return { week, session, recipe: recipeById[session.recipeId]! };
}

describe('CHANGE_REQUEST_011 — run_intervals generator', () => {
  it('Week 2 (2026-09-14): 4 × 3 min @ 6:00, duration 46 min', () => {
    const recipe = runIntervalsSession('2026-09-14').recipe;
    expect(recipe.durationMin).toBe(46);
    expect(recipe.blocks[0]!.faire).toContain('4 × 3 min à 6:00 /km');
  });

  it('Week 5 (2026-10-05): 3 × 2 min @ 5:50', () => {
    const recipe = runIntervalsSession('2026-10-05').recipe;
    expect(recipe.blocks[0]!.faire).toContain('3 × 2 min à 5:50 /km');
  });

  it('Week 11 (2026-11-16): 4 × 1 min @ 5:30', () => {
    const recipe = runIntervalsSession('2026-11-16').recipe;
    expect(recipe.blocks[0]!.faire).toContain('4 × 1 min à 5:30 /km');
  });

  it('every week 2-11 keeps the fixed frame: warm-up + exactly one main block + cool-down', () => {
    for (let weekNumber = 2; weekNumber <= 11; weekNumber += 1) {
      const startDate = weeks[weekNumber - 1]!.startDate;
      const { week, recipe } = runIntervalsSession(startDate);
      expect(recipe.blocks).toHaveLength(1);
      expect(recipe.warmup).toBeTruthy();
      expect(recipe.cooldown).toBeTruthy();
      expect(validateWeek(week).some((error) => error.includes('R-WS-04') || error.includes('R-WS-19'))).toBe(false);
    }
  });

  it('the main set never invents a row: it is read verbatim from the progression table (R-WS-20)', () => {
    for (let weekNumber = 2; weekNumber <= 11; weekNumber += 1) {
      const startDate = weeks[weekNumber - 1]!.startDate;
      const recipe = runIntervalsSession(startDate).recipe;
      const row = runIntervalsProgression[weekNumber - 2]!;
      expect(recipe.blocks[0]!.faire).toContain(`${row.reps} × ${row.minutes} min`);
    }
  });
});

describe('CHANGE_REQUEST_011 — nextRow (R-WS-22 repeat rule)', () => {
  const week2 = runIntervalsProgression[0]!; // target 6:00 = 360 s/km

  it('two reps more than 15 s/km slow → repeat', () => {
    expect(nextRow(week2, [380, 378, 362, 365])).toBe('repeat');
  });

  it('every rep more than 10 s/km fast → advanceFaster', () => {
    expect(nextRow(week2, [345, 348, 346, 349])).toBe('advanceFaster');
  });

  it('mixed, no rule triggered → advance', () => {
    expect(nextRow(week2, [365, 358, 362, 368])).toBe('advance');
  });
});

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-10T12:00:00Z'));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

async function openWeek2RunIntervalsRetour() {
  const { container } = render(createElement(CoachConcoursApp));
  await screen.findByText(/Séances/);
  // Week 1 is shown first (weekIndex 0); the third `.wtabs` button moves one
  // week forward, to Week 2 (2026-09-14), which has a run_intervals session.
  const nextWeekButton = container.querySelectorAll('.wtabs button')[2] as HTMLButtonElement;
  fireEvent.click(nextWeekButton);
  const matches = await screen.findAllByText('Intervalles course');
  const cardButton = matches.map((node) => node.closest('button.card')).find((node): node is HTMLButtonElement => node !== null);
  if (!cardButton) throw new Error('No week-card button found for "Intervalles course"');
  fireEvent.click(cardButton);
  await screen.findByText('Ton programme');
  fireEvent.click(screen.getByText('Retour'));
  await screen.findByText('Intervalles');
  return container;
}

describe('CHANGE_REQUEST_011 section D — Retour tab, run_intervals', () => {
  it('shows one pace box per rep (Week 2: 4 reps) plus "Répétitions faites"', async () => {
    await openWeek2RunIntervalsRetour();
    expect(screen.getByLabelText('Rép 1')).toBeTruthy();
    expect(screen.getByLabelText('Rép 2')).toBeTruthy();
    expect(screen.getByLabelText('Rép 3')).toBeTruthy();
    expect(screen.getByLabelText('Rép 4')).toBeTruthy();
    expect(screen.queryByLabelText('Rép 5')).toBeNull();
    expect(screen.getByLabelText('Répétitions faites')).toBeTruthy();
  });

  it('a typed pace persists after reload', async () => {
    await openWeek2RunIntervalsRetour();
    const input = screen.getByLabelText('Rép 1') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '6:05' } });

    vi.useRealTimers();
    await new Promise((resolve) => setTimeout(resolve, 700));

    fireEvent.click(screen.getByText('Prévu'));
    await screen.findByText('Ton programme');
    fireEvent.click(screen.getByText('Retour'));
    const reopened = await screen.findByLabelText('Rép 1') as HTMLInputElement;
    expect(reopened.value).toBe('6:05');
  });
});
