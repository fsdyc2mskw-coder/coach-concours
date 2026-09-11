# Execution plan - Coach Concours V1

## Status

- Specification prepared: 2 September 2026
- Implementation: not started
- Owner: next Codex implementation task
- Primary brief: `CODEX_POLICE_V1_START_HERE.md`

## Objective

Convert the existing trail-first PWA into a police-first V1 without rewriting its sound
technical foundation or losing persisted user records. Enforce 1 Monday CrossFit class
+ 1 self-directed CrossFit-room explosive + 1 outdoor explosive interval + 1 station
technique + 1 coordination/balance session in every complete five-day week.

## Scope authority

Read all files in `docs/police-v1/`. The settled decisions there supersede old trail-first
product scope. Keep existing engineering-quality and data-protection rules unless a V1
document explicitly changes them.

## Stage 0 - establish baseline

- [ ] Inspect repository and working-tree state; preserve unrelated user changes.
- [ ] Run the existing `npm run check` and record baseline failures without deleting tests.
- [ ] Inventory every SwissMobile, `/trails`, `trailRegion`, Garmin, and
  `VITE_GARMIN_BRIDGE_URL` reference.
- [ ] Inventory all persisted-state readers/writers and every exported JSON contract.
- [ ] Confirm the current build at 393 x 852 before modifying UI.
- [ ] Add a progress log to this file with commands and results.

Exit criterion: old state and removal surfaces are mapped; baseline is reproducible.

## Stage 1 - domain foundations

- [ ] Add V2 types from `docs/police-v1/DATA_MODEL.md`.
- [ ] Add a typed/validated static 11-station catalogue using
  `examples/police-stations.json` as the seed.
- [ ] Add official-order, interleaving, and critical-rule tests.
- [ ] Add station progress, police attempt, and recall attempt selectors.
- [ ] Implement clean-only best-circuit-time derivation.
- [ ] Implement focus-policy types and pure validator using `examples/focus-policy.json`.
- [ ] Test normal, boundary, and invalid weeks.

Exit criterion: pure domain tests prove official content and the focus guardrail.

## Stage 2 - safe V1-to-V2 migration

- [ ] Implement V1-to-V2 state migration before switching the app seed to V2.
- [ ] Preserve activities, feedback, screenshots, Drive registry, and relevant timestamps.
- [ ] Map activity source `garmin` to neutral `imported` without losing metrics.
- [ ] Do not relabel historical trail/strength workouts as police-specific.
- [ ] Initialize fixed goals and known concern seeds.
- [ ] Add one-time post-migration review state for unknown personal inputs.
- [ ] Add fixtures for empty, typical, Garmin-tagged, and partially corrupt V1 states.
- [ ] Verify refresh/persistence after migration.

Exit criterion: no valid V1 user record is silently lost and V2 reload is stable.

## Stage 3 - police-first plan engine

- [ ] Implement the phase calendar and deterministic scheduling rules.
- [ ] Fix the coached CrossFit class on Monday and support a fixed or variable separate
  room-session weekday.
- [ ] Generate exactly 1 CrossFit + 1 room explosive + 1 outdoor interval run + 1 station
  technique + 1 coordination/balance session in complete weeks.
- [ ] Embed exactly one active memory game in each room, technique, and
  coordination/balance session: three per ordinary week, with no extra day or final test.
- [ ] Use current weaknesses and attempt results to select station content.
- [ ] Generate useful exact/approximation/mental work with no room access.
- [ ] Make the 11 October event replace that week's run.
- [ ] Stop the plan at the 20 November test.
- [ ] Implement room/outdoor explosive load, quality, and recovery response without
  adding a day.
- [ ] Protect both event dates.
- [ ] Add all deterministic tests listed in the engine specification.

Exit criterion: every generated week passes the focus validator and representative plans
are understandable from their rationales.

## Stage 4 - schema, export, and adaptation protocol

- [ ] Version and update TypeScript validators and JSON schemas.
- [ ] Update context JSON/Markdown with police progress, recall, explosive-session
  response, focus status,
  and secondary trail information.
- [ ] Update plan-update operations for V2 workout types.
- [ ] Revalidate focus at preview and exact apply time.
- [ ] Refuse second run, reduced police allocation, event movement, sixth day, or hard-day
  violations.
- [ ] Update public samples and Claude prompt/template files.
- [ ] Add schema, export, preview, stale-preview, and application tests.

Exit criterion: external adaptation cannot bypass the local police-focus guardrail.

## Stage 5 - V1 user interface

- [ ] Replace onboarding with fixed goals, baseline classification, week, and equipment.
- [ ] Build police-first dashboard and compact trail card.
- [ ] Build Plan focus summary and station/fidelity badges.
- [ ] Build Circuit screen with four chunks, station detail, recall, visualization, and
  attempt recording.
- [ ] Add type-specific station/skill, room explosive, outdoor interval, trail-event, and
  recall completion forms.
- [ ] Update Activities with neutral source labels and appropriate filters.
- [ ] Update Settings for schedule/equipment and preserve optional Drive/export.
- [ ] Rename global product ideation to `Idée / feedback` with categories.
- [ ] Keep plan adaptation separate in Settings.
- [ ] Redirect legacy `/trails` links safely.
- [ ] Cover empty, no-room, unknown-input, offline, loading, and error states.

Exit criterion: the complete daily loop works on an iPhone-sized viewport.

## Stage 6 - remove old scope

- [ ] Follow the exact deletion inventory in `MIGRATION_AND_REMOVALS.md`.
- [ ] Delete Swiss trail catalogue, code, scripts, screen, tests, settings, and docs.
- [ ] Delete Garmin code, state, environment variables, UI, tests, and docs.
- [ ] Remove future-integration teasers and stale imports.
- [ ] Remove the product-level medical-disclaimer invariant/copy as requested.
- [ ] Confirm generic manual/imported activity history remains functional.

Exit criterion: repository search finds no active SwissMobile/Garmin feature reference;
historical references, if retained, are unmistakably archived and excluded from current
product instructions.

## Stage 7 - current documentation and product naming

- [ ] Update root/nested AGENTS instructions to Coach Concours.
- [ ] Update README, product, architecture, data model, engine, UX, acceptance, status,
  roadmap, sources, security, testing, handoff, plan, and changelog.
- [ ] Replace old `CODEX_START_HERE.md` with the current start flow.
- [ ] Regenerate or clearly archive the legacy DOCX handoff.
- [ ] Regenerate file manifest and checksums only after final file layout is stable.
- [ ] Ensure all visible copy is natural French for Switzerland.

Exit criterion: no current document instructs a future agent to rebuild removed features.

## Stage 8 - verification

- [ ] Run schema validation, typecheck, tests, build, and repository validation.
- [ ] Run `npm run check` as the aggregate gate.
- [ ] Test fresh onboarding.
- [ ] Test V1 migration and reload.
- [ ] Test a no-room week and a week with exact-room access.
- [ ] Test fixed and variable CrossFit schedules.
- [ ] Test the 11 October week and post-race week.
- [ ] Test the final 16-20 November partial week.
- [ ] Test feedback capture/persistence.
- [ ] Test invalid plan-update attempts against every focus rule.
- [ ] Test dashboard, plan, circuit, session, activities, and settings at 393 x 852.
- [ ] Check keyboard, long text, safe areas, offline reload, and horizontal overflow.
- [ ] Update validation report with actual evidence, not intended results.

Exit criterion: all applicable acceptance criteria are checked and no required work is
silently deferred.

## Required implementation report

At completion, report:

- outcome first;
- commands and exact results;
- important files changed/deleted;
- migration behaviour and fixtures tested;
- focus-policy cases tested;
- mobile flows manually exercised;
- any unknown user input still required;
- any truly external blocker.

Do not describe a stage as complete merely because code was written; use the exit
criteria and acceptance file.

## Progress log

### 2 September 2026 - specification preparation

- Created the police-V1 specification pack and machine-readable seed proposals.
- Downloaded and visually reviewed both official PDFs.
- Reviewed the official demonstration video and current preparation web page.
- Did not modify application code or delete legacy features in this preparation step.
