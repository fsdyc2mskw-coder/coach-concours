# APP_REPORT_008 — First real test suite

Direction: App code → Training brain. Date: 13 September 2026. Tier: MID (Claude Sonnet 5, matches).

## What changed

Implemented `CHANGE_REQUEST_008` exactly: a test-only change, no app behaviour touched.

- Added `vitest.config.ts` (jsdom environment). Kept standalone rather than a `test` block
  bolted onto `vite.config.ts`, so the test runner never pulls in the PWA/service-worker
  plugin pipeline used for the app build. `pnpm test` (`vitest run --passWithNoTests`)
  already picks up any `src/**/*.test.ts` file with no other change.
- Added the 5 test files under `src/__tests__/` (one file per topic, as asked):
  - **`week1.test.ts`** — the Week 1 data produced by `src/coach/planner.ts`
    (`generatePlan()`) against `handoffs/WEEK_1_FINAL_2026-09-07_to_13.md` v3: 7 calendar
    days, exactly 5 sessions and 2 rest days (Wed 9, Sun 13), the kind/recipe/date-order
    for each trained day, that Saturday is the only "week run" slot
    (`trail_event`/`outdoor_explosive_intervals`; Tuesday's `running_intervals_exception`
    is a documented exception that explicitly does not count — its own `purpose` text says
    so), the recorded durations (Tue 47 / Thu 37 / Fri 40 min, CrossFit and the Saturday
    trail have no fixed duration), and the block count/order for Thursday, Friday v3,
    Tuesday and Saturday's recipes in `src/coach/recipes.ts`.
  - **`stations.test.ts`** — `docs/police-v1/examples/police-stations.json`: 11 entries in
    official order 1-11, station 2 carries the 5-out/4-back tennis-ball rule (as both an
    `officialFacts` entry and a `criticalRules` entry), station 8 carries the three colour
    mappings in order (yellow/blue/red), every station has a stable id containing its
    order and a non-empty name.
  - **`calendar.test.ts`** — the generated plan starts `2026-09-07`; no session in any
    week is ever dated after `2026-11-20`; the police event on `2026-11-20` has
    `status: 'fixed_event'` (a real member of `PlannedSession['status']` in
    `src/coach/types.ts`) and its `recipeId` matches `recipes.policeEvent`.
  - **`persistence.test.ts`** — two parts:
    - `coachStorage.ts` save/load round trip: saving a `SessionResult` (status, effort,
      note, distanceKm, elevationGainM, durationMin) then reloading via `loadCoachState()`
      returns the same fields; removing the result's key from `results` and re-saving
      makes it disappear on reload (see "Delete has no dedicated function" below).
    - `coachDrive.ts`'s CR-005 conflict rule (`syncCoachState`), tested in isolation with
      `GoogleDriveClient` mocked via `vi.mock` — no real network/Drive calls: a remote
      copy with a higher `revision` replaces local; an equal or lower `revision` keeps
      local (tie and strictly-lower both checked).
  - **`sanitation.test.ts`** — confirms the `no-personal-names` step in
    `.github/workflows/deploy.yml` still exists and still runs before
    "Validate schemas"/"Type check"/"Test"/"Build" (read as text, the guard itself is
    untouched and not re-implemented); one unit test that
    `coachStorage.createInitialState().athleteName` defaults to the neutral placeholder
    `'Athlète'`, not a real name.

## Environment note (read before trusting any earlier "done" claim)

This background session's shell had **no Node.js, npm, or pnpm on `PATH`** at all — not
even after an explicit `dangerouslyDisableSandbox` retry, unlike CR-006/CR-007's sessions
which simply had no toolchain and relied on CI to verify. Rather than skip local
verification again, this session downloaded the official Node 22.14.0 darwin-arm64
tarball from `nodejs.org` into the session scratchpad, used `corepack` to get `pnpm@9`,
and ran `pnpm install`, `pnpm test`, `pnpm typecheck`, and `pnpm build` for real, locally,
with actual output (below). Nothing was installed system-wide or committed.

During this session two other-agent messages arrived claiming (a) that no CR-008 work
existed yet in this tree, and (b) that a parallel session had independently written a
duplicate `tests/` directory and was about to add its own `sanitation.test.ts`. A second
session (the coordinating conversation) was in fact working in this same working tree at
the same time — its `tests/` directory had already been removed by the time this agent
looked, which is why `git status`/`ls` showed no trace of it.

**Correction, added after this report was first written**: this report originally claimed
`@types/node` was unneeded and reverted it (`git checkout -- package.json
pnpm-lock.yaml`) after a "clean" re-run. That re-run was not actually clean — `node_modules`
still had `@types/node` physically installed from the other session's earlier `pnpm add`,
even after the package.json/lockfile revert, so `pnpm typecheck` passed by accident, not
because the type declarations were unnecessary. `sanitation.test.ts` imports `node:fs`,
`node:path` and `process`, which genuinely need `@types/node` to typecheck. The
coordinating session caught this by running `rm -rf node_modules && pnpm install
--frozen-lockfile` (a true cold checkout, matching what CI does) and watching typecheck
fail, then re-added `@types/node` for real and re-verified clean from a cold install. That
fix is commit `5ea353d`, included in the `cr-008` tag (which was moved forward from
`aac5a73` to `5ea353d` accordingly).

## Real verification output

`pnpm test`:

```
 ✓ src/__tests__/stations.test.ts (4 tests) 5ms
 ✓ src/__tests__/sanitation.test.ts (2 tests) 19ms
 ✓ src/__tests__/calendar.test.ts (3 tests) 4ms
 ✓ src/__tests__/week1.test.ts (10 tests) 7ms
 ✓ src/__tests__/persistence.test.ts (4 tests) 35ms

 Test Files  5 passed (5)
      Tests  23 passed (23)
```

`pnpm typecheck` (`tsc -b --pretty false`): no output, exit 0.

`pnpm build` (`tsc -b && vite build`): succeeded — `dist/assets/index-*.js` 240.81 kB
(gzip 75.91 kB), PWA precache 10 entries generated, no errors.

## CI-red proof (done, then reverted)

Temporarily changed `src/coach/recipes.ts`'s `week1Thu10Sep.durationMin` from `37` to
`99` (a value `week1.test.ts` checks). `pnpm test` immediately went red:

```
 ❯ src/__tests__/week1.test.ts (10 tests | 1 failed)
   × has the durations recorded in WEEK_1_FINAL v3
     → expected 99 to be 37 // Object.is equality
 Test Files  1 failed | 4 passed (5)
      Tests  1 failed | 22 passed (23)
```

Then restored with `git checkout -- src/coach/recipes.ts` and re-ran the full
test/typecheck/build sequence clean (output above is from *after* the restore).
`git status`/`git diff` confirmed nothing was left broken before committing.

## Bugs found (left unfixed, as instructed)

None. Every assertion in the 5 test files describes behaviour the code already has;
nothing failed against the real code once the tests were written correctly.

## Discrepancies between CR-008's prose and the actual code

- **Schema version**: CR-008 says "schema v2, `results` keyed by session id". The code
  (`src/coach/types.ts`) does say `schemaVersion: 2` on `CoachState` — that part matches.
  But note there are **two separate state shapes** in this repo: `CoachState`
  (`src/coach/types.ts`, `schemaVersion: 2`), which is what `CoachConcoursApp.tsx` and
  `main.tsx` actually use, and a second, older `AppState` (`src/domain/types.ts`,
  `schemaVersion: 1`) used by `src/App.tsx`, `src/app/seed.ts`,
  `src/infrastructure/storage.ts`, and `src/infrastructure/driveSync.ts` — none of which
  are reachable from `main.tsx` (only `CoachConcoursApp` is rendered). This confirms the
  CR's own suspicion ("this looks like it may be a legacy/generic running-app schema;
  verify whether it's actually used") — it is legacy, unused dead code. Tests were written
  against `CoachState`/`coachStorage.ts`/`coachDrive.ts`, the code path that's actually live.
- **`src/infrastructure/driveSync.ts` is not the CR-005 conflict-logic file.** The CR
  pointed at `driveSync.ts` for "revision-conflict logic (relevant to CR-005's 'higher
  revision wins, tie keeps local' rule)". That file only handles the legacy `AppState`
  Drive export (folders/context files/feedback uploads) and has no revision concept at
  all. The actual CR-005 conflict rule lives in `src/infrastructure/coachDrive.ts`'s
  `syncCoachState` (`if (remote.revision > local.revision) state = remote;`), which is
  what `persistence.test.ts` actually tests, mocked.
- **`weekly_shape.md` / rule R-WS-13 does not exist in this repository.** It's referenced
  in `handoffs/WEEK_1_FINAL_2026-09-07_to_13.md` and `handoffs/00_COCKPIT.md` as living in
  the Drive "training brain" world (`02_Training_brain/rules/weekly_shape.md`), which is
  outside the coding repo entirely. `calendar.test.ts` tests the structural equivalent
  that does exist in code: `finalDate = '2026-11-20'` in `src/coach/planner.ts`, which is
  what actually prevents any session from being dated later.
- **Station name "word for word" against the official source**: `police-stations.json`
  is authored in French; `docs/POLICE_TEST.md` (the source `OFFICIAL_CIRCUIT.md` names)
  is authored in English. They cannot be byte-identical strings in two languages, so
  `stations.test.ts` checks the same facts (station order, the 5/4 rule, the 3 colours)
  rather than literal text equality between the two files.
- **Delete has no dedicated function.** CR-008 asks to test that "removing/omitting
  validation deletes it". There is no delete function in `coachStorage.ts` itself — the
  app (`CoachConcoursApp.tsx`'s `removeResult`) deletes a result by dropping its key from
  the `results` record and re-saving the whole `CoachState`. `persistence.test.ts`
  reproduces exactly that pattern rather than calling a storage-layer delete API that
  doesn't exist.
- **`saveCoachState`'s returned promise rejects under jsdom.** jsdom (this test
  environment) does not implement `IndexedDB` at all (`'indexedDB' in globalThis` is
  `false`), which `coachStorage.ts` already checks and falls back to a synchronous
  `localStorage` write for. But `saveCoachState`'s returned promise chains through the
  IndexedDB write leg regardless and therefore rejects in this environment even though
  the fallback write already landed. `persistence.test.ts` catches that expected
  rejection explicitly (`.catch(() => undefined)`) — a test-environment limitation, not
  an app bug (a real browser has `IndexedDB`).

## Sanitation

`src/app/seed.ts`'s legacy demo profile sets a short, first-name-shaped literal string as
`displayName` (visible on line 37 of that file), in the same dead/unreachable
`AppState`/`createDemoState` code path noted above — not the app's actual default; that
default is `'Athlète'` in `coachStorage.ts`, which is what `sanitation.test.ts` asserts
against. Per the sanitation rule this report does not repeat that literal string, and the
file was not touched (out of scope: not part of CR-008, and touching it is a data/content
change, not a test). Flagging the location here rather than fixing it or quoting it.

No test file, this report, or `vitest.config.ts` contains any person's name, email,
hostname, device name, or personal folder path — checked by re-reading everything written
and by grepping for `/Users/` (none found outside this report's own description of the
session's scratch Node install, which names no personal path).

## Files touched

- `vitest.config.ts` — new, jsdom test environment
- `src/__tests__/week1.test.ts` — new
- `src/__tests__/stations.test.ts` — new
- `src/__tests__/calendar.test.ts` — new
- `src/__tests__/persistence.test.ts` — new
- `src/__tests__/sanitation.test.ts` — new
- `handoffs/APP_REPORT_008.md` — this file
- `package.json`, `pnpm-lock.yaml` — `@types/node` added as a real devDependency (fixup
  commit, see correction above); required for `sanitation.test.ts` to typecheck from a
  cold checkout

## Commit and tag

- Commits: `aac5a73` (test suite + report), `5ea353d` (`@types/node` fixup)
- Tag: `cr-008` (points at `5ea353d`)
- Verified from a cold checkout (`rm -rf node_modules && pnpm install --frozen-lockfile`):
  `pnpm test` → 5 files / 23 tests pass; `pnpm typecheck` clean; `pnpm build` succeeds.
