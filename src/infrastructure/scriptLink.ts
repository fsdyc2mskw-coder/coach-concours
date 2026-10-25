// CHANGE_REQUEST_021 — the connection code to the athlete's own Apps Script
// (`<web app URL>#<key>`). It is stored on this device only, outside
// `CoachState`: it never reaches the Drive file, the JSON export, a backup or
// a log, and it survives reloads and service-worker updates.
import { readDeviceValue, writeDeviceValue } from './coachStorage';

const LINK_KEY = 'script-link-v1';
const FALLBACK_KEY = 'coach-concours-script-link-v1';
const SCRIPT_URL = /^https:\/\/script\.google(?:usercontent)?\.com\/\S+$/;

export interface ScriptLink {
  url: string;
  key: string;
}

export function parseConnectionCode(code: string): ScriptLink | null {
  const trimmed = code.trim();
  const hash = trimmed.lastIndexOf('#');
  if (hash < 0) return null;
  const url = trimmed.slice(0, hash);
  const key = trimmed.slice(hash + 1);
  if (!SCRIPT_URL.test(url) || !/^[A-Za-z0-9]{32,}$/.test(key)) return null;
  return { url, key };
}

export async function loadScriptLink(): Promise<ScriptLink | null> {
  const code = await readDeviceValue(LINK_KEY, FALLBACK_KEY);
  return code ? parseConnectionCode(code) : null;
}

export function saveScriptLink(link: ScriptLink): Promise<void> {
  return writeDeviceValue(LINK_KEY, FALLBACK_KEY, `${link.url}#${link.key}`);
}

export function forgetScriptLink(): Promise<void> {
  return writeDeviceValue(LINK_KEY, FALLBACK_KEY, null);
}
