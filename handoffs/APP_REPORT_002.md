# APP_REPORT_002 — one hiit block per police session

Tier stated: **TOP** (matches the CR-002 header; this session ran on the model assigned to
that tier, see `00_AGENT_ROUTING.md`).

## A. What changed (`src/coach/types.ts`, `src/coach/recipes.ts`, `src/coach/planner.ts`)

`ExerciseBlock` gets an optional `hiit?: { format, durationMin }` field (`HiitFormat` =
`'amrap' | 'emom' | 'intervals' | 'for_time' | 'chipper'`). Four existing blocks are tagged
with it, duration read off text already in the recipe, nothing invented:

| Recipe | Block | format | durationMin | Where the number comes from |
|---|---|---|---|---|
| `room` (police_integration, Wed) | "Micro-circuit police — 4 tours" | intervals | 10 | 4 tours × (10+10+10-20 s work + 120 s recovery) ≈ 600-640 s |
| `outdoor` (police_strength_transitions, Fri) | "6 × 20 s vite / 80 s facile" | intervals | 10 | 6 × (20+80) s = 600 s exactly |
| `week1Thu10Sep` | "Conditioning EMOM — 10 min" | emom | 10 | already in the title |
| `week1Fri11Sep` | "AMRAP 10 min" | amrap | 10 | already in the title |

`validateWeek` (`planner.ts`) gains three checks, skipped for Week 1 exactly the way the
existing R-WS-07 check already is (R-WS-15):

- **R-WS-16**: every `police_technique` / `police_strength_transitions` / `police_integration`
  / `police_mock_test` session has exactly one tagged hiit block.
- **R-WS-17**: in `police_technique`, that block is ≤ 10 min and is the recipe's last block
  (before the cool-down text).
- **R-WS-18**: in `police_strength_transitions` / `police_integration`, that block is 10-20 min.

A fourth check, not tied to `isWeek1`, covers the structural half of R-WS-09: the police
session scheduled the day before the week's run (`trail_maintenance` or `trail_event`) must
keep its hiit block ≤ 10 min. With the current fixed weekly template this is Friday
(`outdoor`), already at 10 min, so it passes without any content change.

A new exported function, `hiitShortFormNotes(week, results)`, covers the other half of
R-WS-09 — the day after a CrossFit class recorded with effort 4-5. The recipe library is
static French text, so the engine cannot shorten a block by itself; this returns an
adaptation note (same pattern as the existing `adaptCurrentWeek`/`adaptFromPreviousWeek`
`volumeFactor`/`adaptationNote` mechanism) rather than silently rewriting content. It is not
wired into `validateWeek` (which has no `results` parameter and is not called from the UI
today — `grep` confirms `CoachConcoursApp.tsx` never calls it) or into the UI; it is exported
and tested so Cowork/the UI layer can call it once there is a place to show the note.

`recipes.ts` also gains `memoryPromptsAskingToExplain()`, a direct scan of every recipe's
`memory.prompt` for "explain"/"expliquer" (R-WS-16's neighbouring memory-block rule, restated
in the CR). It returns none today.

## B. Question for the athlete/Cowork, not decided here: `coordination` has no hiit block

`coordination` (`police_technique`, scheduled every Tuesday by the generic template) has
three blocks — colours/ball, balance/transfer, rope — and none of them is AMRAP/EMOM/
intervals/for-time/chipper. R-WS-16 requires exactly one. This is real, not a validator bug:
`validateWeek` on a generic week (e.g. 2026-09-14) now returns exactly one error, naming this
session, and the same is true of every other week that reuses `coordination` (checked
2026-09-21 and the race week 2026-10-05 as well).

I did not add a HIIT block to `coordination` myself — the CR's "Out of scope" section puts
"card library content" outside this change request, and picking a drill, its reps, its
duration and its equipment is exactly a sporting decision, which CLAUDE.md tells me to
surface here rather than decide. The two tests that used to assert
`validateWeek(genericWeek)` / `validateWeek(raceWeek)` returned no errors at all now assert
they return exactly this one error, naming R-WS-16, so the test suite documents the gap
rather than silently passing over it or silently failing on it.

**Open question**: does `coordination` get a short (≤ 10 min, last-before-cool-down) hiit
block added to its existing three, in a future card-content pass, or is Tuesday meant to stay
a HIIT-free technique day with `police_technique` itself exempted from R-WS-16 for that one
recipe? The CR's own "Why" section only names Friday as "the first session built this way,"
which reads as forward-looking rather than a retroactive requirement on every existing
recipe — but `weekly_shape.md` v2's R-WS-16 wording ("every police session … contains exactly
one hiit block") does not carve out an exception. Whichever way this is decided, it is a
one-line change to `recipes.ts` (add a tagged block, or add a documented exemption) once the
drill itself is chosen.

## C. Question for the athlete/Cowork, not decided here: the dose-from-recorded-capacity rule

The CR's "Expected behaviour" and its own "Tests that must pass" both describe a rule this
codebase's actual architecture cannot express today: "when a previous result exists for the
same card, the next prescription starts from that recorded completion … when no result
exists, the card's lower bound is used." CR-001 (the change request this one is ordered
after) removed `src/domain/planEngine.ts` and the rest of the card-based engine — there is no
`card` type with a `quality` tag or lower/upper `bounds` left in the codebase; `SessionResult`
records free-form numeric fields per Week 1 (`amrapRounds`, `racketDropsR1`, …), not a
generic "recorded completion for this hiit block" value tied back to a card id. Building that
generic dose-tracking model is itself an engine-architecture decision bigger than this CR's
stated scope ("Adaptation rules beyond the dose start rule above" is explicitly out of
scope, and the dose-start rule itself needs the card/bounds model as a prerequisite). I have
not built it and have not tried to fake it with Week-1-shaped fields. The corresponding
checklist item ("first HIIT dose of a card with no result == card lower bound") is not
implemented or tested for the same reason — there is no card to test it against yet.

## D. Tests added/changed

`src/__tests__/weeklyShape.test.ts`:
- R-WS-16/18 on `room` (10-20 min band) and on `outdoor` (≤ 10 min, and structurally
  confirmed to sit the day before the week's run).
- R-WS-16/17 on `coordination`, documenting the known gap from section B (does not fail —
  asserts the absence, matching current reality).
- R-WS-17 on Week 1 Friday's AMRAP (exempt from the check, true anyway).
- Week 1 stays exempt from R-WS-16/17/18, same pattern as its existing R-WS-07 exemption.
- R-WS-16 re-checked on a second generic week (2026-09-21) so the rule is not accidentally
  specific to 2026-09-14.
- `hiitShortFormNotes` returns no note when the day-after session has no hiit block to
  shorten (must not throw or invent one).
- `memoryPromptsAskingToExplain()` returns none.
- The two pre-existing assertions `expect(validateWeek(genericWeek)).toHaveLength(0)` and
  `expect(validateWeek(raceWeek)).toHaveLength(0)` (from CR-001's R-WS-07 test) are updated
  to expect exactly the one R-WS-16 error from section B, with a comment pointing at this
  report — not weakened silently.

Item-by-item against the CR's own checklist:

- [x] every police session in any generated week has count(hiit) == 1 — **implemented as a
  check; currently fails for `coordination`, tracked by the updated tests, not silently
  hidden (section B)**
- [x] police_technique: hiit.duration_min ≤ 10 and hiit is the last block before cool-down
- [x] day before run → hiit.duration_min ≤ 10
- [x] interval block is not counted by the run counter (unchanged from CR-001; already
  covered by `weeklyShape.test.ts`'s R-WS-08 test, untouched here)
- [ ] first HIIT dose of a card with no result == card lower bound — **not implementable
  without the card/bounds model CR-001 removed; see section C**
- [x] Week 1 equality with `WEEK_1_FINAL` v3 — unchanged, still covered by `week1.test.ts`
  and `cr009.test.ts`; the new hiit tags on Thursday/Friday are additive metadata, not a
  content change
- [x] no memory prompt contains "explain" / "expliquer"

## E. Verification

**This coding session had no Node.js and no git-push credentials in its sandbox** — the same
gap `00_COCKPIT.md` recorded for CR-009 (decisions log, 14 Sep). `pnpm run check`
(`validate:repository`, `validate:schemas`, `typecheck`, `test`, `build`) was not run. The
change was checked by hand instead:

- every new/edited block of TypeScript was re-read in full after editing (`types.ts`,
  `recipes.ts`, `planner.ts`, `weeklyShape.test.ts`);
- the new `ExerciseBlock.hiit` field is optional and additive — grepped `CoachConcoursApp.tsx`
  for exhaustive block-shape rendering or destructuring and found none (`block.title`,
  `block.faire`, `block.regle/noter/details/stationMappings` are read individually, nothing
  spreads or `toEqual`s the whole object), and grepped the other test files for the same;
- traced `sessionsForWeek`/`week1Override` by hand against every new `validateWeek` branch
  for the specific weeks the new tests use (2026-09-07, 2026-09-14, 2026-09-21, 2026-10-05,
  2026-11-16) to confirm the day-before-run lookup and the R-WS-16/17/18 loop produce the
  error counts the tests assert;
- confirmed no JSON schema in `schemas/` constrains `ExerciseBlock`'s shape (they validate
  `feedback`/`plan-update`/`app-export` payloads, unrelated to `SessionRecipe`).

None of this replaces a real `pnpm run check`. **Please run it on a real checkout before
merging** (or push the branch and let CI run it, the same recovery CR-009 used).

## F. Files touched

Modified: `src/coach/types.ts`, `src/coach/recipes.ts`, `src/coach/planner.ts`,
`src/__tests__/weeklyShape.test.ts`.
Added: `handoffs/CHANGE_REQUEST_002_hiit_block_in_every_police_session.md` (this CR's own
copy, per the worker rule in `00_COCKPIT.md` §3), `handoffs/APP_REPORT_002.md` (this file).

## Commit and tag

Commit hash: `11734dd` (branch `cr-002-hiit-block-per-police-session`). Push/PR blocker: this
sandbox has no git push credentials (same gap as CR-009) — the branch is committed locally;
pushing it and opening the pull request needs to happen from an environment with push access
(GitHub Desktop, as CR-008/CR-009 did, or a session with credentials). Tag `cr-002` is set on
the merge commit once the athlete presses Merge, not by this session.
