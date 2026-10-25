// CHANGE_REQUEST_021 — Drive sync goes through the athlete's own Apps Script
// (apps-script/Code.gs). No Google sign-in in the app: the app posts the
// connection key and the state, the script applies the CR-005 revision rule
// and writes the file. The body is `text/plain` so the browser sends no CORS
// preflight; the script answers through a redirect, hence `redirect: 'follow'`.
import type { CoachState } from '../coach/types';
import { parseCoachState, stateForDrive } from './coachStorage';
import type { ScriptLink } from './scriptLink';

const REQUEST_TIMEOUT_MS = 30_000;

export const BAD_KEY_MESSAGE = 'Code refusé';
export const UNREACHABLE_MESSAGE = 'Script injoignable, les données restent sur le téléphone';

export class ScriptSyncError extends Error {
  public constructor(public readonly kind: 'bad_key' | 'unreachable' | 'script', message: string) {
    super(message);
  }
}

export interface DriveSyncResult {
  state: CoachState;
  fileId: string;
}

interface ScriptResponse {
  ok: boolean;
  error?: string;
  state?: unknown;
  fileId?: string;
}

async function callScript(link: ScriptLink, action: 'sync' | 'backup' | 'ping', state?: CoachState): Promise<ScriptResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let payload: ScriptResponse;
  try {
    const response = await fetch(link.url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(state ? { key: link.key, action, state } : { key: link.key, action }),
      redirect: 'follow',
      signal: controller.signal
    });
    if (!response.ok) throw new Error(String(response.status));
    payload = await response.json() as ScriptResponse;
  } catch {
    throw new ScriptSyncError('unreachable', UNREACHABLE_MESSAGE);
  } finally {
    clearTimeout(timer);
  }
  if (!payload || typeof payload !== 'object') throw new ScriptSyncError('unreachable', UNREACHABLE_MESSAGE);
  if (payload.error === 'bad_key') throw new ScriptSyncError('bad_key', BAD_KEY_MESSAGE);
  if (!payload.ok) throw new ScriptSyncError('script', `Erreur du script (${payload.error ?? 'inconnue'}).`);
  return payload;
}

export async function pingScript(link: ScriptLink): Promise<void> {
  await callScript(link, 'ping');
}

export async function syncCoachState(link: ScriptLink, local: CoachState): Promise<DriveSyncResult> {
  const syncedAt = new Date().toISOString();
  const outgoing: CoachState = {
    ...local,
    drive: { ...local.drive, status: 'synced', transport: 'script', lastSyncAt: syncedAt, lastSyncRevision: local.revision, message: undefined }
  };
  const response = await callScript(link, 'sync', stateForDrive(outgoing));
  // CHANGE_REQUEST_005 rule, applied by the script: the higher revision wins,
  // a tie keeps the phone's copy. The app takes whichever copy comes back.
  const winner = parseCoachState(response.state);
  const fileId = response.fileId ?? winner.drive.fileId ?? '';
  return {
    state: {
      ...winner,
      drive: { ...winner.drive, status: 'synced', transport: 'script', fileId, lastSyncAt: syncedAt, lastSyncRevision: winner.revision, message: undefined }
    },
    fileId
  };
}

export async function createDriveBackup(link: ScriptLink, state: CoachState): Promise<void> {
  await callScript(link, 'backup', stateForDrive(state));
}
