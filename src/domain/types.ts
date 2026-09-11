export const WORKOUT_TYPES = [
  'easy',
  'threshold',
  'intervals',
  'hills',
  'long_run',
  'hike_run',
  'strength',
  'active_recovery',
  'rest'
] as const;

export type WorkoutType = (typeof WORKOUT_TYPES)[number];
export type WorkoutStatus = 'planned' | 'completed' | 'skipped';
export type GoalKind = 'race' | 'progression';
export type SyncStatus = 'local' | 'pending' | 'synced' | 'error';
export type AdaptationMode = 'review' | 'safe-auto';
export type TrailRegion = 'lausanne' | 'romandie' | 'valais' | 'oberland' | 'central' | 'east' | 'ticino' | 'all';

export interface AthleteProfile {
  id: 'me';
  displayName: string;
  locale: 'fr-CH';
  timezone: 'Europe/Zurich';
  weeklyRunningDistanceKm: number;
  easyPaceSecPerKm: number;
  runSessionsPerWeek: number;
  strengthSessionsPerWeek: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingGoal {
  id: string;
  kind: GoalKind;
  name: string;
  targetDate?: string;
  distanceKm?: number;
  elevationGainM?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaceTarget {
  mode: 'pace';
  minSecPerKm: number;
  maxSecPerKm: number;
  rpeFallback: 1 | 2 | 3 | 4 | 5;
  terrainNote?: string;
}

export interface WorkoutSegment {
  id: string;
  label: string;
  durationMin?: number;
  distanceKm?: number;
  repetitions?: number;
  paceTarget?: PaceTarget;
  instructions?: string;
}

export interface PlannedWorkout {
  id: string;
  planId: string;
  date: string;
  type: WorkoutType;
  title: string;
  description: string;
  rationale: string;
  plannedDurationMin: number;
  plannedDistanceKm: number;
  plannedElevationGainM: number;
  target?: PaceTarget;
  segments: WorkoutSegment[];
  status: WorkoutStatus;
  linkedActivityId?: string;
  source: 'rules' | 'claude';
  createdAt: string;
  updatedAt: string;
}

export interface PlanWeek {
  id: string;
  index: number;
  startDate: string;
  phase: 'base' | 'build' | 'peak' | 'taper';
  targetDistanceKm: number;
  targetElevationGainM: number;
  workoutIds: string[];
}

export interface TrainingPlan {
  id: string;
  version: number;
  algorithmVersion: string;
  goalId: string;
  goalWorkoutId?: string;
  generatedAt: string;
  startDate: string;
  endDate: string;
  weeks: PlanWeek[];
  workouts: PlannedWorkout[];
  lastAdaptationSummary?: string;
}

export interface Activity {
  id: string;
  externalId?: string;
  source: 'garmin' | 'manual' | 'demo';
  name: string;
  startedAt: string;
  durationSec: number;
  distanceM: number;
  averagePaceSecPerKm: number;
  averageHeartRateBpm?: number;
  elevationGainM: number;
  rawFileName?: string;
  importedAt: string;
}

export interface SessionFeedback {
  id: string;
  workoutId: string;
  activityId?: string;
  effort: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
  syncStatus: SyncStatus;
}

export interface TechnicalContext {
  appVersion: string;
  route: string;
  featureId: string;
  capturedAt: string;
  viewport: { width: number; height: number };
  screen: { width: number; height: number };
  devicePixelRatio: number;
  userAgent: string;
  language: string;
  online: boolean;
  lastError?: string;
}

export interface AppFeedback {
  id: string;
  message: string;
  screenshotDataUrl?: string;
  technical: TechnicalContext;
  createdAt: string;
  syncStatus: SyncStatus;
}

export interface GoogleAccount {
  email: string;
  name: string;
  picture?: string;
}

export interface DriveFileRegistry {
  rootFolderId?: string;
  contextFolderId?: string;
  claudeFolderId?: string;
  contextJsonFileId?: string;
  contextMarkdownFileId?: string;
  planUpdateFileId?: string;
  planUpdateSchemaFileId?: string;
  feedbackFolderId?: string;
  sessionFeedbackFolderId?: string;
  screenshotsFolderId?: string;
}

export interface DriveSyncState {
  connected: boolean;
  account?: GoogleAccount;
  files: DriveFileRegistry;
  lastSyncAt?: string;
  lastSyncError?: string;
}

export interface GarminSyncState {
  mode: 'demo' | 'bridge-unconfigured' | 'bridge-configured';
  lastSyncAt?: string;
  lastSyncError?: string;
}

export interface AppSettings {
  adaptationMode: AdaptationMode;
  screenshotByDefault: boolean;
  requireGoogleAuth: boolean;
  trailRegion: TrailRegion;
  googleClientId?: string;
  garminBridgeUrl?: string;
}

export interface AppState {
  schemaVersion: 1;
  profile: AthleteProfile | null;
  goal: TrainingGoal | null;
  plan: TrainingPlan | null;
  activities: Activity[];
  sessionFeedback: SessionFeedback[];
  appFeedback: AppFeedback[];
  settings: AppSettings;
  drive: DriveSyncState;
  garmin: GarminSyncState;
  lastTechnicalError?: string;
}

export type PlanUpdateOperation =
  | {
      type: 'move_workout';
      workoutId: string;
      newDate: string;
      reason: string;
    }
  | {
      type: 'replace_workout';
      workoutId: string;
      replacement: Omit<
        PlannedWorkout,
        'id' | 'planId' | 'status' | 'linkedActivityId' | 'createdAt' | 'updatedAt'
      >;
      reason: string;
    }
  | {
      type: 'cancel_workout';
      workoutId: string;
      reason: string;
    }
  | {
      type: 'add_workout';
      workout: Omit<
        PlannedWorkout,
        'id' | 'planId' | 'status' | 'linkedActivityId' | 'createdAt' | 'updatedAt'
      >;
      reason: string;
    };

export interface PlanUpdate {
  schemaVersion: '1.0';
  updateId: string;
  basePlanId: string;
  basePlanVersion: number;
  generatedAt: string;
  summary: string;
  operations: PlanUpdateOperation[];
}

export interface PlanUpdatePreview {
  update: PlanUpdate;
  warnings: string[];
  safeForAutomaticApplication: boolean;
  resultingPlan: TrainingPlan;
}

export interface TrainingHistorySummary {
  weeksObserved: number;
  averageWeeklyDistanceKm: number;
  averageWeeklyElevationGainM: number;
  averageEasyPaceSecPerKm: number;
  completedRuns: number;
}
