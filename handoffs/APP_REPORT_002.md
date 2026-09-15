# APP_REPORT_002 — one hiit block per police session

Tier stated: **TOP** (matches the CR-002 header; this session ran on the model assigned to
that tier, see `00_AGENT_ROUTING.md`).

## A. What changed (`src/coach/types.ts`, `src/coach/recipes.ts`, `src/coach/planner.ts`)

`ExerciseBlock` gets an optional `hiit?: { format, durationMin }` field (`HiitFormat` =
`'amrap' | 'emom' | 'intervals' | 'for_time' | 'chipper'`). Five blocks are tagged with it:

| Recipe | Block | format | durationMin | Where the number comes from |
|---|---|---|---|---|
| `coordination` (police_technique, Tue) | "Corde EMOM — 6 min" | emom | 6 | **new block, added per the athlete's decision below** |
| `room` (police_integration, Wed) | "Micro-circuit police — 4 tours" | intervals | 10 | 4 tours × (10+10+10-20 s work + 120 s recovery) ≈ 600-640 s |
| `outdoor` (police_strength_transitions, Fri) | "6 × 20 s vite / 80 s facile" | intervals | 10 | 6 × (20+80) s = 600 s exactly |
| `week1Thu10Sep` | "Conditioning EMOM — 10 min" | emom | 10 | already in the title |
| `week1Fri11Sep` | "AMRAP 10 min" | amrap | 10 | already in the title |

`validateWeek` (`planner.ts`) gains three checks, skipped only for Week 1 (R-WS-15), exactly
the way the existing R-WS-07 check already is:

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

## B. `coordination`'s hiit block — resolved by the athlete, not decided here

Reported in an earlier draft of this report: `coordination` (`police_technique`, Tuesday) had
no AMRAP/EMOM/intervals/for-time/chipper block, so it failed R-WS-16 on every week that
schedules it. I did not invent a drill myself and asked instead.

**The athlete's answer**: add the block, exactly as specified — a fourth block, "Corde EMOM —
6 min" (title normalised to the recipe file's existing " — X min" convention; the athlete
wrote "Corde EMOM 6 min"), placed last, before the cool-down:

- `faire`: "Chaque minute : 40 sauts freestyle, puis pas alternés jusqu'à la fin de la
  minute." (capitalised to match the recipe's sentence-case convention; wording otherwise
  unchanged from the instruction)
- no `regle`
- record field `emomMinutesCompleted` (integer 0-6), added to `SessionResult` in `types.ts`
- session `durationMin`: 40 → 46

This is a direct implementation of the athlete's own content decision, not a sporting
judgement made here. `coordination` now passes R-WS-16/17 like every other police session in
the generic template; the `hiit: 'pending'` escape hatch from the earlier draft (and its
`validateWeek` exemption) is removed as unnecessary.

## C. The dose-from-recorded-capacity rule — deferred, not decided here

The CR's "Expected behaviour" and its own "Tests that must pass" both describe a rule this
codebase's actual architecture cannot express today: "when a previous result exists for the
same card, the next prescription starts from that recorded completion … when no result
exists, the card's lower bound is used." CR-001 (the change request this one is ordered
after) removed `src/domain/planEngine.ts` and the rest of the card-based engine — there is no
`card` type with a `quality` tag or lower/upper `bounds` left in the codebase; `SessionResult`
records free-form numeric fields per Week 1 (`amrapRounds`, `racketDropsR1`, …, now also
`emomMinutesCompleted`), not a generic "recorded completion for this hiit block" value tied
back to a card id.

**Per the athlete's instruction, this rule is out of scope for CR-002 and deferred to the
future cards-and-adaptation request** (`00_COCKPIT.md`'s queue already lists "Level 2
feedback fields per card + adaptation rules (after ~25 cards)"). It is not built and not
faked with Week-1-shaped fields. The corresponding checklist item ("first HIIT dose of a card
with no result == card lower bound") is not implemented or tested for the same reason —
there is no card to test it against yet, and building the card/bounds model is itself an
engine-architecture decision that belongs to that later request.

## D. Tests added/changed

`src/__tests__/weeklyShape.test.ts`:
- R-WS-16/17 on `coordination`'s new "Corde EMOM — 6 min" block (last block, ≤ 10 min, no
  R-WS-16/17 error on the generic week).
- R-WS-16/18 on `room` (10-20 min band) and on `outdoor` (≤ 10 min, and structurally
  confirmed to sit the day before the week's run).
- R-WS-17 on Week 1 Friday's AMRAP (exempt from the check, true anyway).
- Week 1 stays exempt from R-WS-16/17/18, same pattern as its existing R-WS-07 exemption.
- A fixture test (the unused `technique` bank recipe, which genuinely has no hiit block)
  proves R-WS-16 still fails a real violation, now that every scheduled recipe complies.
- `hiitShortFormNotes` returns no note when the day-after session's hiit block is already
  ≤ 10 min (must not invent a shortening that isn't needed).
- `memoryPromptsAskingToExplain()` returns none.
- The two pre-existing R-WS-07 assertions (`validateWeek(genericWeek)`/`validateWeek(raceWeek)`
  → `toHaveLength(0)`) are unchanged in the end: `coordination`'s fix means no new error was
  ever needed there.

Item-by-item against the CR's own checklist:

- [x] every police session in any generated week has count(hiit) == 1
- [x] police_technique: hiit.duration_min ≤ 10 and hiit is the last block before cool-down
- [x] day before run → hiit.duration_min ≤ 10
- [x] interval block is not counted by the run counter (unchanged from CR-001; already
  covered by `weeklyShape.test.ts`'s R-WS-08 test, untouched here)
- [ ] first HIIT dose of a card with no result == card lower bound — **deferred to the cards
  and adaptation request, per the athlete's instruction; see section C**
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
  for the specific weeks the new tests use (2026-09-07, 2026-09-14, 2026-10-05, 2026-11-16)
  to confirm the day-before-run lookup and the R-WS-16/17/18 loop produce zero errors on the
  generic and race weeks and are skipped correctly for Week 1;
- confirmed no JSON schema in `schemas/` constrains `ExerciseBlock`'s or `SessionResult`'s
  shape (they validate `feedback`/`plan-update`/`app-export` payloads, unrelated to these
  internal types).

None of this replaces a real `pnpm run check`. **Please run it on a real checkout before
merging** (or let CI run it on the pushed branch, the same recovery CR-008/CR-009 used).

## F. Repository-root `CLAUDE.md`

Checked Drive `04_App_handoffs/agent/CLAUDE.md` (id `1OYzFoLa0dzNdl8q1yIKJsvf5mMDF95vU`)
against the repository's root `CLAUDE.md`: byte-identical. No change made — it was already
committed at the root (by CR-001).

## G. Tags `cr-005` and `cr-008`

`git ls-remote --tags origin` shows `cr-006`, `cr-007`, `cr-009` on origin but not `cr-005` or
`cr-008` — confirmed missing, as the athlete expected. Both commits exist in this branch's
local history (`e2f7559` "CR-005: Google Drive sync of the app state", `5ea353d` "CR-008
fixup: declare @types/node as a real devDependency"). **Not pushed by this session**: same
credential gap as the branch itself (section E) — `git push` fails with "could not read
Username for 'https://github.com'". Local tags are not even created yet, to avoid a stale
local tag diverging from whatever gets pushed; push both from an environment with credentials
with, e.g., `git push origin e2f7559:refs/tags/cr-005 5ea353d:refs/tags/cr-008`.

## Files touched

Modified: `src/coach/types.ts`, `src/coach/recipes.ts`, `src/coach/planner.ts`,
`src/__tests__/weeklyShape.test.ts`.
Added: `handoffs/CHANGE_REQUEST_002_hiit_block_in_every_police_session.md` (this CR's own
copy, per the worker rule in `00_COCKPIT.md` §3), `handoffs/APP_REPORT_002.md` (this file).

## Commit and tag

Commit hash: `4b2b398` (branch `cr-002-hiit-block-per-police-session`). Push/PR blocker: this
sandbox has no git push credentials (same gap as CR-009) for pushing the branch or the two
tags in section G — see this report's accompanying message for what still needs doing from an
environment with push access (GitHub Desktop, as CR-008/CR-009 did). Tag `cr-002` is set on
the merge commit once the athlete presses Merge, not by this session.
