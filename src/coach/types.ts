// CHANGE_REQUEST_001 — aligned with the 9 September rules (weekly_shape.md v2,
// TRAINING_ENGINE.md). `police_balance_coordination`, `room_explosive_intervals`
// and `outdoor_explosive_intervals` are gone from this active union: the
// recipes that used to carry them are re-tagged (see recipes.ts), not
// deleted. `running_intervals_exception` stays only for Week 1's documented
// Tuesday exception (R-WS-08); it is never produced by the generator itself.
// CHANGE_REQUEST_011 — `run_intervals` added: the fixed Tuesday
// running-interval session from rules v3 (R-WS-19/20). Distinct from
// `running_intervals_exception` (Week 1's one documented Tuesday-as-trained
// exception, still frozen and never produced by the generator itself).
export type SessionKind =
  | 'crossfit_class'
  | 'police_technique'
  | 'police_strength_transitions'
  | 'police_integration'
  | 'police_mock_test'
  | 'trail_maintenance'
  | 'trail_event'
  | 'run_intervals'
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
// CHANGE_REQUEST_010 section D — a session with values typed into "Retour"
// but no status chosen yet is `draft` in the data ("en cours" on the week
// card), distinct from the three completion outcomes above.
export type ResultStatus = CompletionStatus | 'draft';
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

// CHANGE_REQUEST_014 section C — a session moved to another day of its own
// week. The move is its own small layer, never a rewritten week: the stored
// `weeks` are thrown away and rebuilt by `generatePlan` at every start
// (coachStorage.loadCoachState), so anything written into a week would
// disappear at the next reload. `sessionId` is the generator's own id
// (`${date}:${kind}`), which the move never rewrites — `state.results` is
// keyed by it, and renaming a session would cut the numbers already recorded
// loose from it.
export interface DayMove {
  sessionId: string;
  toDate: string;
  movedAt: string;
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
  // CHANGE_REQUEST_010 — `status` can now be `draft` (autosaved from the
  // Retour tab before the athlete has chosen Terminée/Partielle/Passée); the
  // effort rating is optional for the same reason. A record read from Drive
  // or exported before CR-010 always carries a real CompletionStatus and a
  // real effort, so both stay assignable to their pre-CR-010 types.
  status: ResultStatus;
  effort?: 1 | 2 | 3 | 4 | 5;
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
  // CHANGE_REQUEST_010 section D — new optional field named by the mockup's
  // Retour group for the Friday station-2 block ("Hésitations à l'obstacle").
  obstacleHesitations?: number;
  // CHANGE_REQUEST_002 — record field for `coordination`'s new hiit block
  // ("Corde EMOM — 6 min"): minutes out of 6 completed as prescribed.
  emomMinutesCompleted?: number;
  // CHANGE_REQUEST_011 section D — Tuesday run_intervals Retour group: one
  // pace per rep actually run (seconds per kilometre, read off the watch's
  // auto-lap) and the number of reps completed. `repPacesSec` may be shorter
  // than the row's `reps` when the session was stopped early.
  repPacesSec?: number[];
  repsDone?: number;
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
  // CHANGE_REQUEST_014 — optional, so a state written before CR-014 loads
  // unchanged and `schemaVersion` stays 2.
  dayMoves?: DayMove[];
  results: Record<string, SessionResult>;
  memoryReveals: Record<string, boolean>;
  drive: DriveState;
  migration: {
    legacyTrailDbDetected: boolean;
    legacyTrailArchive?: unknown;
    checkedAt: string;
  };
}
