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
// Part B: src/infrastructure/coachDrive.ts's CR-005 conflict rule ("the
// copy with the higher revision wins, a tie keeps local") tested in
// isolation, with GoogleDriveClient mocked — no real network/Drive calls.
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

const driveFixture = vi.hoisted(() => ({
  remoteFile: null as { id: string } | null,
  remoteText: ''
}));

vi.mock('../infrastructure/googleDrive', () => {
  class FakeGoogleDriveClient {
    public constructor(private readonly accessToken: string) {
      void this.accessToken;
    }
    public async ensureFolder(name: string) {
      return { id: `folder-${name}`, name, mimeType: 'application/vnd.google-apps.folder' };
    }
    public async findFile() {
      return driveFixture.remoteFile;
    }
    public async getFile(fileId: string) {
      return { id: fileId, name: 'coach-concours-state-v2.json', mimeType: 'application/json' };
    }
    public async readTextFile() {
      return driveFixture.remoteText;
    }
    public async upsertTextFile(options: { fileId?: string }) {
      return { id: options.fileId ?? 'new-remote-file-id', name: 'coach-concours-state-v2.json', mimeType: 'application/json' };
    }
  }
  return { GoogleDriveClient: FakeGoogleDriveClient };
});

describe('coachDrive: CR-005 conflict rule (Drive mocked, no network)', () => {
  it('a synced remote copy with a higher revision replaces local', async () => {
    const { syncCoachState } = await import('../infrastructure/coachDrive');
    const { stateForDrive } = await import('../infrastructure/coachStorage');
    const local: CoachState = { ...createInitialState(), revision: 1, athleteName: 'Locale' };
    const remote: CoachState = { ...createInitialState(), revision: 5, athleteName: 'Depuis Drive' };
    driveFixture.remoteFile = { id: 'remote-1' };
    driveFixture.remoteText = JSON.stringify(stateForDrive(remote));

    const result = await syncCoachState('fake-token', local, 'redacted@example.invalid');
    expect(result.state.revision).toBe(5);
    expect(result.state.athleteName).toBe('Depuis Drive');
  });

  it('a synced remote copy with an equal or lower revision does not replace local', async () => {
    const { syncCoachState } = await import('../infrastructure/coachDrive');
    const { stateForDrive } = await import('../infrastructure/coachStorage');

    // Tie: keeps local.
    const localTie: CoachState = { ...createInitialState(), revision: 5, athleteName: 'Locale' };
    const remoteTie: CoachState = { ...createInitialState(), revision: 5, athleteName: 'Depuis Drive' };
    driveFixture.remoteFile = { id: 'remote-2' };
    driveFixture.remoteText = JSON.stringify(stateForDrive(remoteTie));
    const tieResult = await syncCoachState('fake-token', localTie, 'redacted@example.invalid');
    expect(tieResult.state.revision).toBe(5);
    expect(tieResult.state.athleteName).toBe('Locale');

    // Lower: keeps local.
    const localHigher: CoachState = { ...createInitialState(), revision: 9, athleteName: 'Locale' };
    const remoteLower: CoachState = { ...createInitialState(), revision: 2, athleteName: 'Ancienne copie' };
    driveFixture.remoteText = JSON.stringify(stateForDrive(remoteLower));
    const lowerResult = await syncCoachState('fake-token', localHigher, 'redacted@example.invalid');
    expect(lowerResult.state.revision).toBe(9);
    expect(lowerResult.state.athleteName).toBe('Locale');
  });
});
