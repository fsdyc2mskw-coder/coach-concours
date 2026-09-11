import { useMemo, useState, type FormEvent } from 'react';
import { useApp } from '../app/AppContext';
import type { AppRoute } from '../app/router';
import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';
import { ScreenHeader } from '../components/ScreenHeader';
import { DemoGarminProvider } from '../infrastructure/garmin/demoProvider';
import { OfficialGarminBridgeProvider } from '../infrastructure/garmin/officialProvider';
import { formatDateLong, formatDuration, formatPace, todayKey } from '../domain/utils';

export function ActivitiesScreen({ route }: { route: AppRoute }) {
  const {
    state,
    importActivities,
    recordGarminSyncError,
    addManualActivity,
    regeneratePlan
  } = useApp();
  const [manualOpen, setManualOpen] = useState(false);
  const [name, setName] = useState('Course');
  const [date, setDate] = useState(todayKey());
  const [distance, setDistance] = useState('8');
  const [duration, setDuration] = useState('55');
  const [elevation, setElevation] = useState('200');
  const [heartRate, setHeartRate] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const activities = useMemo(
    () => [...state.activities].sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [state.activities]
  );
  const bridge = new OfficialGarminBridgeProvider(state.settings.garminBridgeUrl);

  async function syncGarmin() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await bridge.sync(state.garmin.lastSyncAt);
      importActivities(result.activities, result.syncedAt, 'bridge-configured');
      setMessage(`${result.activities.length} activité(s) reçue(s) depuis Garmin.`);
    } catch (cause) {
      const error = cause instanceof Error ? cause.message : String(cause);
      recordGarminSyncError(error);
      setMessage(error);
    } finally {
      setBusy(false);
    }
  }

  async function importDemo() {
    setBusy(true);
    setMessage(null);
    try {
      const provider = new DemoGarminProvider();
      const result = await provider.sync();
      importActivities(result.activities, result.syncedAt, 'demo');
      setMessage('Historique Garmin de démonstration importé. Recalculer le plan pour l’utiliser comme base.');
    } finally {
      setBusy(false);
    }
  }

  function submitManual(event: FormEvent) {
    event.preventDefault();
    const parsedHeartRate = heartRate.trim() ? Number(heartRate) : undefined;
    const payload = {
      name,
      date,
      distanceKm: Number(distance),
      durationMin: Number(duration),
      elevationGainM: Number(elevation),
      ...(parsedHeartRate !== undefined ? { averageHeartRateBpm: parsedHeartRate } : {})
    };
    if (
      !Number.isFinite(payload.distanceKm) ||
      payload.distanceKm < 0 ||
      !Number.isFinite(payload.durationMin) ||
      payload.durationMin <= 0 ||
      !Number.isFinite(payload.elevationGainM) ||
      payload.elevationGainM < 0 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(payload.date) ||
      payload.date > todayKey() ||
      (parsedHeartRate !== undefined &&
        (!Number.isFinite(parsedHeartRate) || parsedHeartRate < 50 || parsedHeartRate > 230))
    ) {
      setMessage('Les valeurs de l’activité ne sont pas valides.');
      return;
    }
    try {
      addManualActivity(payload);
      setManualOpen(false);
      setMessage('Activité ajoutée.');
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : String(cause));
    }
  }

  return (
    <AppShell route={route} featureId="activities">
      <main className="screen">
        <ScreenHeader
          eyebrow={`${activities.length} activité${activities.length > 1 ? 's' : ''}`}
          title="Activités"
          description="Historique utilisé pour calibrer le plan et préparer le contexte envoyé à Claude."
        />

        <section className="card" data-feature-id="garmin-sync">
          <div className="section-row">
            <div>
              <p className="eyebrow">Source principale</p>
              <h2>Garmin Connect</h2>
            </div>
            <span className={bridge.isConfigured() ? 'status-badge status-badge--ok' : 'status-badge'}>
              {bridge.isConfigured() ? 'Configuré' : 'Pont requis'}
            </span>
          </div>
          <p className="muted">
            La synchronisation automatique passe par un petit backend approuvé par Garmin. Aucun identifiant Garmin n’est saisi dans cette webapp.
          </p>
          <div className="button-row">
            <button
              className="button button--primary"
              type="button"
              disabled={!bridge.isConfigured() || busy}
              onClick={() => void syncGarmin()}
            >
              {busy ? 'Synchronisation…' : 'Synchroniser Garmin'}
            </button>
            {!bridge.isConfigured() ? (
              <button className="button button--secondary" type="button" disabled={busy} onClick={() => void importDemo()}>
                Importer la démo
              </button>
            ) : null}
          </div>
        </section>

        <div className="button-row button-row--spread">
          <button className="button button--secondary" type="button" onClick={() => setManualOpen((value) => !value)}>
            {manualOpen ? 'Fermer' : 'Ajouter manuellement'}
          </button>
          <button className="text-button" type="button" disabled={!state.profile || !state.goal} onClick={regeneratePlan}>
            Recalculer le plan
          </button>
        </div>

        {manualOpen ? (
          <form className="card stack" onSubmit={submitManual} data-feature-id="manual-activity" noValidate>
            <h2>Nouvelle activité</h2>
            <label className="field">
              <span>Nom</span>
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <div className="form-grid">
              <label className="field field--full">
                <span>Date</span>
                <input type="date" max={todayKey()} value={date} onChange={(event) => setDate(event.target.value)} />
              </label>
              <label className="field">
                <span>Distance, km</span>
                <input type="number" min="0" step="0.1" value={distance} onChange={(event) => setDistance(event.target.value)} />
              </label>
              <label className="field">
                <span>Durée, min</span>
                <input type="number" min="1" step="1" value={duration} onChange={(event) => setDuration(event.target.value)} />
              </label>
              <label className="field">
                <span>Dénivelé positif, m</span>
                <input type="number" min="0" step="10" value={elevation} onChange={(event) => setElevation(event.target.value)} />
              </label>
              <label className="field">
                <span>Fréquence cardiaque moyenne</span>
                <input type="number" min="50" max="230" value={heartRate} onChange={(event) => setHeartRate(event.target.value)} placeholder="facultatif" />
              </label>
            </div>
            <button className="button button--primary button--full" type="submit">Ajouter l’activité</button>
          </form>
        ) : null}

        {message ? <p className="inline-notice" role="status">{message}</p> : null}

        <section className="section" data-feature-id="activity-list">
          <div className="section-row">
            <h2>Historique</h2>
            <span className="muted">Plus récent d’abord</span>
          </div>
          {activities.length === 0 ? (
            <EmptyState title="Aucune activité">
              <p>Importer la démonstration ou ajouter une course manuellement.</p>
            </EmptyState>
          ) : (
            <div className="activity-list">
              {activities.map((activity) => (
                <article className="activity-card" key={activity.id}>
                  <div className="activity-card__source">{activity.source === 'garmin' ? 'G' : activity.source === 'demo' ? 'D' : 'M'}</div>
                  <div className="activity-card__body">
                    <p className="eyebrow">{formatDateLong(activity.startedAt.slice(0, 10))}</p>
                    <h3>{activity.name}</h3>
                    <div className="activity-card__metrics">
                      <span>{(activity.distanceM / 1_000).toFixed(1)} km</span>
                      <span>{formatDuration(activity.durationSec / 60)}</span>
                      <span>{activity.elevationGainM} m D+</span>
                      <span>{formatPace(activity.averagePaceSecPerKm)}</span>
                      {activity.averageHeartRateBpm ? <span>{activity.averageHeartRateBpm} bpm</span> : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}
