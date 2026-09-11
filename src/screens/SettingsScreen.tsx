import { useState, type ChangeEvent } from 'react';
import { APP_VERSION } from '../app/version';
import { useApp } from '../app/AppContext';
import type { AppRoute } from '../app/router';
import { navigate } from '../app/router';
import { AppShell } from '../components/AppShell';
import { GoogleDriveSetupGuide } from '../components/GoogleDriveSetupGuide';
import { ScreenHeader } from '../components/ScreenHeader';
import { TRAIL_REGION_OPTIONS } from '../domain/swissTrails';
import type { PlanUpdatePreview, TrailRegion } from '../domain/types';

export function SettingsScreen({ route }: { route: AppRoute }) {
  const {
    state,
    googleSession,
    driveBusy,
    connectGoogle,
    disconnectGoogle,
    syncDrive,
    exportClaudeFiles,
    updateSettings,
    readUpdateFromDrive,
    previewUpdateText,
    applyUpdate,
    resetDriveUpdateFile,
    regeneratePlan,
    resetEverything
  } = useApp();
  const [message, setMessage] = useState<string | null>(null);
  const [updateText, setUpdateText] = useState('');
  const [preview, setPreview] = useState<PlanUpdatePreview | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  async function run(label: string, action: () => Promise<void>) {
    setBusyAction(label);
    setMessage(null);
    try {
      await action();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusyAction(null);
    }
  }

  function previewText(text = updateText) {
    setMessage(null);
    try {
      const result = previewUpdateText(text);
      setPreview(result);
      setMessage('Adaptation valide. Vérifier le résumé et les avertissements avant application.');
    } catch (cause) {
      setPreview(null);
      setMessage(cause instanceof Error ? cause.message : String(cause));
    }
  }

  async function loadFromDrive() {
    const text = await readUpdateFromDrive();
    setUpdateText(text);
    const result = previewUpdateText(text);

    if (
      state.settings.adaptationMode === 'safe-auto' &&
      result.safeForAutomaticApplication &&
      result.update.operations.length > 0
    ) {
      await applyUpdate(result);
      setPreview(null);
      setUpdateText('');
      try {
        await resetDriveUpdateFile();
        setMessage(`Adaptation sûre appliquée automatiquement. Plan version ${result.resultingPlan.version}.`);
      } catch (cause) {
        const detail = cause instanceof Error ? cause.message : String(cause);
        setMessage(`Plan version ${result.resultingPlan.version} appliqué, mais le fichier Drive n’a pas pu être réinitialisé : ${detail}`);
      }
      return;
    }

    setPreview(result);
    setMessage(
      result.update.operations.length === 0
        ? 'Analyse valide : Claude ne propose aucune modification.'
        : 'Adaptation valide. Vérifier le résumé et les avertissements avant application.'
    );
  }

  async function applyCurrentPreview() {
    if (!preview) {
      throw new Error('Aucune adaptation validée.');
    }
    await applyUpdate(preview);
    let resetWarning = '';
    if (googleSession && state.drive.files.planUpdateFileId) {
      try {
        await resetDriveUpdateFile();
      } catch (cause) {
        const detail = cause instanceof Error ? cause.message : String(cause);
        resetWarning = ` Le fichier Drive n’a pas pu être réinitialisé : ${detail}`;
      }
    }
    setPreview(null);
    setUpdateText('');
    setMessage(`Plan mis à jour en version ${preview.resultingPlan.version}.${resetWarning}`);
  }

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    setUpdateText(text);
    previewText(text);
    event.target.value = '';
  }

  async function resetApp() {
    if (!window.confirm('Supprimer le profil, le plan, les activités et les feedbacks locaux ?')) {
      return;
    }
    await resetEverything();
    navigate('/onboarding');
  }

  const googleClientConfigured = Boolean(
    state.settings.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID
  );

  return (
    <AppShell route={route} featureId="settings">
      <main className="screen">
        <ScreenHeader
          eyebrow={`Version ${APP_VERSION}`}
          title="Réglages"
          description="Connexions, échange Claude et paramètres du moteur."
        />

        <section className="card" data-feature-id="google-drive-settings">
          <div className="section-row">
            <div>
              <p className="eyebrow">Sauvegarde</p>
              <h2>Google Drive</h2>
            </div>
            <span className={googleSession ? 'status-badge status-badge--ok' : 'status-badge'}>
              {googleSession ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
          {googleSession ? (
            <div className="account-card">
              {googleSession.account.picture ? <img src={googleSession.account.picture} alt="" data-no-capture="true" /> : null}
              <div>
                <strong>{googleSession.account.name}</strong>
                <span>{googleSession.account.email}</span>
              </div>
            </div>
          ) : (
            <p className="muted">
              Connecte le compte qui doit recevoir la sauvegarde. Trail Coach créera automatiquement son propre dossier, sans accéder au reste du Drive.
            </p>
          )}
          <GoogleDriveSetupGuide />
          <div className="button-row">
            {googleSession ? (
              <>
                <button
                  className="button button--primary"
                  type="button"
                  disabled={driveBusy || busyAction !== null}
                  onClick={() => void run('sync', syncDrive)}
                >
                  {driveBusy || busyAction === 'sync' ? 'Sauvegarde…' : 'Sauvegarder maintenant'}
                </button>
                <button className="button button--ghost" type="button" onClick={() => void disconnectGoogle()}>
                  Déconnecter
                </button>
              </>
            ) : (
              <button
                className="button button--primary"
                type="button"
                disabled={!googleClientConfigured || driveBusy}
                onClick={() => void run('connect', connectGoogle)}
              >
                {driveBusy || busyAction === 'connect' ? 'Connexion…' : 'Connecter Google Drive'}
              </button>
            )}
          </div>
          <dl className="definition-list">
            <div><dt>Dernière sauvegarde</dt><dd>{state.drive.lastSyncAt ? new Date(state.drive.lastSyncAt).toLocaleString('fr-CH') : 'jamais'}</dd></div>
            <div><dt>Feedbacks en attente</dt><dd>{state.appFeedback.filter((item) => item.syncStatus !== 'synced').length + state.sessionFeedback.filter((item) => item.syncStatus !== 'synced').length}</dd></div>
            <div><dt>Dossier créé</dt><dd>{state.drive.files.rootFolderId ? 'oui' : 'non'}</dd></div>
          </dl>
          {state.drive.lastSyncError ? <p className="field-error">{state.drive.lastSyncError}</p> : null}
        </section>

        <section className="card" data-feature-id="claude-export">
          <p className="eyebrow">Analyse externe</p>
          <h2>Contexte pour Claude</h2>
          <p className="muted">
            L’application écrit une version JSON structurée et une version Markdown lisible. Claude n’est jamais appelé directement par l’app.
          </p>
          <button className="button button--secondary button--full" type="button" onClick={exportClaudeFiles}>
            Télécharger JSON + Markdown
          </button>
        </section>

        <section className="card stack" data-feature-id="claude-plan-update">
          <div className="section-row">
            <div>
              <p className="eyebrow">Retour de Claude</p>
              <h2>Adapter le plan</h2>
            </div>
            <span className="status-badge">Plan v{state.plan?.version ?? 0}</span>
          </div>
          <p className="muted">
            Charger `plan-update.json` depuis Drive, choisir un fichier ou coller directement le JSON produit par Claude.
          </p>
          <div className="button-row">
            <button
              className="button button--secondary"
              type="button"
              disabled={!googleSession || busyAction !== null}
              onClick={() => void run('read-update', loadFromDrive)}
            >
              {busyAction === 'read-update' ? 'Lecture…' : 'Lire depuis Drive'}
            </button>
            <label className="button button--ghost file-button">
              Choisir un fichier
              <input type="file" accept="application/json,.json" onChange={(event) => void chooseFile(event)} />
            </label>
          </div>
          <label className="field">
            <span>Contenu JSON</span>
            <textarea
              className="code-area"
              rows={12}
              value={updateText}
              onChange={(event) => {
                setUpdateText(event.target.value);
                setPreview(null);
              }}
              placeholder="{ ... }"
              spellCheck={false}
            />
          </label>
          <button className="button button--secondary button--full" type="button" disabled={!updateText.trim()} onClick={() => previewText()}>
            Vérifier l’adaptation
          </button>

          {preview ? (
            <div className={preview.warnings.length > 0 ? 'update-preview update-preview--warning' : 'update-preview update-preview--safe'}>
              <p className="eyebrow">Aperçu</p>
              <h3>{preview.update.summary}</h3>
              <dl className="definition-list">
                <div><dt>Opérations</dt><dd>{preview.update.operations.length}</dd></div>
                <div><dt>Nouvelle version</dt><dd>{preview.resultingPlan.version}</dd></div>
                <div><dt>Application automatique sûre</dt><dd>{preview.safeForAutomaticApplication ? 'oui' : 'non'}</dd></div>
              </dl>
              {preview.warnings.length > 0 ? (
                <div>
                  <strong>Avertissements</strong>
                  <ul>
                    {preview.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                  </ul>
                </div>
              ) : (
                <p>Aucun garde-fou déclenché.</p>
              )}
              <button
                className="button button--primary button--full"
                type="button"
                disabled={busyAction !== null || preview.update.operations.length === 0}
                onClick={() => void run('apply-update', applyCurrentPreview)}
              >
                {busyAction === 'apply-update' ? 'Application…' : 'Appliquer au plan'}
              </button>
            </div>
          ) : null}

          <button
            className="text-button"
            type="button"
            disabled={!googleSession || !state.drive.files.planUpdateFileId || busyAction !== null}
            onClick={() => void run('reset-update', resetDriveUpdateFile)}
          >
            Réinitialiser le fichier d’adaptation sur Drive
          </button>
        </section>

        <section className="card" data-feature-id="adaptation-mode">
          <h2>Mode d’adaptation</h2>
          <label className="radio-row">
            <input
              type="radio"
              name="adaptationMode"
              checked={state.settings.adaptationMode === 'review'}
              onChange={() => updateSettings({ adaptationMode: 'review' })}
            />
            <span><strong>Validation manuelle</strong><small>Toute adaptation doit être acceptée dans l’app.</small></span>
          </label>
          <label className="radio-row">
            <input
              type="radio"
              name="adaptationMode"
              checked={state.settings.adaptationMode === 'safe-auto'}
              onChange={() => updateSettings({ adaptationMode: 'safe-auto' })}
            />
            <span><strong>Automatique si sûre</strong><small>À la lecture depuis Drive, appliquer seulement une adaptation non vide et sans avertissement.</small></span>
          </label>
        </section>

        <section className="card" data-feature-id="trail-region-settings">
          <p className="eyebrow">Suggestions de parcours</p>
          <h2>Région de trail</h2>
          <label className="field">
            <span>Zone proposée en priorité</span>
            <select
              value={state.settings.trailRegion}
              onChange={(event) => updateSettings({ trailRegion: event.target.value as TrailRegion })}
            >
              {TRAIL_REGION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <p className="muted">Lausanne est la valeur initiale, mais tu peux choisir une région ou toute la Suisse.</p>
        </section>

        <section className="card" data-feature-id="feedback-settings">
          <h2>Feedback application</h2>
          <label className="switch-row">
            <span><strong>Capture automatique</strong><small>Créer une capture avant d’ouvrir la zone de feedback.</small></span>
            <input
              type="checkbox"
              checked={state.settings.screenshotByDefault}
              onChange={(event) => updateSettings({ screenshotByDefault: event.target.checked })}
            />
          </label>
        </section>

        <section className="card" data-feature-id="garmin-settings">
          <div className="section-row">
            <div>
              <p className="eyebrow">Intégration future</p>
              <h2>Garmin</h2>
            </div>
            <span className={state.settings.garminBridgeUrl ? 'status-badge status-badge--ok' : 'status-badge'}>
              {state.settings.garminBridgeUrl ? 'Pont configuré' : 'Non configuré'}
            </span>
          </div>
          <p className="muted">
            URL du pont : {state.settings.garminBridgeUrl || 'aucune'}. La webapp n’emploie aucune API Garmin non officielle.
          </p>
        </section>

        <section className="card" data-feature-id="plan-maintenance">
          <h2>Maintenance du plan</h2>
          <p className="muted">Recalculer à partir de l’objectif et des activités actuelles remplace les adaptations non terminées.</p>
          <button className="button button--secondary button--full" type="button" disabled={!state.profile || !state.goal} onClick={regeneratePlan}>
            Régénérer le plan
          </button>
        </section>

        {message ? <p className="inline-notice" role="status">{message}</p> : null}

        <section className="danger-zone" data-feature-id="reset-app">
          <h2>Réinitialiser l’application</h2>
          <p>Supprime uniquement les données locales. Les fichiers déjà synchronisés sur Drive restent dans Drive.</p>
          <button className="button button--danger-ghost button--full" type="button" onClick={() => void resetApp()}>
            Effacer les données locales
          </button>
        </section>
      </main>
    </AppShell>
  );
}
