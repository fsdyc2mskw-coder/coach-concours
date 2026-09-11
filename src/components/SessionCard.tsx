import { navigate, sessionPath } from '../app/router';
import type { PlannedWorkout, WorkoutType } from '../domain/types';
import { formatDateShort, formatDuration, formatPace } from '../domain/utils';

const labels: Record<WorkoutType, string> = {
  easy: 'Endurance',
  threshold: 'Seuil',
  intervals: 'Intervalles',
  hills: 'Côtes',
  long_run: 'Sortie longue',
  hike_run: 'Randonnée-course',
  strength: 'Renforcement',
  active_recovery: 'Récupération',
  rest: 'Repos'
};

export function SessionCard({ workout }: { workout: PlannedWorkout }) {
  return (
    <button
      type="button"
      className={`session-card session-card--${workout.status}`}
      onClick={() => navigate(sessionPath(workout.id))}
      data-feature-id={`workout-${workout.type}`}
    >
      <div className="session-card__date">
        <span>{formatDateShort(workout.date)}</span>
        <strong>{labels[workout.type]}</strong>
      </div>
      <div className="session-card__body">
        <div className="session-card__title-row">
          <h3>{workout.title}</h3>
          <span className={`status-dot status-dot--${workout.status}`} aria-label={workout.status} />
        </div>
        <p>{workout.description}</p>
        <div className="session-card__metrics">
          <span>{formatDuration(workout.plannedDurationMin)}</span>
          {workout.plannedDistanceKm > 0 ? <span>{workout.plannedDistanceKm.toFixed(1)} km</span> : null}
          {workout.plannedElevationGainM > 0 ? <span>{workout.plannedElevationGainM} m D+</span> : null}
          {workout.target ? <span>{formatPace(workout.target.minSecPerKm)}–{formatPace(workout.target.maxSecPerKm)}</span> : null}
        </div>
      </div>
      <span className="session-card__arrow" aria-hidden="true">›</span>
    </button>
  );
}
