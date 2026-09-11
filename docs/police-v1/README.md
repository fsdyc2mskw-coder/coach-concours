# Police concours V1 - specification pack

## Purpose

This directory is the complete product and implementation brief for converting the
existing Trail Coach prototype into the first version of Coach Concours.

## Manifest and reading order

| Order | File | Purpose |
|---:|---|---|
| 0 | `UPDATE_2026-09-07.md` | Latest user-authoritative decisions and conflict precedence |
| 1 | `PERSONAL_BASELINE.md` | Dates, targets, constraints, weaknesses, and known unknowns |
| 2 | `FOCUS_GUARDRAIL.md` | Enforceable police-first planning policy |
| 3 | `OFFICIAL_CIRCUIT.md` | Source-grounded 11-station circuit reference |
| 4 | `PRODUCT_SPEC.md` | V1 scope, outcomes, and exclusions |
| 5 | `DATA_MODEL.md` | Proposed entities, versions, and invariants |
| 6 | `TRAINING_ENGINE.md` | Deterministic phases, weekly templates, and validation |
| 7 | `WORKOUT_LIBRARY.md` | Station decompositions and low-equipment practice |
| 8 | `UX_SPEC.md` | Navigation, screens, copy, and states |
| 9 | `MIGRATION_AND_REMOVALS.md` | Safe removal of SwissMobile and Garmin |
| 10 | `ACCEPTANCE_CRITERIA.md` | Testable definition of V1 |
| 11 | `SOURCE_REGISTER.md` | Provenance and source-use rules |
| 12 | `examples/personal-config.json` | Machine-readable seed proposal |
| 13 | `examples/focus-policy.json` | Machine-readable focus policy proposal |
| 14 | `examples/police-stations.json` | Machine-readable station seed proposal |

The execution plan is at `../exec-plans/police-concours-v1.md`. The one-command
handoff for Codex is at the repository root: `CODEX_POLICE_V1_START_HERE.md`.
A short prompt that can be pasted into a new Codex task is at
`../../CODEX_POLICE_V1_PROMPT.md`.

## Source files stored with the project

- `../sources/police/official-circuit-guide.pdf`
- `../sources/police/official-training-program.pdf`

The official YouTube demonstration is linked in `SOURCE_REGISTER.md`; it is not copied
into the repository.

## Decisions already made

- Police test preparation is primary.
- Trail running is maintenance only.
- Five principal training days per week means 1 Monday CrossFit class + 1 prescribed
  CrossFit-room explosiveness session + 1 outdoor explosive interval run + 1
  station/circuit technique session + 1 coordination/balance session.
- The second running session previously considered is removed.
- Circuit memory is a first-class outcome.
- Learning the full circuit by heart is Rule 0 above every other coaching rule.
- Each police session contains one active memory game; there is no separate final test.
- CrossFit attendance was reported, registration is planned, and the class is Monday.
  On another day, its room,
  agility ladder, and large box can be used for a prescribed police-concours session. The
  current continuous-run reference is approximately 6 km.
- Stations 2 and 8 are the main fear/coordination priorities; station 10 has a wrong-foot
  start correction; stations 9 and 11 need fluency rather than basic correctness.
- Limited room/equipment access must never block the plan.
- The trail catalogue is deleted.
- Garmin is deleted.
- The global product-ideation feedback control stays.
- The old medical-disclaimer product invariant is removed.

These are settled product decisions, not questions for Codex to reopen.
