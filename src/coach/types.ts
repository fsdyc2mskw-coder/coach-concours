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
// CHANGE_REQUEST_013 — the two named session shapes of weekly_shape.md v4
// (R-WS-07). They replace `police_technique` / `police_integration` /
// `police_strength_transitions` *in the generator*; those three kinds stay in
// the union below because Week 1 is frozen as trained (R-WS-15) and its
// recipes carry them verbatim, and because `recipes.ts` keeps them as bank
// entries the generator never schedules. `police_mock_test` is gone from the
// union entirely: R-PC-04 forbids it anywhere.
export type SessionShape = 'skill_session' | 'chain_session';

export type SessionKind =
  | 'crossfit_class'
  | SessionShape
  | 'police_technique'
  | 'police_strength_transitions'
  | 'police_integration'
  | 'trail_maintenance'
  | 'trail_event'
  | 'run_intervals'
  | 'running_intervals_exception'
  | 'police_event';

// CHANGE_REQUEST_013 section A. `warmup` and `cooldown` are listed here
// exactly as the change request writes them, but they are not
// `ExerciseBlock`s in this codebase: `SessionRecipe` has carried them as its
// own `warmup` / `cooldown` strings since CR-001, and CR-009/CR-010 render
// them from there. `blockSequence()` in `sessionShapes.ts` re-inserts them at
// their real positions so the index rules below can be checked literally.
// CHANGE_REQUEST_017 — `baseline` added: the one-off baseline block of
// `rules/test_battery.md` v2. R-TB-01 keeps it on exactly two sessions of the
// week of 21 September 2026 and on no other session in any week; which two is
// decided by session id in `baseline.ts`, never by date and never by kind.
// CHANGE_REQUEST_013 v2 — `hill_sprints` added: the last block of the weekend
// run from week 7 (R-WS-04 allows it, R-WS-43 sets the count).
export type BlockKind =
  | 'warmup' | 'memory' | 'fresh_reference'
  | 'skill_block' | 'chain_block' | 'cardio' | 'tail_b' | 'baseline' | 'hill_sprints' | 'cooldown';

export type CardioFormat = 'emom' | 'amrap' | 'for_time';

// CHANGE_REQUEST_013 section C.
// CHANGE_REQUEST_013 v2 — `touchdowns` (S09 and S11 on the board),
// `balance_faults` (S09's "touchdowns + ball drops" in one number per
// minute) and `recall_errors` (R-MM-04, errors out of 33).
export type DrillMeasure =
  | 'drops' | 'foot_errors' | 'hand_errors' | 'balls_lost'
  | 'restarts' | 'cones_touched' | 'swings' | 'round_time_s'
  | 'touchdowns' | 'balance_faults' | 'recall_errors';

// A card of `02_Training_brain/exercise_cards/00_INDEX.md`, referenced by its
// id. `CardRef` and `DrillRef` are named but not defined by the change
// request (CR-012 carries the card ids themselves and has not landed here);
// they are defined with the minimum the blocks below actually need — see
// APP_REPORT_013.md.
export interface CardRef {
  cardId: string;
  stationId: number;
  label: string;
}

// A drill is a card that is scored (R-WS-26). `drillId` is unique inside one
// session, so `DrillScore` can be keyed by it without colliding when the same
// card is used twice (tail A and tail B both use `S11_racket_on_board`).
export interface DrillRef extends CardRef {
  drillId: string;
  measure: DrillMeasure;
  scoreLabel: string;
}

export type MemoryModule = 'M1' | 'M2' | 'M3' | 'M4' | 'M5';

export interface MemoryBlockSpec {
  kind: 'memory';
  modules: MemoryModule[];
  // CHANGE_REQUEST_013 v2 — R-MM-04: from week 4 the skill session's memory
  // block ends with the scored recall check.
  drills?: DrillRef[];
}

// R-WS-37: the same-day clean reference a tail is measured against.
export interface FreshReferenceSpec {
  kind: 'fresh_reference';
  blockId: string;
  drills: DrillRef[];
}

export interface SkillBlock { // one station, two cards at most
  kind: 'skill_block';
  stationId: number;        // exactly one
  drills: DrillRef[];       // 1 or 2, each with its own score field
  durationMin: number;      // 16..20
}

export interface ChainBlock {
  kind: 'chain_block';
  rounds: number;
  stations: number[];       // 2 or more, in order
  transitionNote: string;   // the walk between stations IS the training
  tailA: DrillRef;          // 30..45 s, the same drill every round
  // Not in the change request's own interface: R-WS-34 fixes tail A at 30 to
  // 45 s and the locked chain session writes 30 s, so the number has to live
  // somewhere to be checked. Added here rather than guessed at check time.
  tailASeconds: number;
  // Not in the change request's own interface either: the locked chain
  // session scores the chain block itself ("SCORE: time per round · cones
  // touched"), which section C's list (skill block, tail, fresh reference)
  // does not cover. The locked file wins, so the block carries its own
  // scored drills.
  roundScores: DrillRef[];
  restS: number;
  durationMin: number;
  intensity: 'moderate';
}

export interface CardioBlock {
  kind: 'cardio';
  format: CardioFormat;
  atoms: CardRef[];         // 1..3, NEVER more
  durationMin: number;      // SEASON_PLAN[week].cardioMin (R-WS-32)
  target: null;             // always null, there is no target
  // CHANGE_REQUEST_013 v2 — the atoms removed from a reused cardio entry
  // because they belong to the week's focus station ("atomes à remplacer").
  toReplace?: CardRef[];
}

export interface TailMinute {
  minute: number;
  drill: DrillRef;
  label: string;
}

export interface TailB {
  kind: 'tail_b';
  minutes: TailMinute[];    // 4 or 5, rising difficulty
  referenceBlockId: string; // the fresh_reference of the same session
  stopRule: string;         // shown to the athlete before she starts
}

// CHANGE_REQUEST_017 section A — the three cheap tests of the baseline. The
// block carries only which tests it holds; the numbers themselves live in
// `SessionResult`, like every other Retour field.
export type BaselineTest = 'broad_jump' | 'sprint_20m' | 'six_min_run';

export interface BaselineBlockSpec {
  kind: 'baseline';
  tests: BaselineTest[];
  // R-TB-04 forbids a target, so there is no target field here to hold one.
  // `conditions` is the sentence shown before the block (section C).
  conditions: string;
}

export type BlockSpec =
  | MemoryBlockSpec
  | FreshReferenceSpec
  | SkillBlock
  | ChainBlock
  | CardioBlock
  | TailB
  | BaselineBlockSpec;

// CHANGE_REQUEST_013 section C — one numeric score per drill, stored per
// session id. The fresh-to-fatigued gap is NOT here: it is computed from
// these values (`progression.ts`), never typed.
export interface DrillScore {
  drillId: string;
  measure: DrillMeasure;
  value: number;
}

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
// CHANGE_REQUEST_013 — `kind` and `spec` are optional so that Week 1's frozen
// recipes and the run/trail recipes load and render unchanged. Every block of
// the two new session shapes carries both.
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
  kind?: BlockKind;
  spec?: BlockSpec;
  // CHANGE_REQUEST_013 v2 section D — a named gap (R-SP-03): no spec, no
  // drills, no score box, "À construire dans Cowork".
  placeholder?: boolean;
}

export interface MemoryPrompt {
  id: string;
  prompt: string;
  answer: string;
  // CHANGE_REQUEST_013 — which module of `memory_modules.md` this prompt is.
  // Optional: the pre-CR-013 recipes were written before the modules were
  // named in a rule file, so they carry no module rather than a guessed one.
  module?: MemoryModule;
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
  // CHANGE_REQUEST_013 section C — one score per drill of a skill block, a
  // tail or a fresh reference. Optional, so a record written before CR-013
  // loads unchanged and `schemaVersion` stays 2.
  drillScores?: DrillScore[];
  // CHANGE_REQUEST_013 section C — what the athlete did in the cardio block
  // (rounds done, or minutes held): one number plus free text, and nothing
  // else. No target is ever stored or displayed (R-WS-31).
  cardioValue?: number;
  cardioNote?: string;
  // CHANGE_REQUEST_017 section B — the baseline's recorded numbers, and
  // nothing else. Optional, so a record written before CR-017 loads unchanged
  // and `schemaVersion` stays 2. Stored against the session id the baseline
  // block belongs to, so a CR-014 move carries them with the session.
  // R-TB-02/R-TB-03: only the attempts and the distance are stored here; the
  // best jump, the best sprint and the VMA are computed in `baseline.ts` and
  // have deliberately no field of their own.
  broadJumpCm?: number[];   // up to 3 attempts, cm
  sprint20mS?: number[];    // up to 3 attempts, seconds, two decimals
  sixMinRunM?: number;      // metres covered in 6 minutes
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
