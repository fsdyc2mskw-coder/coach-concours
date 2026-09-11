import type { GoogleAccount } from '../domain/types';

const GOOGLE_SCRIPT_ID = 'google-identity-services';
const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.file'
].join(' ');
let googleScriptPromise: Promise<void> | null = null;

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken(options?: { prompt?: string }): void;
}

interface GoogleOauth2Api {
  initTokenClient(config: {
    client_id: string;
    scope: string;
    callback: (response: GoogleTokenResponse) => void;
    error_callback?: (error: unknown) => void;
  }): GoogleTokenClient;
  revoke(accessToken: string, done?: () => void): void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: GoogleOauth2Api;
      };
    };
  }
}

export interface GoogleSession {
  accessToken: string;
  expiresAt: number;
  account: GoogleAccount;
}

export async function requestGoogleSession(clientId: string): Promise<GoogleSession> {
  if (!clientId.trim()) {
    throw new Error('VITE_GOOGLE_CLIENT_ID n’est pas configuré.');
  }
  await loadGoogleIdentityScript();
  const oauth2 = window.google?.accounts.oauth2;
  if (!oauth2) {
    throw new Error('Google Identity Services n’a pas pu être initialisé.');
  }

  const token = await new Promise<{ accessToken: string; expiresIn: number }>((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_SCOPES,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || response.error || 'Autorisation Google refusée.'));
          return;
        }
        resolve({
          accessToken: response.access_token,
          expiresIn: response.expires_in ?? 3_600
        });
      },
      error_callback: () => reject(new Error('La fenêtre d’autorisation Google a échoué ou a été fermée.'))
    });
    client.requestAccessToken({ prompt: 'consent' });
  });

  const account = await fetchGoogleAccount(token.accessToken);
  return {
    accessToken: token.accessToken,
    expiresAt: Date.now() + token.expiresIn * 1_000,
    account
  };
}

export function revokeGoogleSession(session: GoogleSession): Promise<void> {
  return new Promise((resolve) => {
    const oauth2 = window.google?.accounts.oauth2;
    if (!oauth2) {
      resolve();
      return;
    }
    oauth2.revoke(session.accessToken, resolve);
  });
}

async function fetchGoogleAccount(accessToken: string): Promise<GoogleAccount> {
  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) {
    throw new Error(`Profil Google inaccessible (${response.status}).`);
  }
  const payload = (await response.json()) as {
    email?: string;
    name?: string;
    picture?: string;
  };
  if (!payload.email) {
    throw new Error('Le compte Google ne fournit pas d’adresse e-mail.');
  }
  return {
    email: payload.email,
    name: payload.name || payload.email,
    ...(payload.picture ? { picture: payload.picture } : {})
  };
}

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts.oauth2) {
    return Promise.resolve();
  }
  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    const timeout = window.setTimeout(() => {
      reject(new Error('Le chargement de Google Identity a expiré.'));
    }, 15_000);
    const finish = () => {
      window.clearTimeout(timeout);
      if (window.google?.accounts.oauth2) {
        resolve();
      } else {
        reject(new Error('Google Identity Services n’a pas pu être initialisé.'));
      }
    };
    const fail = () => {
      window.clearTimeout(timeout);
      reject(new Error('Chargement Google Identity impossible.'));
    };
    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', fail, { once: true });
    if (!existing) {
      document.head.appendChild(script);
    }
  }).catch((error: unknown) => {
    document.getElementById(GOOGLE_SCRIPT_ID)?.remove();
    googleScriptPromise = null;
    throw error;
  });

  googleScriptPromise = promise;
  return promise;
}
