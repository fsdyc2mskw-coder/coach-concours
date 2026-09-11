# V1 migration and removal plan

## Principle

Change the product without losing valid local activities, feedback, Drive registry data,
or technical settings. Remove SwissMobile and Garmin features only after the V2 state
migration and replacement UI compile and are tested.

## Persisted-state migration

Implement `schemaVersion: 1 -> 2` as a pure, tested migration.

### Preserve

- profile ID, display name, locale, timezone, created/updated timestamps where meaningful;
- all recorded activities and their IDs;
- session feedback and application feedback;
- screenshot data;
- Drive connection/file registry metadata;
- last technical error;
- existing completed-workout history when it can be retained without pretending it is a
  police session.

### Transform

- `goal` -> fixed `goals.primary` and `goals.secondary` from the personal baseline;
- `source: 'garmin'` -> `source: 'imported'` without changing activity ID, time, distance,
  duration, elevation, or notes;
- compatible historical runs -> `activityKind: 'run'`;
- old strength work -> `activityKind: 'other'` unless completion data establishes CrossFit;
- new profile fields -> explicit unknown/null values when the user has not answered;
- existing future trail plan -> archive/supersede and generate the new police-first plan
  after onboarding confirmation; do not relabel old workouts as police training;
- preserve Drive settings but remove Garmin/trail-region settings.

### Initialize

- reported baseline 8:30 with cleanliness unknown;
- station 2 concern `fear`, priority `very_high`;
- station 8 concern `coordination`, priority `very_high`;
- stations 9-11 concern `balance`, priority `high` pending clarification;
- empty attempt and recall histories;
- police test 20 November and trail event 11 October.

### Migration UX

After migration, show a one-time review asking for CrossFit day, running baseline,
equipment, exact-room availability, and classification of the 8:30 attempt. The data is
already preserved before the review; cancelling does not erase it.

## Swiss trail catalogue deletion inventory

Delete after replacement navigation/session UI is ready:

- `src/screens/TrailsScreen.tsx`
- `src/domain/swissTrails.ts`
- `src/data/swiss-trails.generated.json`
- `scripts/sync-swiss-trails.mjs`
- `tests/TrailsScreen.test.tsx`
- `tests/swissTrails.test.ts`
- `docs/SWISSMOBILE.md`
- `docs/exec-plans/swissemobile-catalog.md`
- `docs/exec-plans/nearby-trails-page.md`

Remove associated:

- `/trails` route and App switch case;
- `Parcours` bottom-navigation item;
- nearby-route suggestions, region selector, geolocation, and trail links in Session;
- `TrailRegion`, `TRAIL_REGION_OPTIONS`, and `trailRegion` settings;
- `sync:swiss-trails` package scripts;
- tests and copy that expect route suggestions;
- SwissMobile entries from README, source docs, roadmap, status, changelog “current
  features”, validation report, manifests, and handoff instructions.

Historical changelog facts may remain only in a clearly labelled pre-rework archive; the
current product documentation must not advertise the removed feature.

## Garmin deletion inventory

Delete:

- `src/infrastructure/garmin/`
- `docs/GARMIN.md`
- `docs/decisions/0004-garmin-adapter.md`

Remove associated:

- `GarminSyncState` and `garmin` root state;
- `garminBridgeUrl` and `VITE_GARMIN_BRIDGE_URL`;
- Garmin imports, commands, sync errors, providers, buttons, badges, demo import, and copy
  from `AppContext`, seed, Activities, Settings, and onboarding;
- Garmin references from `src/vite-env.d.ts`, schemas, exports, tests, README, AGENTS,
  infrastructure instructions, security docs, product docs, architecture, status,
  roadmap, plan, source docs, release notes, handoff, and validation report;
- Garmin future-work invitations. This removal is deliberate; do not replace it with
  another wearable teaser.

Keep generic manual activity entry and add neutral `imported` source support for migrated
records. Do not retain a hidden Garmin endpoint.

## Product-language replacement

Update current documents and UI from Trail Coach to Coach Concours. Trail remains only as
the named secondary event and one weekly maintenance run.

Remove product-level “not medical advice” invariant and visible disclaimer language from
current product docs and UI. Preserve concrete performance scheduling, recovery, pain
reporting, and data-security behaviour specified elsewhere.

## Claude features

Keep two separate flows:

1. **Idée / feedback** - global product ideation; preserve screenshot and technical
   context.
2. **Plan update import** - structured training-plan operations in Settings; update its
   schema and semantic guardrails for police focus.

Do not label ordinary product feedback as an automatic training adaptation.

## Documentation replacement inventory

Update these current-source documents during implementation:

- `AGENTS.md` and nested relevant `AGENTS.md` files;
- `README.md`;
- `CODEX_START_HERE.md` or replace its content with a pointer to the police start file;
- `PROJECT_HANDOFF.md`;
- `PLANS.md`;
- `CHANGELOG.md`;
- `VALIDATION_REPORT.md` after validation;
- `docs/index.md`, `PRODUCT.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `TRAINING_ENGINE.md`,
  `UX.md`, `ACCEPTANCE.md`, `STATUS.md`, `ROADMAP.md`, `SOURCES.md`, `SECURITY.md`, and
  `TESTING.md` where affected;
- top-level `SECURITY.md`, `FILE_MANIFEST.txt`, and `SHA256SUMS` where retained.

The legacy `.docx` handoff describes the old product. Either regenerate it after V1 using
the repository's document workflow or label/exclude it as historical so it cannot be
mistaken for current instructions.

## Schema and example synchronization

Update together:

- TypeScript domain types;
- runtime validators;
- `schemas/app-export.schema.json`;
- `schemas/plan-update.schema.json`;
- `schemas/feedback.schema.json` only if feedback category changes its contract;
- `public/sample/claude-plan-update.json`;
- Claude prompt/templates;
- export/import tests;
- storage and migration tests.

## Safe implementation order

1. Add V2 types and static station catalogue.
2. Add migration and migration tests.
3. Add focus validation and the new plan engine.
4. Add replacement onboarding/dashboard/Circuit/session UI.
5. Update export and plan-update contracts.
6. Remove old routes/features and compile.
7. Rewrite current docs and regenerate release manifests.
8. Run full checks and mobile QA.

Never delete the old feature code first and then discover that the only valid stored-state
reader depended on it.

