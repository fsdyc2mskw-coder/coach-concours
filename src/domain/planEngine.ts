import type {
  Activity,
  AthleteProfile,
  PaceTarget,
  PlanWeek,
  PlannedWorkout,
  TrainingGoal,
  TrainingHistorySummary,
  TrainingPlan,
  WorkoutSegment,
  WorkoutType
} from './types';
import {
  addDays,
  clamp,
  createId,
  daysBetween,
  parseDateKey,
  round,
  startOfWeekMonday,
  toDateKey,
  todayKey
} from './utils';

export const PLAN_ALGORITHM_VERSION = 'rules-0.3.1';

export interface GeneratePlanInput {
  profile: AthleteProfile;
  goal: TrainingGoal;
  activities?: Activity[];
  startDate?: string;
  now?: string;
}

interface WeekTargets {
  distanceKm: number;
  elevationGainM: number;
  phase: PlanWeek['phase'];
}

export function summarizeHistory(
  activities: Activity[],
  fallbackProfile: AthleteProfile,
  referenceDate = todayKey()
): TrainingHistorySummary {
  const normalizedReferenceDate = normalizeDateKey(referenceDate, 'date de référence');
  const start = parseDateKey(normalizedReferenceDate);
  start.setDate(start.getDate() - 28);
  const windowStart = start.getTime();
  const recentRuns = activities.filter((activity) => {
    const time = new Date(activity.startedAt).getTime();
    return Number.isFinite(time) && time >= windowStart && activity.distanceM > 0;
  });

  if (recentRuns.length === 0) {
    return {
      weeksObserved: 0,
      averageWeeklyDistanceKm: fallbackProfile.weeklyRunningDistanceKm,
      averageWeeklyElevationGainM: 0,
      averageEasyPaceSecPerKm: fallbackProfile.easyPaceSecPerKm,
      completedRuns: 0
    };
  }

  const totalDistanceKm = recentRuns.reduce((sum, run) => sum + run.distanceM / 1_000, 0);
  const totalElevationM = recentRuns.reduce((sum, run) => sum + run.elevationGainM, 0);
  const paces = recentRuns
    .map((run) => run.averagePaceSecPerKm)
    .filter((pace) => pace > 180 && pace < 900)
    .sort((a, b) => a - b);
  const medianPace = paces[Math.floor(paces.length / 2)] ?? fallbackProfile.easyPaceSecPerKm;

  return {
    weeksObserved: 4,
    averageWeeklyDistanceKm: round(totalDistanceKm / 4, 1),
    averageWeeklyElevationGainM: Math.round(totalElevationM / 4),
    averageEasyPaceSecPerKm: Math.round(medianPace),
    completedRuns: recentRuns.length
  };
}

export function generateTrainingPlan(input: GeneratePlanInput): TrainingPlan {
  const referenceDate = normalizeDateKey(input.now ?? todayKey(), 'date de référence');
  const requestedStartDate = normalizeDateKey(
    input.startDate ?? referenceDate,
    'date de début'
  );
  const generatedAt = toGeneratedAt(input.now);
  const firstWeekStart = startOfWeekMonday(requestedStartDate);
  const history = summarizeHistory(input.activities ?? [], input.profile, referenceDate);
  const weekCount = determineWeekCount(firstWeekStart, requestedStartDate, input.goal);
  const planId = createId('plan');
  const weeks: PlanWeek[] = [];
  const workouts: PlannedWorkout[] = [];

  for (let index = 0; index < weekCount; index += 1) {
    const weekStart = addDays(firstWeekStart, index * 7);
    const targets = calculateWeekTargets(index, weekCount, input.goal, history);
    const generatedWeekWorkouts = createWeekWorkouts({
      planId,
      weekIndex: index,
      weekStart,
      targets,
      easyPaceSecPerKm: history.averageEasyPaceSecPerKm,
      generatedAt
    });
    const weekWorkouts = index === 0
      ? generatedWeekWorkouts.filter((workout) => workout.date >= requestedStartDate)
      : generatedWeekWorkouts;

    workouts.push(...weekWorkouts);
    const plannedDistanceKm = round(
      weekWorkouts.reduce((sum, workout) => sum + workout.plannedDistanceKm, 0),
      1
    );
    const plannedElevationGainM = Math.round(
      weekWorkouts.reduce((sum, workout) => sum + workout.plannedElevationGainM, 0)
    );
    weeks.push({
      id: createId('week'),
      index,
      startDate: weekStart,
      phase: targets.phase,
      targetDistanceKm: plannedDistanceKm,
      targetElevationGainM: plannedElevationGainM,
      workoutIds: weekWorkouts.map((workout) => workout.id)
    });
  }

  let goalWorkoutId: string | undefined;
  if (input.goal.kind === 'race' && input.goal.targetDate) {
    goalWorkoutId = injectRaceWorkout({
      goal: input.goal,
      planId,
      generatedAt,
      weeks,
      workouts,
      easyPaceSecPerKm: history.averageEasyPaceSecPerKm
    });
  }

  const calendarEndDate = weeks.at(-1)
    ? addDays(weeks.at(-1)!.startDate, 6)
    : requestedStartDate;
  const endDate = input.goal.kind === 'race' && input.goal.targetDate
    ? normalizeDateKey(input.goal.targetDate, 'date de course')
    : calendarEndDate;

  return {
    id: planId,
    version: 1,
    algorithmVersion: PLAN_ALGORITHM_VERSION,
    goalId: input.goal.id,
    ...(goalWorkoutId ? { goalWorkoutId } : {}),
    generatedAt,
    startDate: requestedStartDate,
    endDate,
    weeks,
    workouts: workouts.sort((a, b) => a.date.localeCompare(b.date)),
    lastAdaptationSummary: 'Plan initial généré par le moteur de règles.'
  };
}

function determineWeekCount(
  firstWeekStart: string,
  requestedStartDate: string,
  goal: TrainingGoal
): number {
  if (goal.kind === 'race' && goal.targetDate) {
    const targetDate = normalizeDateKey(goal.targetDate, 'date de course');
    if (targetDate < requestedStartDate) {
      throw new Error('La date de course ne peut pas précéder le début du plan.');
    }
    const days = Math.max(1, daysBetween(firstWeekStart, targetDate) + 1);
    const weekCount = Math.ceil(days / 7);
    if (weekCount > 24) {
      throw new Error('La course doit se situer dans les 24 prochaines semaines.');
    }
    return clamp(weekCount, 1, 24);
  }
  return 8;
}

function calculateWeekTargets(
  weekIndex: number,
  weekCount: number,
  goal: TrainingGoal,
  history: TrainingHistorySummary
): WeekTargets {
  const progress = weekCount <= 1 ? 1 : weekIndex / (weekCount - 1);
  const phase = determinePhase(progress, weekIndex, weekCount);
  const baselineDistance = clamp(history.averageWeeklyDistanceKm, 12, 55);
  const raceDistance = clamp(goal.distanceKm ?? 20, 5, 30);
  const peakDistance = clamp(Math.max(baselineDistance * 1.25, raceDistance * 1.35), 18, 65);

  let distanceKm = baselineDistance + (peakDistance - baselineDistance) * Math.min(progress / 0.8, 1);
  if ((weekIndex + 1) % 4 === 0 && phase !== 'taper') {
    distanceKm *= 0.82;
  }
  if (phase === 'taper') {
    const weeksRemaining = weekCount - weekIndex;
    distanceKm *= weeksRemaining <= 1 ? 0.48 : 0.7;
  }

  const goalElevation = Math.max(0, goal.elevationGainM ?? 800);
  const baselineElevation =
    history.averageWeeklyElevationGainM > 0
      ? history.averageWeeklyElevationGainM
      : Math.min(goalElevation * 0.35, 500);
  const peakElevation = clamp(Math.max(baselineElevation * 1.3, goalElevation * 1.05), 200, 3_000);
  let elevationGainM = baselineElevation + (peakElevation - baselineElevation) * Math.min(progress / 0.8, 1);
  if ((weekIndex + 1) % 4 === 0 && phase !== 'taper') {
    elevationGainM *= 0.82;
  }
  if (phase === 'taper') {
    const weeksRemaining = weekCount - weekIndex;
    elevationGainM *= weeksRemaining <= 1 ? 0.4 : 0.65;
  }

  return {
    phase,
    distanceKm: round(distanceKm, 1),
    elevationGainM: Math.round(elevationGainM / 10) * 10
  };
}

function determinePhase(progress: number, weekIndex: number, weekCount: number): PlanWeek['phase'] {
  const weeksRemaining = weekCount - weekIndex;
  if (weeksRemaining <= 2) {
    return 'taper';
  }
  if (progress < 0.35) {
    return 'base';
  }
  if (progress < 0.75) {
    return 'build';
  }
  return 'peak';
}

interface CreateWeekWorkoutsInput {
  planId: string;
  weekIndex: number;
  weekStart: string;
  targets: WeekTargets;
  easyPaceSecPerKm: number;
  generatedAt: string;
}

function createWeekWorkouts(input: CreateWeekWorkoutsInput): PlannedWorkout[] {
  const qualityType = chooseQualityType(input.weekIndex, input.targets.phase);
  const supportType = chooseSupportType(input.weekIndex, input.targets.phase);
  const distance = input.targets.distanceKm;
  const elevation = input.targets.elevationGainM;

  const allocations = input.targets.phase === 'taper'
    ? { quality: 0.18, easy: 0.22, support: 0.14, long: 0.46 }
    : { quality: 0.2, easy: 0.2, support: 0.18, long: 0.42 };

  const quality = makeWorkout({
    planId: input.planId,
    date: addDays(input.weekStart, 1),
    type: qualityType,
    distanceKm: distance * allocations.quality,
    elevationM: elevation * 0.25,
    easyPaceSecPerKm: input.easyPaceSecPerKm,
    generatedAt: input.generatedAt,
    weekIndex: input.weekIndex
  });

  const strength = makeWorkout({
    planId: input.planId,
    date: addDays(input.weekStart, 2),
    type: 'strength',
    distanceKm: 0,
    elevationM: 0,
    easyPaceSecPerKm: input.easyPaceSecPerKm,
    generatedAt: input.generatedAt,
    weekIndex: input.weekIndex
  });

  const easy = makeWorkout({
    planId: input.planId,
    date: addDays(input.weekStart, 3),
    type: 'easy',
    distanceKm: distance * allocations.easy,
    elevationM: elevation * 0.12,
    easyPaceSecPerKm: input.easyPaceSecPerKm,
    generatedAt: input.generatedAt,
    weekIndex: input.weekIndex
  });

  const support = makeWorkout({
    planId: input.planId,
    date: addDays(input.weekStart, 5),
    type: supportType,
    distanceKm: distance * allocations.support,
    elevationM: elevation * 0.18,
    easyPaceSecPerKm: input.easyPaceSecPerKm,
    generatedAt: input.generatedAt,
    weekIndex: input.weekIndex
  });

  const longType: WorkoutType = input.weekIndex % 3 === 2 ? 'hike_run' : 'long_run';
  const long = makeWorkout({
    planId: input.planId,
    date: addDays(input.weekStart, 6),
    type: longType,
    distanceKm: distance * allocations.long,
    elevationM: elevation * 0.45,
    easyPaceSecPerKm: input.easyPaceSecPerKm,
    generatedAt: input.generatedAt,
    weekIndex: input.weekIndex
  });

  return [quality, strength, easy, support, long];
}

function chooseQualityType(weekIndex: number, phase: PlanWeek['phase']): WorkoutType {
  if (phase === 'base') {
    return weekIndex % 2 === 0 ? 'hills' : 'threshold';
  }
  if (phase === 'taper') {
    return 'threshold';
  }
  return weekIndex % 2 === 0 ? 'intervals' : 'hills';
}

function chooseSupportType(weekIndex: number, phase: PlanWeek['phase']): WorkoutType {
  if (phase === 'taper') {
    return 'active_recovery';
  }
  if (phase === 'base') {
    return weekIndex % 2 === 0 ? 'active_recovery' : 'easy';
  }
  return weekIndex % 3 === 0 ? 'threshold' : 'easy';
}

interface MakeWorkoutInput {
  planId: string;
  date: string;
  type: WorkoutType;
  distanceKm: number;
  elevationM: number;
  easyPaceSecPerKm: number;
  generatedAt: string;
  weekIndex: number;
}

function makeWorkout(input: MakeWorkoutInput): PlannedWorkout {
  const distanceKm = input.type === 'strength' ? 0 : Math.max(1.5, round(input.distanceKm, 1));
  const target = input.type === 'strength' || input.type === 'rest'
    ? undefined
    : paceTargetFor(input.type, input.easyPaceSecPerKm);
  const durationMin = durationFor(input.type, distanceKm, input.easyPaceSecPerKm, input.weekIndex);
  const copy = workoutCopy(input.type, input.weekIndex);
  const id = createId('workout');

  const workout: PlannedWorkout = {
    id,
    planId: input.planId,
    date: input.date,
    type: input.type,
    title: copy.title,
    description: copy.description,
    rationale: copy.rationale,
    plannedDurationMin: durationMin,
    plannedDistanceKm: distanceKm,
    plannedElevationGainM: Math.max(0, Math.round(input.elevationM / 10) * 10),
    segments: segmentsFor(input.type, target, durationMin, distanceKm, input.weekIndex),
    status: 'planned',
    source: 'rules',
    createdAt: input.generatedAt,
    updatedAt: input.generatedAt
  };

  if (target) {
    workout.target = target;
  }
  return workout;
}

function paceTargetFor(type: WorkoutType, easyPace: number): PaceTarget {
  const factors: Record<Exclude<WorkoutType, 'strength' | 'rest'>, [number, number, 1 | 2 | 3 | 4 | 5]> = {
    easy: [0.97, 1.08, 2],
    threshold: [0.82, 0.9, 4],
    intervals: [0.74, 0.82, 5],
    hills: [0.92, 1.12, 4],
    long_run: [1, 1.13, 2],
    hike_run: [1.12, 1.55, 3],
    active_recovery: [1.08, 1.22, 1]
  };
  const [fastFactor, slowFactor, rpeFallback] = factors[type as Exclude<WorkoutType, 'strength' | 'rest'>];
  const target: PaceTarget = {
    mode: 'pace',
    minSecPerKm: Math.round(easyPace * fastFactor),
    maxSecPerKm: Math.round(easyPace * slowFactor),
    rpeFallback
  };
  if (type === 'hills' || type === 'hike_run' || type === 'long_run') {
    target.terrainNote = "L'allure est une référence sur terrain courant. En montée ou sur terrain technique, respecter surtout l'effort indiqué.";
  }
  return target;
}

function durationFor(type: WorkoutType, distanceKm: number, easyPace: number, weekIndex: number): number {
  if (type === 'strength') {
    return 30 + Math.min(15, weekIndex * 2);
  }
  const paceFactor: Record<Exclude<WorkoutType, 'strength' | 'rest'>, number> = {
    easy: 1,
    threshold: 0.96,
    intervals: 1.04,
    hills: 1.12,
    long_run: 1.08,
    hike_run: 1.3,
    active_recovery: 1.1
  };
  if (type === 'rest') {
    return 0;
  }
  return Math.max(20, Math.round((distanceKm * easyPace * paceFactor[type]) / 60));
}

function segmentsFor(
  type: WorkoutType,
  target: PaceTarget | undefined,
  durationMin: number,
  distanceKm: number,
  weekIndex: number
): WorkoutSegment[] {
  const segment = (label: string, overrides: Partial<WorkoutSegment> = {}): WorkoutSegment => ({
    id: createId('segment'),
    label,
    ...overrides
  });

  switch (type) {
    case 'intervals': {
      const repetitions = clamp(5 + Math.floor(weekIndex / 3), 5, 8);
      return [
        segment('Échauffement', { durationMin: 15, instructions: 'Course facile puis 3 accélérations progressives.' }),
        segment(`${repetitions} répétitions`, {
          repetitions,
          durationMin: 3,
          paceTarget: target,
          instructions: 'Récupération trottée de 2 min entre les répétitions.'
        }),
        segment('Retour au calme', { durationMin: 10 })
      ];
    }
    case 'threshold':
      return [
        segment('Échauffement', { durationMin: 15 }),
        segment('Bloc au seuil', {
          repetitions: 3,
          durationMin: 8,
          paceTarget: target,
          instructions: 'Récupération de 3 min en course facile.'
        }),
        segment('Retour au calme', { durationMin: 10 })
      ];
    case 'hills':
      return [
        segment('Échauffement', { durationMin: 15 }),
        segment('Répétitions en côte', {
          repetitions: clamp(6 + Math.floor(weekIndex / 2), 6, 10),
          durationMin: 2,
          paceTarget: target,
          instructions: "Monter avec une technique propre. Redescendre en récupération complète. L'effort prime sur l'allure."
        }),
        segment('Retour au calme', { durationMin: 10 })
      ];
    case 'strength':
      return [
        segment('Activation', {
          durationMin: 5,
          instructions: 'Mobilité des chevilles et des hanches, puis équilibre sur une jambe.'
        }),
        segment('Circuit jambes et tronc', {
          repetitions: 3,
          durationMin: 8,
          instructions: 'Squats, fentes arrière, pont fessier, mollets et gainage. Tout se fait au poids du corps, à domicile, sans série à l’échec.'
        }),
        segment('Retour au calme', {
          durationMin: 5,
          instructions: 'Respiration calme et mobilité légère, sans étirement forcé.'
        })
      ];
    case 'hike_run':
      return [
        segment('Sortie randonnée-course', {
          durationMin,
          distanceKm,
          paceTarget: target,
          instructions: 'Marcher activement dans les montées raides et courir relâché sur le reste.'
        })
      ];
    case 'long_run':
      return [
        segment('Sortie longue trail', {
          durationMin,
          distanceKm,
          paceTarget: target,
          instructions: 'Conserver une intensité facile et régulière. Ne pas accélérer pour compenser le relief.'
        })
      ];
    case 'active_recovery':
      return [
        segment('Récupération active', {
          durationMin,
          distanceKm,
          paceTarget: target,
          instructions: 'Allure très facile, sans objectif de vitesse.'
        })
      ];
    case 'easy':
      return [segment('Endurance facile', { durationMin, distanceKm, paceTarget: target })];
    case 'rest':
      return [segment('Repos')];
  }
}

function workoutCopy(type: WorkoutType, weekIndex: number): Pick<PlannedWorkout, 'title' | 'description' | 'rationale'> {
  const map: Record<WorkoutType, Pick<PlannedWorkout, 'title' | 'description' | 'rationale'>> = {
    easy: {
      title: 'Endurance facile',
      description: 'Course régulière sur terrain confortable.',
      rationale: 'Développer le volume aérobie sans ajouter une fatigue élevée.'
    },
    threshold: {
      title: 'Seuil contrôlé',
      description: 'Blocs soutenus mais réguliers, sans finir à intensité maximale.',
      rationale: 'Améliorer la capacité à maintenir une allure soutenue.'
    },
    intervals: {
      title: 'Intervalles',
      description: 'Répétitions rapides séparées par une récupération trottée.',
      rationale: 'Développer la vitesse aérobie en conservant une structure mesurable.'
    },
    hills: {
      title: 'Côtes',
      description: 'Répétitions en montée avec récupération en descente.',
      rationale: 'Développer la force spécifique et l’économie de course en montée.'
    },
    long_run: {
      title: 'Sortie longue trail',
      description: 'Sortie facile avec du dénivelé et une durée progressive.',
      rationale: 'Construire l’endurance spécifique nécessaire au trail court.'
    },
    hike_run: {
      title: 'Randonnée-course',
      description: 'Alternance de course et de marche active selon la pente.',
      rationale: 'Apprendre à gérer les montées raides tout en accumulant du temps d’effort.'
    },
    strength: {
      title: 'Renforcement',
      description: 'Circuit à domicile, sans matériel, pour les jambes, les chevilles et le tronc.',
      rationale: 'Renforcer les structures utiles à la stabilité et aux variations de terrain.'
    },
    active_recovery: {
      title: 'Récupération active',
      description: 'Course très facile et courte.',
      rationale: 'Maintenir le mouvement sans compromettre les séances importantes.'
    },
    rest: {
      title: 'Repos',
      description: 'Aucune séance planifiée.',
      rationale: 'Laisser la fatigue diminuer.'
    }
  };
  const copy = map[type];
  if (weekIndex === 0 && type === 'easy') {
    return { ...copy, description: `${copy.description} Première semaine volontairement conservatrice.` };
  }
  return copy;
}

interface InjectRaceWorkoutInput {
  goal: TrainingGoal;
  planId: string;
  generatedAt: string;
  weeks: PlanWeek[];
  workouts: PlannedWorkout[];
  easyPaceSecPerKm: number;
}

function injectRaceWorkout(input: InjectRaceWorkoutInput): string | undefined {
  const targetDate = input.goal.targetDate;
  if (!targetDate || !input.goal.distanceKm) {
    return undefined;
  }
  const raceWeekStart = startOfWeekMonday(targetDate);
  const raceWeek = input.weeks.find((week) => week.startDate === raceWeekStart);
  if (!raceWeek) {
    return undefined;
  }

  // Keep only sessions strictly before the goal event in race week. This avoids
  // duplicate sessions on race day and workouts scheduled after the race.
  const removedIds = new Set(
    input.workouts
      .filter((workout) => raceWeek.workoutIds.includes(workout.id) && workout.date >= targetDate)
      .map((workout) => workout.id)
  );
  if (removedIds.size > 0) {
    const retained = input.workouts.filter((workout) => !removedIds.has(workout.id));
    input.workouts.splice(0, input.workouts.length, ...retained);
    raceWeek.workoutIds = raceWeek.workoutIds.filter((id) => !removedIds.has(id));
  }

  const target = paceTargetFor('long_run', input.easyPaceSecPerKm);
  const race: PlannedWorkout = {
    id: createId('workout'),
    planId: input.planId,
    date: targetDate,
    type: 'long_run',
    title: input.goal.name || 'Trail objectif',
    description: `${round(input.goal.distanceKm, 1)} km · ${Math.round(input.goal.elevationGainM ?? 0)} m D+`,
    rationale: 'Séance objectif du plan.',
    plannedDurationMin: Math.max(30, Math.round((input.goal.distanceKm * input.easyPaceSecPerKm * 1.12) / 60)),
    plannedDistanceKm: round(input.goal.distanceKm, 1),
    plannedElevationGainM: Math.round(input.goal.elevationGainM ?? 0),
    target,
    segments: [
      {
        id: createId('segment'),
        label: 'Course objectif',
        distanceKm: round(input.goal.distanceKm, 1),
        paceTarget: target,
        instructions: 'Gérer l’effort selon le profil réel du parcours. Le rythme moyen n’est pas une contrainte sur les sections techniques.'
      }
    ],
    status: 'planned',
    source: 'rules',
    createdAt: input.generatedAt,
    updatedAt: input.generatedAt
  };

  input.workouts.push(race);
  raceWeek.workoutIds.push(race.id);
  raceWeek.targetDistanceKm = round(
    input.workouts
      .filter((workout) => raceWeek.workoutIds.includes(workout.id))
      .reduce((sum, workout) => sum + workout.plannedDistanceKm, 0),
    1
  );
  raceWeek.targetElevationGainM = Math.round(
    input.workouts
      .filter((workout) => raceWeek.workoutIds.includes(workout.id))
      .reduce((sum, workout) => sum + workout.plannedElevationGainM, 0)
  );
  return race.id;
}

export function nextWorkout(plan: TrainingPlan, fromDate = todayKey()): PlannedWorkout | null {
  return (
    plan.workouts
      .filter((workout) => workout.status === 'planned' && workout.date >= fromDate)
      .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  );
}

export function workoutsForWeek(plan: TrainingPlan, weekStart: string): PlannedWorkout[] {
  const week = plan.weeks.find((item) => item.startDate === weekStart);
  if (!week) {
    return [];
  }
  return plan.workouts
    .filter((workout) => week.workoutIds.includes(workout.id))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function moveWorkout(plan: TrainingPlan, workoutId: string, newDate: string): TrainingPlan {
  const selected = plan.workouts.find((workout) => workout.id === workoutId);
  if (!selected) {
    throw new Error('Séance introuvable.');
  }
  if (selected.status !== 'planned') {
    throw new Error('Seule une séance planifiée peut être déplacée.');
  }
  if (plan.goalWorkoutId === workoutId) {
    throw new Error('La course objectif ne peut pas être déplacée depuis le calendrier.');
  }
  const goalDate = plan.goalWorkoutId
    ? plan.workouts.find((workout) => workout.id === plan.goalWorkoutId)?.date
    : undefined;
  if (goalDate && newDate === goalDate) {
    throw new Error('Aucune autre séance ne peut être déplacée le jour de la course objectif.');
  }
  if (newDate < plan.startDate || newDate > plan.endDate) {
    throw new Error('La nouvelle date sort de la période du plan.');
  }
  if (newDate === selected.date) {
    return plan;
  }

  const targetWeekStart = startOfWeekMonday(newDate);
  if (!plan.weeks.some((week) => week.startDate === targetWeekStart)) {
    throw new Error('La nouvelle date ne correspond à aucune semaine du plan.');
  }

  const now = new Date().toISOString();
  const workouts = plan.workouts
    .map((workout) =>
      workout.id === workoutId ? { ...workout, date: newDate, updatedAt: now } : workout
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  const weeks = plan.weeks.map((week) => ({
    ...week,
    workoutIds: week.workoutIds.filter((id) => id !== workoutId)
  }));
  const targetWeek = weeks.find((week) => week.startDate === targetWeekStart)!;
  targetWeek.workoutIds.push(workoutId);
  recalculateWeekTargets(weeks, workouts);

  return {
    ...plan,
    version: plan.version + 1,
    workouts,
    weeks,
    lastAdaptationSummary: 'Séance déplacée manuellement.'
  };
}

/**
 * Marks a planned workout as completed and links the recorded activity.
 * The plan version changes even though the planned weekly volume does not:
 * any Claude update generated against the previous state must become stale.
 */
export function markWorkoutCompleted(
  plan: TrainingPlan,
  workoutId: string,
  activityId: string
): TrainingPlan {
  const selected = requirePlannedWorkout(plan, workoutId);
  const now = new Date().toISOString();
  const workouts = plan.workouts.map((workout) =>
    workout.id === selected.id
      ? {
          ...workout,
          status: 'completed' as const,
          linkedActivityId: activityId,
          updatedAt: now
        }
      : workout
  );

  return {
    ...plan,
    version: plan.version + 1,
    workouts,
    lastAdaptationSummary: 'Séance terminée et activité enregistrée.'
  };
}

/** Marks a planned workout as skipped and removes it from weekly targets. */
export function markWorkoutSkipped(plan: TrainingPlan, workoutId: string): TrainingPlan {
  const selected = requirePlannedWorkout(plan, workoutId);
  const now = new Date().toISOString();
  const workouts = plan.workouts.map((workout) =>
    workout.id === selected.id
      ? { ...workout, status: 'skipped' as const, updatedAt: now }
      : workout
  );
  const weeks = plan.weeks.map((week) => ({ ...week, workoutIds: [...week.workoutIds] }));
  recalculateWeekTargets(weeks, workouts);

  return {
    ...plan,
    version: plan.version + 1,
    workouts,
    weeks,
    lastAdaptationSummary: 'Séance annulée manuellement.'
  };
}

function requirePlannedWorkout(plan: TrainingPlan, workoutId: string): PlannedWorkout {
  const selected = plan.workouts.find((workout) => workout.id === workoutId);
  if (!selected) {
    throw new Error('Séance introuvable.');
  }
  if (selected.status !== 'planned') {
    throw new Error('Seule une séance planifiée peut être modifiée.');
  }
  return selected;
}

function recalculateWeekTargets(weeks: PlanWeek[], workouts: PlannedWorkout[]): void {
  for (const week of weeks) {
    const active = workouts.filter(
      (workout) => week.workoutIds.includes(workout.id) && workout.status !== 'skipped'
    );
    week.targetDistanceKm = round(
      active.reduce((sum, workout) => sum + workout.plannedDistanceKm, 0),
      1
    );
    week.targetElevationGainM = Math.round(
      active.reduce((sum, workout) => sum + workout.plannedElevationGainM, 0)
    );
  }
}

function normalizeDateKey(value: string, label: string): string {
  const dateKey = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw new Error(`La ${label} n’est pas valide.`);
  }
  const parsed = parseDateKey(dateKey);
  if (!Number.isFinite(parsed.getTime()) || toDateKey(parsed) !== dateKey) {
    throw new Error(`La ${label} n’est pas valide.`);
  }
  return dateKey;
}

function toGeneratedAt(now?: string): string {
  if (!now) {
    return new Date().toISOString();
  }
  const date = /^\d{4}-\d{2}-\d{2}$/.test(now)
    ? new Date(`${now}T12:00:00.000Z`)
    : new Date(now);
  if (!Number.isFinite(date.getTime())) {
    throw new Error('La date de référence n’est pas valide.');
  }
  return date.toISOString();
}

export function dateKeyFromIso(iso: string): string {
  return toDateKey(new Date(iso));
}
