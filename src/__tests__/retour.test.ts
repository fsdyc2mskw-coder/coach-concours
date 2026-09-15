// CHANGE_REQUEST_010 section D — the Retour tab autosaves every field on
// change, grouped by block. `.test.ts`, not `.tsx`: builds the app element
// with `createElement` so the file parses without the JSX loader.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CoachConcoursApp from '../CoachConcoursApp';
import { recipes } from '../coach/recipes';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-10T12:00:00Z'));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

async function openFridayRetour() {
  const { container } = render(createElement(CoachConcoursApp));
  await screen.findByText(/Séances/);
  const title = await screen.findByText(recipes.week1Fri11Sep!.title);
  fireEvent.click(title.closest('button')!);
  await screen.findByText('Ton programme');
  fireEvent.click(screen.getByText('Retour'));
  await screen.findByLabelText('Balles échappées');
  return container;
}

describe('CR-010 Retour tab', () => {
  // Regression test for a real bug caught live on the deployed app right
  // after the CR-010 merge: `blockFields` was keyed only by block index, so
  // every session's blocks 0-3 wrongly inherited Friday's field names
  // (Thursday's "Box jump, frais" showed "Erreurs de mémoire", etc.). Fixed
  // by gating on the recipe id too — this pins the fix.
  it('does not attach Friday-only field groups to a different session\'s blocks (Thursday, week1Thu10Sep)', async () => {
    const { container } = render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);
    const title = await screen.findByText(recipes.week1Thu10Sep!.title);
    fireEvent.click(title.closest('button')!);
    await screen.findByText('Ton programme');
    fireEvent.click(screen.getByText('Retour'));
    await screen.findByText('Toute la séance');
    // Only the final "Toute la séance" group: none of Thursday's blocks
    // (rope warm-up, box jump, EMOM, easy racket, rope EMOM) declare a
    // Friday-only record field.
    const groupHeads = Array.from(container.querySelectorAll('.grp .gh')).map((node) => node.textContent);
    expect(groupHeads).toEqual(['Toute la séance']);
  });

  it('the group list equals the blocks that declare record fields, plus the final "Toute la séance" group', async () => {
    const container = await openFridayRetour();
    // Friday's 5 blocks: mémoire, poste 2, raquette référence and AMRAP each
    // declare record fields; station 8 declares none (named in the CR as
    // having nothing to record) so it gets no group.
    const groupHeads = Array.from(container.querySelectorAll('.grp .gh')).map((node) => node.textContent);
    expect(groupHeads).toHaveLength(5);
    expect(groupHeads[0]).toContain('Mémoire du circuit');
    expect(groupHeads[1]).toContain('Poste 2');
    expect(groupHeads[2]).toContain('Référence précision raquette-balle');
    expect(groupHeads[3]).toContain('AMRAP');
    expect(groupHeads[4]).toBe('Toute la séance');
  });

  it('saves a typed value without pressing any button, and shows it again on reopening the tab', async () => {
    await openFridayRetour();
    const input = screen.getByLabelText('Balles échappées') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '3' } });

    // Debounced autosave: advance past DRAFT_SAVE_DEBOUNCE_MS (500ms) without
    // touching Date (only real timers are faked here would break the debounce
    // itself, so only `Date` is mocked above — this waits on the real clock).
    vi.useRealTimers();
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Leave the tab and come back: the field re-reads from the saved state.
    fireEvent.click(screen.getByText('Prévu'));
    await screen.findByText('Ton programme');
    fireEvent.click(screen.getByText('Retour'));
    const reopened = await screen.findByLabelText('Balles échappées') as HTMLInputElement;
    expect(reopened.value).toBe('3');
  });
});
