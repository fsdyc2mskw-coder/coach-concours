import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useApp } from '../app/AppContext';
import type { AppRoute } from '../app/router';
import { navigate } from '../app/router';
import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';
import { StatPill } from '../components/StatPill';
import { feedbackForWorkout, workoutById } from '../domain/selectors';
import {
  suggestSwissTrails,
  SWISS_TRAIL_CATALOG_META,
  TRAIL_REGION_OPTIONS
} from '../domain/swissTrails';
import type { TrailRegion } from '../domain/types';
import { formatDateLong, formatDuration, formatPace, todayKey } from '../domain/utils';

export function SessionScreen({ route, workoutId }: { route: AppRoute; workoutId: string }) {
  const { state, moveWorkout, completeWorkout, skipWorkout, updateSettings } = useApp();
  const workout = workoutById(state, workoutId);
  const feedback = feedbackForWorkout(state, workoutId);
  const linkedActivity = useMemo(
    () => state.activities.find((activity) => activity.id === workout?.linkedActivityId) ?? null,
    [state.activities, workout?.linkedActivityId]
  );
  const trailSuggestions = useMemo(
    () => workout && workout.plannedDistanceKm > 0
      ? suggestSwissTrails(
          workout.plannedDistanceKm,
          workout.plannedElevationGainM,
          state.settings.trailRegion
        )
      : [],
    [state.settings.trailRegion, workout?.id, workout?.plannedDistanceKm, workout?.plannedElevationGainM]
  );
  const [newDate, setNewDate] = useState(workout?.date ?? '');
  const [distance, setDistance] = useState(String(workout?.plannedDistanceKm ?? 0));
  const [duration, setDuration] = useState(String(workout?.plannedDurationMin ?? 0));
  const [elevation, setElevation] = useState(String(workout?.plannedElevationGainM ?? 0));
  const [heartRate, setHeartRate] = useState('');
  const [effort, setEffort] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!workout) {
      return;
    }
    setNewDate(workout.date);
    setDistance(String(workout.plannedDistanceKm));
    setDuration(String(workout.plannedDurationMin));
    setElevation(String(workout.plannedElevationGainM));
  }, [workout?.id, workout?.date]);

  if (!workout || !state.plan) {
    return (
      <AppShell route={route} featureId="session-missing">
        <main className="screen">
          <EmptyState title="Séance introuvable">
            <button className="button button--primary" type="button" onClick={() => navigate('/plan')}>
              Revenir au plan
            </button>
          </EmptyState>
        </main>
      </AppShell>
    );
  }

  const currentWorkoutId = workout.id;
  const currentWorkoutDate = workout.date;
  const today = todayKey();
  const earliestMoveDate = state.plan.startDate > today ? state.plan.startDate : today;
  const canRecordWorkout = workout.date <= today;
  const isGoalWorkout = state.plan.goalWorkoutId === workout.id;
  const elevationExample = buildElevationExample(workout.plannedElevationGainM);

  function handleMove() {
    if (!newDate || newDate === currentWorkoutDate) {
      return;
    }
    setError(null);
    try {
      moveWorkout(currentWorkoutId, newDate);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const actualDistanceKm = Number(distance);
    const actualDurationMin = Number(duration);
    const actualElevationGainM = Number(elevation);
    const averageHeartRateBpm = heartRate.trim() ? Number(heartRate) : undefined;
    if (
      !Number.isFinite(actualDistanceKm) ||
      actualDistanceKm < 0 ||
      !Number.isFinite(actualDurationMin) ||
      actualDurationMin <= 0 ||
      !Number.isFinite(actualElevationGainM) ||
      actualElevationGainM < 0 ||
      (averageHeartRateBpm !== undefined &&
        (!Number.isFinite(averageHeartRateBpm) || averageHeartRateBpm < 50 || averageHeartRateBpm > 230))
    ) {
      setError('Les données réelles de la séance ne sont pas valides.');
      return;
    }
    setSaving(true);
    try {
      await completeWorkout({
        workoutId: currentWorkoutId,
        actualDistanceKm,
        actualDurationMin,
        actualElevationGainM,
        ...(averageHeartRateBpm ? { averageHeartRateBpm } : {}),
        effort,
        comment
      });
      navigate('/dashboard');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell route={route} featureId={`session-${workout.type}`}>
      <main className="screen">
        <button className="back-button" type="button" onClick={() => navigate('/plan')}>
          ‹ Plan
        </button>

        <header className="session-hero" data-feature-id="session-summary">
          <div className="section-row">
            <div>
              <p className="eyebrow">{formatDateLong(workout.date)}</p>
              <h1>{workout.title}</h1>
            </div>
            <span className={`status-badge status-badge--${workout.status}`}>
              {statusLabel(workout.status)}
            </span>
          </div>
          <p>{workout.description}</p>
          <div className="stats-row">
            <StatPill label="Durée" value={formatDuration(workout.plannedDurationMin)} />
            <StatPill label="Distance" value={`${workout.plannedDistanceKm.toFixed(1)} km`} />
            <StatPill label="D+" value={`${workout.plannedElevationGainM} m`} />
          </div>
        </header>

        {workout.target ? (
          <section className="card card--accent" data-feature-id="pace-target">
            <p className="eyebrow">Intensité prescrite</p>
            <h2>{formatPace(workout.target.minSecPerKm)} à {formatPace(workout.target.maxSecPerKm)}</h2>
            <p>Ressenti de secours : {workout.target.rpeFallback}/5.</p>
            {workout.target.terrainNote ? <p className="muted">{workout.target.terrainNote}</p> : null}
          </section>
        ) : null}

        {elevationExample ? (
          <section className="card" data-feature-id="elevation-guidance">
            <p className="eyebrow">Trouver le dénivelé</p>
            <h2>{workout.plannedElevationGainM} m D+ sans parcours parfait</h2>
            <p>
              Avant de partir, tracer une boucle dans une carte qui affiche le profil altimétrique.
              Le total de toutes les montées correspond au dénivelé positif, ou D+.
            </p>
            <p>
              Sans parcours adapté, trouver une côte proche d’environ {elevationExample.climbM} m D+
              et la monter {elevationExample.repetitions} fois. Les descentes servent de récupération.
            </p>
            <p className="muted">
              Le chiffre reste un repère. Respecter d’abord la durée et l’effort prévu ; ne pas rallonger
              inutilement la séance pour atteindre exactement le D+.
            </p>
          </section>
        ) : null}

        {trailSuggestions.length > 0 ? (
          <section className="card stack" data-feature-id="swiss-trail-suggestions">
            <div>
              <p className="eyebrow">Où faire cette séance</p>
              <h2>Idées de trails en Suisse</h2>
              <p className="muted">
                Classées selon les {workout.plannedDistanceKm.toFixed(1)} km et {workout.plannedElevationGainM} m D+ prévus.
              </p>
              <p className="muted">
                {SWISS_TRAIL_CATALOG_META.count.toLocaleString('fr-CH')} itinéraires existants issus du catalogue
                officiel SuisseMobile. L’application ne fabrique aucun tracé.
              </p>
            </div>
            <label className="field">
              <span>Zone de recherche</span>
              <select
                value={state.settings.trailRegion}
                onChange={(event) => updateSettings({ trailRegion: event.target.value as TrailRegion })}
              >
                {TRAIL_REGION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <div className="trail-list">
              {trailSuggestions.map((suggestion) => (
                <article className="trail-card" key={suggestion.id}>
                  <div className="section-row">
                    <div>
                      <p className="eyebrow">{suggestion.place}</p>
                      <h3>{suggestion.name}</h3>
                    </div>
                    <span className="status-badge">
                      Parcours existant
                    </span>
                  </div>
                  {suggestion.description ? <p>{suggestion.description}</p> : null}
                  <p className="trail-card__metrics">
                    {suggestion.distanceKm} km · {suggestion.elevationGainM} m D+
                    {suggestion.elevationLossM !== null && suggestion.elevationLossM > 0 ? ` · ${suggestion.elevationLossM} m D−` : ''}
                  </p>
                  <p className="muted">
                    Niveau {suggestion.difficulty} · {suggestion.durationMin !== null ? formatDuration(suggestion.durationMin) : 'durée inconnue'} · {suggestion.season}
                  </p>
                  {suggestion.warning ? (
                    <a href={suggestion.warning.url} target="_blank" rel="noreferrer">
                      ⚠ {suggestion.warning.title}
                    </a>
                  ) : null}
                  <a
                    className="button button--secondary button--full"
                    href={suggestion.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ouvrir la fiche {suggestion.sourceLabel}
                  </a>
                </article>
              ))}
            </div>
            <button className="button button--secondary button--full" type="button" onClick={() => navigate('/trails')}>
              Voir tous les parcours près de moi
            </button>
            <p className="muted">
              Vérifier la météo, l’état des sentiers, les éventuelles fermetures et les transports avant de partir.
              {' '}Données SuisseMobile via Switzerland Tourism OpenData, CC BY-SA 4.0.
            </p>
          </section>
        ) : null}

        <section className="section" data-feature-id="workout-structure">
          <div className="section-row">
            <h2>Structure</h2>
            <span className="muted">{workout.segments.length} bloc{workout.segments.length > 1 ? 's' : ''}</span>
          </div>
          <div className="segment-list">
            {workout.segments.map((segment, index) => (
              <article className="segment-card" key={segment.id}>
                <span className="segment-card__index">{index + 1}</span>
                <div>
                  <h3>{segment.label}</h3>
                  <p className="segment-card__metrics">
                    {segment.repetitions ? `${segment.repetitions} × ` : ''}
                    {segment.durationMin ? `${segment.durationMin} min` : ''}
                    {segment.distanceKm ? `${segment.distanceKm.toFixed(1)} km` : ''}
                  </p>
                  {segment.instructions ? <p>{segment.instructions}</p> : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="card" data-feature-id="workout-rationale">
          <p className="eyebrow">Pourquoi cette séance</p>
          <p>{workout.rationale}</p>
        </section>

        {workout.status === 'planned' && !isGoalWorkout ? (
          <section className="card" data-feature-id="move-workout">
            <h2>Déplacer la séance</h2>
            <div className="inline-form">
              <input
                type="date"
                min={earliestMoveDate}
                max={state.plan.endDate}
                value={newDate}
                onChange={(event) => setNewDate(event.target.value)}
              />
              <button className="button button--secondary" type="button" disabled={newDate === workout.date} onClick={handleMove}>
                Déplacer
              </button>
            </div>
          </section>
        ) : null}

        {workout.status === 'completed' ? (
          <section className="card card--success" data-feature-id="completed-feedback">
            <p className="eyebrow">Séance enregistrée</p>
            <h2>{linkedActivity ? `${(linkedActivity.distanceM / 1_000).toFixed(1)} km · ${Math.round(linkedActivity.durationSec / 60)} min` : 'Activité liée'}</h2>
            {feedback ? (
              <>
                <p>Effort : {feedback.effort}/5</p>
                <p>{feedback.comment || 'Aucun commentaire.'}</p>
              </>
            ) : null}
          </section>
        ) : workout.status === 'skipped' ? (
          <section className="card">
            <h2>Séance ignorée</h2>
            <p className="muted">Elle restera visible dans l’historique du plan.</p>
          </section>
        ) : !canRecordWorkout ? (
          <section className="card stack" data-feature-id="future-workout-actions">
            <div>
              <p className="eyebrow">Séance à venir</p>
              <h2>Le compte rendu sera disponible le jour de la séance.</h2>
              <p className="muted">Tu peux encore déplacer ou annuler cette séance.</p>
            </div>
            {error ? <p className="field-error" role="alert">{error}</p> : null}
            <button
              className="button button--danger-ghost button--full"
              type="button"
              onClick={() => {
                setError(null);
                try {
                  skipWorkout(currentWorkoutId);
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : String(cause));
                }
              }}
            >
              Marquer comme non réalisée
            </button>
          </section>
        ) : (
          <form className="card stack" onSubmit={submit} data-feature-id="post-workout-feedback" noValidate>
            <div>
              <p className="eyebrow">Après la séance</p>
              <h2>Données réelles et ressenti</h2>
            </div>
            <div className="form-grid">
              <label className="field">
                <span>Distance, km</span>
                <input type="number" min="0" step="0.1" inputMode="decimal" value={distance} onChange={(event) => setDistance(event.target.value)} />
              </label>
              <label className="field">
                <span>Durée, min</span>
                <input type="number" min="1" step="1" inputMode="numeric" value={duration} onChange={(event) => setDuration(event.target.value)} />
              </label>
              <label className="field">
                <span>Dénivelé positif, m</span>
                <input type="number" min="0" step="10" inputMode="numeric" value={elevation} onChange={(event) => setElevation(event.target.value)} />
              </label>
              <label className="field">
                <span>Fréquence cardiaque moyenne</span>
                <input type="number" min="50" max="230" step="1" inputMode="numeric" value={heartRate} onChange={(event) => setHeartRate(event.target.value)} placeholder="facultatif" />
              </label>
            </div>

            <fieldset className="effort-fieldset">
              <legend>Effort ressenti</legend>
              <div className="effort-scale">
                {([1, 2, 3, 4, 5] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={effort === value ? 'is-active' : ''}
                    onClick={() => setEffort(value)}
                    aria-pressed={effort === value}
                  >
                    <strong>{value}</strong>
                    <span>{effortLabel(value)}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="field">
              <span>Commentaire libre</span>
              <textarea rows={4} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Sensations, terrain, difficulté particulière, douleur éventuelle…" />
            </label>
            {error ? <p className="field-error" role="alert">{error}</p> : null}
            <button className="button button--primary button--full" type="submit" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Terminer la séance'}
            </button>
            <button
              className="button button--danger-ghost button--full"
              type="button"
              onClick={() => {
                setError(null);
                try {
                  skipWorkout(currentWorkoutId);
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : String(cause));
                }
              }}
            >
              Marquer comme non réalisée
            </button>
          </form>
        )}
      </main>
    </AppShell>
  );
}

function statusLabel(status: 'planned' | 'completed' | 'skipped'): string {
  return {
    planned: 'Prévue',
    completed: 'Terminée',
    skipped: 'Ignorée'
  }[status];
}

function effortLabel(value: 1 | 2 | 3 | 4 | 5): string {
  return {
    1: 'Très facile',
    2: 'Facile',
    3: 'Soutenu',
    4: 'Difficile',
    5: 'Maximal'
  }[value];
}

function buildElevationExample(targetM: number): { climbM: number; repetitions: number } | null {
  if (targetM <= 0) {
    return null;
  }
  const climbM = targetM <= 75 ? 25 : targetM <= 300 ? 50 : 100;
  return {
    climbM,
    repetitions: Math.max(1, Math.round(targetM / climbM))
  };
}
