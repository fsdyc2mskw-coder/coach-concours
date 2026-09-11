import { useEffect, useState } from 'react';
import { APP_VERSION } from '../app/version';
import { useApp } from '../app/AppContext';
import type { AppFeedback } from '../domain/types';
import { createId } from '../domain/utils';
import { Modal } from './Modal';

interface FeedbackSheetProps {
  open: boolean;
  route: string;
  featureId: string;
  featureIds: string[];
  screenshotDataUrl?: string;
  captureError?: string;
  onRecapture(): Promise<void>;
  onClose(): void;
}

export function FeedbackSheet({
  open,
  route,
  featureId,
  featureIds,
  screenshotDataUrl,
  captureError,
  onRecapture,
  onClose
}: FeedbackSheetProps) {
  const { state, addAppFeedback } = useApp();
  const [message, setMessage] = useState('');
  const [selectedFeatureId, setSelectedFeatureId] = useState(featureId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedFeatureId(featureId);
    } else {
      setMessage('');
      setError(null);
    }
  }, [featureId, open]);

  async function submit() {
    if (!message.trim()) {
      setError('Décrire ce qui fonctionne ou ce qui doit être corrigé.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const feedback: AppFeedback = {
        id: createId('app-feedback'),
        message: message.trim(),
        ...(screenshotDataUrl ? { screenshotDataUrl } : {}),
        technical: {
          appVersion: APP_VERSION,
          route,
          featureId: selectedFeatureId,
          capturedAt: now,
          viewport: { width: window.innerWidth, height: window.innerHeight },
          screen: { width: window.screen.width, height: window.screen.height },
          devicePixelRatio: window.devicePixelRatio || 1,
          userAgent: navigator.userAgent,
          language: navigator.language,
          online: navigator.onLine,
          ...(state.lastTechnicalError ? { lastError: state.lastTechnicalError } : {})
        },
        createdAt: now,
        syncStatus: 'pending'
      };
      await addAppFeedback(feedback);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title="Feedback" onClose={onClose}>
      <div className="stack">
        {featureIds.length > 1 ? (
          <label className="field">
            <span>Écran ou fonctionnalité concernée</span>
            <select
              value={selectedFeatureId}
              onChange={(event) => setSelectedFeatureId(event.target.value)}
            >
              {featureIds.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </label>
        ) : (
          <div className="context-chip">
            <span>Contexte</span>
            <strong>{selectedFeatureId}</strong>
          </div>
        )}

        <label className="field">
          <span>Ce qui va ou ne va pas</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            placeholder="Décris le comportement attendu et ce qui s’est passé."
            autoFocus
          />
        </label>

        <section className="screenshot-box">
          <div className="section-row">
            <div>
              <span className="field-label">Capture d’écran</span>
              <small>La fenêtre de feedback n’est pas incluse.</small>
            </div>
            <button className="button button--ghost button--small" type="button" onClick={() => void onRecapture()}>
              Reprendre
            </button>
          </div>
          {screenshotDataUrl ? (
            <img className="screenshot-preview" src={screenshotDataUrl} alt="Capture de l’écran courant" />
          ) : (
            <p className="muted">Aucune capture disponible.</p>
          )}
          {captureError ? <p className="field-error">{captureError}</p> : null}
        </section>

        <p className="microcopy">
          Version, route, dimensions d’écran, navigateur, état réseau et dernière erreur détectée seront ajoutés automatiquement.
        </p>
        {error ? <p className="field-error" role="alert">{error}</p> : null}
        <button className="button button--primary button--full" type="button" disabled={saving} onClick={() => void submit()}>
          {saving ? 'Enregistrement…' : 'Enregistrer le feedback'}
        </button>
      </div>
    </Modal>
  );
}
