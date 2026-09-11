# Codex start here - Police concours V1

## Mission

Transform the existing Trail Coach prototype into **Coach Concours**, a private,
mobile-first training app whose primary purpose is to prepare the athlete for the Police
cantonale vaudoise physical aptitude test on **20 November 2026**.

This is an implementation task. Preserve the sound React, TypeScript, Vite,
offline-storage, migration, feedback, and test foundations. Do not rewrite the
application from scratch.

## Authority and conflict rule

For this rework, the files in `docs/police-v1/` and this file supersede older
trail-first product statements. Existing repository instructions about code quality,
security, deterministic domain logic, migrations, mobile layout, and testing still
apply. When an old document says that trail running is the sole product purpose, the
police-V1 specification wins.

Read in this order before editing code:

1. `AGENTS.md`
2. this file
3. `docs/police-v1/README.md`
4. every document listed in that manifest
5. `docs/POLICE_TEST.md`
6. `docs/exec-plans/police-concours-v1.md`
7. existing architecture, storage, migration, schema, and test files affected by the work

## Non-negotiable product outcome

The app must keep the weekly plan focused on the police test:

- exactly five planned principal training days per complete week;
- one Monday coached CrossFit class;
- one self-directed CrossFit-room session on another day for short explosive conditioning;
- one outdoor explosive interval run, never a second run;
- one station/circuit technique session;
- one coordination/balance session;
- exactly one active memory game in each room, technique, and coordination/balance
  session: three per ordinary complete week, with no extra principal day or final test;
- the trail event replaces the interval run in event week; no separate maintenance run;
- a fast circuit attempt only counts as a performance benchmark when all 11 stations are clean.

The October trail is a protected secondary event, not a competing training programme:

- 12 km;
- 400 m positive elevation gain;
- 11 October 2026;
- no route catalogue, route discovery, or trail-specific product area.

## Required removals

Remove the Swiss trail catalogue and Garmin feature completely. Follow
`docs/police-v1/MIGRATION_AND_REMOVALS.md` so persisted activities are retained.
Remove the product-level “not medical advice” invariant and corresponding visible
disclaimer language. Do not interpret that removal as permission to discard the
performance-load, recovery, pain-reporting, or data-safety rules in this pack.

## Required feature set

Implement:

- police-first onboarding and dashboard;
- the official 11-station circuit library;
- mental recall, sequence recall, rule quizzes, and guided visualization;
- station confidence, clean/error status, split time, and notes;
- exact, approximation, and mental-only practice modes;
- progressive obstacle/box confidence work;
- basketball coordination and final-station balance work;
- a deterministic five-day plan engine enforcing the focus guardrail;
- CrossFit class and self-directed room conditioning as separate first-class sessions
  whose emphasis and effort affect nearby work;
- one outdoor explosive interval session per week and the 11 October event, which
  replaces it in event week;
- “Idée / feedback” for product ideation, kept separate from plan adaptation;
- an explicit local-state migration with no silent data loss.

## Delivery sequence

Work through `docs/exec-plans/police-concours-v1.md` in order. Keep the repository
buildable at coherent checkpoints. Update types, runtime validation, JSON schemas,
examples, migrations, exports, UI, tests, and documentation together.

Do not delete the old trail/Garmin code until references and migration needs have been
mapped. Deletion is part of the implementation, not the first step.

## Definition of done

V1 is complete only when:

- every acceptance criterion in `docs/police-v1/ACCEPTANCE_CRITERIA.md` is either
  verified or explicitly reported as externally blocked;
- `npm run check` passes;
- the production build has been exercised at 393 x 852 CSS pixels;
- refresh and migration preserve existing activities and feedback;
- no SwissMobile or Garmin feature remains reachable or referenced as future product work;
- the final report lists files changed, migrations performed, commands run, test results,
  manual checks, and remaining external dependencies.
