// CHANGE_REQUEST_021 — Drive sync through the athlete's own Apps Script.
//
// apps-script/Code.gs is plain Apps Script JavaScript; it is loaded here as
// text and run with a `module` object, which is the guard it exports under.
// The app tests mock `fetch` with that same script's `handleRequest`, backed
// by an in-memory store, so the app talks to the real revision rule without
// any network or Google service.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createElement } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import CoachConcoursApp from '../CoachConcoursApp';
import type { CoachState } from '../coach/types';
import { createInitialState, saveCoachState } from '../infrastructure/coachStorage';

interface StoreCalls { reads: number; writes: number; backups: string[] }
interface ScriptEnv {
  getKey: () => string | null;
  withLock: <T>(work: () => T) => T;
  now: () => Date;
  store: { readState: () => string | null; writeState: (text: string) => string; stateFileId: () => string | null; writeBackup: (name: string, text: string) => void };
}
interface ScriptModule {
  chooseWinner: (stored: { revision: number } | null, incoming: { revision: number }) => 'stored' | 'incoming';
  handleRequest: (body: unknown, env: ScriptEnv) => { ok: boolean; error?: string; state?: CoachState; fileId?: string };
  connectionLine: (url: string, key: string) => string;
}

const root = process.cwd();
const scriptSource = readFileSync(resolve(root, 'apps-script/Code.gs'), 'utf8');
function loadScript(): ScriptModule {
  const module = { exports: {} as ScriptModule };
  new Function('module', scriptSource)(module);
  return module.exports;
}
const script = loadScript();

const KEY = 'a'.repeat(64);
const URL = 'https://script.google.com/macros/s/TEST_DEPLOYMENT/exec';
const CODE = `${URL}#${KEY}`;

function memoryEnv(stored: string | null = null) {
  const calls: StoreCalls = { reads: 0, writes: 0, backups: [] };
  let text = stored;
  const env: ScriptEnv = {
    getKey: () => KEY,
    withLock: (work) => work(),
    now: () => new Date('2026-10-25T08:00:00Z'),
    store: {
      readState: () => { calls.reads += 1; return text; },
      writeState: (next) => { calls.writes += 1; text = next; return 'state-file'; },
      stateFileId: () => (text ? 'state-file' : null),
      writeBackup: (_name, backup) => { calls.backups.push(backup); }
    }
  };
  return { env, calls, stored: () => (text ? JSON.parse(text) as CoachState : null) };
}

// ---------- A. The script ----------

describe('CR-021 A — revision rule in Code.gs (pure function)', () => {
  it('remote higher → remote; local higher → local; tie → local', () => {
    expect(script.chooseWinner({ revision: 6 }, { revision: 5 })).toBe('stored');
    expect(script.chooseWinner({ revision: 4 }, { revision: 5 })).toBe('incoming');
    expect(script.chooseWinner({ revision: 5 }, { revision: 5 })).toBe('incoming');
    expect(script.chooseWinner(null, { revision: 0 })).toBe('incoming');
  });

  it('sync keeps the stored copy when it is ahead and never writes it back', () => {
    const remote = { ...createInitialState(), revision: 9, athleteName: 'Depuis Drive' };
    const memory = memoryEnv(JSON.stringify(remote));
    const result = script.handleRequest({ key: KEY, action: 'sync', state: { ...createInitialState(), revision: 3 } }, memory.env);
    expect(result.ok).toBe(true);
    expect(result.state?.athleteName).toBe('Depuis Drive');
    expect(memory.calls.writes).toBe(0);
  });
});

describe('CR-021 A — wrong key: nothing read, nothing written', () => {
  it.each([['wrong key', 'b'.repeat(64)], ['missing key', undefined], ['empty key', '']])('%s → bad_key', (_label, key) => {
    for (const action of ['ping', 'sync', 'backup']) {
      const memory = memoryEnv(JSON.stringify(createInitialState()));
      const result = script.handleRequest({ key, action, state: createInitialState() }, memory.env);
      expect(result).toEqual({ ok: false, error: 'bad_key' });
      expect(memory.calls).toEqual({ reads: 0, writes: 0, backups: [] });
    }
  });

  it('a script with no key set yet refuses every call', () => {
    const memory = memoryEnv();
    memory.env.getKey = () => null;
    expect(script.handleRequest({ key: '', action: 'ping' }, memory.env)).toEqual({ ok: false, error: 'bad_key' });
  });
});

describe('CR-021 A — manifest and setup line', () => {
  const manifest = JSON.parse(readFileSync(resolve(root, 'apps-script/appsscript.json'), 'utf8')) as { oauthScopes: string[]; webapp: { executeAs: string; access: string } };

  it('appsscript.json scopes are exactly drive.file', () => {
    expect(manifest.oauthScopes).toEqual(['https://www.googleapis.com/auth/drive.file']);
  });

  it('web app runs as the deploying user, open to anyone', () => {
    expect(manifest.webapp).toEqual({ executeAs: 'USER_DEPLOYING', access: 'ANYONE_ANONYMOUS' });
  });

  it('setup hands out a code only for an /exec URL', () => {
    expect(script.connectionLine(URL, KEY)).toBe(CODE);
    expect(script.connectionLine('https://script.google.com/macros/s/X/dev', KEY).startsWith('URL_WEB_APP#')).toBe(true);
  });

  it('the script logs nothing but the setup line', () => {
    expect(scriptSource.match(/Logger\.log|console\./g)).toEqual(['Logger.log']);
  });
});

// ---------- B. The app ----------

let scriptMemory: ReturnType<typeof memoryEnv>;
let network: 'up' | 'down';
const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
  if (network === 'down') throw new TypeError('Failed to fetch');
  const body = JSON.parse(init.body as string) as unknown;
  const payload = script.handleRequest(body, scriptMemory.env);
  return { ok: true, status: 200, json: async () => JSON.parse(JSON.stringify(payload)) as unknown };
});

function bodies(action?: string): Array<{ key: string; action: string; state?: CoachState }> {
  return fetchMock.mock.calls
    .map((call) => JSON.parse(call[1].body as string) as { key: string; action: string; state?: CoachState })
    .filter((body) => !action || body.action === action);
}

async function openDriveTab() {
  await screen.findByText(/Séances/);
  fireEvent.click(screen.getByLabelText('Drive'));
}

async function linkWith(code: string) {
  await openDriveTab();
  fireEvent.change(screen.getByLabelText('Code de connexion'), { target: { value: code } });
  fireEvent.click(screen.getByText('Enregistrer'));
}

beforeEach(() => {
  localStorage.clear();
  scriptMemory = memoryEnv();
  network = 'up';
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-25T08:00:00Z'));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('CR-021 B — link, reload, sync on its own', () => {
  it('saves the link, then a reload opens already linked and syncs without any action', async () => {
    render(createElement(CoachConcoursApp));
    await linkWith(CODE);
    await screen.findByText('Lié au script');
    expect(bodies().map((body) => body.action)).toEqual(['ping', 'sync']);
    expect(scriptMemory.stored()).not.toBeNull();

    // Simulated reload: the component is unmounted, the storage module is
    // fetched fresh, and the app is mounted again on the same storage.
    cleanup();
    fetchMock.mockClear();
    vi.resetModules();
    const fresh = await import('../infrastructure/scriptLink');
    expect(await fresh.loadScriptLink()).toEqual({ url: URL, key: KEY });

    render(createElement(CoachConcoursApp));
    await waitFor(() => expect(bodies('sync')).toHaveLength(1));
    expect(bodies('ping')).toHaveLength(0);
    await openDriveTab();
    expect(screen.getByText('Lié au script')).toBeTruthy();
    expect(screen.queryByLabelText('Code de connexion')).toBeNull();
  });

  it('a wrong code writes nothing and shows "Code refusé"', async () => {
    render(createElement(CoachConcoursApp));
    await linkWith(`${URL}#${'c'.repeat(64)}`);
    await screen.findByText('Code refusé');
    expect(bodies('sync')).toHaveLength(0);
    expect(scriptMemory.calls.writes).toBe(0);
    expect(localStorage.getItem('coach-concours-script-link-v1')).toBeNull();
  });

  it('a pasted text that is not a code is refused without any call', async () => {
    render(createElement(CoachConcoursApp));
    await linkWith('bonjour');
    await screen.findByText('Code refusé');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('a second device with a lower revision takes the script copy', async () => {
    const ahead: CoachState = { ...createInitialState(), revision: 12, athleteName: 'Autre appareil' };
    scriptMemory = memoryEnv(JSON.stringify(ahead));
    await saveCoachState({ ...createInitialState(), revision: 2 }).catch(() => undefined);
    localStorage.setItem('coach-concours-script-link-v1', CODE);
    render(createElement(CoachConcoursApp));
    await waitFor(() => expect(bodies('sync')).toHaveLength(1));
    await waitFor(() => {
      const envelope = JSON.parse(localStorage.getItem('coach-concours-state-v2')!) as { state: CoachState };
      expect(envelope.state.revision).toBe(12);
      expect(envelope.state.athleteName).toBe('Autre appareil');
    });
  });
});

describe('CR-021 B — the connection code stays on the device', () => {
  it('is absent from the Drive payload, the backup payload and the stored state (the JSON export)', async () => {
    render(createElement(CoachConcoursApp));
    await linkWith(CODE);
    await screen.findByText('Lié au script');
    fireEvent.click(screen.getByText('Créer une sauvegarde horodatée'));
    await screen.findByText('Sauvegarde horodatée créée dans Drive.');

    const sent = [...bodies('sync'), ...bodies('backup')];
    expect(sent).toHaveLength(2);
    for (const body of sent) {
      const payload = JSON.stringify(body.state);
      expect(payload).not.toContain(KEY);
      expect(payload).not.toContain('script.google.com');
    }
    expect(scriptMemory.calls.backups).toHaveLength(1);
    expect(scriptMemory.calls.backups[0]).not.toContain(KEY);
    // The JSON export is `JSON.stringify(state)`: the stored state is that state.
    const stored = localStorage.getItem('coach-concours-state-v2')!;
    expect(stored).not.toContain(KEY);
    expect(stored).not.toContain('script.google.com');
  });

  it('"Oublier ce code" removes it from this device only; local data stays', async () => {
    render(createElement(CoachConcoursApp));
    await linkWith(CODE);
    await screen.findByText('Lié au script');
    fireEvent.click(screen.getByText('Oublier ce code'));
    await screen.findByLabelText('Code de connexion');
    expect(localStorage.getItem('coach-concours-script-link-v1')).toBeNull();
    expect(localStorage.getItem('coach-concours-state-v2')).not.toBeNull();
    expect(scriptMemory.stored()).not.toBeNull();
  });
});

describe('CR-021 B — offline', () => {
  it('a network failure leaves status pending and the data intact; `online` syncs', async () => {
    const local: CoachState = { ...createInitialState(), revision: 4, athleteName: 'Locale' };
    await saveCoachState(local).catch(() => undefined);
    localStorage.setItem('coach-concours-script-link-v1', CODE);
    network = 'down';
    render(createElement(CoachConcoursApp));
    await screen.findByText('À synchroniser');
    const envelope = JSON.parse(localStorage.getItem('coach-concours-state-v2')!) as { state: CoachState };
    expect(envelope.state.revision).toBe(4);
    expect(scriptMemory.stored()).toBeNull();

    network = 'up';
    await act(async () => { window.dispatchEvent(new Event('online')); });
    await screen.findByText('Drive à jour');
    expect(scriptMemory.stored()?.revision).toBe(4);
  });
});

describe('CR-021 B — a pre-CR-021 state', () => {
  it('loads with wasConnected and accountEmail and links without error', async () => {
    const before: CoachState = { ...createInitialState(), revision: 7, drive: { status: 'synced', wasConnected: true, accountEmail: 'athlete@example.invalid', fileId: 'old-file', lastSyncRevision: 7 } };
    await saveCoachState(before).catch(() => undefined);
    render(createElement(CoachConcoursApp));
    await linkWith(CODE);
    await screen.findByText('Lié au script');
    expect(fetchMock.mock.calls.every((call) => call[0] === URL)).toBe(true);
    const stored = scriptMemory.stored()!;
    expect(stored.revision).toBe(7);
    expect(stored.schemaVersion).toBe(2);
    expect(stored.drive.transport).toBe('script');
  });
});

// ---------- No Google sign-in left, nothing personal in the new files ----------

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

describe('CR-021 — retired sign-in and sanitation', () => {
  it('no source file under src/ references accounts.google.com or googleapis.com/drive', () => {
    const offenders = filesUnder(resolve(root, 'src'))
      .filter((path) => !path.endsWith('cr021.test.ts'))
      .filter((path) => /accounts\.google\.com|googleapis\.com\/(upload\/)?drive/.test(readFileSync(path, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('the deploy workflow no longer injects a Google client id', () => {
    expect(readFileSync(resolve(root, '.github/workflows/deploy.yml'), 'utf8')).not.toContain('VITE_GOOGLE_CLIENT_ID');
  });

  it('apps-script/ holds no deployment URL, file id, key or e-mail', () => {
    for (const path of filesUnder(resolve(root, 'apps-script'))) {
      const text = readFileSync(path, 'utf8');
      expect(text).not.toMatch(/\/macros\/s\/[A-Za-z0-9_-]{10,}/);
      expect(text).not.toMatch(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
      expect(text).not.toMatch(/[A-Za-z0-9_-]{25,}/);
    }
  });
});
