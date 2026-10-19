# APP_REPORT_013 v6: week 7 (Bordeaux), the single-circuit enchaînement, the Luc Léger test

<!-- template v2, 22 September 2026: sanitised, snapshot = commit hash, coder = Claude Code -->

Direction: **App code → Training brain.** Written by the coder (the athlete's Claude Code
session). Read in Cowork.

Change request: `handoffs/CHANGE_REQUEST_013_v6_week7_bordeaux.md` (19 October 2026), copied from
Drive `04_App_handoffs` with its inputs: `WEEK_7_FINAL_2026-10-19_v3.md` (03), `rules/season_plan.md`
v5, `rules/weekly_shape.md` v8, `rules/test_battery.md` v3, `exercise_cards/00_INDEX.md` of 19 October
and the twelve cards listed (02). Drive is the source; nothing read from `90_Archive/`.
Tier declared in the CR header: **TOP** (engine). Run on Claude Opus; the effort of this session
was below "high" (said at the start, the athlete continued).
Branch `cr-013-v6-week7-bordeaux`, cut from `origin/main` at `f8e9a36` (CR-020 merge) with no
upstream. Nothing merged, nothing tagged, nothing pushed to `main`.

## Done

| Request item | Status | Where in the code |
|---|---|---|
| A. Week 7 row: Mon CrossFit · Tue skill · Wed intervals + Luc Léger · Thu enchaînement · Fri skill | done | `sessionShapes.ts` (`SEASON_PLAN_V4[7]`), load ■■■ from season_plan v5 |
| A. Travel placeholders removed from week 7 only; the travel kinds stay | done | week 8 unchanged, `V4SessionKind` unchanged |
| A. Sat 24 rest; Sun 25 the note "Vol vers Kingston · repos", no session | done | `SeasonWeekV4.dayNotes` (screen text only), week screen |
| A. Weeks 8 to 11 exactly as v5 | done | builders untouched; fixture test |
| A. Wed + Thu hard days flagged, never blocked | done | `weekChecker.ts` unchanged: C1 on Thu 22 (amber); Thu card carries the "au-dessus de la limite" line |
| A. KEEP the CR-018 memory cycle; no memory slot invented | done | `memoryCycle.ts` unchanged; no memory block in week 7 (Q1) |
| A. Drag any session to any day | done | unchanged CR-014 layer |
| B. Week 7 content as data, block for block, French texts | done | `seasonV4.ts` (`buildWeek7Monday` … `buildWeek7Friday`) |
| B. Warm-ups one line; daily line on the week card | done | checked in `validateV4Week` |
| B. Backups on the Tuesday and Thursday cards (R-SP-14) | done | block `details`; Luc Léger backup as the test block's rule |
| C. New enchaînement shape: warm-up + priming · fresh test · ONE circuit · fatigue test · Cross Ops block | done | block kind `circuit` (`CircuitSpec`), `validateV4Week` (R-SP-15) |
| C. Two-storm shape kept for week 6 and the week 10 Friday | done | `buildEnchainement` untouched |
| C. The Cross Ops block is not flagged as a second hard block | done | no such check exists for v4 weeks; test asserts no error |
| C. Circuit score: total time OR station at the cap, never both | done | Retour: typing one clears the other |
| D. Every score in `drillScores`, the suggested ids | done | new measures in `DrillMeasure`; no stored field added |
| D. VMA computed, never typed, shown on the Wednesday Retour and Fait | done | `lucLegerVmaKmh`, `lucLegerVmaOf` (`seasonV4.ts`) |
| D. The GAP fresh → tired for bench with ball and racket | done | `enchainementGap` now knows `racket` |
| Out of scope (weeks 8-11, answers to APP_REPORT_013_v5, CR-019, CR-020, persistence) | untouched | |

## What changed, in short

- `src/coach/types.ts`: block kinds `circuit` and `luc_leger`; specs `CircuitSpec` and
  `LucLegerSpec`; measures `stage`, `leg`, `time_s`, `station_at_cap`, `backup`, `turn_done`,
  `clean_minutes`. `DrillScore` itself is unchanged.
- `src/coach/sessionShapes.ts`: the week 7 row, `dayNotes`, `WEEK7_SUNDAY_NOTE`; `drillsOfBlock`
  reads the two new specs.
- `src/coach/seasonV4.ts`: the five week 7 recipes; `will10Block` shared with week 6 (same text);
  the GAP list gains `racket`; the VMA function; `missedReps` (the optional 5th rep never counts);
  `validateV4Week` gains the R-SP-15 checks, the week 7 Wednesday frame (Luc Léger → recovery →
  intervals), "one Luc Léger test, week 7 only" (R-TB-01) and "no memory block in week 7".
- `src/data/exerciseCards.ts`: the ten cards week 7 uses (index of 19 October).
- `src/CoachConcoursApp.tsx`: the Sunday note; oui / non for `turn_done`; A / B / C buttons for the
  backup; times typed `m:ss` and stored in seconds; the circuit "time OR station" rule; the VMA line
  (live on Retour, stored-derived on Fait); "Rép 5 · optionnelle"; the GAP line reads "après le
  circuit" on a circuit enchaînement.
- `handoffs/`: the CR, the week 7 FINAL, the three rules files, the index and twelve cards, copied
  from Drive.

## Score encoding (all in `drillScores`)

```
 test:luc_leger_stage        palier atteint (integer)
 test:luc_leger_leg          navette
 skill:bench_ball_falls      chutes + touchers (one number)
 skill:bench_ball_turn       demi-tour réussi: 1 oui, 0 non
 skill:racket_balance_drops  balles tombées
 cardio:will10_rounds        tours
 fresh:bench_ball · fresh:racket · tired1:bench_ball · tired1:racket
 ench:bordeaux10_time_s      seconds (typed m:ss)          ┐ one OR the other, never both
 ench:bordeaux10_station_at_cap  1-6 lap 1, 7-12 lap 2     ┘
 ench:backup                 A = 1, B = 2, C = 3 (empty = none)
 cardio:roumi_time_s         seconds (typed m:ss)
 skill:hoops11_foot · skill:hoops11_hand
 skill:racket_course_drops   balles tombées (total)
 skill:skipping_emom8_clean  minutes propres sur 8
```
The interval paces stay in the existing `repPacesSec` (typed `m:ss`, as on every Tuesday) instead
of `intervals:rep1 … rep5`: same record as every earlier interval session, no new field. Five boxes,
the fifth labelled "optionnelle". Effort is the session's one effort field (not one per block).

## Tests

`./node_modules/.bin/tsc -b --pretty false` clean · `vitest run` **343 passed** (20 files; 313
before, 30 new in `src/__tests__/cr013v6.test.ts`) · `tsc -b && vite build` OK.
`validate:schemas` OK. `validate:repository`: the three broken links in `docs/` already on `main`.

The new file follows the CR's "Tests that must pass" in order: week 7 block for block; weeks 6 and
8 to 11 by session id and recipe id, weeks 3 to 11 validate clean; no travel placeholder in week 7,
week 8 keeps them; the circuit shape and the two-storm shape; time OR station (screen, stored
record); Luc Léger first, VMA computed (stage 9 → 12.0 km/h), one test in the season; the optional
5th rep never missed; Wed + Thu flagged, not blocked; one-line warm-ups, no predicted time, no mock
test, no cardio target.

Existing tests changed because week 7 changed, each with a v6 comment: `cr013v5` (table row, trail
list, named gaps now weeks 8-11, optional list, intervals W8-W9 only, memory and video skip week 7,
the week 7 screen check moved to week 8), `cr013v2` (placeholders weeks 8-11), `cr014` (week 7 has
C1 + C3 by design), `cr018` (week 7 has no memory block, no video line).

Deployed page: not checked. This machine cannot push; the build was served locally and checked in
the preview pane at phone width: week 7 shows the five sessions, Saturday "Repos", Sunday "Vol vers
Kingston · repos", load 3 / 5, the ⚠ on Thursday; the Wednesday Retour shows "VMA : 12,0 km/h ·
calculée (palier 9, navette 6)" and "Rép 5 · optionnelle".

## Behaviour the athlete can check in the app

- Week 7: Mon "Cours CrossFit", Tue "Compétences courtes · parc", Wed "Test Luc Léger +
  fractionné", Thu "Enchaînement · BORDEAUX 10", Fri "Compétences chrono", Sat "Repos", Sun the
  flight note. "Séances 0/5".
- Wednesday → Retour: type the palier and the navette, the VMA appears under them, computed.
- Thursday → Retour: type a total time (`9:30`), then a station: the time empties, and the other
  way round. Backup: tap A, B or C.
- After the merge and deploy, the PWA may serve the old code until it is fully quit and reopened.

## Questions for the training brain (sport decisions the code cannot take)

1. **Memory in week 7.** `WEEK_7_FINAL` v3 has no memory slot, so no memory block was added (the CR
   says not to invent one). The CR-018 cycle still lists week 7 (skill PLAN with the video line,
   chain ORDER); the MÉMOIRE home still offers the game. Should week 7 carry the cycle's cards
   (4 min, on Tue / Thu / Fri), or stay without?
2. **VMA formula and what she types.** The CR formula is 8.0 + 0.5 × (palier atteint − 1), the speed
   of the last FULLY completed stage. The box reads "Palier atteint" (the stage she was in when the
   test ended). If she types the last stage she completed instead, the VMA reads 0.5 km/h low.
   Confirm the label, or say if the leg should count (it is recorded, not used).
3. **Racket pass card in the tests.** The fresh and fatigue tests name "raquette 1 passage" without a
   card. The code uses `S11_racket_course_5min` (state both). Confirm, or name another card.
4. **Station at the cap.** Encoded 1 to 12 (lap 1 = 1-6, lap 2 = 7-12) so the lap is not lost.
   Confirm, or say if only the station of the lap matters.
5. **Racket in balance on Tuesday.** The FINAL says "drops per pass" and "3 passes on the wall";
   the CR gives one id. One box (total). Per-pass boxes if wanted.
6. **Durations not in the FINAL.** The hoops block (4 passes) and ROUMI (for time) carry no minutes;
   the session durations shown are the FINAL's own "about 40 / 70 / 55 / 35 min". The Tuesday and
   Friday cool-downs are not written in the FINAL, so none is shown.
7. **Monday text.** "adapter les sauts (trail de 20 km samedi)": the trail was Saturday 17, before
   the class. Kept word for word; reword if it reads as a trail to come.
8. **Hoops count.** The full 11 on Friday (the FINAL wins over R-SP-17 "7 hoops in W7", as the CR
   says). No change asked; noted for the week 8 build.

## Known gaps

- Weeks 8 to 11, the W8-W11 skeleton changes of season_plan v5, the 13 answers to APP_REPORT_013_v5
  and the phase labels (Q9, "Voyage · entretien") wait for CR-013 v7. The week header still shows
  the v4 phase name.
- The fresh → tired GAP unit for the bench reads "touchers" (the week 6 label); in week 7 the box
  counts falls + touchdowns.
- Housekeeping already on the cockpit list, not touched: the CR-010 code comment naming the Pages
  host, the three broken links in `docs/`.
- Cowork: copy this report to Drive 04; the cockpit still lists CR-020 as next, and it is merged
  (`f8e9a36`).

## Snapshot

Branch `cr-013-v6-week7-bordeaux` · pull request `CR-013 v6 week 7 Bordeaux` · the tag `cr-013-v6`
is published by the Cowork chat on the merge commit after the athlete's merge.
This machine has no push credentials and no GitHub CLI: the branch is committed locally and
reaches GitHub when the athlete publishes it (GitHub Desktop); the pull request is opened after.

Commit: `809994a0d3709f7098e6798c4c253f75f72b695f`
