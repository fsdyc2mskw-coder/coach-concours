// CHANGE_REQUEST_010 — the week/session/block screen rebuild. This suite
// stays on `.test.ts` (not `.tsx`) like the rest of the harness, so it builds
// the app element with `createElement` instead of JSX — a `.ts` file is
// parsed without the JSX loader.
//
// Fixes "today" to a date inside Week 1 (2026-09-07 to 2026-09-13, per
// week1.test.ts) so the week screen that renders first is deterministic
// regardless of the real wall-clock date the suite runs on.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CoachConcoursApp from '../CoachConcoursApp';
import { flowStrip, recipes } from '../coach/recipes';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-10T12:00:00Z'));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('CR-010 week screen', () => {
  it('renders one card per session and one Repos line per rest day for Week 1 (5 sessions, 2 rest days)', async () => {
    const { container } = render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);
    expect(container.querySelectorAll('.card').length).toBe(5);
    expect(container.querySelectorAll('.rest').length).toBe(2);
  });
});

describe('CR-010 session screen, tab Prévu', () => {
  it('renders one numbered step per flow-strip node, each showing its faire (or warm-up/cool-down) text', async () => {
    const { container } = render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);
    const title = await screen.findByText(recipes.week1Fri11Sep!.title);
    fireEvent.click(title.closest('button')!);
    await screen.findByText('Ton programme');

    const recipe = recipes.week1Fri11Sep!;
    const nodes = flowStrip(recipe);
    const steps = container.querySelectorAll('.steps li');
    expect(steps.length).toBe(nodes.length);
    expect(steps.length).toBe(recipe.blocks.length + 2); // + warm-up + cool-down

    // Warm-up step (first) shows the recipe's warmup text.
    expect(steps[0]!.querySelector('.do')!.textContent).toBe(recipe.warmup);
    // Cool-down step (last) shows the recipe's cooldown text.
    expect(steps[steps.length - 1]!.querySelector('.do')!.textContent).toBe(recipe.cooldown);
    // A block step (station 2) shows that block's own faire text.
    const station2 = recipe.blocks.find((block) => block.title.startsWith('Poste 2'))!;
    const station2Step = Array.from(steps).find((li) => li.querySelector('.do')?.textContent === station2.faire);
    expect(station2Step).toBeDefined();
    expect(station2Step!.querySelector('.pill.rule')).not.toBeNull();
  });
});
