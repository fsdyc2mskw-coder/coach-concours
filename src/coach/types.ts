export type SessionKind =
  | 'crossfit_class'
  | 'room_explosive_intervals'
  | 'outdoor_explosive_intervals'
  | 'police_technique'
  | 'police_balance_coordination'
  | 'trail_event'
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

export interface ExerciseBlock {
  title: string;
  prescription: string;
  stationMappings: number[];
  approximation?: boolean;
}

export interface MemoryPrompt {
  id: string;
  prompt: string;
  answer: string;
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
  completedAt: string;
}

export interface DriveState {
  fileId?: string;
  rootFolderId?: string;
  backupsFolderId?: string;
  accountEmail?: string;
  lastSyncAt?: string;
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
