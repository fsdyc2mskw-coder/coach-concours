// CHANGE_REQUEST_015 — the app notices a new deployed version.
//
// vite.config.ts sets `registerType: 'prompt'` (not 'autoUpdate'): the new
// service worker sits ready but inactive until UpdateBanner's own button
// calls `updateServiceWorker(true)`. `useRegisterSW` is aliased to
// src/testing/mockPwaRegister.ts for the whole test run (vitest.config.ts),
// which lets this suite flip `needRefresh` without a real service worker.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CoachConcoursApp from '../CoachConcoursApp';
import { __reloadCallCount, __resetPwaMock, __triggerNeedRefresh } from '../testing/mockPwaRegister';

beforeEach(() => {
  localStorage.clear();
  __resetPwaMock();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-10T12:00:00Z'));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  __resetPwaMock();
});

describe('CR-015 section A — vite.config.ts registers with prompt, not autoUpdate', () => {
  it('registerType is "prompt"', () => {
    const config = readFileSync(resolve(process.cwd(), 'vite.config.ts'), 'utf8');
    expect(config).toMatch(/registerType:\s*'prompt'/);
    expect(config).not.toMatch(/registerType:\s*'autoUpdate'/);
  });
});

describe('CR-015 section A — the update banner', () => {
  it('is absent until a new build is waiting', async () => {
    render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);
    expect(screen.queryByText('Nouvelle version disponible')).toBeNull();
  });

  it('appears with one button, "Recharger", when needRefresh is true', async () => {
    render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);
    __triggerNeedRefresh();
    await screen.findByText('Nouvelle version disponible');
    expect(screen.getByText('Recharger')).toBeTruthy();
  });

  it('tapping Recharger calls updateServiceWorker(true), and nothing reloads before that tap', async () => {
    render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);
    __triggerNeedRefresh();
    await screen.findByText('Nouvelle version disponible');
    expect(__reloadCallCount()).toBe(0);
    fireEvent.click(screen.getByText('Recharger'));
    expect(__reloadCallCount()).toBe(1);
  });

  it('a pending Retour draft keeps its typed text when the banner appears (data is untouched)', async () => {
    const { container } = render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);
    const cardButton = container.querySelector('button.card') as HTMLButtonElement;
    fireEvent.click(cardButton);
    await screen.findByText('Ton programme');
    fireEvent.click(screen.getByText('Retour'));
    const note = await screen.findByLabelText('Note') as HTMLTextAreaElement;
    fireEvent.change(note, { target: { value: 'brouillon en cours' } });

    __triggerNeedRefresh();
    await screen.findByText('Nouvelle version disponible');

    expect((screen.getByLabelText('Note') as HTMLTextAreaElement).value).toBe('brouillon en cours');
  });
});

describe('CR-015 house rules — no text claims the tag is created automatically', () => {
  it('CLAUDE.md and 00_AGENT_ROUTING.md say nothing about automatic tag creation', () => {
    const claude = readFileSync(resolve(process.cwd(), 'CLAUDE.md'), 'utf8');
    const routing = readFileSync(resolve(process.cwd(), 'handoffs/00_AGENT_ROUTING.md'), 'utf8');
    for (const text of [claude, routing]) {
      expect(text).not.toMatch(/tag[^.]*created automatically/i);
      expect(text).not.toMatch(/automatically[^.]*creates?[^.]*tag/i);
    }
  });

  it('CLAUDE.md states the coder never tags and never pushes to main', () => {
    const claude = readFileSync(resolve(process.cwd(), 'CLAUDE.md'), 'utf8');
    expect(claude).toMatch(/never tags/i);
    expect(claude).toMatch(/never push(es)? to main/i);
  });
});
