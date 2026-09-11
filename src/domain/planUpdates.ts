import { z } from 'zod';
import type {
  PaceTarget,
  PlanUpdate,
  PlanUpdatePreview,
  PlannedWorkout,
  TrainingPlan,
  WorkoutSegment,
  WorkoutType
} from './types';
import { WORKOUT_TYPES } from './types';
import { createId, round, startOfWeekMonday, todayKey } from './utils';

const paceTargetSchema: z.ZodType<PaceTarget> = z.object({
  mode: z.literal('pace'),
  minSecPerKm: z.number().int().min(120).max(1_200),
  maxSecPerKm: z.number().int().min(120).max(1_200),
  rpeFallback: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  terrainNote: z.string().max(500).optional()
});

const segmentSchema: z.ZodType<WorkoutSegment> = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(160),
  durationMin: z.number().min(0).max(600).optional(),
  distanceKm: z.number().min(0).max(100).optional(),
  repetitions: z.number().int().min(1).max(100).optional(),
  paceTarget: paceTargetSchema.optional(),
  instructions: z.string().max(1_500).optional()
});

const replacementWorkoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(WORKOUT_TYPES),
  title: z.string().min(1).max(160),
  description: z.string().min(1).max(2_000),
  rationale: z.string().min(1).max(2_000),
  plannedDurationMin: z.number().min(0).max(720),
  plannedDistanceKm: z.number().min(0).max(100),
  plannedElevationGainM: z.number().min(0).max(10_000),
  target: paceTargetSchema.optional(),
  segments: z.array(segmentSchema).max(30),
  source: z.enum(['rules', 'claude'])
});

const operationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('move_workout'),
    workoutId: z.string().min(1),
    newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reason: z.string().min(1).max(2_000)
  }),
  z.object({
    type: z.literal('replace_workout'),
    workoutId: z.string().min(1),
    replacement: replacementWorkoutSchema,
    reason: z.string().min(1).max(2_000)
  }),
  z.object({
    type: z.literal('cancel_workout'),
    workoutId: z.string().min(1),
    reason: z.string().min(1).max(2_000)
  }),
  z.object({
    type: z.literal('add_workout'),
    workout: replacementWorkoutSchema,
    reason: z.string().min(1).max(2_000)
  })
]);

export const planUpdateSchema: z.ZodType<PlanUpdate> = z.object({
  schemaVersion: z.literal('1.0'),
  updateId: z.string().min(1),
  basePlanId: z.string().min(1),
  basePlanVersion: z.number().int().min(1),
  generatedAt: z.string().datetime(),
  summary: z.string().min(1).max(4_000),
  operations: z.array(operationSchema).max(30)
});

export function parsePlanUpdate(input: unknown): PlanUpdate {
  return planUpdateSchema.parse(input);
}

export function parsePlanUpdateText(text: string): PlanUpdate {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new Error("Le fichier d'adaptation n'est pas un JSON valide.");
  }
  return parsePlanUpdate(parsed);
}

export function previewPlanUpdate(
  plan: TrainingPlan,
  rawUpdate: unknown,
  referenceDate = todayKey()
): PlanUpdatePreview {
  const update = parsePlanUpdate(rawUpdate);
  if (update.basePlanId !== plan.id) {
    throw new Error("L'adaptation vise un autre plan.");
  }
  if (update.basePlanVersion !== plan.version) {
    throw new Error(
      `Version incompatible : l'adaptation vise la version ${update.basePlanVersion}, le plan local est en version ${plan.version}.`
    );
  }

  validateOperationTargets(plan, update, referenceDate);
  const resultingPlan = applyOperations(plan, update);
  const warnings = safetyWarnings(plan, resultingPlan, update);

  return {
    update,
    warnings,
    safeForAutomaticApplication: warnings.length === 0,
    resultingPlan
  };
}

export function applyPlanUpdate(plan: TrainingPlan, update: PlanUpdate): TrainingPlan {
  return previewPlanUpdate(plan, update).resultingPlan;
}


function validateOperationTargets(
  plan: TrainingPlan,
  update: PlanUpdate,
  referenceDate: string
): void {
  const targetedWorkoutIds = new Set<string>();
  for (const operation of update.operations) {
    if (operation.type === 'add_workout') {
      assertFutureDateInPlan(operation.workout.date, plan, referenceDate);
      assertDateIsNotGoalDay(operation.workout.date, plan);
      validateWorkoutPaceTargets(operation.workout, 'La séance ajoutée');
      continue;
    }

    if (targetedWorkoutIds.has(operation.workoutId)) {
      throw new Error(`Plusieurs opérations ciblent la même séance : ${operation.workoutId}.`);
    }
    targetedWorkoutIds.add(operation.workoutId);

    const current = plan.workouts.find((workout) => workout.id === operation.workoutId);
    if (!current) {
      throw new Error(`Séance introuvable dans le plan : ${operation.workoutId}.`);
    }
    if (plan.goalWorkoutId === operation.workoutId) {
      throw new Error('La course objectif ne peut pas être déplacée, remplacée ou annulée par une adaptation.');
    }
    if (current.status !== 'planned') {
      throw new Error(`La séance ${operation.workoutId} n'est plus planifiée et ne peut pas être adaptée.`);
    }
    if (current.date < referenceDate) {
      throw new Error(`La séance ${operation.workoutId} est passée et ne peut pas être adaptée.`);
    }

    if (operation.type === 'move_workout') {
      assertFutureDateInPlan(operation.newDate, plan, referenceDate);
      assertDateIsNotGoalDay(operation.newDate, plan);
      if (operation.newDate === current.date) {
        throw new Error(`Le déplacement de ${operation.workoutId} ne change pas sa date.`);
      }
    }
    if (operation.type === 'replace_workout') {
      assertFutureDateInPlan(operation.replacement.date, plan, referenceDate);
      assertDateIsNotGoalDay(operation.replacement.date, plan);
      validateWorkoutPaceTargets(
        operation.replacement,
        `La séance de remplacement pour ${operation.workoutId}`
      );
    }
  }
}

function assertDateIsNotGoalDay(date: string, plan: TrainingPlan): void {
  const goalDate = plan.goalWorkoutId
    ? plan.workouts.find((workout) => workout.id === plan.goalWorkoutId)?.date
    : undefined;
  if (goalDate && date === goalDate) {
    throw new Error('Aucune autre séance ne peut être placée le jour de la course objectif.');
  }
}

function validateWorkoutPaceTargets(
  workout: Pick<PlannedWorkout, 'target' | 'segments'>,
  label: string
): void {
  const targets: Array<{ name: string; value: PaceTarget }> = [];
  if (workout.target) {
    targets.push({ name: 'cible principale', value: workout.target });
  }
  workout.segments.forEach((segment, index) => {
    if (segment.paceTarget) {
      targets.push({
        name: `segment ${index + 1} (${segment.label})`,
        value: segment.paceTarget
      });
    }
  });

  for (const target of targets) {
    if (target.value.minSecPerKm > target.value.maxSecPerKm) {
      throw new Error(
        `${label} contient une plage d'allure inversée pour ${target.name} : ` +
          `${target.value.minSecPerKm} s/km à ${target.value.maxSecPerKm} s/km.`
      );
    }
  }
}

function assertFutureDateInPlan(
  date: string,
  plan: TrainingPlan,
  referenceDate: string
): void {
  if (date < referenceDate) {
    throw new Error(`La date ${date} est passée et ne peut pas être utilisée.`);
  }
  if (date < plan.startDate || date > plan.endDate) {
    throw new Error(`La date ${date} sort de la période du plan.`);
  }
}

function applyOperations(plan: TrainingPlan, update: PlanUpdate): TrainingPlan {
  if (update.operations.length === 0) {
    return plan;
  }

  const now = new Date().toISOString();
  let workouts = plan.workouts.map((workout) => ({ ...workout, segments: workout.segments.map((segment) => ({ ...segment })) }));

  for (const operation of update.operations) {
    if (operation.type === 'add_workout') {
      const newWorkout: PlannedWorkout = {
        ...operation.workout,
        segments: rekeySegments(operation.workout.segments),
        id: createId('workout'),
        planId: plan.id,
        status: 'planned',
        source: 'claude',
        createdAt: now,
        updatedAt: now
      };
      workouts.push(newWorkout);
      continue;
    }

    const index = workouts.findIndex((workout) => workout.id === operation.workoutId);
    if (index < 0) {
      throw new Error(`Séance introuvable dans le plan : ${operation.workoutId}.`);
    }
    const current = workouts[index]!;

    switch (operation.type) {
      case 'move_workout':
        workouts[index] = { ...current, date: operation.newDate, source: 'claude', updatedAt: now };
        break;
      case 'replace_workout':
        workouts[index] = {
          ...operation.replacement,
          segments: rekeySegments(operation.replacement.segments),
          id: current.id,
          planId: current.planId,
          status: current.status,
          source: 'claude',
          createdAt: current.createdAt,
          updatedAt: now,
          ...(current.linkedActivityId ? { linkedActivityId: current.linkedActivityId } : {})
        };
        break;
      case 'cancel_workout':
        workouts[index] = { ...current, status: 'skipped', source: 'claude', updatedAt: now };
        break;
    }
  }

  workouts = workouts.sort((a, b) => a.date.localeCompare(b.date));
  const weeks = plan.weeks.map((week) => ({ ...week, workoutIds: [] as string[] }));

  for (const workout of workouts) {
    const weekStart = startOfWeekMonday(workout.date);
    const week = weeks.find((item) => item.startDate === weekStart);
    if (!week) {
      throw new Error(`La séance du ${workout.date} sort de la période du plan.`);
    }
    week.workoutIds.push(workout.id);
  }

  for (const week of weeks) {
    const active = workouts.filter((workout) => week.workoutIds.includes(workout.id) && workout.status !== 'skipped');
    week.targetDistanceKm = round(active.reduce((sum, workout) => sum + workout.plannedDistanceKm, 0), 1);
    week.targetElevationGainM = Math.round(active.reduce((sum, workout) => sum + workout.plannedElevationGainM, 0));
  }

  return {
    ...plan,
    version: plan.version + 1,
    workouts,
    weeks,
    lastAdaptationSummary: update.summary
  };
}

function rekeySegments(segments: WorkoutSegment[]): WorkoutSegment[] {
  return segments.map((segment) => ({ ...segment, id: createId('segment') }));
}

function safetyWarnings(
  before: TrainingPlan,
  after: TrainingPlan,
  update: PlanUpdate
): string[] {
  const warnings: string[] = [];
  if (update.operations.length > 10) {
    warnings.push('Plus de 10 modifications sont proposées en une seule adaptation.');
  }

  for (const week of after.weeks) {
    const beforeWeek = before.weeks.find((candidate) => candidate.startDate === week.startDate);
    if (beforeWeek && beforeWeek.targetDistanceKm > 0) {
      const increase = (week.targetDistanceKm - beforeWeek.targetDistanceKm) / beforeWeek.targetDistanceKm;
      if (increase > 0.15) {
        warnings.push(
          `La semaine du ${week.startDate} augmente la distance de ${Math.round(increase * 100)} %.`
        );
      }
    }
    if (beforeWeek && beforeWeek.targetElevationGainM > 0) {
      const elevationIncrease =
        (week.targetElevationGainM - beforeWeek.targetElevationGainM) /
        beforeWeek.targetElevationGainM;
      if (elevationIncrease > 0.2) {
        warnings.push(
          `La semaine du ${week.startDate} augmente le dénivelé positif de ${Math.round(elevationIncrease * 100)} %.`
        );
      }
    }

    const weekWorkouts = after.workouts.filter(
      (workout) => week.workoutIds.includes(workout.id) && workout.status !== 'skipped'
    );
    const beforeWorkouts = beforeWeek
      ? before.workouts.filter(
          (workout) => beforeWeek.workoutIds.includes(workout.id) && workout.status !== 'skipped'
        )
      : [];
    const qualityCount = weekWorkouts.filter((workout) => isQualityWorkout(workout.type)).length;
    const beforeQualityCount = beforeWorkouts.filter((workout) => isQualityWorkout(workout.type)).length;
    if (qualityCount > 2 && qualityCount > beforeQualityCount) {
      warnings.push(`La semaine du ${week.startDate} contient ${qualityCount} séances de qualité.`);
    }
    const totalDistance = weekWorkouts.reduce((sum, workout) => sum + workout.plannedDistanceKm, 0);
    const longDistance = Math.max(
      0,
      ...weekWorkouts
        .filter((workout) => workout.type === 'long_run' || workout.type === 'hike_run')
        .map((workout) => workout.plannedDistanceKm)
    );
    const beforeTotalDistance = beforeWorkouts.reduce(
      (sum, workout) => sum + workout.plannedDistanceKm,
      0
    );
    const beforeLongDistance = Math.max(
      0,
      ...beforeWorkouts
        .filter((workout) => workout.type === 'long_run' || workout.type === 'hike_run')
        .map((workout) => workout.plannedDistanceKm)
    );
    const longRatio = totalDistance > 0 ? longDistance / totalDistance : 0;
    const beforeLongRatio = beforeTotalDistance > 0 ? beforeLongDistance / beforeTotalDistance : 0;
    if (longRatio > 0.5 && longRatio > beforeLongRatio + 0.01) {
      warnings.push(`La sortie longue dépasse 50 % du volume de la semaine du ${week.startDate}.`);
    }
  }

  return [...new Set(warnings)];
}

function isQualityWorkout(type: WorkoutType): boolean {
  return type === 'threshold' || type === 'intervals' || type === 'hills';
}
