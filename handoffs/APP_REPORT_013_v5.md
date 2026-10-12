# APP_REPORT_013 v5: season reshape (season_plan v4) and week 6 at the park

<!-- template v2, 22 September 2026: sanitised, snapshot = commit hash, coder = Claude Code -->

Direction: **App code → Training brain.** Written by the coder (the athlete's Claude Code
session). Read in Cowork.

Change request: `handoffs/CHANGE_REQUEST_013_v5_season_reshape_week6.md` (12 October 2026), copied
from Drive `04_App_handoffs` with its inputs: `DECISIONS_SEASON_RESHAPE_2026-10-12_v3.md` (04),
`WEEK_6_FINAL_2026-10-12_v2.md` (03), `rules/season_plan.md` v4 (02), `exercise_cards/00_INDEX.md`
of 12 October and the eight new cards (02). Drive is the source; nothing read from `90_Archive/`.
Tier declared in the CR header: **TOP** (engine). Run on Claude Opus, as the routing asks.
Branch `cr-013-v5-season-reshape`, cut from `origin/main` at `6ca7013` (CR-018) with no upstream.
Nothing merged, nothing tagged, nothing pushed to `main`.

## Done

| Request item | Status | Where in the code |
|---|---|---|
| A. New session kinds (7), French names, loads | done | `types.ts` (`SessionKind`), `seasonV4.ts` (`V4_KIND_TITLE`, `V4_KIND_LOAD`) |
| A. `SEASON_PLAN` v4, weeks 6 to 11, cell for cell | done | `sessionShapes.ts` (`SEASON_PLAN_V4`); `SEASON_PLAN` keeps weeks 3 to 5 |
| A. W6 no Saturday CrossFit; W9 no Monday, Sat 7 Nov kept | done | `SEASON_PLAN_V4` |
| A. W7 / W8 optional sessions: "optionnel", never missed | done | `SessionRecipe.optional` (screen only), week count in `CoachConcoursApp.tsx` |
| A. Days movable as built; nothing moves a day in code | done | unchanged CR-014 layer |
| A. Weeks 3, 4, 5 exactly as before | done | the v3 engine is untouched; the planner branches at week 6 |
| A. Three-hard-days check flags, never blocks | done | `weekChecker.ts` (amber, R-SP-13, from week 6); `validateV4Week` never errors on it |
| A. CR-018 memory cycle on the four v4 police kinds | done | `memoryShapeOf`, `isPoliceSession` (`sessionShapes.ts`), `memoryGame.ts` |
| A. W7 to W11 named gaps "Contenu à construire (semaine n)" | done | `seasonV4.ts` (`buildToBuild`) |
| B. Week 6 content as data, block for block | done | `seasonV4.ts` (Tuesday, `buildWeek6SkillPark`, `buildEnchainement`) |
| B. Warm-ups one line, priming named | done | `WARMUP_LINE`; checked in `validateV4Week` |
| B. Daily line on the week card | done | `SeasonWeekV4.dailyLine`, week screen |
| C. Tuesdays W6, W10, W11; none in W7 to W9 | done | `TUESDAY_SETS_V4` (`seasonV4.ts`) |
| C. Low-lung sprints as a separate block, with the safety line | done | block kind `low_lung`, `LOW_LUNG_SAFETY_LINE` |
| C. volumeFactor never changes reps, length or pace | done | every v4 session has volumeFactor 1 |
| D. Every new score in `drillScores`, the suggested ids | done | new measures in `DrillMeasure`; no stored field added |
| D. The GAP computed, shown on Retour | done | `enchainementGap` (`seasonV4.ts`), Retour and Fait tabs |
| E. W10 Friday rematch, line and W6 scores beside the boxes | done | `buildEnchainement(10, true)`, `rematchOf` |
| F. R-SP-08, R-SP-11, R-TL-11, R-SP-10, R-SP-09 | done | `validateV4Week`, `hardPoliceSession` (no v4 kind) |
| G. Q6 of APP_REPORT_018 partly settled | noted | no code change; Q1 to Q5 untouched |
| H. CR-019 not implemented | done | nothing from CR-019 |
| Deployed page checked | not done | the page deploys only from `main`; the built app was checked from a local copy instead (see Tests) |

## What changed, in short

```
 wk  Mon        Tue                  Wed               Thu               Fri                   Sat               Sun
 6   CrossFit   Intervalles 58 min   Compétences 58    CrossFit          Enchaînement 43       Trail             -
 7   -          Voyage T1 (gap)      -                 Voyage T2 (gap)   -                     Voyage T3 (gap)   Trail, optionnel
 8   -          Voyage T1 opt (gap)  -                 Voyage T2 (gap)   -                     Voyage T3 (gap)   -
 9   -          Footing (gap)        Footing (gap)     Compétences (gap) Enchaînement (gap)    CrossFit          Footing (gap)
 10  CrossFit   Intervalles 49 min   Enchaînement(gap) Compétences (gap) Enchaînement REVANCHE Trail             -
 11  CrossFit   Intervalles 35 min   Compétences (gap, allègement)       -   Concours (fixed)
```

- `src/coach/seasonV4.ts` (new): the v4 generator, week 6 content, the Tuesdays of section C, the
  named gaps, the rematch, `enchainementGap`, `validateV4Week`.
- `planner.ts`: weeks 6 to 11 come from `sessionsForV4Week`; the Tuesday table and its repeat rule
  run for weeks 2 to 5 only; `validateWeek` hands weeks 6 to 11 to `validateV4Week`. The two v3
  builders that hard-coded week 11 (taper session) and week 9 (hill-sprint Tuesday) are removed.
- New block kinds: `setup`, `skill_test`, `storm`, `rest`, `low_lung`, `to_build`. New measures:
  `rounds_done`, `hesitations`, `errors`, `rounds`, `last_lap`, `burpees_in_lap`,
  `highest_minute`, `box_jumps_used` (stored 1 = yes, 0 = no), `metres_held`.
- Cards registry: S00_full_burpee, S00_bar_row, S00_low_lung_sprint, S02_obstacle_wall_official,
  S09_bench_walk_with_ball, BLK_will_10, BLK_acheron_park, BLK_death_by_obstacle (role D added).
- Screens: icons and names of the new kinds, "Intensité : à bloc" on the enchaînement, the daily
  line, "optionnel", the rematch line, score boxes for every drill of any session (the Tuesday
  low-lung metres included), oui / non for box jumps, the GAP lines under each tired test.

Readings taken where the inputs left a choice (none is a sporting decision; each can be reversed
in one line):

| # | Point | What the code does | Why |
|---|---|---|---|
| R1 | Friday order | set-up, then the warm-up, both as blocks | WEEK_6_FINAL puts the set-up first; the step list would otherwise show the warm-up first |
| R2 | Storm rule line | the three "rules shown" of section B first; the burpee and row cues in the details | the step list cuts a rule line at 72 characters |
| R3 | Tuesday W6 warm-up and cool-down | 12 min and 8 min from WEEK_6_FINAL | section B gives none; WEEK_6_FINAL wins for week 6 |
| R4 | Verbatim lines | safety line, daily line, rematch line written exactly as the CR (straight apostrophe) | the CR quotes them; every other French string keeps ’ |
| R5 | Week 6 ids | Mon 12 and Tue 13 keep their ids; Wed to Sat are new ids (`2026-10-14:skill_park` ...) | ids are `date:kind`; old week 6 moves or results on Wed to Sun no longer attach (only Monday could have been logged by 12 Oct) |
| R6 | Named gap blocks | police gaps carry the cycle's card plus "Contenu à construire (semaine n)"; T1 and easy runs carry the gap only | section A KEEP (one card per police session) and R-SP-03 |
| R7 | W11 Wednesday | "Compétences au parc" with the line "Semaine d’allègement." | section A "offload, placeholder" |

## Tests

- passed: 305 · failed: 0 · 18 files
- new: `src/__tests__/cr013v5.test.ts`, 44 tests, one block per item of "Tests that must pass",
  then the "Expected behaviour" screens (week 6 card, Tue 13, Fri 16 with the GAP typed and stored,
  week 7, week 9, week 10 rematch with week 6 scores, Sat 17 trail).
- changed: the v3-era files (`cr013v3`, `cr013v2`, `cr013`, `cr014`, `cr018`, `runIntervals`).
  Every week 3, 4, 5 assertion is unchanged. Assertions that only described the v3 weeks 6 to 11
  (v3 rows, crossfit_plus, travel engine chain, hill-sprint Tuesday, ghost circuit, reused
  blocks, taper session) are removed or narrowed to weeks 3 to 5, each with a note in place.
  The CR-018 cycle tests now run on the v4 police kinds instead of being dropped.

```
 pnpm typecheck   clean      (run as ./node_modules/.bin/tsc -b --pretty false)
 pnpm test        18 files, 305 tests passed (vitest run)
 pnpm build       built, PWA precache 10 entries (tsc -b && vite build)
 validate:schemas OK on all three schemas
```

pnpm is not installed on this machine; each script's own command was run with the repository's
binaries. The built `dist/` was served locally and opened in the in-app browser at phone width on
12 October: the week 6 card (load 4 of 5, daily line, 58 min Tuesday), the Friday enchaînement
(à bloc, 43 min, 9 blocks) and its Retour, where the GAP appears as soon as a fresh and a tired
score are typed.

## Behaviour the athlete can check in the app

1. Week 6 card → 4 squares of 5, the line "Chaque jour · 2 min d'équilibre sur une jambe pendant
   le brossage des dents", Sat 17 "Trail" with nothing else, Sun 18 "Repos".
2. Tue 13 → "5 × 4 min à 5:10 /km, récupération 2 min", a 4 min walk, then "Sprints poumons vides,
   6 × 30 m" with "jamais d'hyperventilation avant · stop si vertige · loin de la circulation".
   Retour: 5 pace boxes and "Mètres tenus sans respirer".
3. Wed 14 "Compétences au parc" → QUI MANQUE · obstacle 16 · banc avec balle 7 · raquette 6 ·
   cerceaux 6 · WILL 10.
4. Fri 16 "Enchaînement" → "Intensité : à bloc"; in Retour type the fresh and tired scores: the
   lines "Écart · Cerceaux : +2 erreurs · calculé" appear under each tired test; nothing to type.
5. Week 7 → Monday empty, the three "Voyage" sessions "contenu à construire", Sunday "Trail ·
   optionnel"; the count reads 0/3, not 0/4.
6. Week 10 Fri 13 Nov → "Revanche : battre tes scores de la semaine 6", and "Semaine 6 : n" under
   each box that has a week 6 score.
7. Edit mode on week 10 → amber "Trois journées fortes d’affilée … (R-SP-13)", nothing blocked.
8. After the merge: the PWA can keep the old code until the app is fully closed and reopened.

## Questions for the training brain (sport decisions the code cannot take)

- Q1. Tuesday repeat rule (R-WS-22): weeks 6, 10, 11 are pinned to section C, so a slow week 5
  Tuesday no longer pushes week 6 back to a repeat, and "advance faster" no longer moves a pace.
  Keep the rule off from week 6, or bring it back on the v4 Tuesdays?
- Q2. Week 10 Tuesday: the CR gives no hold distance and no walk before the low-lung sprints; the
  card says "then 2 sets" after week 8. Built: 6 × 30 m, no hold line, no walk block. To set at the
  week 10 build.
- Q3. Week 10 rematch memory: the cycle gives RÈGLES with M4 in week 10 (10 min), so the rematch is
  49 min against 43 in week 6; storms and tests are unchanged. Keep M4 on the rematch, or keep the
  week 6 four-minute card?
- Q4. Warm-up minutes: the app shows "Échauffement ~5 min" (R-SP-09) and counts 5, so Wednesday
  reads 58 min (WEEK_6_FINAL about 60) and Friday 43 (about 46). The Tuesday keeps its own 12 min
  warm-up. Does R-SP-09 cover the Tuesday run too?
- Q5. Box jumps used: one oui / non per storm (both block cards list it as a measure); the CR and
  WEEK_6_FINAL say once for the session. Per storm, or once?
- Q6. ACHERON PARK slalom: mapped to the card `S01_slalom_18m` (out straight, slalom back) while
  the park lane is about 15 m. Keep, or write a park slalom card?
- Q7. WILL 10: referenced by its block card `BLK_will_10` because push-ups have no atom card; the
  burpee type in WILL 10 is not written (the storms say chest to the floor). Confirm, or add a
  push-up atom card.
- Q8. Hoops in the tests: one number "erreurs" per pass (foot and hand together), as WEEK_6_FINAL
  writes; Wednesday keeps foot and hand apart. One number on Fridays, confirmed?
- Q9. Phase label: the week screen still prints the v3 phases (W6 "Récupérer", W7-W8 "Intégrer",
  W9-W10 "Pic spécifique", W11 "Alléger"). "Récupérer" on a load-4 week reads wrong. Which labels
  for weeks 6 to 11? Not changed here: not in the CR.
- Q10. The checker marks ⚠ on the athlete's own v4 weeks: W6 C1 (Thursday CrossFit then the
  enchaînement) and C3 (Monday to Saturday), W9 C1 (enchaînement then Saturday CrossFit) and C3,
  W10 C2 (amber) and C3. Keep these marks on the planned weeks, or silence them until a move?
- Q11. Daily line: only week 6 carries it (section B). season_plan v4 lists the daily balance in
  the park week shape. Add it to weeks 9 to 11?
- Q12. The easy runs of week 9 and the trail day are not counted as "runs" side by side by C5
  (Tuesday and Wednesday easy runs are adjacent by design). Confirm.
- Q13. The card index marks `S00_jumping_jacks` as killed (7 October). Week 5 still shows them
  (locked, must not change); no week 6 session uses them. Nothing to do unless a week 7+ build asks.

## Known gaps

- Deployed page not checked: GitHub Pages deploys from `main` only, after the merge.
- `runIntervalsProgression` still holds rows 6 to 8 of `run_intervals_progression.md` v4
  (5 × 4 at 5:25, 6 × 2, 3 × 5); they feed no week now. Rows 10 and 11 equal section C. Left for
  the run_intervals v5 fold-in.
- Data left in place for later drops, no longer used from week 6: `SKILL_BLOCKS[11]` per set, the
  travel and ghost chain labels, the power EMOM fallback, the weekend hill-sprint block.
- Week screen headline "0 semaine avant le trail" from week 6 on (the race is past). Pre-existing,
  not fixed.
- A code comment in `src/CoachConcoursApp.tsx` (CR-010 fix note) names the GitHub Pages host,
  which contains the account name. Pre-existing, not touched; worth removing in a cleanup.
- `validate:repository` reports three broken links to `../VALIDATION_REPORT.md` in `docs/`. Same
  on `main`; the script is not in CI.
- Cowork: copy this report to Drive 04; the cockpit is stale on the CR queue (Cowork writes it).

## Snapshot

Branch `cr-013-v5-season-reshape` · pull request `CR-013 v5 season reshape and week 6` · the tag
`cr-013-v5` is published by the Cowork chat on the merge commit after the athlete's merge.
This machine has no push credentials and no GitHub CLI: the branch is committed locally and
reaches GitHub when the athlete publishes it (GitHub Desktop); the pull request is opened after.

Commit: `a23dc2b824a63d9c3c7af2d46c64be3c554ca395`
