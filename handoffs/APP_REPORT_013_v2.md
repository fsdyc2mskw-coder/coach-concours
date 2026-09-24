# APP_REPORT_013 v2: the season table in the app

Change request: `handoffs/CHANGE_REQUEST_013_blocks_tails_sessions.md` v2 (23 September 2026,
afternoon edition), copied from Drive `04_App_handoffs` because the repository had no copy of it.
Tier declared in the CR header: **TOP**. Run on Claude Opus 5.5, the TOP row of
`00_AGENT_ROUTING.md`. No mismatch to flag.
Branch `cr-013-v2-season-table`, cut from `origin/main` at `c9cc5db` (CR-017), with no upstream
set, so a plain `git push` cannot land on `main`. Nothing merged, nothing tagged.

## Done, and not done (the short version)

```
 DONE
 A  SEASON_PLAN, the table cell for cell; the four old constants are gone
 B  SKILL_BLOCKS 8 + 11 · CHAIN_BLOCKS locked + chain_A · TAILS racket + balance
    CARDIO_BY_WEEK 3 + 4 · reuse rule with "atomes à remplacer"
 C  power slot · memory module per week · recall check from W4 · weekend run km and hill
    sprints · week 11 taper on Wednesday 18 Nov · week bar reads `load`
 D  placeholderBlock(kind, label): no spec, no drill, no score box, "À construire dans Cowork"
 E  Q1 freshOnly removed, S00_broad_jumps / S01_hill_sprints / S09_balance_ladder added
    Q2 cardioMin column · Q3 skill session moderate · Q4 count-of-four dropped
    Q5 focus column + placeholders · Q6 C4 flag removed · Q7 and Q8 unchanged, as answered
 F  "samedi 11 oct." → "dimanche 11 oct."
    week 3 unchanged, string for string (tested)
    43 new tests, 206 in total, all green; typecheck and build pass

 NOT DONE
 ·  no pull request from this session: see "Delivery" at the end
 ·  no browser check: the preview server could not start (the sandbox refuses it access to the
    project folder); the four screen changes were rendered and read back in the jsdom harness
```

## 1. What changed

### A. `SEASON_PLAN` (`src/coach/sessionShapes.ts`)

The typed constant exactly as the change request writes it (`FocusStation`, `ChainKind`,
`TailSkill`, `SeasonWeek`), one row per week 3 to 11. Readers: `seasonWeek(n)` (null for weeks 1
and 2) and `focusStationOf(n)` (null for `W8_WORST` and `LIGHT`). The validator now reads the
focus station and the cardio dose from the table (R-SP-01), not from the skill block.

### B. Content as data

```
 SKILL_BLOCKS[8]        week 3's locked block, moved unchanged; week 6 reuses it (R-SP-05)
 SKILL_BLOCKS[11]       the week 4 racket block: board 7 min, walk 1, obstacles 10
 CHAIN_BLOCKS.locked    week 3
 CHAIN_BLOCKS.chain_A   slalom → walk → wall bars → walk → 5 hoops, 3 rounds, 90 s
 TAILS.racket           week 3's fresh reference, tail A and tail B
 TAILS.balance          S09: reference = min 2 + min 4 · tail A = min 3, 30 s, switch leg
                        · tail B = the 4 minutes, 20 s between · stop rule of the card
 CARDIO_BY_WEEK[3]      locked (AMRAP / EMOM 10)
 CARDIO_BY_WEEK[4]      AMRAP: slalom · wall bars · skipping
                        EMOM: carioca · skipping · 8 half burpees
 later weeks            reuse the last entry, drop focus-station atoms, list them in the
                        block's rule line "Atomes à remplacer dans Cowork : ..."
                        (EMOM keeps the empty minute as "atome à remplacer")
```

### C. The generator

```
 wk  skill block          chain block                     tails    cardio  power  memory
 3   8 (locked)           locked                          racket   10      -      locked
 4   11 racket            chain A                         balance  12      3      M1
 5   placeholder poste 10 placeholder "Enchaînement B"    balance  10 ¹    3      M2
 6   8 (week 3 block)     placeholder "Enchaînement B"    balance  12      3      M2
 7   placeholder poste 1  placeholder ghost 1 à 6         racket   13 ¹    5      M3
 8   placeholder poste 10 placeholder ghost 6 à 11        racket   15 ¹    5      M3
 9   placeholder (W8)     placeholder ghost 1 à 11        racket   15      5      M4
 10  placeholder (W8)     placeholder ghost 1 à 11        racket   12      5      M4
 11  taper Wed 18 Nov: M4 6 · "Passage fantôme au pas" 15 (placeholder) · cardio 6 · no tails
 ¹ "atomes à remplacer": W5 and W8 lose the skipping, W7 the slalom and the carioca
```

- **Power slot** (R-WS-41): the warm-up of both police sessions ends with "puis N sauts en
  longueur, réception tenue, retour en marchant". The warm-up grows by the season plan's own
  "about 2 min" (3 jumps) or "about 3 min" (5 jumps): 8 min in weeks 4 to 6, 9 min in 7 to 10.
  Week 4 gives 49 min per session, the plan's own "~49 min". Never scored.
- **Memory**: both police sessions carry the week's module (R-MM-05). From week 4 the skill
  session's memory block ends with the recall check, one scored drill `recall_errors`,
  "Erreurs de rappel sur 33" (R-MM-04). New validator lines for R-MM-04, R-MM-05, R-WS-41.
- **Weekend run** (weeks 4 to 10, not week 5): a per-week recipe with the table's distance;
  week 4 carries the plan's own text (about 250 m D+, no speed). From week 7 a last block
  "Côtes : N sprints de 8 à 10 s, retour en marchant" (kind `hill_sprints`), and the Retour tab
  asks "Sprints faits" only, stored in the existing `repsDone` field.
- **Week 11**: the skill session moves to Wednesday 18 November as "Séance d'affûtage"; no
  chain session; Thursday 19 is empty; Friday 20 is the unchanged police event.
- **Week bar**: five squares under the week header, `load` of them filled. Weeks 1 and 2 are not
  in the table and show none.
- **Loads**: skill session `moderate` from week 4.

### D. Placeholders

`placeholderBlock(kind, label, minutes?, stations?)`: the right `kind`, `placeholder: true`, no
`spec`, so no drill and no score box, the label in the title, the single line "À construire dans
Cowork." A placeholder skill block keeps its station in `stationMappings` when the table names
one, so "the skill block station equals focus" still reads. The validator accepts a placeholder
as the block (R-SP-06): it keeps the "first block after memory" check and skips the drill and
duration checks.

### E. Rules that changed shape

- **R-WS-25** now counts **cards**, not score boxes: the week 4 racket block (from the plan file,
  which wins for week 4) scores five numbers from two cards. The v1 test that said "at most two
  drills" now says "at most two cards"; the "third drill is flagged" test now adds a third card.
- **R-WS-29**: the fresh-only check and the `freshOnly` field are deleted; the station check stays.
  The v1 test for the fresh-only flag is replaced by "a skipping atom may appear".
- **R-WS-27** (new check): the skill block's station is the table's focus.
- **C4** (CR-014 checker) removed with its test; a test now asserts it never fires.
- **`countMemoryExposures`** removed with its test line (Q4).

## 2. Where I had to read the inputs

| # | Point | What the code does | Why |
|---|---|---|---|
| S1 | Week 3 skill session load | stays `low` | "week 3 must not change"; Q3 applied from week 4 (question 1) |
| S2 | Ghost circuit and chain B | placeholder, no rounds | R-SP-03 and CR section D beat "keep a normal chain block" (question 5) |
| S3 | Balance score | one number per minute, touchdowns + ball drops, measure `balance_faults` | the plan writes "touchdowns + drops per minute" (question 7) |
| S4 | Racket block scores | 5 numbers, see week 4 test | the plan's SCORE lines, one box each (question 8) |
| S5 | "atomes à remplacer" | shown only when an atom was actually removed | nothing to replace otherwise (question 6) |
| S6 | Warm-up length | 6 + 2 or 6 + 3 min | season plan "about 2 min / about 3 min" |
| S7 | Chain memory length with M4 | 4 min | `weekly_shape.md` v6 shape wins over M4's "about 6 min" (question 3) |

## 3. Sporting questions (for Cowork, none decided here)

1. **Week 3 skill session load.** Kept `low` because week 3 is locked. Should it read
   `moderate` like every later week?
2. **Taper session.** Load set `moderate` (Q3 applied). Its 6 min cardio reuses the week 4 AMRAP
   atoms (slalom, wall bars, skipping) by the reuse rule, and its memory block carries the recall
   check (R-MM-04 says every week from W4). Is a 6 min AMRAP of those three atoms right two days
   before the test, and should the recall check stay in week 11?
3. **M4 in the chain session.** M4 is "about 6 min"; the chain session's memory slot is 4 min.
   Kept 4. Confirm, or say which one gives way.
4. **Chain B starts in 11 days.** Weeks 5 and 6 show "Enchaînement B, à construire". Until it is
   written, the chain session has no rounds and **no tail A** (tail A lives inside the rounds,
   R-WS-34); the fresh reference, the cardio and tail B are all there. The same holds for the
   ghost circuit in weeks 7 to 10.
5. **Ghost circuit rendering.** `weekly_shape.md` v6 R-WS-42 and season note (b) say "the app
   keeps a normal chain block and labels it Circuit fantôme : à venir". R-SP-03 and the change
   request's section D say a placeholder never copies another week. The app shows the placeholder
   titled "Circuit fantôme : à venir, postes 1 à 6". If a "normal chain block" was meant, which one?
6. **Reused cardio atoms.** Weeks 6, 9, 10 and 11 reuse the week 4 atoms with nothing removed,
   so nothing is flagged. In weeks 9 and 10 the focus is `W8_WORST`, so no atom can be filtered
   and R-WS-29 cannot be checked until the week 8 review sets the station.
7. **Balance score.** One number per minute, touchdowns plus ball drops added together. Or two
   boxes per minute (eight in tail B)?
8. **Racket block score.** "Drops per 30 s" is one box (not one per set); the obstacle drops are
   three boxes (flat 1, obstacles, flat 2) for both sets together. Per set instead?
9. **Weeks 9 and 10.** Note (c) switches the tails to balance if the week 8 worst score is the
   racket. Both the station and that switch need a data-only version of this request after the
   week 8 review.

## 4. Found, not touched (out of scope)

- `src/coach/recipes.ts` run intervals: week 8's purpose still says "Re-test 1 km le samedi de
  cette semaine", while `season_plan.md` v2 says no test after the one baseline. The progression
  table file is not an input of this request.
- The balance fresh reference has two drills on the same card, so the per-card gap on "Fait"
  lists S09 twice, each against the mean of all four tail-B minutes. Readable, not ideal.
- `validate:repository` still reports the 10 broken README/docs links already present on `main`
  (not run in CI). `*.tsbuildinfo` still untracked. An untracked note file sits in the working
  folder and was left out of the commit.

## 5. Files touched

| File | What |
|---|---|
| `src/coach/sessionShapes.ts` | SEASON_PLAN, content tables, placeholders, generator, weekend run, taper |
| `src/coach/planner.ts` | table reads, week 11 Wednesday, weekend run, loads, validators |
| `src/coach/types.ts` | `hill_sprints` block kind, 3 measures, memory drills, `toReplace`, `placeholder` |
| `src/coach/weekChecker.ts` | C4 removed |
| `src/data/exerciseCards.ts` | index of 23 Sep, `freshOnly` removed, 3 cards added |
| `src/data/runIntervalsProgression.ts` | Sunday 11 Oct |
| `src/CoachConcoursApp.tsx`, `src/coach.css` | week bar, "Sprints faits" |
| `src/__tests__/cr013v2.test.ts` | new, 43 tests |
| `src/__tests__/cr013.test.ts`, `cr014.test.ts`, `weeklyShape.test.ts` | v1 tests re-pointed to the v2 rules (section 1E) |
| `handoffs/` | CR-013 v2, `WEEK_4_PLAN_2026-09-28.md`, `rules/` (season_plan v2, weekly_shape v6, memory_modules v2), `exercise_cards/` (00_INDEX, S00, S01, S09, S10 v2) |

## 6. Verification

```
 pnpm typecheck   (tsc -b)      clean
 pnpm test        (vitest run)  14 files, 206 tests passed (163 before, 43 new)
 pnpm build       (vite build)  built, PWA precache 10 entries
 validate:schemas               OK on all three schemas
```

## 7. Delivery

The commit is on the local branch `cr-013-v2-season-table`. Pushing the branch and opening the
pull request "CR-013 v2 season table" are the next steps; the session summary says whether they
happened. Merge and the tag `cr-013-v2` on the merge commit are the athlete's.

Commit: `35ac6d2bb9ec94976fc61a9976ca9204a4a36498`
