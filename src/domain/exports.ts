import type { AppState, PlannedWorkout } from './types';
import { recentActivities } from './selectors';
import { addDays, formatPace, todayKey } from './utils';

export interface ClaudeContextExport {
  schemaVersion: '1.0';
  exportedAt: string;
  app: {
    name: 'Trail Coach';
    stateSchemaVersion: number;
  };
  athlete: AppState['profile'];
  goal: AppState['goal'];
  plan: {
    id: string;
    version: number;
    algorithmVersion: string;
    goalWorkoutId?: string;
    recentWorkouts: PlannedWorkout[];
    nextWorkouts: PlannedWorkout[];
    lastAdaptationSummary?: string;
  } | null;
  recentActivities: ReturnType<typeof recentActivities>;
  sessionFeedback: AppState['sessionFeedback'];
  productFeedback: Array<{
    id: string;
    message: string;
    technical: AppState['appFeedback'][number]['technical'];
    createdAt: string;
  }>;
}

export function buildClaudeContext(state: AppState, referenceDate = todayKey()): ClaudeContextExport {
  const horizon = addDays(referenceDate, 28);
  return {
    schemaVersion: '1.0',
    exportedAt: new Date().toISOString(),
    app: {
      name: 'Trail Coach',
      stateSchemaVersion: state.schemaVersion
    },
    athlete: state.profile,
    goal: state.goal,
    plan: state.plan
      ? {
          id: state.plan.id,
          version: state.plan.version,
          algorithmVersion: state.plan.algorithmVersion,
          ...(state.plan.goalWorkoutId ? { goalWorkoutId: state.plan.goalWorkoutId } : {}),
          recentWorkouts: state.plan.workouts.filter(
            (workout) =>
              workout.date >= addDays(referenceDate, -14) &&
              workout.date <= referenceDate &&
              (workout.date < referenceDate || workout.status !== 'planned')
          ),
          nextWorkouts: state.plan.workouts.filter(
            (workout) =>
              workout.status === 'planned' &&
              workout.date >= referenceDate &&
              workout.date <= horizon
          ),
          ...(state.plan.lastAdaptationSummary
            ? { lastAdaptationSummary: state.plan.lastAdaptationSummary }
            : {})
        }
      : null,
    recentActivities: recentActivities(state, 42, referenceDate),
    sessionFeedback: state.sessionFeedback.filter(
      (feedback) => feedback.createdAt.slice(0, 10) >= addDays(referenceDate, -42)
    ),
    productFeedback: state.appFeedback.map((feedback) => ({
      id: feedback.id,
      message: feedback.message,
      technical: feedback.technical,
      createdAt: feedback.createdAt
    }))
  };
}

export function buildClaudeContextJson(state: AppState): string {
  return `${JSON.stringify(buildClaudeContext(state), null, 2)}\n`;
}

export function buildClaudeContextMarkdown(state: AppState, referenceDate = todayKey()): string {
  const context = buildClaudeContext(state, referenceDate);
  const lines: string[] = [
    '# Contexte Trail Coach',
    '',
    `Export : ${context.exportedAt}`,
    ''
  ];

  if (context.athlete) {
    lines.push(
      '## Athlète',
      '',
      `- Nom : ${context.athlete.displayName}`,
      `- Volume de référence : ${context.athlete.weeklyRunningDistanceKm} km/semaine`,
      `- Allure facile de référence : ${formatPace(context.athlete.easyPaceSecPerKm)}`,
      ''
    );
  }

  if (context.goal) {
    lines.push(
      '## Objectif',
      '',
      `- Type : ${context.goal.kind === 'race' ? 'course' : 'progression générale'}`,
      `- Nom : ${context.goal.name}`,
      ...(context.goal.targetDate ? [`- Date : ${context.goal.targetDate}`] : []),
      ...(context.goal.distanceKm ? [`- Distance : ${context.goal.distanceKm} km`] : []),
      ...(typeof context.goal.elevationGainM === 'number'
        ? [`- Dénivelé positif : ${context.goal.elevationGainM} m`]
        : []),
      ''
    );
  }

  if (context.plan) {
    lines.push(
      '## Plan',
      '',
      `Plan ${context.plan.id}, version ${context.plan.version}, moteur ${context.plan.algorithmVersion}.`,
      ''
    );
    if (context.plan.recentWorkouts.length > 0) {
      lines.push('### Séances récentes du plan', '');
      for (const workout of context.plan.recentWorkouts) {
        lines.push(
          `- ${workout.date} — ${workout.title} : prévu ${workout.plannedDistanceKm} km, ${workout.plannedDurationMin} min, ${workout.plannedElevationGainM} m D+ ; statut ${workout.status}.`
        );
      }
      lines.push('');
    }
    lines.push('### Plan à venir', '');
    for (const workout of context.plan.nextWorkouts) {
      lines.push(
        `### ${workout.date} — ${workout.title}`,
        '',
        `- Type : ${workout.type}`,
        `- Prévu : ${workout.plannedDistanceKm} km · ${workout.plannedDurationMin} min · ${workout.plannedElevationGainM} m D+`,
        `- Statut : ${workout.status}`,
        `- Justification : ${workout.rationale}`,
        ''
      );
    }
  }

  lines.push('## Activités récentes', '');
  if (context.recentActivities.length === 0) {
    lines.push('Aucune activité récente.', '');
  } else {
    for (const activity of context.recentActivities) {
      lines.push(
        `- ${activity.startedAt.slice(0, 10)} — ${activity.name} : ${(activity.distanceM / 1_000).toFixed(1)} km, ${Math.round(activity.durationSec / 60)} min, ${activity.elevationGainM} m D+, ${formatPace(activity.averagePaceSecPerKm)}.`
      );
    }
    lines.push('');
  }

  lines.push('## Ressenti après séance', '');
  if (context.sessionFeedback.length === 0) {
    lines.push('Aucun ressenti enregistré.', '');
  } else {
    for (const feedback of context.sessionFeedback) {
      lines.push(`- ${feedback.createdAt.slice(0, 10)} — effort ${feedback.effort}/5 : ${feedback.comment || 'sans commentaire'}`);
    }
    lines.push('');
  }

  lines.push(
    '## Consigne pour Claude',
    '',
    'Analyser les données, puis produire uniquement un fichier conforme à `plan-update.schema.json`. Ne modifier que les séances futures. Chaque modification doit contenir une raison précise. En cas de données insuffisantes, produire zéro opération et expliquer pourquoi dans `summary`.',
    ''
  );

  return `${lines.join('\n')}\n`;
}
