import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../app/AppContext';
import type { AppRoute } from '../app/router';
import { navigate } from '../app/router';
import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';
import { ScreenHeader } from '../components/ScreenHeader';
import { SessionCard } from '../components/SessionCard';
import { StatPill } from '../components/StatPill';
import { workoutsForWeek } from '../domain/planEngine';
import { addDays, formatDateShort, startOfWeekMonday, todayKey } from '../domain/utils';

export function PlanScreen({ route }: { route: AppRoute }) {
  const { state } = useApp();
  const plan = state.plan;
  const initialIndex = useMemo(() => {
    if (!plan) {
      return 0;
    }
    const current = startOfWeekMonday(todayKey());
    const index = plan.weeks.findIndex((week) => week.startDate === current);
    return index >= 0 ? index : 0;
  }, [plan]);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  useEffect(() => {
    setSelectedIndex((current) => {
      if (!plan) {
        return 0;
      }
      return Math.min(current, Math.max(0, plan.weeks.length - 1));
    });
  }, [plan]);

  if (!plan) {
    return (
      <AppShell route={route} featureId="plan-empty">
        <main className="screen">
          <ScreenHeader title="Plan" />
          <EmptyState title="Aucun plan actif">
            <button className="button button--primary" type="button" onClick={() => navigate('/onboarding')}>
              Créer un plan
            </button>
          </EmptyState>
        </main>
      </AppShell>
    );
  }

  const week = plan.weeks[selectedIndex] ?? plan.weeks[0]!;
  const sessions = workoutsForWeek(plan, week.startDate);
  const completed = sessions.filter((workout) => workout.status === 'completed').length;

  return (
    <AppShell route={route} featureId="weekly-plan">
      <main className="screen">
        <ScreenHeader
          eyebrow={`Version ${plan.version} · ${plan.algorithmVersion}`}
          title="Plan d’entraînement"
          description={state.goal?.name}
        />

        <section className="week-selector" data-feature-id="week-selector">
          <button
            className="icon-button"
            type="button"
            disabled={selectedIndex === 0}
            onClick={() => setSelectedIndex((value) => Math.max(0, value - 1))}
            aria-label="Semaine précédente"
          >
            ‹
          </button>
          <div>
            <p className="eyebrow">Semaine {week.index + 1} / {plan.weeks.length}</p>
            <h2>{formatDateShort(week.startDate)} – {formatDateShort(addDays(week.startDate, 6))}</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            disabled={selectedIndex >= plan.weeks.length - 1}
            onClick={() => setSelectedIndex((value) => Math.min(plan.weeks.length - 1, value + 1))}
            aria-label="Semaine suivante"
          >
            ›
          </button>
        </section>

        <section className="card card--compact" data-feature-id="week-targets">
          <div className="section-row">
            <div>
              <p className="eyebrow">Phase</p>
              <h2>{phaseLabel(week.phase)}</h2>
            </div>
            <span className="status-badge status-badge--ok">{completed}/{sessions.length} faites</span>
          </div>
          <div className="stats-row">
            <StatPill label="Distance" value={`${week.targetDistanceKm.toFixed(1)} km`} />
            <StatPill label="D+" value={`${week.targetElevationGainM} m`} />
            <StatPill label="Séances" value={String(sessions.length)} />
          </div>
        </section>

        <section className="section" data-feature-id="week-workouts">
          <div className="session-list">
            {sessions.map((workout) => <SessionCard key={workout.id} workout={workout} />)}
          </div>
        </section>

        <button className="button button--ghost button--full" type="button" onClick={() => navigate('/settings')}>
          Importer une adaptation Claude
        </button>
      </main>
    </AppShell>
  );
}

function phaseLabel(phase: 'base' | 'build' | 'peak' | 'taper'): string {
  return {
    base: 'Base aérobie',
    build: 'Construction',
    peak: 'Spécifique / pic',
    taper: 'Allègement'
  }[phase];
}
