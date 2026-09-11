import type { AppState } from '../domain/types';

const DB_NAME = 'trail-coach-db';
const STORE_NAME = 'key-value';
const STATE_KEY = 'app-state-v1';
const FALLBACK_KEY = 'trail-coach-state-v1';

interface StoredStateEnvelope {
  storageVersion: 1;
  savedAt: number;
  state: AppState;
}

let lastSavedAt = 0;
let indexedDbWriteQueue: Promise<void> = Promise.resolve();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) {
      reject(new Error('IndexedDB indisponible.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Impossible d'ouvrir IndexedDB."));
  });
}

export async function loadAppState(): Promise<AppState | null> {
  const [indexedDbState, fallbackState] = await Promise.all([
    readIndexedDbState(),
    Promise.resolve(readFallbackState())
  ]);
  // En cas d'égalité (anciens formats sans horodatage), la copie localStorage
  // est prioritaire : elle était déjà le dernier secours écrit synchroniquement.
  const newest = indexedDbState && fallbackState
    ? fallbackState.savedAt >= indexedDbState.savedAt ? fallbackState : indexedDbState
    : fallbackState ?? indexedDbState;
  if (!newest) return null;
  lastSavedAt = Math.max(lastSavedAt, newest.savedAt);
  return newest.state;
}

export function saveAppState(state: AppState): Promise<void> {
  const savedAt = Math.max(Date.now(), lastSavedAt + 1);
  lastSavedAt = savedAt;
  const envelope: StoredStateEnvelope = { storageVersion: 1, savedAt, state };
  let fallbackSaved = false;

  try {
    const withoutScreenshots: AppState = {
      ...state,
      appFeedback: state.appFeedback.map(({ screenshotDataUrl: _removed, ...feedback }) => feedback)
    };
    localStorage.setItem(FALLBACK_KEY, JSON.stringify({ ...envelope, state: withoutScreenshots }));
    fallbackSaved = true;
  } catch {
    // IndexedDB remains the primary durable store when localStorage is unavailable or full.
  }

  const write = indexedDbWriteQueue.then(() => writeIndexedDbState(envelope));
  indexedDbWriteQueue = write.catch(() => undefined);
  return write.catch((cause: unknown) => {
    if (!fallbackSaved) throw cause;
  });
}

export async function clearAppState(): Promise<void> {
  await indexedDbWriteQueue.catch(() => undefined);
  localStorage.removeItem(FALLBACK_KEY);
  try {
    const database = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(STATE_KEY);
      transaction.oncomplete = () => {
        database.close();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error ?? new Error('Suppression locale impossible.'));
    });
  } catch {
    // Nothing else to clear.
  }
}

async function readIndexedDbState(): Promise<StoredStateEnvelope | null> {
  try {
    const database = await openDatabase();
    const value = await new Promise<unknown>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).get(STATE_KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Lecture locale impossible.'));
      transaction.oncomplete = () => database.close();
    });
    return toEnvelope(value);
  } catch {
    return null;
  }
}

function readFallbackState(): StoredStateEnvelope | null {
  try {
    const fallback = localStorage.getItem(FALLBACK_KEY);
    return fallback ? toEnvelope(JSON.parse(fallback) as unknown) : null;
  } catch {
    return null;
  }
}

async function writeIndexedDbState(envelope: StoredStateEnvelope): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(envelope, STATE_KEY);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error ?? new Error('Écriture locale impossible.'));
  });
}

function toEnvelope(value: unknown): StoredStateEnvelope | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<StoredStateEnvelope> & Partial<AppState>;
  if (candidate.storageVersion === 1 && typeof candidate.savedAt === 'number' && candidate.state) {
    return candidate as StoredStateEnvelope;
  }
  if (candidate.schemaVersion === 1) {
    return { storageVersion: 1, savedAt: 0, state: candidate as AppState };
  }
  return null;
}
