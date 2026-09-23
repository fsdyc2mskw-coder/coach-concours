// CHANGE_REQUEST_017 — one test per line of the change request's test list,
// plus the two screens it names (the baseline group in Retour and the
// "Référence" card on Parcours).
//
// `.test.ts`, not `.tsx`: the app element is built with `createElement` so
// the file parses without the JSX loader, exactly as the CR-010 and CR-011
// Retour tests do.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CoachConcoursApp from '../CoachConcoursApp';
import {
  BASELINE_SKILL_SESSION_ID,
  BASELINE_TRAIL_SESSION_ID,
  baselineBlockFor,
  baselineBlockOf,
  baselineReference,
  bestBroadJumpCm,
  bestSprint20mS,
  vmaKmh,
  withBaselineBlock
} from '../coach/baseline';
import { applyDayMoves, planWithMoves, withMove } from '../coach/dayMoves';
import { generatePlan } from '../coach/planner';
import { recipeById } from '../coach/recipes';
import { buildChainSessionRecipe, buildSkillSessionRecipe } from '../coach/sessionShapes';
import type { DayMove, SessionResult, TrainingWeek } from '../coach/types';

const WEEK3 = '2026-09-21';
const weekOf = (weeks: TrainingWeek[], startDate: string) => weeks.find((week) => week.startDate === startDate)!;

// Every session of the whole plan, with the recipe each screen really renders
// for it (the shared recipe plus this session's baseline block, if any).
function allSessionsWithRecipes(weeks: TrainingWeek[]) {
  return weeks.flatMap((week) => week.sessions.map((session) => ({
    session,
    recipe: withBaselineBlock(recipeById[session.recipeId]!, session.id)
  })));
}

const result = (sessionId: string, fields: Partial<SessionResult>): SessionResult => ({
  sessionId, status: 'done', effort: 3, note: '', completedAt: '2026-09-23T18:00:00.000Z', ...fields
});

describe('CR-017 A — where the baseline sits', () => {
  it('only the week 3 skill session and the week 3 trail run carry a baseline block', () => {
    const carrying = allSessionsWithRecipes(generatePlan())
      .filter(({ recipe }) => baselineBlockOf(recipe) !== null)
      .map(({ session }) => session.id);

    expect(carrying).toEqual([BASELINE_SKILL_SESSION_ID, BASELINE_TRAIL_SESSION_ID]);
  });

  it('R-TB-01 — no session in any other week carries one, not even the same recipes', () => {
    // The trail run is the sharp case: every week's weekend run uses the very
    // same `trail-maintenance-v1` recipe object as week 3's.
    const trailRuns = allSessionsWithRecipes(generatePlan())
      .filter(({ session }) => session.kind === 'trail_maintenance');
    expect(trailRuns.length).toBeGreaterThan(1);

    for (const { session, recipe } of trailRuns) {
      const expected = session.id === BASELINE_TRAIL_SESSION_ID;
      expect(baselineBlockOf(recipe) !== null, session.id).toBe(expected);
    }
    // And the shared recipe itself was never mutated on the way through.
    expect(baselineBlockOf(recipeById['trail-maintenance-v1']!)).toBeNull();
  });

  it('the block sits right after the warm-up, i.e. first among the blocks', () => {
    const skill = withBaselineBlock(buildSkillSessionRecipe(3), BASELINE_SKILL_SESSION_ID);
    expect(skill.blocks[0]!.kind).toBe('baseline');
    // The reshaped week draws it before the memory block.
    expect(skill.blocks[1]!.kind).toBe('memory');

    const trail = withBaselineBlock(recipeById['trail-maintenance-v1']!, BASELINE_TRAIL_SESSION_ID);
    expect(trail.blocks[0]!.kind).toBe('baseline');
  });

  it('the skill session carries the jump and the sprint; the trail run carries the 6-min run', () => {
    const skill = baselineBlockFor(BASELINE_SKILL_SESSION_ID)!;
    const trail = baselineBlockFor(BASELINE_TRAIL_SESSION_ID)!;
    expect(skill.spec).toMatchObject({ kind: 'baseline', tests: ['broad_jump', 'sprint_20m'] });
    expect(trail.spec).toMatchObject({ kind: 'baseline', tests: ['six_min_run'] });
    expect(trail.faire).toContain('8-9 km au total');
  });

  it('the week 3 fixtures are otherwise unchanged block for block', () => {
    const week = weekOf(generatePlan(), WEEK3);

    // The chain session and every other week 3 session: untouched.
    const chain = week.sessions.find((session) => session.kind === 'chain_session')!;
    expect(withBaselineBlock(recipeById[chain.recipeId]!, chain.id).blocks)
      .toEqual(buildChainSessionRecipe(3).blocks);

    // The two that do gain one: the baseline block is prepended and nothing
    // else moves or changes.
    const skill = week.sessions.find((session) => session.kind === 'skill_session')!;
    const skillBlocks = withBaselineBlock(recipeById[skill.recipeId]!, skill.id).blocks;
    expect(skillBlocks.slice(1)).toEqual(buildSkillSessionRecipe(3).blocks);

    const trail = week.sessions.find((session) => session.kind === 'trail_maintenance')!;
    const trailBlocks = withBaselineBlock(recipeById[trail.recipeId]!, trail.id).blocks;
    expect(trailBlocks.slice(1)).toEqual(recipeById['trail-maintenance-v1']!.blocks);

    // The week's shape itself is not touched by this request.
    expect(week.sessions.map((session) => session.id)).toEqual([
      '2026-09-21:crossfit_class',
      '2026-09-22:run_intervals',
      BASELINE_SKILL_SESSION_ID,
      '2026-09-25:chain_session',
      BASELINE_TRAIL_SESSION_ID
    ]);
  });
});

describe('CR-017 A — the baseline follows a CR-014 move', () => {
  // The athlete trains baseline 1 on Wednesday 23 and baseline 2 on Sunday
  // 27, so she drags both sessions off the days the generator put them on.
  const moves: DayMove[] = [
    { sessionId: BASELINE_SKILL_SESSION_ID, toDate: '2026-09-23', movedAt: '2026-09-23T08:00:00.000Z' },
    { sessionId: BASELINE_TRAIL_SESSION_ID, toDate: '2026-09-27', movedAt: '2026-09-23T08:00:00.000Z' }
  ];

  it('after a move of either session, the baseline block follows it', () => {
    const week = weekOf(applyDayMoves(generatePlan(), moves), WEEK3);

    const wednesday = week.sessions.find((session) => session.date === '2026-09-23')!;
    const sunday = week.sessions.find((session) => session.date === '2026-09-27')!;

    expect(wednesday.id).toBe(BASELINE_SKILL_SESSION_ID);
    expect(sunday.id).toBe(BASELINE_TRAIL_SESSION_ID);
    expect(baselineBlockOf(withBaselineBlock(recipeById[wednesday.recipeId]!, wednesday.id))).not.toBeNull();
    expect(baselineBlockOf(withBaselineBlock(recipeById[sunday.recipeId]!, sunday.id))).not.toBeNull();

    // And the days they came from no longer hold a baseline: it moved, it was
    // not copied.
    expect(week.sessions.some((session) => session.date === '2026-09-24')).toBe(false);
    expect(week.sessions.some((session) => session.date === '2026-09-26')).toBe(false);
  });

  it('a moved session keeps its baseline results bound to it', () => {
    const results: Record<string, SessionResult> = {
      [BASELINE_SKILL_SESSION_ID]: result(BASELINE_SKILL_SESSION_ID, { broadJumpCm: [198, 212, 205], sprint20mS: [4.3, 4.12, 4.2] }),
      [BASELINE_TRAIL_SESSION_ID]: result(BASELINE_TRAIL_SESSION_ID, { sixMinRunM: 1040 })
    };
    const week = weekOf(planWithMoves(results, moves, '2026-09-23'), WEEK3);
    const wednesday = week.sessions.find((session) => session.date === '2026-09-23')!;

    // The move rewrites `date`, never `id`, and `results` is keyed by `id`.
    expect(results[wednesday.id]!.broadJumpCm).toEqual([198, 212, 205]);
    expect(baselineReference(results)).toEqual({
      bestBroadJumpCm: 212, bestSprint20mS: 4.12, sixMinRunM: 1040, vmaKmh: 10.4
    });
  });

  it('a second move (she moves it again) keeps the block and the values', () => {
    const results: Record<string, SessionResult> = { [BASELINE_TRAIL_SESSION_ID]: result(BASELINE_TRAIL_SESSION_ID, { sixMinRunM: 1040 }) };
    const twice = withMove(withMove(moves, BASELINE_TRAIL_SESSION_ID, '2026-09-27'), BASELINE_TRAIL_SESSION_ID, '2026-09-25');
    const week = weekOf(planWithMoves(results, twice, '2026-09-23'), WEEK3);
    const moved = week.sessions.find((session) => session.id === BASELINE_TRAIL_SESSION_ID)!;

    expect(moved.date).toBe('2026-09-25');
    expect(baselineBlockOf(withBaselineBlock(recipeById[moved.recipeId]!, moved.id))).not.toBeNull();
    expect(results[moved.id]!.sixMinRunM).toBe(1040);
  });
});

describe('CR-017 B — stored, and computed', () => {
  it('best jump is the max, best sprint is the min, VMA is the distance / 100', () => {
    const jumpAndSprint = result(BASELINE_SKILL_SESSION_ID, { broadJumpCm: [198, 212, 205], sprint20mS: [4.3, 4.12, 4.2] });
    expect(bestBroadJumpCm(jumpAndSprint)).toBe(212);
    expect(bestSprint20mS(jumpAndSprint)).toBe(4.12);
    expect(vmaKmh(result(BASELINE_TRAIL_SESSION_ID, { sixMinRunM: 1040 }))).toBe(10.4);
  });

  it('no stored field exists for the best jump, the best sprint or the VMA', () => {
    const stored = result(BASELINE_SKILL_SESSION_ID, { broadJumpCm: [198, 212, 205], sprint20mS: [4.3, 4.12, 4.2] });
    // R-TB-02 / R-TB-03: the three derived numbers are absent from the record
    // itself, so nothing can ever be typed into them.
    for (const key of ['bestBroadJumpCm', 'bestSprint20mS', 'vmaKmh', 'bestJump', 'bestSprint', 'vma']) {
      expect(Object.hasOwn(stored, key), key).toBe(false);
    }
  });

  it('a partly-filled baseline computes from what is there, and an empty one computes nothing', () => {
    expect(bestBroadJumpCm(result('x', { broadJumpCm: [201] }))).toBe(201);
    expect(bestBroadJumpCm(result('x', {}))).toBeUndefined();
    expect(bestSprint20mS(result('x', { sprint20mS: [] }))).toBeUndefined();
    expect(vmaKmh(result('x', {}))).toBeUndefined();
    expect(baselineReference({})).toEqual({});
  });

  it('schemaVersion stays 2 and the three fields are optional', () => {
    // A record with no baseline field at all is still a valid SessionResult:
    // it type-checks here, which is the whole claim.
    const before: SessionResult = result('2026-09-25:chain_session', {});
    expect(before.broadJumpCm).toBeUndefined();
    expect(before.sprint20mS).toBeUndefined();
    expect(before.sixMinRunM).toBeUndefined();
  });
});

// ---------- the screens ----------

describe('CR-017 C — the screens', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    // The last day of week 3, so the week screen opens on week 3 itself and
    // both baseline sessions (Thu 24 and Sat 26 as generated) are already in
    // the past: the fields must still accept values on a past session.
    vi.setSystemTime(new Date('2026-09-27T12:00:00Z'));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  async function openRetourOn(cardTitle: string) {
    const { container } = render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);
    const matches = await screen.findAllByText(cardTitle);
    const card = matches.map((node) => node.closest('button.card')).find((node): node is HTMLButtonElement => node !== null);
    if (!card) throw new Error(`No week-card button found for "${cardTitle}"`);
    fireEvent.click(card);
    await screen.findByText('Ton programme');
    fireEvent.click(screen.getByText('Retour'));
    await screen.findByText('Toute la séance');
    return container;
  }

  // The bottom tab bar only exists on the week list, so a session has to be
  // closed before the Parcours tab can be reached.
  async function goToParcours(container: HTMLElement) {
    fireEvent.click(container.querySelector('button.back')!);
    await screen.findByText(/Séances/);
    fireEvent.click(screen.getByLabelText('Parcours'));
    await screen.findByText('Ton parcours');
  }

  it('the fields accept values on a past session, and the best is computed as she types', async () => {
    await openRetourOn('Séance compétence');

    fireEvent.change(screen.getByLabelText('Saut — essai 1') as HTMLInputElement, { target: { value: '198' } });
    fireEvent.change(screen.getByLabelText('Saut — essai 2') as HTMLInputElement, { target: { value: '212' } });
    fireEvent.change(screen.getByLabelText('Sprint — essai 1') as HTMLInputElement, { target: { value: '4.12' } });

    // Computed, shown read-only, never an input.
    await screen.findByText(/Meilleur saut : 212 cm · calculé/);
    await screen.findByText(/Meilleur sprint : 4\.12 s · calculé/);
    // Computed, shown as text: there is no input to type either of them into.
    expect(screen.queryByLabelText(/Meilleur saut/)).toBeNull();
    expect(screen.queryByLabelText(/Meilleur sprint/)).toBeNull();
  });

  it('the baseline group shows the conditions sentence and no target word', async () => {
    await openRetourOn('Séance compétence');
    await screen.findByText(/Mêmes chaussures, même surface, heure semblable, même méthode de chronométrage\./);
  });

  it('a typed baseline value survives leaving the tab (autosave)', async () => {
    await openRetourOn('Trail — sortie de maintien');
    const distance = await screen.findByLabelText('6 minutes — distance') as HTMLInputElement;
    fireEvent.change(distance, { target: { value: '1040' } });
    await screen.findByText(/VMA : 10\.4 km\/h · calculée/);

    vi.useRealTimers();
    await new Promise((resolve) => setTimeout(resolve, 700));

    fireEvent.click(screen.getByText('Prévu'));
    await screen.findByText('Ton programme');
    fireEvent.click(screen.getByText('Retour'));
    const reopened = await screen.findByLabelText('6 minutes — distance') as HTMLInputElement;
    expect(reopened.value).toBe('1040');
  });

  it('the Référence card shows only recorded values, and no target word', async () => {
    const container = await openRetourOn('Trail — sortie de maintien');
    fireEvent.change(await screen.findByLabelText('6 minutes — distance') as HTMLInputElement, { target: { value: '1040' } });
    vi.useRealTimers();
    await new Promise((resolve) => setTimeout(resolve, 700));

    await goToParcours(container);
    const card = (await screen.findByText(/RÉFÉRENCE, SEMAINE DU 21 SEPTEMBRE/)).closest('.kv')!;

    expect(card.textContent).toContain('6 minutes');
    expect(card.textContent).toContain('1 040 m');
    expect(card.textContent).toContain('VMA 10.4 km/h');
    // Only what was recorded: the jump and the sprint were never typed.
    expect(card.textContent).not.toContain('Saut en longueur');
    expect(card.textContent).not.toContain('Sprint 20 m');
    // R-TB-04.
    for (const forbidden of ['cible', 'objectif', 'prévu', 'prédit', '→', '↑', '↓']) {
      expect(card.textContent!.toLowerCase(), forbidden).not.toContain(forbidden.toLowerCase());
    }
  });

  it('the Référence card is absent until something is recorded', async () => {
    render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);
    fireEvent.click(screen.getByLabelText('Parcours'));
    await screen.findByText('Ton parcours');
    expect(screen.queryByText(/RÉFÉRENCE/)).toBeNull();
  });

  it('a session with no baseline block shows no baseline field', async () => {
    await openRetourOn('Séance enchaînement');
    expect(screen.queryByLabelText('6 minutes — distance')).toBeNull();
    expect(screen.queryByLabelText('Saut — essai 1')).toBeNull();
  });
});
