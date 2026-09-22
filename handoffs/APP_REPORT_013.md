# APP_REPORT_013 — blocks, tails and the two session shapes as app data

Change request: `CHANGE_REQUEST_013_blocks_tails_sessions.md` (22 September 2026), **Tier: TOP**.
Coder session: Claude Code, running on Opus 5 — the model matches the TOP tier of
`00_AGENT_ROUTING.md`. Branch `cr-013-blocks-tails-sessions`. Pull request
`CR-013 blocks, tails and the two session shapes`. Not merged, not tagged.

The change request's own precedence rule was applied throughout: **where its prose and a
locked session file disagree, the locked session file wins.** Every place that happened is
listed under "Where the locked files overruled the prose" below.

---

## 1. What changed

### A. The session model

`src/coach/types.ts`

```ts
export type SessionShape = 'skill_session' | 'chain_session';
export type BlockKind = 'warmup' | 'memory' | 'fresh_reference'
  | 'skill_block' | 'chain_block' | 'cardio' | 'tail_b' | 'cooldown';
export type CardioFormat = 'emom' | 'amrap' | 'for_time';
```

- `skill_session` and `chain_session` are members of `SessionKind`, so a `PlannedSession`
  can carry them directly.
- **`police_mock_test` is deleted from the union entirely** (R-PC-04). It appears nowhere
  in the repository any more; a test asserts the string "mock" is absent from the whole
  recipe library.
- `police_technique`, `police_strength_transitions` and `police_integration` are removed
  **from the generator** from week 3 on, but stay in the union, because Week 1 is frozen as
  trained (R-WS-15) and its recipes carry those kinds verbatim. Their recipes stay in
  `recipes.ts` as bank entries the generator never schedules — the same treatment
  `recipes.technique` has had since CR-001.

`SkillBlock`, `ChainBlock`, `CardioBlock` and `TailB` are implemented with the change
request's own field names, as a discriminated union on `kind`, hung off `ExerciseBlock`
as an optional `spec`. `ExerciseBlock.kind` and `.spec` are optional so Week 1's frozen
recipes, the trail run and the Tuesday run intervals load and render unchanged, and
`schemaVersion` stays 2.

### B. The blocks and the rules

`src/coach/planner.ts` → `validateV4PoliceSessions()`, one check per line of the change
request's "Rules the generator must enforce" list, plus the rule-file rules behind them:

| Rule | Check |
|---|---|
| R-WS-07 | two police sessions, one of each shape, skill before chain |
| R-WS-12 | memory at index 1 (skill) / 2 (chain) of the full sequence, never last |
| R-WS-16 | exactly one cardio block; a chain block carries `kind: 'chain_block'` so it structurally cannot satisfy the count |
| R-WS-25 | skill block: one station, 1-2 drills, 16-20 min, first block after memory, station in no other block |
| R-WS-26 | no two scored drills share a score id inside a session |
| R-WS-28 | cardio atoms are never all station-0 fillers |
| R-WS-29 | cardio excludes the week's skill station, and any card flagged fresh-only |
| R-WS-30 | at most 3 cardio atoms |
| R-WS-31 | `cardio.target` is always `null` |
| R-WS-32 | 10 min in week 3, 12-15 min from week 4 |
| R-WS-34 | tail A 30-45 s, chain block `intensity: 'moderate'` |
| R-WS-35 | tail B is the only block after the cardio block, last before the cool-down, 4-5 minutes |
| R-WS-36 | neither tail uses the week's skill station |
| R-WS-37 | a session with any tail carries a fresh reference, before the first hard block, and tail B points at it |
| R-WS-38 | every tail carries a stop rule |
| R-WS-40 | M5 is never selected |
| R-PC-04 | no mock-test kind anywhere; no recipe text predicts an official circuit time |
| R-PC-05 | a chain block links two stations or more and describes its transition |

### C. Scores

`DrillScore { drillId, measure, value }`, stored per session id as
`SessionResult.drillScores`. Every drill of a skill block, a tail, a fresh reference and
(see below) a chain block carries its own `drillId`, `measure` and `scoreLabel`, so the
Retour tab renders one numeric field per drill automatically, grouped by block.

The cardio block gets exactly what the change request allows and nothing more:
`cardioValue` (rounds done, or minutes held) plus `cardioNote` free text, plus the effort
score that already existed. **No target is displayed anywhere.**

### D. Progression from the baseline

`src/coach/progression.ts`

- `cardioBaseline()` — the same session shape's recorded cardio number from the previous
  week, shown read-only beside this week's cardio block, with the words "Aucune cible."
  No target, no prediction, no coaching text.
- `freshToFatiguedGap()` — tail B's mean score minus the fresh reference's mean score, for
  the same session, plus the same gap per card so the board and the obstacles read apart.
  **Computed, never typed**: there is no gap field anywhere in `SessionResult`, and a test
  pins that. A shortened tail still produces a gap (R-WS-38: two minutes still count).
- `gapHistory()` — the gap week after week, oldest first, rendered on the Parcours screen.

### E. Week 3 as data

The two locked Drive sessions are seeded block for block, with their own doses:

```
SKILL SESSION   warmup 6 · memory 6 (M1+M2) · skill block 18 (poste 8, 2 cartes) ·
                cardio AMRAP 10 (slalom · espaliers · demi-burpees) · cooldown 5
CHAIN SESSION   warmup 6 · fresh reference 3 · memory 4 (M3) · chain block 12
                (3 tours, 90 s, postes 1→3, tail A 30 s) · cardio EMOM 10
                (carioca · jump squats · montées de genoux) · tail B 5 (4×1 min) · cooldown 5
```

Week 3's cardio is 10 min, below the 12-15 band on purpose, exactly as section E requires.

---

## 2. Files touched

| File | What |
|---|---|
| `src/coach/types.ts` | new types of section A/B/C; `ExerciseBlock.kind/spec`; `MemoryPrompt.module`; `SessionResult.drillScores/cardioValue/cardioNote`; `police_mock_test` deleted |
| `src/data/exerciseCards.ts` | **new** — the 18 cards of `00_INDEX.md` (22 Sep), with `freshOnly` |
| `src/coach/sessionShapes.ts` | **new** — the two shapes as data, and the readers the rules use |
| `src/coach/progression.ts` | **new** — cardio baseline and fresh-to-fatigued gap |
| `src/coach/planner.ts` | R-WS-07 v4 in the generator; `validateV4PoliceSessions`; adaptation retargeted to the chain session |
| `src/CoachConcoursApp.tsx` | icons for the two shapes; one score box per drill; the cardio number with its baseline; the gap on "Fait"; the gap history on "Parcours"; block screen lists what to record |
| `src/__tests__/cr013.test.ts` | **new** — 53 tests |
| `src/__tests__/weeklyShape.test.ts` | week 3 is no longer a v3 "odd week"; two tests re-pointed, nothing weakened |

Not touched, as the change request requires: the run-intervals progression (CR-011), the
Monday CrossFit class, the Drive sync layer, CR-014's day-move layer.

---

## 3. Verification

Run locally, in this session, on the branch, all three green:

```
pnpm typecheck   clean
pnpm test        12 files, 142 tests passed (89 before, 53 new)
pnpm build       built in 730 ms, PWA precache 10 entries
pnpm validate:schemas   OK on all three schemas
```

Every rule is tested twice: once on the real generated week (the rule holds) and once on
a fixture recipe mutated to break exactly that rule (the rule is actually enforced, not
merely satisfied by accident). A guard test asserts that an **unmutated** fixture week
produces zero errors, which is what makes every "is enforced" assertion meaningful.

The two session screens were rendered for real in the test harness (jsdom, the actual
`CoachConcoursApp` component, "today" fixed inside week 3): one score box per scored
drill of the chain session, the cardio minutes field, the baseline line, and an assertion
that no target-shaped word appears on the tab.

### What could NOT be verified here

- **The app was not opened in a browser in this session.** The coding environment had no
  Node.js, no pnpm and no `gh` on the PATH (the same gap the cockpit already records for
  CR-002 and CR-009). Node 22 was installed into the session's own scratchpad so that
  typecheck/test/build could be run for real — they were — but the browser pane could not
  reach a local dev server (the launcher's shell is denied `getcwd`, so neither `vite` nor
  a plain static server would start). The jsdom render test above is the substitute.
- **The branch was not pushed from this session.** There are no git push credentials here
  (`git push` → "could not read Username for 'https://github.com'"), no `gh` CLI, and the
  in-app browser is not signed in to GitHub; fetching works only because the repository is
  public. **The athlete pushed the branch from her own machine**, exactly as she did for
  CR-002, CR-009 and CR-011. CI then ran the three checks for real on the push. This is now
  the normal shape of a coder session, not a surprise: worth stating once in §7 of the
  cockpit rather than being rediscovered every time.
- **The deployed page** is the last line of the change request's test list. It can only be
  checked after the merge, since Pages rebuilds on push to `main`. Please check it then.
- `pnpm validate:repository` fails with 10 broken relative links in `README.md` and
  `docs/*.md`. **Pre-existing: it fails identically on `main`** (verified by stashing and
  checking out `main`), it is not a CI step, and fixing it is out of this CR's scope.
- `*.tsbuildinfo` is not in `.gitignore`, so `tsc -b` leaves two untracked files in the
  working tree. Pre-existing, left untracked, not committed, not fixed (out of scope).

---

## 4. Where the locked files overruled the prose

1. **"cardio: never contains a card flagged fresh only."** The card index's `state` column
   cannot be that flag: both locked sessions put `state: fresh` cards in their cardio
   blocks (slalom and wall bars in the skill session, carioca in the chain session). The
   locked files win, so `freshOnly` is implemented as its own field on the card, currently
   `false` on all 18 cards, and the rule is enforced and tested against a fixture. → **Q1**
2. **Section C lists the skill block, the tails and the fresh reference as the things that
   carry scores.** The locked chain session also scores the chain block itself ("SCORE:
   time per round · cones touched"). The locked file wins, so `ChainBlock` carries a
   `roundScores: DrillRef[]` field the change request's interface does not have.
3. **R-WS-12 says "four memory exposures per week, two in each police session."** The
   locked skill session has two modules (the 11 stations in order = M1, then the hoop
   colour line = M2); the locked chain session has one (transitions only = M3). Three, not
   four. The locked files win. → **Q4**
4. **`ChainBlock` has no duration for tail A**, but R-WS-34 fixes it at 30-45 s and the
   locked file writes 30 s, so `tailASeconds` was added to the interface rather than
   guessed at check time.

## 5. Substitutions and decisions that are not sporting

- **`warmup` and `cooldown` are listed in `BlockKind` but are not `ExerciseBlock`s here.**
  `SessionRecipe` has carried them as its own strings since CR-001 and CR-009/CR-010
  render them from there. `blockSequence()` re-inserts them at their real positions, so
  "memory at index 1 / index 2" is checked literally against the same 0-based sequence the
  locked files draw. No screen changed.
- **`CardRef` and `DrillRef` are named but never defined by the change request** (CR-012
  carries the card ids and has not landed in this repo). They are defined with the minimum
  the blocks need: `cardId`, `stationId`, `label`, and for a drill `drillId`, `measure`,
  `scoreLabel`. `drillId` is unique inside a session so the same card used twice (tail A
  and tail B both use `S11_racket_on_board`) keeps separate scores.
- **The v4 shapes start at week 3, not week 1.** `weekly_shape.md` v4 says "Week shape,
  from week 3 on", section E seeds week 3, week 1 is frozen (R-WS-15) and week 2 is
  already trained (R-WS-14: the record matches what was really done). Weeks 1 and 2 keep
  the v3 template and the v3 checks; weeks 3-11 use v4 exclusively.
- **Loads kept as they were**: the skill session takes the Thursday slot and the `low`
  load that `police_technique` had; the chain session takes the Friday slot and the `hard`
  load that the Friday police session had. Same days, same intensities, so R-WS-10/11 and
  CR-014's checker behave exactly as before. → **Q3**
- **The CrossFit-fatigue adaptation** (CR-001: cut the volume of the week's hard police
  session after a heavy Monday) was retargeted from the `room` recipe to the chain
  session, which now occupies that slot. Without this it would have gone silently dead.
- **R-WS-09 is dropped in v4** (it is in v4's "replaced" list and in none of its rule
  tables). `hiitShortFormNotes()` is kept but now only ever fires on weeks 1-2; its test
  was re-pointed, not deleted.

---

## 6. Sporting questions — for Cowork, not decided here

**Q1 — Which cards are "fresh only"?** R-WS-29 excludes them from a cardio block, but no
card in `00_INDEX.md` carries such a flag, and the index's `state: fresh` column cannot be
it (see §4.1). Today the flag is `false` on all 18 cards, so the rule is enforced but
never fires. Please say which cards carry it, or whether the rule means something else.

**Q2 — What is the cardio dose in weeks 4 to 11?** R-WS-32 gives the band (12-15 min) and
R-WS-33 requires the progression to be *visible* week after week, as volume and work
density. No input file gives a week-by-week table (unlike Tuesday's runs, which have
`run_intervals_progression.md`). Nothing was invented: every week from 4 on sits at 12 min,
the floor of the stated band. **As it stands the app satisfies R-WS-32 but not R-WS-33.**
A table like the run-intervals one would land in one constant
(`cardioDurationForWeek` in `sessionShapes.ts`).

**Q3 — Is the skill session still a "low" day?** It kept `police_technique`'s `low` load,
but its cardio block grew from a 6-minute rope EMOM to a 10-minute AMRAP (12 from week 4),
and the locked file itself counts "hard blocks: one". If it should now be `moderate`,
R-WS-11's soft adjacent-hard warning and CR-014's C1 flag both change behaviour on
Thursday/Friday. Your call.

**Q4 — Three memory modules a week or four?** See §4.3. R-WS-12 asks for four (two per
police session); the two locked files give three (M1+M2 in the skill session, M3 alone in
the chain session). The app follows the locked files. Should the chain session's 4-minute
memory block also carry M4, and if so with what prompt?

**Q5 — Which station, which drills, which score measures, in weeks 4 to 11?** This is the
biggest gap. The locked skill session says "Only the skill station and the cardio dose
change from week to week", and R-WS-27 asks for a rotation revisiting each station about
every three weeks. But no input file says *which* station in *which* week, and — the real
blocker — the score measures only exist for the cards the two locked sessions actually
use. Assigning a measure to, say, `S10_block_switch_fresh` would be inventing a sporting
decision, so it was not done. **Every week from 4 to 11 therefore repeats week 3's locked
skill content, on station 8.** `SKILL_FOCUS_BY_WEEK` in `sessionShapes.ts` is the single
constant a rotation table drops into. Only 4 of 11 stations are closed (1, 3, 10, 11) and
station 8's ledger box is still unticked, so the card library is the real bottleneck here,
as R-SEL-01 already says.

**Q6 — R-WS-08 versus `CardioFormat`.** R-WS-08 still says running intervals are one
allowed form of cardio block, but section A's `CardioFormat` is `'emom' | 'amrap' |
'for_time'` — no `intervals`. The change request's own type was implemented as written, so
a generated cardio block can no longer take a running-intervals form at all, and CR-014's
C4 flag ("police session with a running HIIT the day after the intervals") is now inert on
generated weeks. Should `CardioFormat` gain `'intervals'`, or should R-WS-08's clause go?

**Q7 — Does "one cardio block per session, always" really mean *every* session?** Taken
literally it binds the Monday CrossFit class (whose content the app never writes, R-WS-02),
Tuesday's run intervals and the weekend trail run — and R-WS-04 forbids any conditioning
finisher on a run. The rule is applied to the two police shapes only. Confirm.

**Q8 — Is the chain block's round time really a "drill"?** `round_time_s` and
`cones_touched` are measures of the round, not of one card. Each is anchored to
`S01_slalom_18m` (the card the round starts on) so it can be a `DrillRef` and get a score
box. If they should be session-level numbers instead, say so and they move.

---

## 7. Unrelated problems found, not fixed

- `pnpm validate:repository`: 10 broken relative links in `README.md`, `docs/CLAUDE_WORKFLOW.md`,
  `docs/STATUS.md`, `docs/TESTING.md`, `docs/index.md` (to `claude/COACH_PROMPT.md`,
  `LICENSE`, `NOTICE.md`, `VALIDATION_REPORT.md`). Pre-existing on `main`, not a CI step.
- `.gitignore` does not cover `*.tsbuildinfo`, so `tsc -b` leaves untracked files behind.
- The `src/app/seed.ts` sanitation finding from `APP_REPORT_008.md` is still open. It was
  not touched here; it is already item 2 of the cockpit's open list.

---

## 8. Commit

Branch `cr-013-blocks-tails-sessions`. The commit this report is about — everything under
§1, all the code and all the tests — is

**`54ebdbeb0ab8f324b8ec303efb273e6593f465b7`**

*CR-013: blocks, tails and the two session shapes as app data*

followed by two documentation-only commits that add and then correct this file.

The branch was pushed by the athlete (this session has no push credentials). The pull
request is titled **CR-013 blocks, tails and the two session shapes**; CI runs on it
(`no-personal-names`, validate schemas, typecheck, test, build), so the three checks in §3
are re-run for real on the push.

Not merged, not tagged, as the change request requires. The athlete merges, then publishes
the tag `cr-013` on the merge commit from the Releases page.
