# Police V1 data model

## Migration target

Increment persisted `AppState.schemaVersion` from `1` to `2`. Implement and test a
total migration from every valid V1 state. Invalid storage must continue to fail visibly
through the existing recovery path; do not silently erase it.

## Conventions

- Business dates: local `YYYY-MM-DD` in `Europe/Zurich`.
- Logged instants: ISO 8601 UTC strings.
- Circuit/station times: integer seconds; optional milliseconds may be added later, not V1.
- Planned duration: minutes.
- Actual duration: seconds.
- Running distance: metres in activities, kilometres in plan targets.
- Elevation gain: metres.
- Effort and confidence: integer 1-5.
- Weekday: `monday` through `sunday`, never locale-dependent numeric constants in persisted data.

## Proposed root

```ts
interface AppStateV2 {
  schemaVersion: 2;
  profile: AthleteProfileV2 | null;
  goals: GoalSet | null;
  plan: TrainingPlanV2 | null;
  activities: ActivityV2[];
  stationProgress: StationProgress[];
  policeAttempts: PoliceAttempt[];
  recallAttempts: CircuitRecallAttempt[];
  sessionFeedback: SessionFeedbackV2[];
  appFeedback: AppFeedback[];
  settings: AppSettingsV2;
  drive: DriveSyncState;
  lastTechnicalError?: string;
}
```

There is no `garmin` state and no `trailRegion` setting.

## Profile and availability

```ts
type Weekday =
  | 'monday' | 'tuesday' | 'wednesday' | 'thursday'
  | 'friday' | 'saturday' | 'sunday';

interface AthleteProfileV2 {
  id: 'me';
  displayName: string;
  locale: 'fr-CH';
  timezone: 'Europe/Zurich';
  trainingDaysPerWeek: 5;
  preferredTrainingDays: Weekday[];
  preferredRestDays: Weekday[];
  crossfitWeekday: 'monday';
  crossfitScheduleMode: 'fixed';
  roomSessionWeekday: Weekday | null;
  roomScheduleMode: 'fixed' | 'varies';
  currentComfortableRunKm: number | null;
  recentWeeklyRunKm: number | null;
  equipment: EquipmentAvailability[];
  exactCircuitAccessDates: string[];
  createdAt: string;
  updatedAt: string;
}

interface EquipmentAvailability {
  equipmentId: string;
  availability: 'available' | 'sometimes' | 'unavailable' | 'unknown';
  notes?: string;
}
```

The coached CrossFit class is fixed on Monday. The room session must use another day. If
room access varies, each week requires a selected day before the plan is finalized. The
engine must not quietly assume Wednesday.

## Fixed goal set

```ts
interface GoalSet {
  primary: PoliceGoal;
  secondary: TrailMaintenanceEvent;
}

interface PoliceGoal {
  id: string;
  kind: 'police_physical_test';
  name: string;
  eventDate: '2026-11-20';
  officialLimitSec: 375;
  personalTargetSec: 371;
  reportedBaselineSec: 510;
  reportedBaselineOutcome: AttemptOutcome | 'unknown';
  requiredStationIds: PoliceStationId[];
}

interface TrailMaintenanceEvent {
  id: string;
  kind: 'trail_maintenance_event';
  name: string;
  eventDate: '2026-10-11';
  distanceKm: 12;
  elevationGainM: 400;
  priority: 'secondary';
  intent: 'finish-maintenance';
}
```

Both event dates are protected against external plan updates.

## Static station catalogue

Keep static source-grounded station definitions outside persisted user state. Load them
from typed TypeScript data or validated bundled JSON. IDs are stable:

```ts
type PoliceStationId =
  | 'station-01-slalom'
  | 'station-02-obstacle'
  | 'station-03-wall-bars'
  | 'station-04-mannequin'
  | 'station-05-trolley'
  | 'station-06-nuts'
  | 'station-07-rope-pull'
  | 'station-08-hoops-basketball'
  | 'station-09-mobile-bench'
  | 'station-10-skipping-rope'
  | 'station-11-racket-ball';
```

Stations 5 and 6 remain separate IDs but include an interleaving relationship.

## Station progress

```ts
interface StationProgress {
  stationId: PoliceStationId;
  priority: 'low' | 'medium' | 'high' | 'very_high';
  confidence: 1 | 2 | 3 | 4 | 5 | null;
  concernTags: Array<'fear' | 'balance' | 'coordination' | 'strength' |
    'speed' | 'dexterity' | 'memory' | 'unknown'>;
  latestExactOutcome?: AttemptOutcome;
  latestExactTimeSec?: number;
  cleanAttempts: number;
  correctedAttempts: number;
  failedAttempts: number;
  notes: string;
  updatedAt: string;
}
```

Seed station 2 with fear/very high, station 8 with coordination/very high, stations
9-11 with balance/high until the first assessment distinguishes the reported final-two
weakness.

## Police attempts

```ts
type PracticeFidelity = 'exact' | 'approximation' | 'mental';
type AttemptOutcome = 'clean' | 'corrected' | 'failed';

interface PoliceAttempt {
  id: string;
  performedAt: string;
  scope: 'station' | 'chunk' | 'full_circuit';
  stationIds: PoliceStationId[];
  fidelity: Exclude<PracticeFidelity, 'mental'>;
  outcome: AttemptOutcome;
  totalTimeSec?: number;
  splits: Array<{
    stationId: PoliceStationId;
    timeSec?: number;
    outcome: AttemptOutcome;
    errorCount: number;
    notes?: string;
  }>;
  equipmentNotes?: string;
  effort: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}
```

Invariant: `bestCleanCircuitTimeSec` is derived, not independently mutable. Select the
minimum `totalTimeSec` among attempts with `scope=full_circuit`, all 11 IDs in order,
`fidelity=exact`, and `outcome=clean`.

## Recall attempts

```ts
interface CircuitRecallAttempt {
  id: string;
  performedAt: string;
  mode: 'video_detective' | 'station_order' | 'rule_match' |
    'transition_choice' | 'find_mistake' | 'guided_visualization' |
    'unprompted_visualization' | 'random_quiz';
  prompted: boolean;
  stationOrderCorrect: number;
  stationOrderTotal: 11;
  criticalRulesCorrect: number;
  criticalRulesTotal: number;
  transitionsCorrect: number;
  transitionsTotal: number;
  durationSec?: number;
  notes?: string;
}
```

Each recall attempt may also store `sessionId`, shuffled/answered station IDs,
`hintCount`, `attemptCount`, and whether tap-to-swap or drag-and-drop was used. A plan
validation rule enforces at most and at least one memory game per police session.

Equipment availability must include confirmed entries for basketball, coloured markers,
skipping rope, table-tennis racket/ball, approximately 18 m of space, and the round
balance board. Substitute-practice records store station ID, object description,
approximate height/load when known, stability confirmation, fidelity, clean/error result,
hesitation, and confidence/fear before and after.

## Plan and workouts

```ts
type WorkoutTypeV2 =
  | 'police_technique'
  | 'police_balance_coordination'
  | 'police_integration'
  | 'police_mock_test'
  | 'crossfit'
  | 'room_explosive_intervals'
  | 'outdoor_explosive_intervals'
  | 'trail_event'
  | 'recovery';

type FocusCategory = 'police' | 'police_support' | 'trail' | 'recovery';
type LoadLevel = 'low' | 'moderate' | 'hard';

interface PlannedWorkoutV2 {
  // Retain existing identity, status, source, timestamps, and plan linkage.
  type: WorkoutTypeV2;
  focusCategory: FocusCategory;
  loadLevel: LoadLevel;
  linkedStationIds: PoliceStationId[];
  practiceFidelity?: PracticeFidelity;
  isPrincipalTrainingDay: boolean;
  protectedEventId?: string;
  plannedDurationMin: number;
  plannedDistanceKm?: number;
  plannedElevationGainM?: number;
  segments: WorkoutSegmentV2[];
}
```

Memory exposures may be lightweight plan items or segments, but selectors must exclude
them from the five-principal-day count.

## Activity and completion

Replace Garmin-specific activity source with:

```ts
type ActivitySourceV2 = 'manual' | 'demo' | 'imported';
type ActivityKindV2 = 'run' | 'crossfit' | 'room_explosive' | 'police' | 'other';
```

Retain existing activities during migration. Map source `garmin` to `imported` and keep
all other values and IDs.

Police completion may create a `PoliceAttempt`; room and outdoor explosive completion
add interval, recovery, movement-quality, and optional heart-rate fields. Running
completion keeps distance, duration, and elevation. Do not force meaningless distance or
pace fields into balance/coordination or room forms.

## Settings

Retain adaptation mode, screenshot preference, optional Google client ID, and Drive
settings. Remove trail region and Garmin bridge URL. Add only true preferences, not
derived progress.

## Export and plan updates

Increment the structured export and plan-update schema versions. Include:

- fixed goal set;
- focus policy version and current focus status;
- station progress;
- recent police and recall attempts;
- room/outdoor explosive work, recovery, movement quality, and effort;
- upcoming five-day plan;
- trail event and maintenance run in secondary position.

Every proposed plan update must pass both legacy semantic checks and the new focus-policy
validator immediately before application.
