import { generatePlan } from '../coach/planner';
import type { CoachState } from '../coach/types';

const DB_NAME = 'coach-concours-db';
const STORE_NAME = 'key-value';
const STATE_KEY = 'coach-state-v2';
const FALLBACK_KEY = 'coach-concours-state-v2';

interface Envelope {
  storageVersion: 2;
  savedAt: number;
  state: CoachState;
}

let writeQueue: Promise<void> = Promise.resolve();
let lastSavedAt = 0;

export async function loadCoachState(): Promise<CoachState> {
  const [primary, fallback] = await Promise.all([readEnvelope(DB_NAME, STATE_KEY), Promise.resolve(readFallback())]);
  const envelope = primary && fallback ? (primary.savedAt >= fallback.savedAt ? primary : fallback) : primary ?? fallback;
  if (envelope && isCoachState(envelope.state)) {
    lastSavedAt = Math.max(lastSavedAt, envelope.savedAt);
    return { ...envelope.state, weeks: generatePlan(envelope.state.results) };
  }
  const legacy = await readUnknownEnvelope('trail-coach-db', 'app-state-v1');
  return createInitialState(legacy);
}

export function createInitialState(legacyTrailArchive?: unknown): CoachState {
  return {
    schemaVersion: 2,
    revision: 0,
    updatedAt: new Date().toISOString(),
    athleteName: 'Athlète',
    planStartDate: '2026-09-07',
    planEndDate: '2026-11-20',
    weeks: generatePlan(),
    results: {},
    memoryReveals: {},
    drive: { status: 'local' },
    migration: {
      legacyTrailDbDetected: legacyTrailArchive !== undefined,
      ...(legacyTrailArchive !== undefined ? { legacyTrailArchive } : {}),
      checkedAt: new Date().toISOString()
    }
  };
}

export function saveCoachState(state: CoachState): Promise<void> {
  const savedAt = Math.max(Date.now(), lastSavedAt + 1);
  lastSavedAt = savedAt;
  const envelope: Envelope = { storageVersion: 2, savedAt, state };
  try { localStorage.setItem(FALLBACK_KEY, JSON.stringify(envelope)); } catch { /* IndexedDB remains primary. */ }
  const write = writeQueue.then(() => writeEnvelope(envelope));
  writeQueue = write.catch(() => undefined);
  return write;
}

export function parseCoachState(value: unknown): CoachState {
  if (!isCoachState(value)) throw new Error('Le fichier Drive ne contient pas un état Coach Concours V2 valide.');
  return { ...value, weeks: generatePlan(value.results) };
}

export function stateForDrive(state: CoachState): CoachState {
  return { ...state, drive: { ...state.drive, status: 'synced', message: undefined } };
}

function openDatabase(name = DB_NAME): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) return reject(new Error('IndexedDB indisponible.'));
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Impossible d'ouvrir IndexedDB."));
  });
}

async function readEnvelope(name: string, key: string): Promise<Envelope | null> {
  const value = await readUnknownEnvelope(name, key).catch(() => undefined);
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<Envelope>;
  return candidate.storageVersion === 2 && typeof candidate.savedAt === 'number' && candidate.state ? candidate as Envelope : null;
}

async function readUnknownEnvelope(name: string, key: string): Promise<unknown | undefined> {
  if (!('indexedDB' in globalThis)) return undefined;
  const databases = await indexedDB.databases?.();
  if (databases && !databases.some((database) => database.name === name)) return undefined;
  const database = await openDatabase(name);
  if (!database.objectStoreNames.contains(STORE_NAME)) { database.close(); return undefined; }
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Lecture locale impossible.'));
    transaction.oncomplete = () => database.close();
  });
}

function readFallback(): Envelope | null {
  try {
    const value = localStorage.getItem(FALLBACK_KEY);
    if (!value) return null;
    const candidate = JSON.parse(value) as Partial<Envelope>;
    return candidate.storageVersion === 2 && typeof candidate.savedAt === 'number' && candidate.state ? candidate as Envelope : null;
  } catch { return null; }
}

async function writeEnvelope(envelope: Envelope) {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(envelope, STATE_KEY);
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => reject(transaction.error ?? new Error('Écriture locale impossible.'));
  });
}

function isCoachState(value: unknown): value is CoachState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CoachState>;
  return candidate.schemaVersion === 2 && candidate.planStartDate === '2026-09-07' && candidate.planEndDate === '2026-11-20' && !!candidate.results && !!candidate.drive;
}
