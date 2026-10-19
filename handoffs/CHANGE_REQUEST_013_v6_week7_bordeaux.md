# CHANGE_REQUEST_013 v6: week 7 (Bordeaux), the single-circuit enchaînement, the Luc Léger test

<!-- template v5, 24 September 2026: coder never tags and never pushes to main; the tag is published by the Cowork chat after the athlete's merge (routing v4, section 3b) -->

Direction: **Training brain → App code.** Written in Cowork. Read by the coder (the athlete's Claude Code session).
Date: 19 October 2026 · Author: the athlete + Claude · Status: open
Version 6 of CR-013. v5 is merged (merge `0fcaafb`, tag `cr-013-v5`).
**Scope decided by the athlete on 19 Oct: week 7 ONLY, now, because week 7 has started (Mon 19 Oct).**
Week 8 content, the W8-W11 skeleton changes of season_plan v5 and the answers to APP_REPORT_013_v5
come in CR-013 v7, after the W8 lock. Order: independent of CR-020 (separate session, either order).
Own session. Branch: `cr-013-v6-week7-bordeaux` (cut with no upstream, cockpit section 9).
Kind: engine (a new enchaînement shape: one circuit for time; a test block inside an interval day)
+ data · **Tier: TOP** (engine → TOP, routing v4). Model: Opus, effort high.

## Read first

`CLAUDE.md`, `handoffs/00_COCKPIT.md` section 9, `handoffs/00_AGENT_ROUTING.md`, then only the files under
"Inputs". State the tier in your first reply and say if the model you run on does not match.

## Why

Week 6 is done. From week 7 the enchaînement is no longer two 7-minute storms but ONE 8-10 minute
high-speed circuit of 5-6 stations that matches the breath and speed of the real test, followed by the
fatigue test (R-SP-15, season_plan v5). Week 7 is a travel week in Bordeaux (no gym, a park to find).
The athlete also decided to run the real Luc Léger test (20 m multistage shuttle run) once, on
Wednesday 21, fresh, before her intervals: her VMA of 2 Oct is out of date and the result will reset
the paces of weeks 8 to 11 (test_battery v3). Today the app shows week 7 as travel placeholders.
**Design goal: week 7 block for block as data; the new enchaînement shape; the Luc Léger result
recorded and its VMA computed; weeks 3 to 6 untouched; weeks 8 to 11 untouched.**

## Inputs (Drive, copy into `handoffs/`; Drive is the source, never `90_Archive/`)

| File | version | What it gives |
|---|---|---|
| `03_Weekly_plans/WEEK_7_FINAL_2026-10-19_v3.md` | FINAL v3 (19 Oct) | week 7, block for block |
| `02_Training_brain/rules/season_plan.md` | **v5** (18 Oct) | R-SP-13, R-SP-15, R-SP-16 |
| `02_Training_brain/rules/weekly_shape.md` | **v8** (18 Oct) | session structure where v5 is silent |
| `02_Training_brain/rules/test_battery.md` | **v3** (19 Oct) | the Luc Léger test, R-TB-01 to R-TB-05 |
| `02_Training_brain/exercise_cards/00_INDEX.md` | 19 Oct | the card list |
| `02_Training_brain/exercise_cards/S00_luc_leger_test.md` | v1 | the test, stage speeds, end rule |
| `02_Training_brain/exercise_cards/BLK_bordeaux_10.md` · `BLK_roumi.md` · `BLK_will_10.md` | v1 | blocks |
| `02_Training_brain/exercise_cards/S11_racket_balance_wall.md` · `S11_racket_course_5min.md` · `S10_skipping_emom_8.md` | v1 | atoms |
| `02_Training_brain/exercise_cards/S02_obstacle_backup_stairs.md` · `S02_obstacle_backup_burpee_jump.md` · `S09_bench_backup_rope_line.md` · `S09_bench_backup_one_leg_ball.md` | v1 | backups B and C |

Precedence: `WEEK_7_FINAL_2026-10-19_v3` wins for week 7 (example: hoops = the full 11 on Friday, the
athlete's decision, over R-SP-17 "7 hoops in W7") · season_plan v5 for the rules · weeks 3 to 6 keep
their locked content and MUST NOT change (results are stored by session id).

## A. Week 7 skeleton (`src/coach/sessionShapes.ts`, `SEASON_PLAN`, week 7 row only)

```
 wk  dates       Mon            Tue          Wed              Thu           Fri          Sat   Sun
 7   19-25 Oct   crossfit_class skill_park   run_intervals    enchainement  skill_park   -     -
                                             (+ Luc Léger     (one circuit) (skill for
                                              test block)                    time)
```
```
 MUST  the travel placeholders of week 7 (travel_speed, travel_mini_ench, travel_skill_kit, the
       optional Sunday trail) are removed from week 7 only. The travel kinds stay in the union
       (week 8 still uses them until v7).
 MUST  Sat 24: nothing (rest). Sun 25: a note line only, "Vol vers Kingston · repos", no session.
 MUST  weeks 8 to 11 stay exactly as in v5 (fixtures unchanged).
 KEEP  hard days in a row are FLAGGED, never blocked (R-SP-13). Wed 21 and Thu 22 are two hard days
       in a row and Thu 22 is above the usual limit: show the flag, she keeps them.
 KEEP  the memory cycle of CR-018 as built. If a W7 police session has no memory slot in the FINAL
       file, do not invent one: write the question in the report.
 KEEP  the athlete may drag any session to any day of its week.
```

## B. Week 7 content, as data (from `WEEK_7_FINAL_2026-10-19_v3.md`; app texts in French)

```
 GENERAL   warm-ups are ONE line (R-SP-09). Daily line on the week card:
           "2 min d'équilibre sur une jambe pendant le brossage des dents".

 Mon 19  crossfit_class  "Cours CrossFit · adapter les sauts (trail de 20 km samedi)" · recorded only

 Tue 20  skill_park "Compétences courtes · parc" (about 40 min)
         warm-up ~5 · repérer pour jeudi : muret plat (banc), mur ou banc à hauteur de poitrine
           (obstacle), barre hanches-poitrine (tirages) ; pour mercredi : une ligne plate de 20 m
         ÉQUILIBRE SUR BANC AVEC BALLE 10' : muret plat ou bordure, marches, demi-tours, échanges
           officiels · scores: chutes + touchers, demi-tour réussi (oui/non)
         RAQUETTE EN ÉQUILIBRE 10' : autour de 5-6 obstacles, puis le long du muret plat
           · score: balles tombées par passage
         CARDIO WILL 10 (Cross Ops p 16) : AMRAP 10 · 3 burpees · 10 pompes · 10 squats
           · no target · scores: tours · effort

 Wed 21  run_intervals "Test Luc Léger + fractionné" (about 70 min)
         warm-up ~10, footing + 2-3 accélérations
         TEST LUC LÉGER (bloc séparé, en premier, à frais) :
           20 m mesurés, application bip au protocole Léger (palier 1 à 8,5 km/h, +0,5 km/h par minute)
           continu, atteindre la ligne à chaque bip, sans pause
           fin au DEUXIÈME bip manqué de suite
           scores: palier atteint · navette (leg) · effort
         récupération 10' : marche 3, footing facile 7
         FRACTIONNÉ 4 × 4 min à 5:10 /km, footing 2 min entre
           5e répétition seulement si la 4e est à 5:15 ou plus vite ET effort ressenti 4 ou moins
           · scores: 4 allures + 1 optionnelle · effort
           line shown: "Après un test maximal, des allures plus lentes sont normales, pas un échec."
         retour au calme

 Thu 22  enchainement "Enchaînement · BORDEAUX 10" (about 55 min, flagged above the limit)
         warm-up ~5 + PRIMING 2 × 10 s sprint
         FRESH TEST : banc avec balle 1 échange officiel · raquette 1 passage
         BORDEAUX 10 · 2 TOURS CHRONO · cap 10:00 · un tour, dans l'ordre :
           sprint 20 m · slalom ~15 m (aller droit, retour en slalom)
           · obstacle, rythme officiel : 5 passages aller (une balle de tennis dans la casquette à chaque
             fois), 4 retour sans balle (9 passages)
           · 10 tirages à la barre · 8 burpees complets · 45 s de corde
           score: temps total, OU la station atteinte à 10:00 · effort · backup utilisé (A, B, C)
         FATIGUE TEST within 30 s : banc avec balle 1 échange · raquette 1 passage
         repos 3'
         ROUMI (Cross Ops p 14) : 10 tours chrono · 10 squats · 5 burpees · 10 squat jumps
           · score: temps · effort
         retour au calme
         rules shown: burpees poitrine au sol · tirages corps gainé · passage bâclé → backup C pour la
           suite du circuit · ça vacille sur le banc → descendre exprès · vertige → stop, ça compte

 Fri 23  skill_park "Compétences chrono" (about 35 min, vol de nuit)
         CERCEAUX : les 11, aller ballon dans les bras, retour en dribble · 4 passages
           · scores: erreurs de pied · erreurs de main
         PARCOURS RAQUETTE 5 min continu, plat + obstacles · score: balles tombées (total)
         CORDE EMOM 8 min : chaque minute 5 pied droit · 5 pied gauche · 10 pieds joints, repos le reste
           · score: minutes propres (sur 8)
         BANC AVEC BALLE 5 min, demi-tours compris · scores: chutes + touchers, demi-tour (oui/non)

 Backups shown on the Thursday and Tuesday cards (R-SP-14; the log names A, B or C):
   obstacle  A mur ou banc à hauteur de poitrine · B escaliers, sauter 2-3 marches · C 1 burpee + 1 squat jump
   banc      A bordure ou muret plat · B la corde posée au sol · C sur une jambe, balle autour de la taille
   tirages   sans barre : pompes, même nombre
   Luc Léger sans ligne de 20 m : déplacer le test à un jour qui en a une ; jamais une distance plus courte
```

## C. The new enchaînement shape (engine)

```
 MUST  from week 7 an enchainement = warm-up + priming · fresh test · ONE circuit (for time, with a
       cap) · fatigue test within 30 s · a Cross Ops block · cool-down (R-SP-15).
 MUST  the v5 shape (two storms + three tests) stays available: week 6 keeps it, and the week 10
       Friday rematch uses it (R-SP-11 exception). Do not migrate week 6.
 MUST  a single-circuit enchaînement is not flagged for "more than one hard block" because of the
       Cross Ops block after it (R-SP-08: hard days are loaded).
 MUST  the circuit score accepts EITHER a total time OR "station reached at the cap", never both.
```

## D. Scores (no persistence change)

Use `drillScores: [{drillId, measure, value}]`, as in v5. Do NOT add a stored field. Suggested ids:
`test:luc_leger_stage`, `test:luc_leger_leg`, `intervals:rep1` … `intervals:rep5` (rep5 optional),
`skill:bench_ball_falls`, `skill:bench_ball_turn`, `skill:racket_balance_drops`, `cardio:will10_rounds`,
`fresh:bench_ball`, `fresh:racket`, `tired1:bench_ball`, `tired1:racket`, `ench:bordeaux10_time_s`,
`ench:bordeaux10_station_at_cap`, `ench:backup`, `cardio:roumi_time_s`, `skill:hoops11_foot`,
`skill:hoops11_hand`, `skill:racket_course_drops`, `skill:skipping_emom8_clean`.
If `value` is numeric only: encode the backup as A = 1, B = 2, C = 3 and yes / no as 1 / 0, and say so
in the report.

```
 COMPUTED, never typed (R-TB-03), shown on the Wednesday Retour:
   VMA (km/h) = 8.0 + 0.5 × (palier atteint − 1)      the speed of the last fully completed stage
   shown with the stage and leg; no target, no comparison, no predicted time (R-TB-04)
   it changes NOTHING automatically (R-TB-05): the paces of weeks 8-11 are reset in Cowork
 COMPUTED, Thursday: the GAP fresh → tired for bench with ball and racket (as in v5)
```
If you find that any of this needs a new stored field, stop and write the question in the report.

## Expected behaviour after the change

- Given week 7, Mon 19 Oct is CrossFit; Tue 20 is "Compétences courtes · parc" with bench, racket in
  balance and WILL 10; Wed 21 starts with the Luc Léger test block, then 10 min recovery, then 4 × 4 min
  at 5:10 with an optional 5th; Thu 22 is "Enchaînement · BORDEAUX 10" with one circuit (2 laps, cap
  10:00), fresh and fatigue tests and ROUMI; Fri 23 is "Compétences chrono"; Sat 24 is empty; Sun 25
  shows only the flight note.
- Given the Wednesday Retour, entering "palier 9, navette 6" shows a computed VMA of 12.0 km/h.
- Given the Thursday Retour, either a total time or a station at the cap can be entered, not both.
- Given weeks 3 to 6 and 8 to 11, the app shows exactly what it showed before this change.

## Tests that must pass

- [ ] week 7 reproduces `WEEK_7_FINAL_2026-10-19_v3.md` block for block (new fixture)
- [ ] weeks 3, 4, 5, 6, 8, 9, 10, 11 reproduce their current fixtures (unchanged)
- [ ] week 7 has no travel placeholder; week 8 still has its travel placeholders
- [ ] the single-circuit enchaînement: one circuit, fresh test, fatigue test, Cross Ops block; week 6
      and the week 10 Friday keep the two-storm shape
- [ ] the circuit score accepts time OR station at cap, never both
- [ ] the Luc Léger block comes before the interval block on Wed 21; the VMA is computed, never typed
- [ ] the optional 5th interval rep never counts as missed
- [ ] Wed 21 + Thu 22 hard days are flagged, never blocked
- [ ] warm-ups are one line; no text predicts an official time; no full mock test
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm build` pass; deployed page checked

## Out of scope

The state schema and `loadCoachState` (persistence). Drive sync. Weeks 8 to 11 (content AND skeleton:
CR-013 v7). The answers to APP_REPORT_013_v5 (CR-013 v7). CR-020 (safe area, its own session). CR-019.
Any sporting decision: write the question in the APP_REPORT, never invent a drill, a dose, a pace or a
substitute atom.

## Deliverable back

`handoffs/APP_REPORT_013_v6.md` in the repo (copied to Drive `04_App_handoffs/` by Cowork), ending with the
commit hash. Pull request titled `CR-013 v6 week 7 Bordeaux`. Never push to main, do not merge, do not
tag: the athlete merges on GitHub, then the Cowork chat publishes the tag `cr-013-v6` on the merge
commit (routing v4, section 3b). Cut the branch with no upstream (cockpit section 9).
Never a person's name, e-mail, hostname, device name or personal folder path.
