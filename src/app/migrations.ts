import { PLAN_ALGORITHM_VERSION } from '../domain/planEngine';
import type { AppState, PlannedWorkout, WorkoutSegment } from '../domain/types';

const HOME_STRENGTH_DESCRIPTION =
  'Circuit à domicile, sans matériel, pour les jambes, les chevilles et le tronc.';

export function migrateStoredState(state: AppState): AppState {
  const settings = {
    ...state.settings,
    trailRegion: state.settings.trailRegion ?? 'lausanne' as const
  };

  if (!state.plan || state.plan.algorithmVersion === PLAN_ALGORITHM_VERSION) {
    return state.settings.trailRegion ? state : { ...state, settings };
  }

  const workouts = state.plan.workouts.map((workout) =>
    workout.type === 'strength' && workout.source === 'rules'
      ? migrateStrengthWorkout(workout)
      : workout
  );

  return {
    ...state,
    settings,
    plan: {
      ...state.plan,
      version: state.plan.version + 1,
      algorithmVersion: PLAN_ALGORITHM_VERSION,
      workouts
    }
  };
}

function migrateStrengthWorkout(workout: PlannedWorkout): PlannedWorkout {
  const segmentId = (index: number, suffix: string) =>
    workout.segments[index]?.id ?? `${workout.id}_${suffix}`;
  const segments: WorkoutSegment[] = [
    {
      id: segmentId(0, 'activation'),
      label: 'Activation',
      durationMin: 5,
      instructions: 'Mobilité des chevilles et des hanches, puis équilibre sur une jambe.'
    },
    {
      id: segmentId(1, 'circuit'),
      label: 'Circuit jambes et tronc',
      repetitions: 3,
      durationMin: 8,
      instructions:
        'Squats, fentes arrière, pont fessier, mollets et gainage. Tout se fait au poids du corps, à domicile, sans série à l’échec.'
    },
    {
      id: segmentId(2, 'cooldown'),
      label: 'Retour au calme',
      durationMin: 5,
      instructions: 'Respiration calme et mobilité légère, sans étirement forcé.'
    }
  ];

  return {
    ...workout,
    description: HOME_STRENGTH_DESCRIPTION,
    segments
  };
}
