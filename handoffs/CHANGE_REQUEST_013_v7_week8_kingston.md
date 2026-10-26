# CHANGE_REQUEST_013 v7: week 8 (Kingston), four new cards, the W9-W11 skeleton of season_plan v5, the APP_REPORT_013_v5 answers

<!-- template v5, 24 September 2026: coder never tags and never pushes to main; the tag is published by the Cowork chat after the athlete's merge (routing v4, section 3b) -->

Direction: **Training brain → App code.** Written in Cowork. Read by the coder (the athlete's Claude Code session).
Date: 25 October 2026 · Author: the athlete + Claude · Status: open
Version 7 of CR-013. v6 is merged (main `eb65779`, PR 16; tag `cr-013-v6` published by Cowork at gate 3).
Order: independent of CR-021 (Drive sync, persistence): either order, NEVER in the same session.
Week 8 runs Mon 26 Oct to Sun 1 Nov; if this lands mid-week, the past days keep their ids (see A).
Own session. Branch: `cr-013-v7-week8-kingston` (cut with no upstream, cockpit section 9).
Kind: engine (a new circuit score "laps + station"; an enchaînement without fresh and fatigue tests)
+ data · **Tier: TOP** (engine → TOP, routing v4). Model: Opus, effort high.

## Read first

`CLAUDE.md`, `handoffs/00_COCKPIT.md` section 9, `handoffs/00_AGENT_ROUTING.md`, then only the files under
"Inputs". State the tier in your first reply and say if the model you run on does not match.
If `handoffs/APP_REPORT_013_v6.md` left open questions, do not answer them: copy them into your report.

## Why

Week 7 is done. Week 8 is a travel week in Kingston: a hotel gym (dumbbells about 10 kg, treadmills) until
Thursday only, then no gym; every 400 m and 800 m run is outdoors. Her travel kit: a yoga mat, one
tennis ball, the hoops, the rope, the racket; no basketball, no wall, no bar. Balance with the ball fails
even fresh, so it becomes the top priority: one leg on a folded yoga mat, almost every day. She chose a
very hard week (Monday easy, Tuesday to Sunday hard), knowing it. Today the app shows week 8 as travel
placeholders. **Design goal: week 8 block for block as data; four new cards; the KINGSTON 10 circuit
scored as laps + station; the W9-W11 skeleton of season_plan v5; the 13 answers to APP_REPORT_013_v5;
weeks 3 to 7 untouched.**

## Inputs (Drive, copy into `handoffs/`; Drive is the source, never `90_Archive/`)

| File | version | What it gives |
|---|---|---|
| `03_Weekly_plans/WEEK_8_FINAL_2026-10-26.md` | FINAL v1 (25 Oct) | week 8, block for block |
| `02_Training_brain/rules/season_plan.md` | **v5** (18 Oct) | the W9-W11 rows; R-SP-09 to R-SP-17 |
| `02_Training_brain/rules/weekly_shape.md` | **v8** (18 Oct) | session structure where v5 is silent |
| `04_App_handoffs/DECISIONS_APP_REPORT_013v5_2026-10-12.md` | 12 Oct | the answers Q1-Q13 |
| `02_Training_brain/exercise_cards/00_INDEX.md` | 25 Oct | the card list |
| `02_Training_brain/exercise_cards/S09_kingston_balance_ladder.md` | v1 (25 Oct) | NEW: balance ladder, app text |
| `02_Training_brain/exercise_cards/S10_rope_mix_15.md` | v1 (25 Oct) | NEW: Tabata footwork + card ladder |
| `02_Training_brain/exercise_cards/S00_dumbbell_thruster.md` | v1 (25 Oct) | NEW: strength piece |
| `02_Training_brain/exercise_cards/BLK_kingston_10.md` | v1 (25 Oct) | NEW: the circuit, laps + station |
| `02_Training_brain/exercise_cards/S00_push_up.md` · `S00_full_burpee.md` · `S00_jump_squats.md` | v1 | atoms used by the WODs |

Precedence: `WEEK_8_FINAL_2026-10-26` wins for week 8 · season_plan v5 for the rules and the W9-W11 rows ·
the DECISIONS file for Q1-Q13 · weeks 3 to 7 keep their locked content and MUST NOT change (results are
stored by session id; week 7 already holds her results).

## A. Week 8 skeleton (`SEASON_PLAN`, week 8 row only)

```
 wk  dates          Mon       Tue          Wed            Thu            Fri            Sat            Sun
 8   26 Oct-1 Nov   easy_run  skill (gym)  strength +     run_intervals  enchainement   cardio day     trail_day
                    (light)   + cardio     cardio (gym)   (treadmill)    (KINGSTON 10)  (RUSSIAN)
```
```
 MUST  the travel placeholders of week 8 (travel_speed, travel_mini_ench, travel_skill_kit) are removed
       from week 8. If no week still uses a travel kind, keep the kinds in the union anyway (old results).
 MUST  reuse existing session kinds where one fits (easy_run, run_intervals, enchainement, trail_day).
       For Tue, Wed and Sat choose the closest existing hard kind; add a new kind ONLY if none fits,
       and say which in the report. Never a CrossFit kind (no class in Kingston).
 MUST  loads: Mon light · Tue to Sat hard · Sun trail day.
 KEEP  Q10: three-hard-days marks stay SILENT on the planned week; shown only when the athlete moves a
       session and creates a new run of hard days. Never blocked (R-SP-13).
 KEEP  the athlete may drag any session to any day of its week.
 KEEP  the memory cycle of CR-018 as built. WEEK_8_FINAL has no memory slot: do not invent one; if the
       cycle forces a slot on a week 8 police session, write the question in the report.
 KEEP  if a week 8 day already holds a result when this lands, its id must still attach (ids date:kind).
```

## B. Week 8 content, as data (from `WEEK_8_FINAL_2026-10-26.md`; app texts in French)

```
 GENERAL  warm-ups are ONE line (R-SP-09, Q4). Daily line on the week card (Q11):
          "2 min d'équilibre sur une jambe pendant le brossage des dents".
          Phase label (Q9): "Voyage · entretien" (see the question at the end of this file).
          Every run of 400 m or 800 m is "en extérieur" (no gym from Friday; she paces it herself).

 Mon 26   easy_run  "Facile · journée de terrain" (about 45 min, light)
          ÉCHELLE D'ÉQUILIBRE KINGSTON 12' (card S09_kingston_balance_ladder, text below)
          FOOTING FACILE 30 min, 8,5 km/h ou plus lent
          scores: touchers + balles tombées (échelle) · effort

 Tue 27   "Compétences + cardio" (about 60 min, hard, flagged above the usual limit)
          échauffement ~5 min
          ÉCHELLE D'ÉQUILIBRE KINGSTON 12'
          CORDE MIX 15 (card S10_rope_mix_15, text below)
          CARDIO RUN B (Cross Ops p 14) : max de tours en 30 min · 800 m de course en extérieur
          · 20 burpees · no target · scores: tours + mètres du tour entamé · effort

 Wed 28   "Force + EAGLE" (about 50 min, hard, gym)
          échauffement ~5 min
          THRUSTERS HALTÈRES 5 × 8, 2 × 10 kg, repos 90 s (card S00_dumbbell_thruster)
          · scores: charge (kg) · répétitions faites · effort
          EAGLE (Cross Ops p 14) : max de tours en 20 min · 400 m de course en extérieur
          · 10 squat jumps · 10 burpees · scores: tours · effort
          ÉQUILIBRE FATIGUÉ 5' (ladder steps 1-2, 30 s par jambe, 3 tours, repos 20 s) · score: touchers

 Thu 29   run_intervals  "Fractionné · tapis" (about 55 min, hard)
          échauffement ~15 min à 8,5 km/h + 3 × 20 s à 13 km/h
          5 × 3 min à 12,0 km/h (5:00 /km), pente 1 %, 2 min de footing à 8 km/h entre
          ÉQUILIBRE FATIGUÉ 5'
          retour au calme 10 min facile
          scores: 5 allures · touchers · effort

 Fri 30   enchainement  "Enchaînement · KINGSTON 10" (about 35 min, hard, park)
          échauffement ~5 min + PRIMING 2 × 10 s sprint
          KINGSTON 10 · MAX DE TOURS EN 10 MIN · un tour, dans l'ordre de l'épreuve :
            1 navette 4 × 20 m
            2 cinq fois : 1 burpee (poitrine au sol) + 1 squat jump
            3 10 pompes, poitrine au sol
            4 cerceaux, les 11, aller, pieds selon la couleur (erreur : retour au cerceau 1)
            5 sur une jambe sur le tapis plié, balle autour de la taille : 10 s droite + 10 s gauche
              (un toucher : on recommence cette jambe)
            6 carte de corde : 5 pied droit · 5 pied gauche · 10 pieds joints (erreur : on recommence le bloc)
          score: tours complets + station atteinte à 10:00 · effort
          NO fresh test, NO fatigue test this week (the athlete's decision, W8 only)
          MAX (Cross Ops p 17) : 10 tours chrono · 10 abdos · 10 pompes · 15 squats · score: temps
          marche 5 min
          rules shown: pas de repos prévu · vertige → stop, ça compte · sans cerceaux : station 4 =
          10 sauts de corde sur une jambe (5 par jambe)

 Sat 31   "RUSSIAN" (about 45 min, hard, no gym)
          échauffement ~5 min
          ÉCHELLE D'ÉQUILIBRE KINGSTON 12'
          RUSSIAN (Cross Ops p 17) : max de tours en 20 min · 10 pompes (pour 10 tractions)
          · 10 squat jumps (pour 10 box jumps) · 10 burpees · 10 squat jumps · 400 m en extérieur
          · scores: tours · effort
          ÉQUILIBRE FATIGUÉ 5'

 Sun 1    trail_day  "TRAIL" only, no detail (R-SP-10)
```

**Card texts shown in the app (French, from the cards):**

```
 ÉCHELLE D'ÉQUILIBRE KINGSTON · 12 min · tapis de yoga plié en quatre · 1 balle de tennis · un mur
 1 min de travail, 30 s de repos. Debout bien droit, genou souple, regard sur un point fixe. Le pied
 libre ne touche pas la jambe d'appui.
 1  Jambe droite sur le tapis. Passe la balle autour de la taille, d'une main à l'autre, sans arrêt. 1 min
 2  Jambe gauche sur le tapis. Pareil. 1 min
 3  Yeux fermés, au sol (pas sur le tapis), une main près du mur. 30 s jambe droite, puis 30 s gauche
 4  Jambe droite sur le tapis, à 1 m du mur. Lance la balle par en dessous contre le mur, rattrape-la
    d'une main. 1 min
 5  Jambe gauche sur le tapis. Pareil. 1 min
 6  Refais 1 et 2. 2 min
 Compte : touchers (le pied libre touche le sol) + balles tombées. But : 0.
 Stop si vertige, 3 touchers en une minute (ça compte), ou douleur à la cheville.
 Version fatiguée (5 min, après le cardio) : étapes 1 et 2 seulement, 30 s par jambe, 3 tours, repos 20 s.

 CORDE MIX 15 · 15 min
 Partie A · Tabata, 8 min : 20 s de corde, 10 s de repos, 16 tours (la suite de 8 tours, deux fois)
   tours 1-2 pieds joints · 3-4 côté à côté (20 cm) · 5-6 avant-arrière (20 cm)
   tour 7 pied gauche seul · tour 8 pied droit seul · tours 9-16 pareil
 Repos 1 min
 Partie B · échelle de cartes, 6 min : 1 min pour chaque carte, 30 s de repos ;
   une erreur fait recommencer le bloc en cours
   1  5 droit · 5 gauche · 10 joints      2  8 droit · 8 gauche · 10 joints
   3  10 droit · 10 gauche · 10 joints    4  15 droit · 15 gauche · 15 joints
 Scores : ratés sur les tours à un pied (7, 8, 15, 16) · cartes propres sur 4
```

## C. Engine

```
 MUST  a new circuit score shape "laps + station at the cap": BOTH numbers are entered together
       (laps completed, then station 1-6 reached at 10:00). The v6 shape "time OR station at the cap"
       stays for BORDEAUX 10 (weeks 7, 9, 10) unchanged.
 MUST  an enchaînement may run WITHOUT fresh test and fatigue test (week 8 only, data flag). Then no
       GAP is computed and nothing shows as missing. Weeks 7, 9, 10 keep their tests.
 MUST  a cardio block with an outdoor run shows the distance; no pace, no target (R-TL-12).
 KEEP  the v5 two-storm shape for week 6 and the week 10 Friday rematch.
```

## D. Scores (no persistence change)

Use `drillScores: [{drillId, measure, value}]`, as in v5 and v6. Do NOT add a stored field. Suggested ids:
`balance:ladder_touchdowns`, `balance:ladder_drops`, `balance:tired_touchdowns`, `rope:onefoot_misses`,
`rope:clean_cards` (0-4), `cardio:cardiorunb_rounds`, `cardio:cardiorunb_metres`, `strength:thruster_kg`,
`strength:thruster_reps`, `cardio:eagle_rounds`, `intervals:rep1` … `intervals:rep5`,
`ench:kingston10_laps`, `ench:kingston10_station` (1-6), `cardio:max_time_s`, `cardio:russian_rounds`.
If you find that any of this needs a new stored field, stop and write the question in the report.

## E. Weeks 9 to 11, skeleton from season_plan v5 (content stays named gaps until each lock)

```
 wk  Mon             Tue        Wed        Thu        Fri                 Sat        Sun
 9   optional, gap   easy run   easy run   SKILL gap  ENCHAÎNEMENT gap    CrossFit   easy run
     "challenging if before the flight" (back Mon 2 Nov; v4 said Tue 3)
 10  CrossFit        intervals  ENCHAÎN.   SKILL gap  REMATCH W6 storms   TRAIL day  -
                                gap
 11  CrossFit        intervals  SKILL gap  -          POLICE TEST (fixed)  -         -
     (offload: skill + mental; "mental" not yet defined: keep a named gap)
```
```
 MUST  only the rows that differ from what main shows today change (W9 Monday is the known
       difference); list every cell you change in the report.
 MUST  no session after Fri 20 Nov 2026 (R-TL-08).
```

## F. The answers to APP_REPORT_013_v5 (DECISIONS file, 12 Oct; check each against main first:
## v6 may already carry some; say which in the report)

```
 Q1  Tuesday repeat / advance rule: OFF from week 6; paces are set by Cowork at each week build.
 Q2  Week 10 low-lung dose: set at the W10 build (no change now).
 Q3  Week 10 rematch Friday: memory card stays 4 min (the W6 card), not the 10 min M4.
 Q4  R-SP-09 covers the Tuesday run too: one line "Échauffement ~10 min (footing)".
 Q5  Box jumps used: one oui / non PER STORM.
 Q6  Storm slalom: keep S01_slalom_18m.
 Q7  Push-ups: atom card S00_push_up; WILL 10 burpees = chest to the floor (S00_full_burpee).
 Q8  Friday hoops tests: one number "erreurs" per pass; Wednesday keeps feet and hands apart.
 Q9  Phase labels: W6 "Parc" · W7-W8 "Voyage · entretien" · W9 "Reprise" · W10 "Charge" · W11 "Allègement".
 Q10 Three-hard-days marks: silent on planned weeks; shown only after a move creates a new run.
 Q11 Daily balance line on every week from W6 to W11.
 Q12 Easy runs side by side in W9: fine, by design.
 Q13 Jumping jacks in W5: nothing to do.
```

## Expected behaviour after the change

- Given week 8, Mon 26 is "Facile · journée de terrain" with the balance ladder and a 30 min easy run;
  Tue 27 has the ladder, CORDE MIX 15 and CARDIO RUN B; Wed 28 thrusters and EAGLE; Thu 29 5 × 3 min at
  12,0 km/h; Fri 30 "Enchaînement · KINGSTON 10" with the six stations, no fresh or fatigue test, then MAX;
  Sat 31 RUSSIAN; Sun 1 "TRAIL".
- Given the Friday Retour, she enters "3 tours, station 4": both are stored; no GAP line appears.
- Given a Thursday 22 Oct result (week 7), it is still there and unchanged.
- Given weeks 3 to 7, the app shows exactly what it showed before; week 9 Monday shows an optional gap.
- Given the week 6 to 11 headers, the phase labels of Q9 show.

## Tests that must pass

- [ ] week 8 reproduces `WEEK_8_FINAL_2026-10-26.md` block for block (new fixture)
- [ ] weeks 3 to 7 reproduce their current fixtures (unchanged); week 7 results still attach
- [ ] week 8 has no travel placeholder
- [ ] KINGSTON 10: laps AND station stored together; BORDEAUX 10 keeps "time OR station"
- [ ] week 8 enchaînement: no fresh test, no fatigue test, no GAP, nothing marked missing
- [ ] the ladder and rope texts show as written in section B
- [ ] Q1-Q13 each covered by a test or named in the report as already on main
- [ ] warm-ups are one line; no text predicts an official time; no full mock test; no session after 20 Nov
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm build` pass; deployed page checked after the merge

## Out of scope

The state schema and `loadCoachState` (persistence). Drive sync (CR-021). Week 9 to 11 CONTENT (only the
skeleton). CR-019. CR-012. Any sporting decision: write the question in the APP_REPORT, never invent a
drill, a dose, a pace or a substitute atom.

## Question already raised with the athlete (do not decide it in code)

Q9 gives W8 the label "Voyage · entretien", but the athlete chose a hard week 8. Use the Q9 label unless
the cockpit or a newer DECISIONS file says otherwise.

## Deliverable back

`handoffs/APP_REPORT_013_v7.md` in the repo (copied to Drive `04_App_handoffs/` by Cowork), ending with the
commit hash. Pull request titled `CR-013 v7 week 8 Kingston`. Never push to main, do not merge, do not tag:
the athlete merges on GitHub, then the Cowork chat publishes the tag `cr-013-v7` on the merge commit
(routing v4, section 3b). Cut the branch with no upstream (cockpit section 9).
Never a person's name, e-mail, hostname, device name or personal folder path.
