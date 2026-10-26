# APP_REPORT_013 v7: week 8 (Kingston), KINGSTON 10 scored laps + station, the W9-W11 skeleton, Q1-Q13

<!-- template v2, 22 September 2026: sanitised, snapshot = commit hash, coder = Claude Code -->

Direction: **App code → Training brain.** Written by the coder (the athlete's Claude Code
session). Read in Cowork.

Change request: `handoffs/CHANGE_REQUEST_013_v7_week8_kingston.md` (25 October 2026), copied from
Drive `04_App_handoffs` with its inputs: `WEEK_8_FINAL_2026-10-26.md` (03), `rules/season_plan.md`
v5 and `rules/weekly_shape.md` v8 (identical to the repository copies), the DECISIONS file of
12 October (04), `exercise_cards/00_INDEX.md` of 25 October and the seven cards listed (02). Drive is
the source; nothing read from `90_Archive/`. In Drive the index is stored as `00_INDEX (1).md` (a
renamed upload, the only copy); it is copied here as `00_INDEX.md`. Cowork may want to fix the name.
Tier declared in the CR header: **TOP** (engine). Run on Claude Opus, effort high (raised at the
athlete's request before any code was written).
Branch `cr-013-v7-week8-kingston`, cut from `origin/main` at `ae62b62` (CR-021 merge) with no
upstream. Own session, not shared with CR-021. Nothing merged, nothing tagged, nothing pushed to `main`.

## Done

| Request item | Status | Where in the code |
|---|---|---|
| A. Week 8 row: Mon easy run · Tue skill + cardio · Wed strength + cardio · Thu intervals · Fri enchaînement · Sat cardio day · Sun trail | done | `sessionShapes.ts` (`SEASON_PLAN_V4[8]`) |
| A. Travel placeholders removed from week 8; the travel kinds stay in the union | done | `V4SessionKind` unchanged |
| A. Reuse existing kinds; Tue, Wed, Sat take the closest one, no new kind, no CrossFit kind | done | `skill_park` for all three (question 1) |
| A. Loads: Mon light · Tue to Sat hard · Sun trail day | done | new optional `V4Slot.load` (plan data, rebuilt at every start, never stored) |
| A. KEEP Q10 (marks silent on the planned week) | done | `weekChecker.ts` (see F) |
| A. KEEP drag any session to any day | done | CR-014 layer unchanged |
| A. KEEP the CR-018 cycle; no memory slot invented in week 8 | done | `NO_MEMORY_SLOT_WEEKS = [7, 8]`; cycle unchanged (question 3) |
| A. KEEP a week 8 result still attaches (ids `date:kind`) | see Known gaps | no week 8 session existed on main before Tue 27 |
| B. Week 8 content as data, block for block, French texts | done | `seasonV4.ts` (`buildWeek8Monday` … `buildWeek8Saturday`) |
| B. Warm-ups one line; daily line; phase label Q9 | done | `validateV4Week`; `SeasonWeekV4.phaseLabel` |
| B. Every 400 m / 800 m run "en extérieur", distance only | done | test: no pace, no km/h, no target |
| B. Card texts of the ladder and the rope as written | done | `KINGSTON_LADDER_*`, `ROPE_MIX_*`; the test reads section B of the CR and checks every line |
| C. New circuit score "laps + station at the cap", both entered together | done | `CircuitSpec.score = 'laps_and_station'`, `laps: null`; two number boxes |
| C. BORDEAUX 10 keeps "time OR station" | done | `score` absent = v6 shape; unchanged Retour rule |
| C. Enchaînement without fresh and fatigue tests, week 8 only (data flag) | done | `SessionRecipe.noGapTests` (screen data); validator refuses it outside week 8 |
| C. No GAP computed, nothing shown as missing | done | no `skill_test` block → `hasGapTests` false; no "Écart" line |
| C. KEEP the two-storm shape (W6, W10 Friday) | done | unchanged |
| D. Scores in `drillScores`, the suggested ids; no stored field | done | new measures only (see Score encoding) |
| E. W9-W11 skeleton: only the cells that differ | done | listed below |
| E. No session after Fri 20 Nov | done | test |
| F. Q1-Q13 | done | table below |
| Out of scope (persistence, CR-021, W9-W11 content, CR-019, CR-012) | untouched | |

## Cells changed in weeks 9 to 11 (section E)

| Week · day | Before (main `ae62b62`) | Now | Why |
|---|---|---|---|
| W9 Mon 2 Nov | no session | `travel_speed`, optional, named gap "Avant le vol · optionnel" | season_plan v5: "Mon 2 challenging if before the flight" (question 5) |
| W10 Tue 10 Nov | warm-up "15 min facile, puis 3 × 20 s d'accélérations progressives." | "Échauffement ~10 min (footing)" | Q4 |
| W11 Tue 17 Nov | same | "Échauffement ~10 min (footing)" | Q4 |
| W10 Fri 13 Nov (rematch) | memory RÈGLES 10 min with M4 | memory RÈGLES 4 min, no M4 | Q3 |
| W6 to W11 headers | v3 phase of the date ("Récupérer", "Intégrer", …) | Q9 labels | Q9 |
| W8 to W11 week card | no daily line (W8-W11) | the daily balance line | Q11 |

Every other cell of weeks 9 to 11 is as on main (same session ids, same recipe ids). W9 Tue, Wed and
Sun stay `easy_run` named gaps; W10 Wed and Thu and W11 Wed stay named gaps.

## The answers Q1-Q13 (section F)

| Q | Status |
|---|---|
| Q1 Tuesday repeat / advance rule OFF from W6 | already on main (the rule runs for weeks 2-5 only, CR-013 v5); test added |
| Q2 W10 low-lung dose at the W10 build | nothing to change; test pins the current 6 × 30 m |
| Q3 W10 rematch: memory 4 min, not M4 | done here (`memoryGameBlock` takes an `m4` override; the check R-MM-06 knows the rematch) |
| Q4 Tuesday warm-up one line | done for W10 and W11; W6 is locked and keeps its line |
| Q5 box jumps oui / non per storm | already on main (`storm1:` and `storm2:box_jumps_used`) |
| Q6 storm slalom S01_slalom_18m | already on main |
| Q7 push-ups = S00_push_up; WILL 10 burpees chest to the floor | done here: `S00_push_up` added to the cards and used as the atom of the W8 WODs. WILL 10 is only in W6-W7 (locked), so its text is unchanged |
| Q8 Friday hoops tests one "erreurs" per pass; Wednesday feet and hands apart | already on main |
| Q9 phase labels | done here: week header, journey timeline |
| Q10 three-hard-days marks silent on planned weeks | done here: the planned day of a session is the date in its id, so a run of three days that each held a hard session in the plan stays silent; a move that makes a new run shows the amber mark, never blocked. Also silences the "two hard days" mark inside such a planned run |
| Q11 daily line W6 to W11 | done here (W8-W11 added) |
| Q12 W9 easy runs side by side | nothing to change |
| Q13 W5 jumping jacks | nothing to change |

## What changed, in short

- `src/coach/types.ts`: block kind `strength` and `StrengthSpec`; `CircuitSpec.score`
  (`time_or_station` | `laps_and_station`) and `laps: number | null`; `SessionRecipe.noGapTests`;
  measures `laps`, `station_reached`, `metres`, `load_kg`, `reps_done`, `misses`, `clean_cards`.
  `SessionResult`, `CoachState` and `DrillScore` are unchanged.
- `src/coach/sessionShapes.ts`: the week 8 row, the week 9 Monday, `V4Slot.load`,
  `SeasonWeekV4.phaseLabel` and `V4_PHASE_LABEL`, the daily line on W8-W11; `memoryGameBlock` takes an
  `m4` override; `drillsOfBlock` reads `strength`.
- `src/coach/seasonV4.ts`: the seven week 8 recipes (the ladder, the tired balance, rope mix 15,
  CARDIO RUN B, thrusters, EAGLE, the treadmill intervals, KINGSTON 10, MAX, RUSSIAN); the W9 Monday
  gap; Q3 and Q4; `validateV4Week` gains the two circuit score shapes, the no-test enchaînement
  (week 8 only), the interval day ending with the tired balance, and no memory block in week 8.
- `src/coach/weekChecker.ts`: Q10.
- `src/data/exerciseCards.ts`: `S00_push_up`, `S00_dumbbell_thruster`,
  `S09_kingston_balance_ladder`, `S10_rope_mix_15`, `BLK_kingston_10` (index of 25 October).
- `src/CoachConcoursApp.tsx`: the week header and the journey read the Q9 label. The laps and station
  boxes need no screen change (two number boxes, nothing cleared).
- `handoffs/`: the CR, `WEEK_8_FINAL_2026-10-26.md`, the DECISIONS file, the index and the new cards.

## Score encoding (all in `drillScores`)

| Session | drillId | measure | box |
|---|---|---|---|
| Mon, Tue, Sat | `balance:ladder_touchdowns` · `balance:ladder_drops` | touchdowns · drops | one total each for the 12 min |
| Wed, Thu, Sat | `balance:tired_touchdowns` | touchdowns | one total |
| Tue | `rope:onefoot_misses` · `rope:clean_cards` | misses · clean_cards (0-4) | |
| Tue | `cardio:cardiorunb_rounds` · `cardio:cardiorunb_metres` | rounds · metres | |
| Wed | `strength:thruster_kg` · `strength:thruster_reps` | load_kg · reps_done | |
| Wed | `cardio:eagle_rounds` | rounds | |
| Fri | `ench:kingston10_laps` · `ench:kingston10_station` | laps · station_reached (1-6) | both kept together |
| Fri | `cardio:max_time_s` | time_s | typed m:ss, stored in seconds |
| Sat | `cardio:russian_rounds` | rounds | |
| Thu | the 5 paces | `repPacesSec` | the existing field of every interval day (W6, W7), not `intervals:rep1..5`: no new field, same box as before |

The effort 1-5 is the session's own `effort`, as on every day.

## Tests

`./node_modules/.bin/tsc -b --pretty false` clean · `vitest run` **403 passed** (22 files; 362
before, 41 new in `src/__tests__/cr013v7.test.ts`) · `tsc -b && vite build` OK ·
`validate:schemas` OK · `validate:repository`: the three broken links in `docs/`, already on `main`
(not run by CI). The `no-personal-names` step needs the repository secret: not runnable here; the diff
was searched by hand, nothing found.

The new file follows the CR's "Tests that must pass" in order: week 8 block for block; weeks 6-7 by
session id and recipe id, weeks 3-7 validate clean, a week 7 Thursday result still attaches; no travel
placeholder in week 8; KINGSTON 10 laps AND station (spec, validator, Retour screen, stored record),
BORDEAUX 10 time OR station; the week 8 enchaînement with no test, no GAP, refused outside week 8;
the ladder and rope texts line by line against section B of the CR; Q1-Q13 one test each; one-line
warm-ups, no predicted time, no mock test, no session after 20 Nov, no target, outdoor runs with a
distance and no pace; the W9-W11 skeleton; the screens.

Existing tests changed because weeks 8 to 11 changed, each with a v7 comment: `cr013v5` (table rows,
loads, display names, trail list, named gaps now W9-W11, optional list, W10 three hard days now
silent, police kinds, the week 8 and 9 screens), `cr013v6` (fixture without week 8, W9 Monday),
`cr013v2` (week bar 4, placeholders W9-W11, the placeholder screen moved to week 9), `cr014` (W8
and W10 flags), `cr018` (no memory block in week 8, the rematch without M4).

Deployed page: not checked. This machine cannot push. The build was served locally and checked in the
preview pane at phone width: week 8 header "VOYAGE · ENTRETIEN · SEMAINE 8 / 11", load 4 / 5, the daily
line, "Séances 0/7", the seven sessions; Friday shows the six stations, MAX, the walk; the Friday
Retour shows "Tours complets — KINGSTON 10" and "ET station atteinte à 10:00 (1 à 6)" side by side,
then "Temps — MAX", and no test box.

## Behaviour the athlete can check in the app

- Week 8: Mon "Facile · journée de terrain", Tue "Compétences + cardio" (with the "au-dessus de la
  limite" line), Wed "Force + EAGLE", Thu "Fractionné · tapis", Fri "Enchaînement · KINGSTON 10",
  Sat "RUSSIAN", Sun "Trail". "Séances 0/7". The header reads "Voyage · entretien".
- Friday → Retour: type 3 in "Tours complets", 4 in "station": both stay. No "Écart" line.
- Week 9: Monday shows "Avant le vol · optionnel", contenu à construire; it never counts as missed.
- The planned week 8 shows no "trois journées fortes" mark. Moving Thursday to Sunday (and the trail
  to Thursday) shows it on Sunday, amber.
- After the merge and deploy, the PWA may serve the old code until it is fully quit and reopened.

## Questions for the training brain (sport decisions the code cannot take)

1. **Kinds of Tue, Wed and Sat.** No existing hard kind fits and the CR forbids the travel and
   CrossFit kinds, so the three days are `skill_park` (a skill or balance piece with a Cross Ops WOD
   as cardio, as on the week 7 Tuesday), loaded hard by the week file. Wednesday is strength first,
   not a skill. Confirm, or ask for a new kind (for example a "strength + cardio" day) in a later CR.
2. **Week bar of week 8.** season_plan v5 gives week 8 two figures, ■■ (Mon-Thu) and ■■■■
   (Fri-Sun); the FINAL makes Tue-Sun hard. The bar shows 4 of 5 (it was 2). Confirm, or give the
   number.
3. **Memory in week 8.** `WEEK_8_FINAL` has no memory slot, so no memory block was added. The CR-018
   cycle still lists week 8 (skill QUI MANQUE ?, chain RÈGLES); the MÉMOIRE home still offers the
   game. Same question as v6 question 1 for week 7.
4. **Phase label of week 8** (the CR's own question). "Voyage · entretien" (Q9) is shown although the
   athlete chose a very hard week. Nothing newer in the cockpit or a DECISIONS file; kept.
5. **The week 9 Monday.** A session needs a kind: `travel_speed` (hard, not a police session, so no
   memory card) marked optional, titled "Avant le vol · optionnel" by the coder. Confirm the kind,
   the load and the words, or give them at the W9 build.
6. **MAX sit-ups.** "10 abdos" has no card. The block lists the atoms that are cards (push-up, air
   squats). A sit-up card, or keep it text only?
7. **Cross Ops WODs without a block card.** CARDIO RUN B, EAGLE, MAX and RUSSIAN have no `BLK_` card
   in the index (unlike WILL 10 and ROUMI). The blocks cite the page and list their atom cards; the
   scores hang on an atom card. Add BLK cards, or fine as is?
8. **A wall in Kingston.** The Kingston ladder card lists "un mur" (steps 3 to 5); the CR's "Why"
   says the travel kit has no wall. Shown as written. If there is no wall, which step changes?
9. **Seven days without rest.** Week 8 trains every day, so the planned week shows "7 jours
   d'entraînement sans repos" (C3, amber). Q10 covers only the three-hard-days mark, so C3 stays.
   Silence it on the planned week too?
10. **Ladder scores.** The card counts touchdowns and drops "per minute"; the app has one total of
    each for the 12 min (the CR's two ids). Boxes per step if wanted.
11. **Tired balance and its card.** The tired balance is scored on the card
    `S09_kingston_balance_ladder` (its own "tired version"), touchdowns only, as the CR's section B
    writes it (no ball drops).

## Open questions carried from APP_REPORT_013_v6 (not answered here, as the CR asks)

1. Memory in week 7: carry the cycle's cards (4 min, on Tue / Thu / Fri), or stay without?
2. VMA formula and what she types: "Palier atteint" (the stage she was in) vs the last stage
   completed; confirm the label, or say if the leg should count.
3. Racket pass card in the week 7 tests: `S11_racket_course_5min` used; confirm or name another.
4. Station at the cap of BORDEAUX 10 encoded 1 to 12 (lap 1 = 1-6, lap 2 = 7-12): confirm.
5. Racket in balance on the week 7 Tuesday: one box (total) instead of drops per pass.
6. Durations not in the week 7 FINAL (hoops, ROUMI, Tuesday and Friday cool-downs).
7. The week 7 Monday text "adapter les sauts (trail de 20 km samedi)": reword?
8. Hoops count: the full 11 on the week 7 Friday (FINAL over R-SP-17); noted for the week 8 build.

## Known gaps

- **Week 8 results recorded before the merge.** On main, week 8 had only Tue 27 `travel_speed`,
  Thu 29 `travel_mini_ench` and Sat 31 `travel_skill_kit`. The CR changes those kinds, so a result
  saved under one of those old ids would not attach to the new sessions (ids are `date:kind`). Nothing
  could be saved for Monday 26 (it was "Repos" on main). If the athlete logs a week 8 session before
  the deploy, tell Cowork: the numbers stay in the stored state, unshown.
- The headline of the week 8 card is "Compétences + cardio" (the first police session of the week),
  as for every week.
- Housekeeping already known, not touched: the three broken links in `docs/`.
- Cowork: copy this report to Drive 04. The card index in Drive is named `00_INDEX (1).md`.

## Snapshot

Branch `cr-013-v7-week8-kingston` · pull request `CR-013 v7 week 8 Kingston` · the tag `cr-013-v7`
is published by the Cowork chat on the merge commit after the athlete's merge.
This machine has no push credentials and no GitHub CLI: the branch is committed locally and
reaches GitHub when the athlete publishes it (GitHub Desktop); the pull request is opened after.

Commit: `e68328eed9d676c8b37d9b01bda558b355591273`
