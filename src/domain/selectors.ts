import type { AppState, PlanWeek, PlannedWorkout, SessionFeedback } from './types';
import { addDays, startOfWeekMonday, todayKey } from './utils';

export function currentWeek(state: AppState, referenceDate = todayKey()): PlanWeek | null {
  if (!state.plan) {
    return null;
  }
  const start = startOfWeekMonday(referenceDate);
  return state.plan.weeks.find((week) => week.startDate === start) ?? null;
}

export function workoutsInWeek(state: AppState, week: PlanWeek | null): PlannedWorkout[] {
  if (!state.plan || !week) {
    return [];
  }
  return state.plan.workouts
    .filter((workout) => week.workoutIds.includes(workout.id))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function todayWorkout(state: AppState, referenceDate = todayKey()): PlannedWorkout | null {
  return state.plan?.workouts.find(
    (workout) => workout.date === referenceDate && workout.status === 'planned'
  ) ?? null;
}

export function upcomingWorkout(state: AppState, referenceDate = todayKey()): PlannedWorkout | null {
  return (
    state.plan?.workouts
      .filter((workout) => workout.date >= referenceDate && workout.status === 'planned')
      .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  );
}

export function feedbackForWorkout(state: AppState, workoutId: string): SessionFeedback | null {
  return state.sessionFeedback.find((feedback) => feedback.workoutId === workoutId) ?? null;
}

export function workoutById(state: AppState, workoutId: string): PlannedWorkout | null {
  return state.plan?.workouts.find((workout) => workout.id === workoutId) ?? null;
}

export function weekProgress(state: AppState, week: PlanWeek | null): {
  completed: number;
  total: number;
  completedDistanceKm: number;
  plannedDistanceKm: number;
} {
  const workouts = workoutsInWeek(state, week);
  const activeWorkouts = workouts.filter((workout) => workout.status !== 'skipped');
  const completed = workouts.filter((workout) => workout.status === 'completed');
  const completedActivityIds = new Set(completed.map((workout) => workout.linkedActivityId).filter(Boolean));
  const completedDistanceKm = state.activities
    .filter((activity) => completedActivityIds.has(activity.id))
    .reduce((sum, activity) => sum + activity.distanceM / 1_000, 0);
  return {
    completed: completed.length,
    total: workouts.length,
    completedDistanceKm,
    plannedDistanceKm: activeWorkouts.reduce((sum, workout) => sum + workout.plannedDistanceKm, 0)
  };
}

export function recentActivities(state: AppState, days = 42, referenceDate = todayKey()) {
  const from = addDays(referenceDate, -days);
  return state.activities
    .filter((activity) => activity.startedAt.slice(0, 10) >= from)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}
