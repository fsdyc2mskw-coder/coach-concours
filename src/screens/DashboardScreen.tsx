import { useMemo, useState } from 'react';
import { useApp } from '../app/AppContext';
import type { AppRoute } from '../app/router';
import { navigate } from '../app/router';
import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';
import { ProgressBar } from '../components/ProgressBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { SessionCard } from '../components/SessionCard';
import { StatPill } from '../components/StatPill';
import { currentWeek, todayWorkout, upcomingWorkout, weekProgress, workoutsInWeek } from '../domain/selectors';
import { daysBetween, formatDateLong, todayKey } from '../domain/utils';

export function DashboardScreen({ route }: { route: AppRoute }) {
  const { state, driveBusy, connectGoogle, syncDrive } = useApp();
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const today = todayKey();
  const week = useMemo(() => currentWeek(state, today), [state, today]);
  const progress = useMemo(() => weekProgress(state, week), [state, week]);
  const sessions = useMemo(() => workoutsInWeek(state, week), [state, week]);
  const plannedToday = todayWorkout(state, today);
  const next = plannedToday ?? upcomingWorkout(state, today);
  const daysToGoal = state.goal?.targetDate ? Math.max(0, daysBetween(today, state.goal.targetDate)) : null;
  const googleConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  async function handleDrive() {
    setSyncMessage(null);
    try {
      if (state.drive.connected) {
        await syncDrive();
      } else {
        await connectGoogle();
      }
      setSyncMessage('Google Drive synchronisé.');
    } catch (cause) {
      setSyncMessage(cause instanceof Error ? cause.message : String(cause));
    }
  }

  return (
    <AppShell route={route} featureId="dashboard">
      <main className="screen">
        <ScreenHeader
          eyebrow={formatDateLong(today)}
          title={state.profile ? `Plan de ${state.profile.displayName}` : 'Trail Coach'}
          action={
            <button
              className={state.drive.connected ? 'sync-button is-connected' : 'sync-button'}
              type="button"
              disabled={driveBusy || (!state.drive.connected && !googleConfigured)}
              onClick={() => void handleDrive()}
              aria-label="Synchroniser Google Drive"
            >
              <span aria-hidden="true">↻</span>
              {driveBusy ? '…' : state.drive.connected ? 'Drive' : 'Connecter'}
            </button>
          }
        />

        {state.goal ? (
          <section className="goal-card" data-feature-id="goal-summary">
            <div>
              <p className="eyebrow">Objectif principal</p>
              <h2>{state.goal.name}</h2>
              <p>
                {state.goal.kind === 'race'
                  ? `${state.goal.distanceKm ?? 0} km · ${state.goal.elevationGainM ?? 0} m D+`
                  : 'Progression générale en trail'}
              </p>
            </div>
            {daysToGoal !== null ? (
              <div className="goal-card__countdown">
                <strong>{daysToGoal}</strong>
                <span>jours</span>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="section" data-feature-id="today-workout">
          <div className="section-row">
            <div>
              <p className="eyebrow">À faire</p>
              <h2>{plannedToday ? 'Séance du jour' : 'Prochaine séance'}</h2>
            </div>
            <button className="text-button" type="button" onClick={() => navigate('/plan')}>
              Voir le plan
            </button>
          </div>
          {next ? (
            <SessionCard workout={next} />
          ) : (
            <EmptyState title="Aucune séance à venir">
              <p>Régénérer le plan depuis les réglages.</p>
            </EmptyState>
          )}
        </section>

        <section className="card" data-feature-id="week-progress">
          <div className="section-row">
            <div>
              <p className="eyebrow">Semaine en cours</p>
              <h2>{progress.completed} / {progress.total} séances</h2>
            </div>
            <span className="phase-badge">{week ? phaseLabel(week.phase) : 'hors plan'}</span>
          </div>
          <ProgressBar
            value={progress.total > 0 ? progress.completed / progress.total : 0}
            label="Progression de la semaine"
          />
          <div className="stats-row">
            <StatPill label="Réalisé" value={`${progress.completedDistanceKm.toFixed(1)} km`} />
            <StatPill label="Prévu" value={`${progress.plannedDistanceKm.toFixed(1)} km`} />
            <StatPill label="D+ cible" value={`${week?.targetElevationGainM ?? 0} m`} />
          </div>
        </section>

        {sessions.length > 0 ? (
          <section className="section" data-feature-id="week-sessions">
            <div className="section-row">
              <h2>Cette semaine</h2>
              <span className="muted">{sessions.length} séances</span>
            </div>
            <div className="session-list">
              {sessions.map((workout) => <SessionCard key={workout.id} workout={workout} />)}
            </div>
          </section>
        ) : null}

        {syncMessage ? <p className="inline-notice">{syncMessage}</p> : null}
      </main>
    </AppShell>
  );
}

function phaseLabel(phase: 'base' | 'build' | 'peak' | 'taper'): string {
  return {
    base: 'Base',
    build: 'Construction',
    peak: 'Pic',
    taper: 'Allègement'
  }[phase];
}
