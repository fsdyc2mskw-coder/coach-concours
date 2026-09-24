# Exercise cards index

One line per card. Rewritten at every station closer and whenever a card's status changes.
Ledger: project file `claude/exercise-library-workflow.md`. Session model: `rules/weekly_shape.md`
v6. Week table: `rules/season_plan.md` v2. Rewritten 23 September 2026, evening: station 8
official setup confirmed from the demo video (one hoop per step, hoops touching) and saved as a
reference file.

```
 card id                        st role state   what it is
 ------------------------------------------------------------------------------------------
 S00_air_squats                 0  X    both    30 s or 16 reps, cardio glue
 S00_jumping_jacks              0  X    both    30 s or 30 reps, cardio glue
 S00_jump_squats                0  X    both    20 s or 10 reps, cardio glue, never last
 S00_half_burpees               0  X    both    20 s or 8 reps, no chest to the ground
 S00_high_knees                 0  X    both    30 s or 40 contacts, cardio glue
 S00_broad_jumps                0  P    fresh   3 or 5 jumps, end of every police warm-up
 S01_slalom_18m                 1  A    fresh   straight out 18 m, slalom back, 10 x 25 s, 1 min rest
 S01_carioca_footwork           1  A    fresh   lateral crossover footwork, 18 m course, 10 x 20 s rest
 S01_uphill_intervals           1  C    fresh   uphill 1 min, jog down, 6 to 8 reps (IDLE: no slope confirmed)
 S01_hill_sprints               1  C    fresh   8-10 s uphill, walk down, end of the weekend run, W7-W10
 S03_ladder_climb_jump_finish   3  A    fresh   climb up, normal descent, jump the last 3 rungs, 5 rounds
 S03_ladder_one_hand_object     3  A    fresh   one hand climbs, ball in the other, 3 rounds
 S08_hand_then_chain            8  A    fresh   left hand alone, then a 3-hoop dribble chain
 S08_chain_out                  8  A    fresh   5 hoops, feet by colour, ball held in the arms
 S08_return_dribble_same_side   8  A    fresh   return leg, dribble on the landing-foot side
 S09_balance_ladder             9  A    both    4 x 1 min, one leg → eyes closed → ball → board; the tails of racket weeks
 S10_block_switch_fresh         10 A    both    10 both, 5 right, 5 left, order at random; also in cardio (23 Sep)
 S10_single_foot_after_legs     10 C    fatigued NOT CONFIRMED by the athlete, see the note below. Unusable.
 S11_racket_obstacles           11 A    fresh   45 s flat, 30 s obstacles, 45 s flat
 S11_racket_on_board            11 A    fresh   ball on racket, standing on the wobble board
 S11_racket_after_intervals     11 C    fatigued the same set, after a hard block (= tail B in practice)

 REFERENCE FILES (not cards, used by cards)
 S08_SETUP_official_hoop_line   8  -    -       NEW 23 Sep: the official hoop line, colour order, code, spacing

 PLACEHOLDERS (not cards, never in a session)
 GC_ghost_circuit               all -   -       the ghost circuit, W7-W10; design before W7
```

**Station 8 official setup, confirmed 23 Sep** (frame of the official demo video, read by the
athlete; file `S08_SETUP_official_hoop_line.md`):

```
 green start marker (not a step), then 11 hoops in ONE straight line, one hoop per step
 1 yellow  2 blue  3 red  4 yellow  5 red  6 blue  7 red  8 yellow  9 yellow  10 red  11 blue
 hoops TOUCHING, edge to edge, no gap · green touching yellow 1
 yellow = both feet in the same hoop, no dribble · blue = right foot, right hand · red = left foot, left hand
```

Home line checked the same evening: colour order correct 11/11; gaps to close; green start hoop
to place touching yellow 1.

**Every atom may be used in a cardio block** (the athlete's rule, 23 Sep afternoon; R-WS-29 v6).
The only exclusion is the week's skill station. The "fresh only" flag set the same morning is
withdrawn; a "fresh" state or a "never under fatigue" line inside an older card describes how
the card was first built, not a ban. This is the answer to question Q1 of `APP_REPORT_013.md`.

Role P (23 Sep): the power slot at the end of the police warm-up. Not scored in a
session; the baseline of 23 Sep measures it once.

Round 1 progress: **five of eleven stations closed (1, 3, 8, 10, 11)**. The six open stations
(2, 4, 5, 6, 7, 9) are on hold for missing equipment or no gym access; they reopen on
equipment, not on the calendar. On 23 Sep the athlete confirmed: no open gym; she is looking
for an outdoor place for the obstacle (2) and the bench (9).

**`S09_balance_ladder`, locked 23 Sep.** The tails of any week whose skill station is the racket
(R-WS-36), and of W5-W6 (chain B already ends on the racket). Station 9 as a bench proxy.

```
 min 1   one leg, eyes open
 min 2   one leg, eyes closed, near a wall
 min 3   one leg, basketball passed around the waist
 min 4   two feet on the wobble board, basketball passed around the waist
 score   touchdowns (foot or board edge) + ball drops · stop: dizzy, or 3 touchdowns in a minute
```

**`S10_single_foot_after_legs` is not confirmed** (flagged 22 September, corrected 23 September).
A full card file exists (17 Sep: 10 air squats, then 5 right 5 left on the rope, 4 to 6 rounds,
measures). The athlete did not recognise it when it was proposed. It stays unusable until she
confirms or drops it in the week 5 skipping session.

Filler atoms, station 0 (19 Sep): glue between real movements inside a cardio block, never the
whole block (R-WS-28). Killed by the athlete: a 30-second straight line run at 80 per cent, and
skater jumps. `S00_jump_squats` is never last; `S00_high_knees` is the safe one to place last.
Ground flag on `S00_half_burpees`: torso off the ground.

Gaze rule, station 11 cards: eyes on the ball at the racket centre, head still, each obstacle
looked at once before arriving, never down at the feet. Gaze rule, station 8 cards: eyes on the
next hoop. Chain length starts at five hoops, grows by two after two clean passes; hoops always
touching (spacing confirmed 23 Sep, no longer an open check). No-bascule rule, both station 3
cards: no swinging or flipping the hips over the top of the ladder.

Where the cards are used, week 3 (the two locked sessions in `03_Weekly_plans/`):

```
 SKILL SESSION   skill block   S08_hand_then_chain · S08_chain_out
                 cardio        S01_slalom_18m · S03_ladder_climb_jump_finish · S00_half_burpees
 CHAIN SESSION   chain         S01_slalom_18m · S03_ladder_climb_jump_finish
                 tail A        S11_racket_on_board
                 cardio        S01_carioca_footwork · S00_jump_squats · S00_high_knees
                 tail B        S11_racket_on_board · S11_racket_obstacles
```

Week 4 (`03_Weekly_plans/WEEK_4_PLAN_2026-09-28.md`):

```
 SKILL SESSION   power         S00_broad_jumps
                 skill block   S11_racket_on_board · S11_racket_obstacles
                 cardio        S01_slalom_18m · S03_ladder_climb_jump_finish · S10_block_switch_fresh
 CHAIN SESSION   power         S00_broad_jumps
                 chain A       S01_slalom_18m · S03_ladder_climb_jump_finish · S08_chain_out
                 tails         S09_balance_ladder (reference, tail A, tail B)
                 cardio        S01_carioca_footwork · S10_block_switch_fresh · S00_half_burpees
```

`S01_hill_sprints` joins the weekend run from W7.

The Drive connector cannot edit a file in place, so each rewrite creates a new file and moves
the previous one to `90_Archive/`.
