# APP_REPORT_001 — Align the app with the 9 September rules

Change request: `handoffs/CHANGE_REQUEST_001_align_app_with_9Sep_rules.md`. Tier: **TOP**.

**Tier mismatch to flag**: this session ran on Claude Sonnet 5, not Fable 5.1 or Opus 5
(`00_AGENT_ROUTING.md` v1 section 4 maps TOP → Fable 5.1/Opus 5 for Claude). Flagging per
`CLAUDE.md`'s instruction to state a mismatch before touching code; the athlete/Cowork
should decide whether this change needs a redo on the TOP model.

**Push/PR blocker**: this session has no GitHub credentials configured (`git push` fails
with "could not read Username for 'https://github.com': Device not configured"). All work
below is committed locally on branch `cr-001-align-with-9sep-rules` but **could not be
pushed and no pull request could be opened**. This does not match the coder-worker model in
`04_App_handoffs/agent/AGENT_coder_worker.md` (credential injected by a cloud workspace);
this was a local Claude Code session on the athlete's machine instead. Someone with push
access needs to push the branch (and open the PR) from a session that has it, or the
athlete needs to connect this local repo to a GitHub credential.

## A. Session types — before/after (`src/coach/types.ts`)

```diff
 export type SessionKind =
   | 'crossfit_class'
-  | 'room_explosive_intervals'
-  | 'outdoor_explosive_intervals'
   | 'police_technique'
-  | 'police_balance_coordination'
+  | 'police_strength_transitions'
+  | 'police_integration'
+  | 'police_mock_test'
+  | 'trail_maintenance'
+  | 'trail_event'
   | 'running_intervals_exception'
-  | 'trail_event'
   | 'police_event';
```

`police_mock_test` is added to the type per the CR's "Session types available" list, but
nothing in the generator produces it yet: the exact-room gate (R-SEL-11) is not modelled.
Flagging as a gap, not guessing at the gate logic (out of scope).

## B. Recipes re-tagged, not deleted (`src/coach/recipes.ts`)

| Recipe key | Old kind (removed) | New kind | Why |
|---|---|---|---|
| `coordination` | `police_balance_coordination` | `police_technique` | Cockpit decision, 13 Sep: reused as Tuesday's fresh-skill session |
| `room` | `room_explosive_intervals` | `police_integration` | Its "micro-circuit police" block already links stations 1,2,4,5,6,7 (role D) |
| `outdoor` | `outdoor_explosive_intervals` | `police_strength_transitions` | Hard conditioning block (role C); not scheduled by the generator by default now (see D) |
| `week1Thu10Sep` | `room_explosive_intervals` | `police_strength_transitions` | Matches `WEEK_1_FINAL_2026-09-07_to_13.md` v3's own text verbatim ("Type: `police_strength_transitions`") |
| `week1Sat12Sep` | `trail_event` | `trail_maintenance` | Matches the same handoff verbatim ("Saturday 12 September — Trail run (`trail_maintenance`)") |
| `technique` | `police_technique` (unchanged) | `police_technique` | No longer scheduled by default (Tuesday now uses `coordination`); left as a library/bank recipe |

New recipe added: `trailMaintenance` (`trail-maintenance-v1`, kind `trail_maintenance`) for
the ordinary weekend run, distinct from `trailEvent` (the fixed 11 Oct race).

Two recipes gained a `memory` field to satisfy R-WS-12 (four exposures per week, modules
A-D): `crossfit` (module B, grounded in the official station-3 rule already in
`docs/police-v1/examples/police-stations.json`) and `outdoor` (module C, fatigued recall,
reusing the exact 5→6 alternation text already established in the `technique` recipe). No
new sporting facts were invented.

## C. Weekly template (`src/coach/planner.ts`, `sessionsForWeek`)

Before: Mon crossfit, Tue coordination, Wed room (hard), Fri outdoor (the only run, unless
race week), Sat technique. No weekend trail run outside race week.

After, for any ordinary week from 14 September on: Mon crossfit, Tue `police_technique`
(coordination), Wed `police_integration` (room), Fri `police_strength_transitions`
(outdoor), weekend `trail_maintenance` (new recipe) — 5 principal sessions, 2 empty days
(R-WS-01), exactly one run (R-WS-03), three distinct police kinds (R-WS-07). Race week
(5-11 Oct) keeps the three police sessions and replaces the weekend run with the fixed
`trail_event` on 11 Oct, no sixth day (R-WS-06). The taper week (16-20 Nov) keeps its
existing behaviour (drop the two hard police sessions before the fixed `police_event`),
kind names only updated.

`validateWeek` now checks R-WS-01, 02, 03 (incl. weekday), 06, 07, 08, 10, 11 and 13 (was:
only the run count, the 5-session count, CrossFit presence, and adjacent-hard days). A new
`countMemoryExposures` export checks R-WS-12 (tested, not folded into `validateWeek`'s error
list since it is informational rather than a hard failure mode today).

**R-WS-05 (distance progression) is not automated.** The `trailMaintenance` recipe states
the 7-8 km → 12 km / 450 m D+ bound as guidance text, matching how Week 1's Saturday entry
is already static text with no numeric progression system elsewhere in the codebase. Full
week-to-week automatic progression would be new scope; flagging rather than guessing at an
algorithm.

**R-WS-09 (short HIIT block the day before the run / after a hard CrossFit)** is not
implemented: it requires the HIIT-block composition CR-002 is scoped to build. Not attempted
here (explicitly out of scope: "HIIT block rules R-WS-16/17/18 (CR-002)").

**Week 2 data**: no `WEEK_2_FINAL` exists in `handoffs/` (checked Drive `03_Weekly_plans/`
and the repo) at the time of this request, so no Week 2 override was added, per the CR's own
instruction ("if it does not exist at the time of this request, say so in the report").
Week 2 (2026-09-14) is generated from the ordinary template.

## D. Dead legacy code removed (flagged in `00_COCKPIT.md` v2.15, open items)

Removed: `src/domain/` (all files), `src/App.tsx`, `src/app/{AppContext,ErrorBoundary,
migrations,router,seed,version}.ts(x)`, `src/components/*`, `src/screens/*`,
`src/infrastructure/{storage,driveSync,screenshot}.ts`, `src/infrastructure/garmin/`,
`src/infrastructure/AGENTS.md`, `src/data/swiss-trails.generated.json`, `src/styles.css`.
None of this was reachable from `src/main.tsx` → `CoachConcoursApp.tsx` (confirmed by
import-graph search before deleting; `src/__tests__/sanitation.test.ts` already documented
this in a comment). One live dependency on the dead tree existed:
`src/infrastructure/googleIdentity.ts` imported the `GoogleAccount` type from
`../domain/types`; that interface is now declared locally in `googleIdentity.ts` instead.

`scripts/validate-repository.mjs`'s `requiredFiles` list referenced three of the deleted
files (`src/domain/planEngine.ts`, `planUpdates.ts`, `src/infrastructure/driveSync.ts`) plus
`CODEX_START_HERE.md` and `PLANS.md`, which have not existed in the repository since before
CR-004 (that CR's own `deploy.yml` comment says as much, which is why `validate:repository`
is not run in CI). Updated the list to files that actually exist, including the new
`CLAUDE.md`.

## E. AGENTS.md renamed (CR text: "renamed from Trail Coach to Coach Concours")

Rewrote `AGENTS.md` for Coach Concours (mission, invariants, read order, commands,
prohibitions, definition of done); it now points to `CLAUDE.md` as the short
per-run house rules file. Also committed `CLAUDE.md` at the repository root, copied
verbatim from Drive `04_App_handoffs/agent/CLAUDE.md`, per the cockpit's "next worker
(with CR-001)" open item.

**Not touched, flagged as a separate gap**: `README.md` is still entirely about the old
"Trail Coach" trail-planning app (SwissMobile catalogue, Garmin bridge, `docs/` files that
may no longer exist) and the root `CODEX_POLICE_V1_*.md` / `CODEX_START_HERE_2026-09-10.md`
/ `HANDOFF_README_upload.md` files are stale leftovers from the abandoned Codex-based coder
model. Neither was named in this CR's scope ("AGENTS.md (or equivalent)" was read narrowly
as AGENTS.md itself); rewriting the README is a good candidate for its own change request.

## F. Tests added/changed

- `src/__tests__/weeklyShape.test.ts` (new): one test per hard rule R-WS-01, 02, 03, 04, 07,
  08, 10, 12, 13, 14 on a generic week (2026-09-14), plus R-WS-06 (race week) and R-WS-15
  (Week 1 exemption, and the taper week's existing special case).
- `src/__tests__/week1.test.ts`: kind expectations updated for Thursday
  (`police_strength_transitions`) and Saturday (`trail_maintenance`) to match
  `WEEK_1_FINAL_2026-09-07_to_13.md` v3's own wording; no other behaviour change.
- `src/__tests__/sanitation.test.ts`: comment updated to record that the dead code it
  described is now deleted.
- `docs/police-v1/examples/police-stations.json` / `src/__tests__/stations.test.ts`:
  unchanged — already matched the official 11-station order, the 5-out/4-back rule and the
  three colour mappings before this change request (test already existed and passes
  conceptually against unchanged data).

## G. Verification — could not run locally

**No Node.js/pnpm is installed in this session** (same situation CR-009's worker reported:
"the worker had no Node, so CI is the gate"). `pnpm typecheck`, `pnpm test`, `pnpm build`
and `pnpm run validate:schemas` were **not run**. I re-read every changed file by hand for
type and reference errors (brace/paren balance checked programmatically for `planner.ts`)
and traced every cross-file reference to the renamed/removed kinds and deleted files before
committing, but this is not a substitute for the CI run. **The Actions run on the pull
request (once someone can open it) is the real gate for this change request**, same as it
was for CR-009.

## H. Files touched

Modified: `AGENTS.md`, `scripts/validate-repository.mjs`, `src/coach/{planner,recipes,
types}.ts`, `src/infrastructure/googleIdentity.ts`, `src/__tests__/{sanitation,week1}.test.ts`.
Added: `CLAUDE.md`, `handoffs/CHANGE_REQUEST_001_align_app_with_9Sep_rules.md`,
`src/__tests__/weeklyShape.test.ts`. Deleted: see section D.

## Commit and tag

Commit hash: filled in after commit (see the branch `cr-001-align-with-9sep-rules`). Tag
`cr-001` is set on the merge commit once the athlete presses Merge — not by this session,
and not yet applicable since the branch has not been pushed (section header "Push/PR
blocker").
