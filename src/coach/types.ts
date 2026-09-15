// CHANGE_REQUEST_001 — aligned with the 9 September rules (weekly_shape.md v2,
// TRAINING_ENGINE.md). `police_balance_coordination`, `room_explosive_intervals`
// and `outdoor_explosive_intervals` are gone from this active union: the
// recipes that used to carry them are re-tagged (see recipes.ts), not
// deleted. `running_intervals_exception` stays only for Week 1's documented
// Tuesday exception (R-WS-08); it is never produced by the generator itself.
export type SessionKind =
  | 'crossfit_class'
  | 'police_technique'
  | 'police_strength_transitions'
  | 'police_integration'
  | 'police_mock_test'
  | 'trail_maintenance'
  | 'trail_event'
  | 'running_intervals_exception'
  | 'police_event';

export type PlanPhase =
  | 'learn'
  | 'combine'
  | 'trail_event'
  | 'reset'
  | 'integrate'
  | 'peak'
  | 'taper';

export type CompletionStatus = 'done' | 'partial' | 'skipped';
export type MovementQuality = 'crisp' | 'mixed' | 'degraded';

// CHANGE_REQUEST_009 block grammar: every block carries the same four slots
// instead of one mixed paragraph. `faire` is mandatory; `regle`, `noter` and
// `details` are optional and simply not rendered when absent. `short` is an
// optional short label for the day's flow strip (falls back to the first two
// words of `title` when absent).
export interface ExerciseBlock {
  title: string;
  short?: string;
  faire: string;
  regle?: string;
  noter?: string;
  details?: string;
  stationMappings: number[];
  approximation?: boolean;
  hiit?: HiitSpec;
}

export interface MemoryPrompt {
  id: string;
  prompt: string;
  answer: string;
}

// CHANGE_REQUEST_002 — R-WS-16: a block is tagged `hiit` when it is the
// session's one stamina/explosiveness block (AMRAP, EMOM, running intervals,
// for-time or chipper). `durationMin` is read off the block's own text, never
// invented (see recipes.ts comments at each tag for where the number comes
// from).
export type HiitFormat = 'amrap' | 'emom' | 'intervals' | 'for_time' | 'chipper';

export interface HiitSpec {
  format: HiitFormat;
  durationMin: number;
}

export interface SessionRecipe {
  id: string;
  version: number;
  kind: SessionKind;
  title: string;
  purpose: string;
  durationMin: number | null;
  equipment: string[];
  warmup: string | null;
  blocks: ExerciseBlock[];
  cooldown: string | null;
  memory?: MemoryPrompt;
}

export interface PlannedSession {
  id: string;
  date: string;
  dayLabel: string;
  kind: SessionKind;
  recipeId: string;
  status: 'coached' | 'proposed' | 'fixed_event';
  phase: PlanPhase;
  load: 'low' | 'moderate' | 'hard' | 'event';
  volumeFactor: number;
  adaptationNote?: string;
}

export interface TrainingWeek {
  id: string;
  startDate: string;
  endDate: string;
  phase: PlanPhase;
  sessions: PlannedSession[];
}

export type LandingQuality = 'clean' | 'mixed' | 'sloppy';

export interface SessionResult {
  sessionId: string;
  status: CompletionStatus;
  effort: 1 | 2 | 3 | 4 | 5;
  note: string;
  movementQuality?: MovementQuality;
  boxHesitation?: boolean;
  overlapTags?: Array<'grip' | 'jumping' | 'heavy_legs' | 'hard_conditioning'>;
  // CHANGE_REQUEST_003 record fields (Week 1 v3): optional, free-form measures named
  // explicitly in the change request. Not tied to a specific session kind.
  memoryErrors?: number;
  ballFumbles?: number;
  racketDropsR1?: number;
  racketDropsR2?: number;
  racketDropsR3?: number;
  amrapRounds?: number;
  landingQuality?: LandingQuality;
  distanceKm?: number;
  elevationGainM?: number;
  durationMin?: number;
  // CHANGE_REQUEST_007 record fields (Week 1 v3, Tuesday 8 Sep running-intervals exception).
  intervalDistance1M?: number;
  intervalDistance2M?: number;
  completedAt: string;
}

export interface DriveState {
  fileId?: string;
  rootFolderId?: string;
  backupsFolderId?: string;
  accountEmail?: string;
  lastSyncAt?: string;
  lastSyncRevision?: number;
  wasConnected?: boolean;
  status: 'local' | 'synced' | 'pending' | 'error';
  message?: string;
}

export interface CoachState {
  schemaVersion: 2;
  revision: number;
  updatedAt: string;
  athleteName: string;
  planStartDate: '2026-09-07';
  planEndDate: '2026-11-20';
  weeks: TrainingWeek[];
  results: Record<string, SessionResult>;
  memoryReveals: Record<string, boolean>;
  drive: DriveState;
  migration: {
    legacyTrailDbDetected: boolean;
    legacyTrailArchive?: unknown;
    checkedAt: string;
  };
}
