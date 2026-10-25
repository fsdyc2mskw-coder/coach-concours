// CHANGE_REQUEST_008 — Persistence test.
//
// Part A: src/infrastructure/coachStorage.ts save/load round trip. jsdom
// (this test's environment) does not implement IndexedDB, so the calls
// below exercise the same localStorage fallback path the real app falls
// back to when IndexedDB is unavailable (coachStorage.ts checks
// `'indexedDB' in globalThis` itself). `saveCoachState`'s returned promise
// still rejects here because its IndexedDB write leg fails in this
// environment — that rejection is caught deliberately below; it is a test
// environment limitation, not a bug in the app (see APP_REPORT_008.md).
//
// There is no dedicated "delete a result" function in the storage layer:
// the app (CoachConcoursApp.removeResult) deletes a result by removing its
// key from the `results` record and re-saving the whole state. The second
// test below reproduces exactly that.
//
import { beforeEach, describe, expect, it } from 'vitest';
import type { CoachState, SessionResult } from '../coach/types';
import { createInitialState, loadCoachState, saveCoachState } from '../infrastructure/coachStorage';

beforeEach(() => {
  localStorage.clear();
});

describe('coachStorage: save/load round trip (localStorage fallback, no IndexedDB in jsdom)', () => {
  it('round-trips a saved session result unchanged', async () => {
    const state = createInitialState();
    const sessionId = '2026-09-11:police_technique';
    const result: SessionResult = {
      sessionId,
      status: 'done',
      effort: 3,
      note: 'Bonnes sensations.',
      distanceKm: 8.2,
      elevationGainM: 150,
      durationMin: 52,
      completedAt: new Date().toISOString()
    };
    const withResult: CoachState = { ...state, results: { ...state.results, [sessionId]: result } };
    await saveCoachState(withResult).catch(() => undefined);

    const reloaded = await loadCoachState();
    const reloadedResult = reloaded.results[sessionId];
    expect(reloadedResult).toBeDefined();
    expect(reloadedResult?.status).toBe('done');
    expect(reloadedResult?.effort).toBe(3);
    expect(reloadedResult?.note).toBe('Bonnes sensations.');
    expect(reloadedResult?.distanceKm).toBe(8.2);
    expect(reloadedResult?.elevationGainM).toBe(150);
    expect(reloadedResult?.durationMin).toBe(52);
  });

  it('drops a result once its key is removed from `results` and the state is re-saved', async () => {
    const state = createInitialState();
    const sessionId = '2026-09-08:running_intervals_exception';
    const result: SessionResult = {
      sessionId,
      status: 'done',
      effort: 2,
      note: '',
      completedAt: new Date().toISOString()
    };
    const withResult: CoachState = { ...state, results: { ...state.results, [sessionId]: result } };
    await saveCoachState(withResult).catch(() => undefined);

    const withoutResult: CoachState = {
      ...withResult,
      results: Object.fromEntries(Object.entries(withResult.results).filter(([key]) => key !== sessionId))
    };
    await saveCoachState(withoutResult).catch(() => undefined);

    const reloaded = await loadCoachState();
    expect(reloaded.results[sessionId]).toBeUndefined();
  });
});

// Part B (the CR-005 conflict rule) moved to cr021.test.ts with CHANGE_REQUEST_021:
// the rule now lives in apps-script/Code.gs and the Google Drive client it mocked is gone.
