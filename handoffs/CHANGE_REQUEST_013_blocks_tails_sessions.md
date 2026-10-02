# CHANGE_REQUEST_013 v3: season table v3, week 5 content, the engine chain, the new Tuesday paces

<!-- template v5, 24 September 2026: coder never tags and never pushes to main; the tag is published by the Cowork chat after the athlete's merge (routing v4, section 3b) -->

Direction: **Training brain → App code.** Written in Cowork. Read by the coder (the athlete's Claude Code session).
Date: 2 October 2026 · Author: the athlete + Claude · Status: open
Version 3 of CR-013. v2 is merged (PR #9, merge `f04b844`, tag `cr-013-v2`) and archived in Drive `90_Archive/`.
Order: after CR-017 (merged) · before CR-015 v3 and CR-016 · **must be merged before Monday 5 October**,
the start of week 5. Own session. Branch: `cr-013-v3-week5-engine`.
Kind: engine (a new session shape and its checks) + data · **Tier: TOP** (engine → TOP, routing v4).

## Read first

`CLAUDE.md`, `handoffs/00_COCKPIT.md` section 9, `handoffs/00_AGENT_ROUTING.md`,
`handoffs/APP_REPORT_013_v2.md` (your own questions 1-9, answered in section F), then only the files
under "Inputs". State the tier in your first reply and say if the model you run on does not match.

## Why

Three things happened since v2. (1) On 24 September the athlete answered the nine questions of
APP_REPORT_013_v2. (2) On 1-2 October she built week 5 and decided that the chain session becomes an
ENGINE session, "to the limit", because the week 3 chain felt like technique and not like cardio.
(3) Travel is confirmed for weeks 7 and 8 (hotel gym, no CrossFit), and the one baseline is done:
the 6-minute run gives VMA 12.2 km/h, so the Tuesday paces are re-anchored and every target moves
25 to 45 s/km faster (the app still asks 6:00, she runs 5:17-5:33). **Design goal: the table, the
week 5 content and the new chain shape as data; the generator changes only where the shape changes.**

## Inputs (Drive, copy into `handoffs/`; Drive is the source, never `90_Archive/`)

| File | version | What changed |
|---|---|---|
| `02_Training_brain/rules/season_plan.md` | **v3** (2 Oct) | travel weeks 7-8, `crossfit_plus`, focus W7-W10, chain T, ghost from W9, hill sprints W9 Tue and W10 Sat, Sunday runs W6 and W9 |
| `02_Training_brain/rules/weekly_shape.md` | **v7** (2 Oct) | ENGINE CHAIN shape, tail A dropped from W5, R-WS-30 W5 exception, R-WS-43, new R-WS-44, R-WS-45, zones R-WS-23 |
| `02_Training_brain/rules/run_intervals_progression.md` | **v4** (2 Oct) | new sets W5-W11, paces from VMA 12.2, treadmill speeds W7-W8, W9 = hill sprints, no re-test |
| `03_Weekly_plans/WEEK_5_FINAL_2026-10-05.md` | FINAL (2 Oct) | the week 5 content, block for block |
| `04_App_handoffs/DECISIONS_APP_REPORTS_013v2_017_2026-09-24.md` | 24 Sep | the answers in section F |
| `02_Training_brain/exercise_cards/S10_block_switch_fresh.md` | **v3** (1 Oct) | the official card: 5 right foot · 5 left foot · 10 feet together |

Precedence: `WEEK_5_FINAL` wins for week 5 · `season_plan.md` v3 wins on any number for a week ·
`weekly_shape.md` v7 wins on a session's structure · `run_intervals_progression.md` v4 wins on any
Tuesday · the two locked week 3 files and the week 4 plan win for weeks 3 and 4, which must not change.

## A. `SEASON_PLAN` becomes v3 (`src/coach/sessionShapes.ts`)

Type changes:

```ts
export type FocusStation = 1 | 8 | 10 | 11 | 'SLALOM_OR_RACKET' | 'LIGHT';   // W8_WORST removed
export type ChainKind = 'locked' | 'chain_A' | 'chain_B' | 'travel_T' | 'ghost' | 'ghost_walk';
export type Phase = 'combine' | 'trail' | 'reset' | 'travel' | 'peak' | 'taper';
// new fields on SeasonWeek:
//   phase: Phase;
//   crossfitPlus: string | null;      // ISO date of the extra Saturday class (R-SP-07)
//   runDay: 'SAT' | 'SUN';            // weekend run day
//   hillSprintsDay: 'TUE' | 'SAT' | null;
//   travel: boolean;                  // W7-W8: no Monday CrossFit, treadmill intervals
```

```
 wk load phase   focus             cardio power memory chain      tails   run        hill        crossfit+  travel
 3  3    combine 8                 10     0     LOCKED locked     racket  [8,9] SUN  0           -          no
 4  4    combine 11                12     3     M1     chain_A    balance [10,11]SAT 0           -          no
 5  2    trail   10                10     3     M2     chain_B    balance RACE  SUN  0           -          no
 6  3    reset   8                 12     3     M2     chain_B    balance [7,7] SUN  0           2026-10-17 no
 7  3    travel  10                13     5     M3     travel_T   racket  [7,8] SAT  0           -          YES
 8  4    travel  SLALOM_OR_RACKET  15     5     M3     travel_T   racket¹ [7,8] SAT  0           -          YES
 9  5    peak    11                15     5     M4     ghost      balance [7,8] SUN  6 TUE       2026-11-07 no
 10 3    peak    11                12     5     M4     ghost      balance [7,7] SAT  6 SAT       -          no
 11 1    taper   LIGHT             6      0     M4     ghost_walk none    null       0           -          no
 ¹ W8: tails = balance if the athlete confirms the racket as focus (R-SP-02, R-WS-36)
```

`baseline` stays true for week 3 only. `buildWeek` = W4, W6, W7, W8, W9 (R-SP-04). Ghost covers
stations 1 to 11 in W9 and W10 (`ghostStations: [1, 11]`); W7-W8 no longer carry a ghost.

## B. What the generator does with the new columns

```
 travel weeks     no Monday CrossFit in W7 and W8 (no session that day); the Tuesday intervals say
                  "sur tapis" and show the km/h of run_intervals v4; the session text never names
                  wall bars, hoops or the ghost (season_plan v3, "Travel weeks")
 crossfit_plus    W6 Sat 17 Oct and W9 Sat 7 Nov: a crossfit_class day, content external, load hard,
                  recorded only (R-SP-07, R-WS-44); that week's weekend run moves to SUNDAY
 W8 focus         shows both options "Slalom ou raquette, à confirmer" as a placeholder skill block
                  until a later data drop (R-SP-02); tails follow the note ¹
 hill sprints     W9: the Tuesday session is a hill_sprints run (6 sprints of 8-10 s, walk back,
                  never on a treadmill), not run_intervals; W10: last block of the Saturday run
                  (as built in v2). W7 and W8 carry none.
 travel_T, W9-10  chain blocks: placeholders "Enchaînement voyage : à construire" and
   ghost          "Circuit fantôme : à venir, postes 1 à 11" (section D of v2, unchanged)
 W9-W11 memory    the engine chain memory slot is 6 min with M4 (decision 6); 4 min before W9
```

Validator: the three-hard-days check (R-WS-10) counts a `crossfit_plus` day as hard.

## C. The ENGINE CHAIN session shape (from week 5)

Replace the chain session shape for weeks 5 and later (weeks 3-4 keep theirs, untouched):

```
 ENGINE CHAIN SESSION   about 49-50 min, load 'hard' (displayed "à bloc")
 1 warm-up 8-9 (+ power slot)       6 · FRESH REFERENCE 2 (tail skill)    7 · cool-down 4
 3 MEMORY 4 (6 from W9)             4 · POWER EMOM 6       hard
 5 CHAIN BLOCK 11       hard        6 · CARDIO (to the limit)
 7 TAIL B 4             scored
```

```
 rules in v7 that change a check
 R-WS-34  NO tail A in the engine chain: the chain round no longer ends with tail A
 R-WS-04/R-TL-04  the session has more than one hard block on purpose: do not flag
 R-WS-30  three atoms maximum, EXCEPT the recorded W5 Wednesday cardio (4 atoms): an exception
          list in data, not a relaxed rule
 R-WS-35  tail B stays the only block after the cardio
 R-WS-37  the fresh reference stays before any hard work (it now sits before the power EMOM)
```

New block kind or reuse: the POWER EMOM is a `cardio`-like block for display but must NOT count as
the session's one cardio block (R-WS-16). If that needs a new kind (`power_emom`), add it; never
let it satisfy "one cardio block per police session".

## D. Week 5 content, as data (from `WEEK_5_FINAL`, word for word in French where the app shows French)

```
 SKILL_BLOCKS[10]      skipping, 18 min, card at eye height 5 DROIT · 5 GAUCHE · 10 JOINTS
                       part A 6 × 45 s, 30-45 s rest, round 6 = coin variant (left first)
                       part B 4 single cards, 1 min rest, ONE attempt each
                       scores: restarts per round A (6 boxes) · restarts per card B (4 boxes)
                       stop rule: two restarts at the same switch → regress as the card says
                       reused unchanged in W7 (R-SP-05)
 CHAIN_BLOCKS.chain_B  4 rounds, 60 s rest, "aussi vite que propre":
                       slalom 18 m aller-retour → 5 m footing → UNE carte corde (5 D · 5 G · 10 J)
                       → 5 m footing → raquette au-dessus des 3 obstacles, un passage
                       scores per round: time · rope restarts · racket drops · cones touched
                       W6 reuses it unchanged until a W6 data drop
 POWER EMOM W5         EMOM 6: odd 2 broad jumps + slalom 18 m one way full speed, walk back;
                       even 6 jump squats · scores: best jump (cm), effort
 CARDIO_BY_WEEK[5]     skill session: "Quatre coins" 30/15, 4 stations, 3 laps (9 min) + 1 min
                         finisher high knees; A hoops 5-hoop line · B wall bars one hand, ball in
                         the other · C jumping jacks · D 25 air squats; no target; WRITE jumping
                         jacks per lap, squats per lap, hoop errors, effort
                       engine chain: "La montée", ascending, 10 min: each round 1 wall bars pass
                         (jump the last 3 rungs) + air squats 4, 8, 12 … (+4) + high knees
                         20, 30, 40 … (+10); WRITE last round finished + reps into the next one
 WARM-UPS W5           skill: 8 min incl. 3 broad jumps · engine: "La ligne des 18 m", 9 min
                       (3 jog · 2 mobility · 2 line drills · 1 build-ups) + 3 broad jumps
 TAILS.balance         fresh reference 2 min (one leg eyes closed near a wall 30 s each leg ·
                       two feet on the board, ball round the waist) · tail B 4 × 1 min, 20 s
                       between, stop if dizzy or 3 touchdowns in one minute (as built in v2)
 W5 days               Wed 7 Oct skill session · Thu 8 Oct engine chain (the plan file wins for
                       week 5); Fri rest; Sat optional easy jog is NOT a session (no sixth day)
```

Cardio of week 6 onward: no new entry in this version. A week with no `CARDIO_BY_WEEK` entry keeps
the v2 reuse rule and its "atomes à remplacer" line (decision 9: cardio is written fresh at each week
build).

## E. Tuesday intervals (`src/data/runIntervalsProgression.ts`, `src/coach/recipes.ts`)

Replace the table with `run_intervals_progression.md` v4:

```
 wk  date    main set                pace /km  treadmill   note
 5   6 Oct   3 × 4 min, jog 3 min    5:25      -           race week, Sun 11 Oct
 6   13 Oct  5 × 4 min, jog 3 min    5:25      -
 7   20 Oct  6 × 2 min, jog 2 min    5:05      11.8 km/h   sur tapis, pente 1 %
 8   27 Oct  3 × 5 min, jog 3 min    5:20      11.3 km/h   sur tapis, pente 1 %
 9   3 Nov   hill sprints × 6 (section B), no intervals
 10  10 Nov  4 × 3 min, jog 2 min    5:15      -
 11  17 Nov  4 × 1 min, jog 2 min    5:00      -           taper
 zones  R 4:55-5:05 · I 5:15-5:30 · T 5:45-5:55 · E >= 7:00 (VMA 12.2 km/h)
```

```
 MUST   the reset and taper `volumeFactor` (0.75 in W6, 0.6 in W11) NEVER changes the number of
        reps, their length or their pace: the main set is the table, as written (R-WS-20).
        W6 shows 5 × 4, not fewer.
 MUST   delete "Re-test 1 km le samedi de cette semaine" (week 8) and any other re-test text.
 KEEP   the adjustment rule (R-WS-22) as built, now against the new targets; add: above 28 °C,
        "courir au ressenti", the session is not counted for the rule.
```

## F. Answers to APP_REPORT_013_v2 (decided 24 Sep, plus 1-2 Oct)

```
 Q1 W3 skill load          stays 'low'. No change.
 Q2 taper session          keep M4 + recall check, ghost walk, 6-min cardio short and crisp,
                           stop fresh. No change in this version (CR at the W10 build).
 Q3 M4 in the chain        6 min in W9-W11; the session grows by 2 min. Section B.
 Q4 chain B                written now (section D). No fallback to chain A.
 Q5 ghost rendering        the placeholder as built is right ("Circuit fantôme : à venir").
 Q6 reused cardio atoms    cardio is written fresh at each week build; the reuse rule stays as a
                           safety net only.
 Q7 balance score          one box per minute, touchdowns + drops together, as built.
 Q8 racket score           ONE ROW PER SET: obstacle drops flat 1 · obstacles · flat 2 for set 1
                           and again for set 2 (6 boxes) in SKILL_BLOCKS[11].
 Q9 weeks 9-10             focus = 11 (racket), tails = balance (section A). W8_WORST is gone.
```

## Expected behaviour after the change

- Given week 5, when the athlete opens Tuesday 6 Oct, then she sees 3 × 4 min at 5:25 with jog 3 min.
- Given week 5, Wednesday 7 Oct shows the skipping skill session and Thursday 8 Oct the engine chain
  with power EMOM, chain B, "La montée" and tail B, and no tail A.
- Given week 6, Tuesday 13 Oct shows 5 × 4 min at 5:25, Saturday 17 Oct is a CrossFit day and the
  run is on Sunday 18 Oct.
- Given week 7, Monday 19 Oct has no CrossFit and Tuesday shows 6 × 2 min at 5:05, 11.8 km/h.
- Given week 9, Tuesday 3 Nov is 6 hill sprints, Saturday 7 Nov is CrossFit, the run is Sunday 8 Nov.

## Tests that must pass

- [ ] `SEASON_PLAN` reproduces the v3 table above cell for cell
- [ ] weeks 3 and 4 still reproduce their locked files block for block (no change)
- [ ] week 5 reproduces `WEEK_5_FINAL_2026-10-05.md` block for block (new fixture), days Wed 7 and Thu 8
- [ ] the engine chain (W5+) has no tail A, has a power EMOM that does not count as the cardio block,
      exactly one cardio block, tail B as the last block before the cool-down
- [ ] the W5 Wednesday cardio with 4 atoms passes R-WS-30 through the exception list; any other block
      with 4 atoms is still flagged
- [ ] Tuesday sets W5-W11 equal run_intervals v4; W6 shows 5 × 4 (volumeFactor does not touch it);
      W7-W8 show km/h; W9 Tuesday is hill sprints; no text says "Re-test"
- [ ] W7 and W8 have no Monday session; W6 and W9 have a Saturday CrossFit day and a Sunday run
- [ ] three hard days in a row are flagged with a crossfit_plus day counted as hard
- [ ] W8 skill block is a placeholder naming both options; W9-W10 skill station = 11, tails = balance
- [ ] racket skill block scores one row per set (6 obstacle boxes)
- [ ] engine chain memory is 4 min in W5-W8 and 6 min in W9-W10
- [ ] no text predicts an official time; no text says the race is on a Saturday
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm build` pass; deployed page checked

## Out of scope

The state schema and `loadCoachState` (persistence: nothing here needs a new stored field; if you
think it does, stop and write the question in the report). Drive sync. The memory game (CR-018).
The reload banner (CR-015). Cardio entries for weeks 6-10, the travel chain, the ghost circuit card,
the W8 slalom block, the taper session content: all later data drops. Any sporting decision: write
the question in the APP_REPORT, never invent a drill, a dose, a pace or a substitute atom.

## Deliverable back

`handoffs/APP_REPORT_013_v3.md` in the repo (copied to Drive `04_App_handoffs/` by Cowork), ending with
the commit hash. Pull request titled `CR-013 v3 week 5 and engine chain`. Never push to main, do not
merge, do not tag: the athlete merges on GitHub, then the Cowork chat publishes the tag `cr-013-v3`
on the merge commit (routing v4, section 3b). Cut the branch with no upstream (cockpit section 9).
Never a person's name, e-mail, hostname, device name or personal folder path.
