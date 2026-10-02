# APP_REPORT_013 v3: week 5 and the engine chain

Change request: `handoffs/CHANGE_REQUEST_013_blocks_tails_sessions.md` v3 (2 October 2026),
copied from Drive `04_App_handoffs` with its six inputs (names kept): `DECISIONS_APP_REPORTS_013v2_017_2026-09-24.md`,
`rules/season_plan.md` v3, `rules/weekly_shape.md` v7, `rules/run_intervals_progression.md` v4,
`exercise_cards/S10_block_switch_fresh.md` v3, `WEEK_5_FINAL_2026-10-05.md`. Byte sizes checked
against Drive, none read from `90_Archive/`.
Tier declared in the CR header: **TOP** (engine). Run on Claude Opus 5.5 as the routing asks, but at
low effort instead of high: flagged at the start of the session, the athlete's call to continue.
Branch `cr-013-v3-week5-engine`, cut from `origin/main` at `09e9724` (CR-015) with no upstream.
Nothing merged, nothing tagged, nothing pushed to `main`.

## Done, and not done

```
 DONE
 A  SEASON_PLAN v3, cell for cell, with phase · crossfitPlus · runDay · hillSprintsDay · travel
 B  travel weeks (no Monday CrossFit, treadmill km/h, no wall bars / hoops / ghost in any text)
    crossfit_plus Saturdays W6 and W9 (CrossFit day, hard, run moved to Sunday)
    W8 focus placeholder "Slalom ou raquette, à confirmer" · W9 Tuesday hill sprints
    travel chain and ghost placeholders · engine memory 4 min, 6 min with M4
    R-WS-10 counts a crossfit_plus day as hard
 C  ENGINE CHAIN shape from week 5: warm-up · fresh reference 2 · memory · POWER EMOM 6 ·
    chain 11 (hard, no tail A) · cardio · tail B 4 · cool-down 4; new block kind `power_emom`
 D  week 5 as data: SKILL_BLOCKS[10], CHAIN_BLOCKS.chain_B, POWER_EMOM_BY_WEEK[5],
    CARDIO_BY_WEEK[5] (Quatre coins, La montée), the two warm-ups; Wed 7 skill, Thu 8 engine
 E  Tuesday table v4, heat line, no re-test text, volumeFactor never touches the main set
 F  Q8 racket one row per set (6 obstacle boxes) from the next racket week; Q9 W9-W10 = 11 + balance
    45 new tests, 254 in total, all green; typecheck, build and schemas pass

 NOT DONE
 ·  deployed page not checked: the browser preview cannot start in this sandbox (macOS refuses the
    launcher access to the project folder, same as v2); screens checked in the jsdom harness
 ·  pull request: see "Delivery" at the end
```

## 1. What changed

### A. `SEASON_PLAN` v3 (`src/coach/sessionShapes.ts`)

`FocusStation` drops `W8_WORST` and gains `SLALOM_OR_RACKET`; `ChainKind` gains `travel_T`;
`Phase` is new; `SeasonWeek` gains `phase`, `crossfitPlus`, `runDay`, `hillSprintsDay`, `travel`;
`hillSprints` is `0 | 6`. One row per week 3 to 11, exactly the CR table (test 1 compares every
cell). `CARDIO_ATOM_EXCEPTIONS = [{ week: 5, shape: 'skill_session', atoms: 4 }]` is the R-WS-30
exception list in data; `maxCardioAtoms()` reads it; the rule stays three everywhere else.

### B. The generator (`src/coach/planner.ts`, `src/coach/sessionShapes.ts`)

```
 wk  Mon  Tue                 Wed    Thu    Fri    Sat            Sun        sessions
 5   CF   3×4' 5:25           SKILL  ENGINE  -     -              RACE       5
 6   CF   5×4' 5:25           -      SKILL   ENGINE CF (17 Oct)   run 7 km   6
 7   -    6×2' 5:05 11,8 km/h SKILL  ENGINE  -     run 7-8 km     -          4
 8   -    3×5' 5:20 11,3 km/h SKILL  ENGINE  -     run 7-8 km     -          4
 9   CF   6 hill sprints      -      SKILL   ENGINE CF (7 Nov)    run 7-8 km 6
 10  CF   4×3' 5:15           -      SKILL   ENGINE run 7 km + 6 hill  -     5
 11  CF   4×1' 5:00           TAPER  -       TEST                            4
```

- **R-WS-01** now expects `5 + crossfit_plus − travel` sessions; the Monday check is skipped in a
  travel week.
- **R-WS-10** counts the crossfit_plus day as hard whatever load is written on it.
- **R-WS-11**: the engine chain followed by the crossfit_plus Saturday is accepted by the
  validator as a second documented pair (question 8).
- **R-WS-28**: a reused cardio block whose real atoms were removed and named "à remplacer" is a
  named gap, not a filler-only block (substitution S4).
- **Travel weeks**: reused cardio drops any wall-bars or hoops atom and the regle line reads
  "N atomes sans le matériel de l’hôtel" without naming them; equipment lists drop ladder and hoops.

### C. The engine chain

```
 block                weeks 5+                         week 4 and before (unchanged)
 fresh reference      2 min                            3 min
 memory               4 min, 6 min with M4 (W9-W11)    4 min
 power EMOM           kind `power_emom`, 6 min         -
 chain block          11 min, intensity hard, no tail A 12 min, moderate, tail A
 cardio               the week's cardioMin             idem
 tail B               4 min                            5 min
 cool-down            4 min                            5 min
 title / version      "Enchaînement moteur" / v3       "Séance enchaînement" / v2
```

Validator: an engine chain must carry a power EMOM; a tail A in it is flagged (R-WS-34 v7); the
"tail A 30-45 s, moderate" checks stay for weeks 3-4; `power_emom` joins the hard blocks the fresh
reference must precede (R-WS-37). The power EMOM can never count as the cardio block: R-WS-16
counts kind `cardio` only, and a test retags it to prove a second cardio block is flagged. No
"one hard block" check exists in the code, so R-WS-04/R-TL-04 needed no change. The screen shows
the engine chain as "Intensité : à bloc"; the data stays `hard`.

### D. Week 5 (from `WEEK_5_FINAL`, French on screen)

```
 Tue 6   3 × 4 min à 5:25, jog 3 · heat line
 Wed 7   warm-up 8 + 3 jumps · Mémoire M2 6 "L’ordre, l’action et quand le poste compte comme réussi"
         + recall /33 · Corde à sauter 18 (A 6 × 45 s, round 6 coin variant; B 4 single cards;
         10 restart boxes; stop rule) · « Quatre coins » 30/15, 4 atoms + finisher · cool-down
         5 calves and ankles · 47 min
 Thu 8   « La ligne des 18 m » 9 + 3 jumps · fresh reference 2 (balance) · M2 4 · EMOM 6 (best
         jump box) · chain B 4 rounds, 60 s (time · rope restarts · racket drops · cones) ·
         « La montée » 10 (no jump atom, safety line) · tail B 4 · cool-down 4 · 50 min
 Sat 10  no session · Sun 11 race
```

### E. Tuesday (`src/data/runIntervalsProgression.ts`, `src/coach/recipes.ts`)

Rows 2-4 kept (Tue 29 Sep stays 4 × 4 at 6:00); rows 5, 6, 7, 8, 10, 11 from v4; no row for
week 9. The planner skips week 9 without moving the cursor, so the sprints stay on Tue 3 Nov
whatever the repeat rule did before. Travel rows say "Sur tapis, pente 1 %" and show the km/h
(computed from the pace: 11,8 and 11,3, the v4 values). Every Tuesday has `volumeFactor 1`, so W6
shows 5 × 4 and its full duration. `retest` and its sentence are deleted; zones and baseline
re-anchored on VMA 12.2. The heat line is shown from week 5 (question 7).

## 2. Substitutions and readings

| # | Point | What the code does | Why |
|---|---|---|---|
| S1 | W9 Tuesday session kind | `run_intervals` slot, recipe "Côtes — sprints en montée", one `hill_sprints` block, Retour asks "Sprints faits" only | keeps R-WS-03's two runs, the session id and no new `SessionKind`; "not run_intervals" read as "not the intervals content" |
| S2 | Travel week days | skill Wednesday, engine chain Thursday | season_plan v3 "Travel weeks" template, which weekly_shape v7 points to (question 1) |
| S3 | Power EMOM in W6-W10 | named gap "Puissance, EMOM 6 : à construire", no score | R-SP-03; only chain B is said to be reused in W6 (questions 2, 3) |
| S4 | R-WS-28 on travel cardio | not flagged while a real atom is listed "à remplacer" | the gap is named; flagging it would fail every generated travel week |
| S5 | Reused cardio beyond 3 atoms | the 4th atom is moved to "à remplacer" (W9, W10, W11 lose the air squats) | the R-WS-30 exception does not carry over; nothing is invented (question 5) |
| S6 | « Quatre coins » format | `amrap`, box "Tours faits (sur 3)", per-lap numbers in « Ce que tu as fait » | R-WS-08 knows EMOM, AMRAP, for time; no new stored field (question 6) |
| S7 | « Quatre coins » finisher | `finisher` field, not an atom | the plan counts four atoms |
| S8 | Week 4 racket boxes | week 4 keeps its three obstacle boxes; per-set rows from week 9 | "weeks 3 and 4 must not change" and their scores are already recorded |
| S9 | Chain B transition note | "Les 5 m de footing entre les postes font partie du tour : arriver prête au poste suivant." | R-PC-05 requires one; the plan has none (question 9) |
| S10 | Skipping block details | the card v3 execution line (read aloud, 2 s still, restart the block) | from the S10 card, not from the plan |
| S11 | Week 3 run day | the table says SUN, the app keeps Sat 26 Sep | week 3 must not change; decision 2 "no app change" |
| S12 | Power EMOM effort | best jump is the only box; effort goes in the session effort | no per-block effort field exists |
| S13 | W5 skill duration | 47 min from the blocks (8 + 6 + 18 + 10 + 5) | the plan header says about 49 |

## 3. Sporting questions (for Cowork, none decided here)

1. **Travel week days.** Skill Wednesday and engine chain Thursday, as the season plan's travel
   template. Keep, or Thursday and Friday like the other weeks?
2. **Power EMOM in travel weeks.** The season plan's travel template has no power EMOM; the
   engine shape has one. The app shows a placeholder in weeks 7 and 8. Keep a power block in the
   hotel, or drop it there?
3. **Power EMOM in weeks 6, 9, 10.** Placeholder until a data drop. Reuse the week 5 EMOM (it
   needs 18 m for the slalom), or write one per week?
4. **Travel cardio.** The reused week 5 cardio loses its wall bars and hoops atoms in weeks 7 and
   8: the skill cardio keeps jumping jacks and air squats, the engine cardio keeps air squats and
   high knees, each with "atomes à remplacer". The week 7 build must write both.
5. **Reused cardio in weeks 9 to 11.** "Quatre coins" is reused with the air squats removed (three
   atoms maximum). The taper cardio on Wed 18 Nov is therefore hoops, wall bars and jumping jacks
   for 6 min, two days before the test. Q2 says the taper is a CR at the week 10 build: confirm.
6. **« Quatre coins » recording.** One box "Tours faits (sur 3)", the per-lap jumping jacks, squats
   and hoop errors written in the free text. Do you want one box per lap instead?
7. **Heat rule.** The line "au-dessus de 28 °C : courir au ressenti ; la séance ne compte pas" is
   shown, but the app has no stored field to know a session was hot, so it cannot leave that
   session out of R-WS-22. A "séance chaude" switch would be a new stored field (persistence, TOP).
   Until then, leaving the pace boxes empty on a hot day keeps the session out of the rule.
8. **Hard days side by side.** Weeks 6 and 9: engine chain Friday then CrossFit Saturday (R-WS-11
   soft). Week 5: Monday to Thursday with no rest day. The validator accepts them (the plan's own
   days); the day screen still shows the amber flags C1 and C3 there. Keep, or move a day?
9. **Chain B transition note**, written by the coder (S9). Keep or rewrite.
10. **Week 8 tails.** Racket in the table; note ¹ says balance if the racket is confirmed as the
    focus. The switch needs the week 8 data drop, with the focus.
11. **Engine chain length in peak weeks.** With cardio 15 and memory 6, week 9 is 57 min and week
    10 is 54 min, against the shape's "about 49-50". Confirm.

## 4. Found, not touched (out of scope)

- `phaseFor()` (the stored `PlanPhase`) still calls 19 Oct to 1 Nov "integrate", so the week
  header reads "Intégrer" in the travel weeks; `SEASON_PLAN.phase` says `travel`.
- R-WS-22 as built: after a "repeat", week 11 takes the row the cursor reached, not the taper
  row, although the CR-011 comment says week 11 never moves. Pre-existing.
- `validate:repository` still reports the broken README and docs links already on `main` (not run
  in CI). An untracked note file and the `*.tsbuildinfo` files sit in the working folder, left out.

## 5. Files touched

| File | What |
|---|---|
| `src/coach/sessionShapes.ts` | SEASON_PLAN v3, exception list, SKILL_BLOCKS[10] and per-set racket, chain B, power EMOM, CARDIO_BY_WEEK[5], reuse rule, engine chain, Tuesday hill sprints |
| `src/coach/planner.ts` | travel, crossfit_plus, run day, Wed/Thu weeks, Tuesday rows, validators |
| `src/coach/types.ts` | `power_emom` kind and spec, `best_jump_cm`, optional tail A, `hard` chain, cardio `finisher` and `valueLabel` |
| `src/coach/recipes.ts` | treadmill text and km/h, heat line, re-test sentence removed |
| `src/data/runIntervalsProgression.ts` | table v4, zones, baseline |
| `src/CoachConcoursApp.tsx` | "à bloc", hill Tuesday Retour, cardio box label |
| `src/__tests__/cr013v3.test.ts` | new, 45 tests |
| `src/__tests__/cr013v2.test.ts`, `cr013.test.ts`, `cr014.test.ts`, `runIntervals.test.ts` | weeks 5+ re-pointed to v3; weeks 3-4 assertions untouched |
| `handoffs/` | the CR v3 and its six inputs, this report |

## 6. Verification

```
 pnpm typecheck   (tsc -b)      clean
 pnpm test        (vitest run)  16 files, 254 tests passed (209 kept, 45 new)
 pnpm build       (vite build)  built, PWA precache 10 entries
 validate:schemas               OK on all three schemas
 deployed page                  not checked (see "Not done")
```

## 7. Delivery

The commit is on the local branch `cr-013-v3-week5-engine`. Push and pull request "CR-013 v3 week
5 and engine chain": the session summary says whether they happened. Merge and the tag `cr-013-v3`
on the merge commit are the athlete's, before Monday 5 October. After the merge, the PWA may serve
the old code until the app is fully closed and reopened.

Commit: `fa39d352e720d9981d52b5900f5d3e737f6696b5`
