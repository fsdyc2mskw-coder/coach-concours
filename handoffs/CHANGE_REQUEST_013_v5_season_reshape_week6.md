# CHANGE_REQUEST_013 v5: season reshape (season_plan v4), week 6 at the park, the ENCHAÎNEMENT

<!-- template v5, 24 September 2026: coder never tags and never pushes to main; the tag is published by the Cowork chat after the athlete's merge (routing v4, section 3b) -->

Direction: **Training brain → App code.** Written in Cowork. Read by the coder (the athlete's Claude Code session).
Date: 12 October 2026 · Author: the athlete + Claude · Status: open
Version 5 of CR-013. v4 is merged (PR #12, merge `ed9cab0`, tag `cr-013-v4`). The Drive file of v3 is archived.
Order: before CR-019 (power blocks: superseded in part, see section H) · after CR-018 (merged).
**Week 6 has started (Mon 12 Oct): merge as soon as possible; Tuesday 13 Oct is the first changed day.**
Own session. Branch: `cr-013-v5-season-reshape` (cut with no upstream, cockpit section 9).
Kind: engine (new session kinds, a new week skeleton, new score fields in the generic drill scores) + data
· **Tier: TOP** (engine → TOP, routing v4). Model: Opus, effort high.

## Read first

`CLAUDE.md`, `handoffs/00_COCKPIT.md` section 9, `handoffs/00_AGENT_ROUTING.md`, then only the files under
"Inputs". State the tier in your first reply and say if the model you run on does not match.

## Why

On 11 Oct the athlete found an outdoor PARK with a wall at about the exam height, a low brick wall that
stands in for the bench, poles, bars and low stumps. Stations 2 (obstacle, her biggest fear) and 9
(bench, balance) become trainable for the first time. The same weekend she confirmed the travel (W7
Bordeaux, no gym; W8 Jamaica, work; back Tue 3 Nov) and said travel weeks mean less training. She also
reported breathlessness on sudden bursts. So the season is reshaped (`season_plan.md` v4): two park
sessions per park week (Wednesday = learn the skill; Friday = ENCHAÎNEMENT: fresh test → storm → tired
test, the GAP), travel weeks as maintenance, a load week in W10 and an offload week in W11. Week 6 is
locked as `WEEK_6_FINAL_2026-10-12_v2.md`. **Design goal: the new table and week 6 as data; new session
kinds where the shape is new; weeks 3 to 5 untouched; weeks 7 to 11 as a skeleton with named
placeholders until their own data drops.**

## Inputs (Drive, copy into `handoffs/`; Drive is the source, never `90_Archive/`)

| File | version | What it gives |
|---|---|---|
| `02_Training_brain/rules/season_plan.md` | **v4** (12 Oct) | the W6-W11 table, the week shape, rules R-SP-08 to R-SP-14 |
| `03_Weekly_plans/WEEK_6_FINAL_2026-10-12_v2.md` | FINAL v2 (12 Oct) | week 6, block for block |
| `04_App_handoffs/DECISIONS_SEASON_RESHAPE_2026-10-12_v3.md` | v3 (12 Oct) | decisions D1-D12 |
| `02_Training_brain/exercise_cards/00_INDEX.md` | 12 Oct | the card list (5 new cards, 3 new blocks) |
| `02_Training_brain/exercise_cards/S02_obstacle_wall_official.md` | v1 | obstacle, official rhythm |
| `02_Training_brain/exercise_cards/S09_bench_walk_with_ball.md` | v1 | balance on bench with ball |
| `02_Training_brain/exercise_cards/S00_full_burpee.md` · `S00_bar_row.md` · `S00_low_lung_sprint.md` | v1 | atoms |
| `02_Training_brain/exercise_cards/BLK_will_10.md` · `BLK_acheron_park.md` · `BLK_death_by_obstacle.md` | v1 | blocks |

Precedence: `WEEK_6_FINAL_2026-10-12_v2` wins for week 6 · `season_plan.md` v4 wins for weeks 6-11 ·
the decisions file v3 wins over `weekly_shape.md` v7 and `run_intervals_progression.md` v4 wherever they
disagree (those two files are folded in later) · weeks 3, 4 and 5 keep their locked files and MUST NOT
change (their results are stored by session id).

## A. Season skeleton W6-W11 (`src/coach/sessionShapes.ts`, `SEASON_PLAN` v4)

New session kinds (add to the kind union; display names in French):

```
 skill_park          "Compétences au parc"          moderate
 enchainement        "Enchaînement"                  hard, displayed "à bloc"
 travel_speed        "Voyage · Vitesse (T1)"         hard
 travel_mini_ench    "Voyage · Mini-enchaînement (T2)" hard
 travel_skill_kit    "Voyage · Kit compétences (T3)" low
 trail_day           "Trail"                          moderate   (R-SP-10: label only, no distance, no detail)
 easy_run            "Footing facile"                 low
```
Existing kinds kept: `crossfit_class`, `run_intervals`, `police_event`.

```
 wk dates           load  Mon        Tue                 Wed               Thu               Fri            Sat              Sun
 6  12-18 Oct       4     crossfit   run_intervals*      skill_park        crossfit          enchainement   trail_day        -
 7  19-25 Oct       2     -          travel_speed        -                 travel_mini_ench  -              travel_skill_kit trail_day (optional)
 8  26 Oct-1 Nov    2     -          travel_speed (opt)  -                 travel_mini_ench  -              travel_skill_kit -
 9  2-8 Nov         3     -          easy_run            easy_run          skill_park        enchainement   crossfit         easy_run
 10 9-15 Nov        5     crossfit   run_intervals*      enchainement      skill_park        enchainement   trail_day        -
 11 16-20 Nov       1     crossfit   run_intervals       skill_park (offload, placeholder)   -    police_event Fri 20
 * with the low-lung sprints after the main set (section C)
```

```
 MUST  W6 has NO Saturday CrossFit: remove crossfit_plus 2026-10-17 (the second class is Thu 15 Oct).
 MUST  W9 has no Monday CrossFit (flight back); crossfit_plus Sat 7 Nov stays.
 MUST  W7 "optional" and W8 "opt" sessions show "optionnel" and never count as missed.
 MUST  the athlete may drag any session to any day of its week (as built); nothing here moves days in code.
 MUST  weeks 3, 4, 5 reproduce their locked files exactly as today (fixtures unchanged).
 KEEP  the three-hard-days validator: it FLAGS, never blocks (R-SP-13: accepted as an exception).
 KEEP  the memory cycle of CR-018 (A/B weeks, one card per police session): police sessions from W6 are
       skill_park, enchainement, travel_mini_ench, travel_skill_kit.
```

Content of weeks 7 to 11: NOT in this version except the W10 Friday (section E). Every other session of
W7-W11 shows its kind, its day and the named placeholder "Contenu à construire (semaine n)". Never copy
week 6 content into them (R-SP-03).

## B. Week 6 content, as data (from `WEEK_6_FINAL_2026-10-12_v2.md`; app texts in French)

```
 GENERAL   warm-ups are ONE line: "Échauffement ~5 min" (R-SP-09); priming is named when used.
           the old v4 W6 content (skill hoops Thu, chain B Fri, CrossFit Sat, run Sun) is replaced.

 Tue 13  run_intervals   5 × 4 min @ 5:10 /km, jog 2 min · rule: rep 5 ≤ rep 1 + 5 s
                         then 4 min walk · LOW-LUNG 6 × 30 m (hold 10-15 m this week), walk back 30 s
                         scores: 5 rep paces · effort · metres held (one number)
 Wed 14  skill_park      warm-up ~5 · memory QUI MANQUE (B week)
                         OBSTACLE 16': 4 from a walk · 4 from a 5 m run-up · official rhythm × 5
                           (5 out with a tennis ball into the "red box", 4 back), 1 min rest
                           scores: rounds done (0-5) · hesitations
                         ÉQUILIBRE SUR BANC AVEC BALLE 7': 3 walks · 2 walks holding a ball ·
                           1 official-style walk (ball A at the start, swap for ball B at the far end,
                           walk back, put down, last walk empty) · score: touchdowns
                         RAQUETTE 6': flat 10 m · over the low stumps · over one stump rail only if
                           pass 2 = 0 drops · scores: drops per pass (3 boxes)
                         CERCEAUX 6': green + 5 hoops, out ball in arms, back dribble, 5-6 passes
                           scores: foot errors · hand errors
                         CARDIO WILL 10 (Cross Ops): AMRAP 10: 3 burpees · 10 push-ups · 10 squats
                           (level-up: squat jumps) · no target · scores: rounds · effort
                         cool-down
 Fri 16  enchainement    set-up 3 · warm-up ~5 + PRIMING 2 × 10 s flat sprint · 3 broad jumps
                         FRESH TEST: hoops 1 pass (errors) · bench with ball 1 official walk (touchdowns)
                         memory RÈGLES (B week)
                         STORM 1 "ACHERON PARK" AMRAP 7: each lap slalom ~15 m (out straight, weave
                           back) · obstacle over and back · burpees 2, 4, 6, 8, 10 ... (+2 per lap)
                           score: last lap reached + burpees in it
                         TIRED TEST 1 within 30 s: hoops · bench with ball
                         REST 3 min
                         STORM 2 "DEATH BY OBSTACLE" 7 min: minute n = n crossings + n burpees +
                           n bar rows; first minute not finished = repeat the last completed level
                           until 7:00 · score: highest minute completed
                         TIRED TEST 2 within 30 s: hoops · bench with ball
                         cool-down 5
                         rules shown: sloppy crossing → 2 box jumps on the low block for the rest of
                           that storm · wobbly → step down on purpose · dizzy → stop, it counts
                         scores: both storm scores · effort · box jumps used (yes/no)
                           · hoops errors and bench touchdowns: FRESH, TIRED 1, TIRED 2
 Mon 12, Thu 15 crossfit_class (recorded only) · Sat 17 trail_day · Sun 18 nothing
 daily line on the week card: "2 min d'équilibre sur une jambe pendant le brossage des dents"
```

## C. Tuesday intervals

```
 W6  5 × 4 min @ 5:10, jog 2 min (decision D9: replaces 5:25, jog 3) + low-lung 6 × 30 m
 W10 4 × 3 min @ 5:15, jog 2 min (v4 values, to be reviewed at the W10 build) + low-lung 6 × 30 m
 W11 4 × 1 min @ 5:00, jog 2 min, no low-lung (taper)
 W7-W9: no run_intervals (travel_speed placeholder in W7-W8; easy runs in W9)
 MUST  volumeFactor never changes reps, length or pace (R-WS-20, as built).
 MUST  the low-lung sprints are a separate block after the main set, with the safety line:
       "jamais d'hyperventilation avant · stop si vertige · loin de la circulation".
```

## D. Scores and the GAP (no persistence change)

Results already store `drillScores: [{drillId, measure, value}]`. Use it for every new score; do NOT add
a field to the stored state. Suggested ids: `fresh:hoops`, `tired1:hoops`, `tired2:hoops`,
`fresh:bench_ball`, `tired1:bench_ball`, `tired2:bench_ball`, `storm1:acheron_lap`,
`storm1:acheron_burpees`, `storm2:death_minute`, `skill:obstacle_rounds`, `skill:obstacle_hesitations`,
`cardio:will10_rounds`, `intervals:low_lung_metres`.
The GAP (tired minus fresh, per skill, per storm) is COMPUTED and shown on the Retour tab, never typed.
If you find that any of this needs a new stored field, stop and write the question in the report.

## E. Week 10 Friday = the REMATCH

W10 Fri 13 Nov reuses the W6 Friday content unchanged (R-SP-05), with the line "Revanche : battre tes
scores de la semaine 6" and the W6 scores shown next to the boxes when they exist.

## F. Rules that change a check

```
 R-SP-08  hard days are loaded (Cross Ops volumes): no automatic dose cut on enchainement or WOD blocks
 R-SP-11  an enchainement has TWO storms + tests: do not flag "more than one hard block" on it
 R-TL-11  four atoms maximum per block (as built in v4); storms have 3-4 atoms
 R-SP-10  trail_day shows the label only
 R-SP-09  warm-up shown as one line
```

## G. Answers to APP_REPORT_018 that this version settles

Q6 (rule files fold-in) → partly: `season_plan.md` v4 is the new source; `weekly_shape` and
`run_intervals` fold-ins come later; the decisions file v3 wins until then. Q1-Q5 stay open (not touched).

## H. CR-019 (power blocks W6-W10)

Superseded for W6 by the priming + storms. Do not implement any CR-019 content here.

## Expected behaviour after the change

- Given week 6, Tue 13 Oct shows 5 × 4 min at 5:10, jog 2, then 6 low-lung sprints.
- Given week 6, Wed 14 Oct is "Compétences au parc" with obstacle × 5 official, bench with ball, racket,
  hoops and WILL 10; Thu 15 Oct is CrossFit; Fri 16 Oct is "Enchaînement" with two storms and three tests;
  Sat 17 Oct is "Trail" with no distance; no Saturday CrossFit; Sun 18 Oct empty.
- Given week 7, Mon 19 Oct is empty and Tue/Thu/Sat show the three travel placeholders, Sun "Trail
  (optionnel)".
- Given week 9, Mon 2 Nov is empty, Tue and Wed are easy runs, Sat 7 Nov is CrossFit.
- Given week 10, Fri 13 Nov shows the W6 storms with "Revanche".
- Given the Friday Retour tab, after entering fresh and tired scores, the GAP is shown, computed.

## Tests that must pass

- [ ] `SEASON_PLAN` W6-W11 reproduces the table of section A cell for cell
- [ ] weeks 3, 4 and 5 reproduce their locked files (existing fixtures, unchanged)
- [ ] week 6 reproduces `WEEK_6_FINAL_2026-10-12_v2.md` block for block (new fixture)
- [ ] W6 Saturday has no CrossFit; W9 Monday has no CrossFit; W9 Saturday has CrossFit
- [ ] enchainement: two storms, three tests (fresh, tired 1, tired 2), not flagged for two hard blocks
- [ ] trail_day shows no distance; warm-ups are one line in W6+
- [ ] W7-W11 sessions other than W10 Friday show "Contenu à construire" and no copied content
- [ ] the GAP is computed from drillScores; no new stored field
- [ ] W6 Tuesday shows 5 × 4 @ 5:10, jog 2, and the low-lung block with its safety line
- [ ] three hard days are flagged, never blocked
- [ ] no text predicts an official time; no full mock test
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm build` pass; deployed page checked

## Out of scope

The state schema and `loadCoachState` (persistence). Drive sync. The memory game logic (CR-018, only its
mapping to the new police session kinds). The reload banner. Content of W7-W9, W10 Wed/Thu, W11
(later data drops). Any sporting decision: write the question in the APP_REPORT, never invent a drill,
a dose, a pace or a substitute atom.

## Deliverable back

`handoffs/APP_REPORT_013_v5.md` in the repo (copied to Drive `04_App_handoffs/` by Cowork), ending with the
commit hash. Pull request titled `CR-013 v5 season reshape and week 6`. Never push to main, do not merge,
do not tag: the athlete merges on GitHub, then the Cowork chat publishes the tag `cr-013-v5` on the merge
commit (routing v4, section 3b). Cut the branch with no upstream (cockpit section 9).
Never a person's name, e-mail, hostname, device name or personal folder path.
