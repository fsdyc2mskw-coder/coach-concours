import { useState } from 'react';
import { useApp } from '../app/AppContext';

export function GoogleDriveSetupGuide() {
  const { state, updateSettings } = useApp();
  const configuredClientId = state.settings.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const [clientId, setClientId] = useState(configuredClientId);
  const [message, setMessage] = useState<string | null>(null);

  function saveClientId() {
    const value = clientId.trim();
    if (!/^\d+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(value)) {
      setMessage('Identifiant invalide : il doit se terminer par .apps.googleusercontent.com.');
      return;
    }
    updateSettings({ googleClientId: value });
    setMessage('Configuration enregistrée sur ce téléphone. Tu peux maintenant connecter le Drive.');
  }

  async function copyOrigin() {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setMessage('Origine du site copiée.');
    } catch {
      setMessage('Maintenir le doigt sur l’adresse pour la copier.');
    }
  }

  return (
    <details className="setup-guide" open={!configuredClientId}>
      <summary>Configurer Google Drive pas à pas</summary>
      <ol className="setup-steps">
        <li>
          Ouvrir <a href="https://console.cloud.google.com/projectcreate" target="_blank" rel="noreferrer">Google Cloud</a>, puis créer un projet nommé <strong>Trail Coach</strong>.
        </li>
        <li>
          <a href="https://console.cloud.google.com/apis/library/drive.googleapis.com" target="_blank" rel="noreferrer">Activer Google Drive API</a> dans ce projet.
        </li>
        <li>
          Dans <a href="https://console.cloud.google.com/auth/branding" target="_blank" rel="noreferrer">Google Auth Platform</a>, démarrer la configuration, choisir un public externe et utiliser l’adresse de ta sœur comme contact et utilisateur test.
        </li>
        <li>
          Dans <a href="https://console.cloud.google.com/auth/clients" target="_blank" rel="noreferrer">Clients</a>, créer un client <strong>Application Web</strong>. Ajouter l’origine JavaScript ci-dessous, sans chemin ni slash final. Aucun URI de redirection n’est nécessaire.
        </li>
      </ol>
      <div className="copy-value">
        <code>{window.location.origin}</code>
        <button className="button button--ghost" type="button" onClick={() => void copyOrigin()}>Copier</button>
      </div>
      <label className="field">
        <span>Identifiant client Google</span>
        <input
          value={clientId}
          onChange={(event) => setClientId(event.target.value)}
          placeholder="000000000000-….apps.googleusercontent.com"
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <button className="button button--secondary button--full" type="button" onClick={saveClientId}>
        Enregistrer la configuration
      </button>
      <p className="field-help">Coller uniquement l’identifiant client public. Ne jamais coller le secret client ni un mot de passe Google.</p>
      {message ? <p className="inline-notice" role="status">{message}</p> : null}
    </details>
  );
}
