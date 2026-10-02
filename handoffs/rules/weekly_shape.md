# Rules: weekly shape

version: 7 (2 October 2026), frozen on "lock week 5". v6 (23 Sep) archived in `90_Archive/`.

```
 CHANGES FROM v6
 · the CHAIN session becomes the ENGINE CHAIN session, "to the limit" (her decision 1 Oct,
   W3 chain felt effort 3, "technique mais pas très cardio"). The skill session is unchanged.
 · R-WS-34 tail A: dropped from the chain session from W5 (cardio first, her ask).
 · R-WS-20 and R-WS-23: run_intervals_progression.md v4; zones anchored on VMA 12.2 km/h
   (baseline 2 Oct: 1 385 m in 6:47, fresh, 4:54 /km).
 · R-WS-43: hill sprints follow season_plan.md v3 (W9 Tuesday 6, W10 Saturday 6).
 · R-WS-44 new: a crossfit_plus Saturday (W6, W9) counts as a hard day (R-SP-07).
 · R-WS-30: W5 Wednesday cardio "Four corners" has 4 atoms, her exception accepted at the lock.
   The rule itself stays at three.
 · links moved to season_plan.md v3.
```

v6 changes, kept: every atom may be used in a cardio block (only the week's skill station stays
out, R-WS-29); one baseline only, no test rows later (R-WS-20, R-WS-23, R-WS-41); the balance
ladder is a real card.

Week shape, weeks 3 to 10. The athlete may reorder the days freely; a session belongs to a
session TYPE, not to a weekday. Travel weeks (W7-W8) and crossfit_plus Saturdays follow
season_plan.md v3.

```
Mon         Tue            Wed    Thu        Fri            Sat          Sun
crossfit    run_intervals  rest   SKILL      ENGINE CHAIN   trail run    rest
(external)  flat, speed           session    session        (Sun W5, W6, W9)
            hard                  moderate   to the limit   moderate
```

Week 11 has its own shape (season_plan.md): Mon CrossFit · Tue intervals · Wed taper
session · Thu nothing · Fri police test.

## The two session shapes

```
 SKILL SESSION  about 45 min                                     load: moderate
 warm-up 6 (+ POWER) · MEMORY 6 · SKILL BLOCK 16-20 · CARDIO · cool-down 5

 ENGINE CHAIN SESSION  about 49 min (from W5)                     load: to the limit
 warm-up 8 (+ POWER) · FRESH REFERENCE 2 · MEMORY 4 · POWER EMOM 6 (hard)
 · CHAIN BLOCK 11 (hard, 60 s rests, no tail A) · CARDIO AMRAP (to the limit)
 · TAIL B 4 · cool-down 4
```

The engine chain changes R-TL-02 (chain shape) and R-TL-04 (one hard block): this session is
hard from the power EMOM to the end of the cardio, on purpose. Safety: rests short but never
zero; chest pain or dizziness stops the block, the session still counts.

```
R-WS-01 | hard | A complete week has 5 principal sessions and 2 days without one. A stacked day (CR-014) is the accepted exception and is flagged, not blocked. Week 11 is the exception by its dates (it ends on Friday 20 Nov). | count(principal) == 5 except W11
R-WS-02 | hard | Monday is the coached CrossFit class; the app never writes its content. It is the athlete's only strength work (season_plan.md, objective 4). | monday.type == crossfit and content == external
R-WS-03 | hard | Exactly two runs per week: run_intervals on Tuesday and the weekend run (trail_maintenance, or trail_event in W5). W9 Tuesday = hill sprints. W11 has one. | count(run) == 2 except W11
R-WS-04 | hard | A run is run-only: no police, balance, memory or conditioning finisher attached. Hill sprints are running and are allowed at the end of the weekend run. | run.blocks subset of {warmup, run_main, hill_sprints, cooldown}
R-WS-05 | hard | Weekend run distance is taken from season_plan.md and never exceeds 12 km / 450 m D+; it never goes below 7 km. | 7 <= km <= 12 and dplus <= 450
R-WS-06 | hard | In W5 (5-11 Oct) trail_event on Sunday 11 October replaces the weekend run; it never adds a sixth day. | count(trail) == 1
R-WS-07 | hard | Two police sessions per week, one of each shape: a SKILL session and an ENGINE CHAIN session. W11: one taper session only. The mock-test option is dead (R-PC-04). | kinds == {skill_session, chain_session}
R-WS-08 | hard | A police cardio block never contains running intervals; its format is EMOM, AMRAP or for time. | cardio.format in {emom, amrap, for_time}
R-WS-10 | hard | Never three consecutive hard days. | no window of 3 all hard
R-WS-11 | soft | Avoid two adjacent hard days (Mon CrossFit + Tue intervals is the accepted pair). | warn
R-WS-13 | hard | No session is generated after 20 November 2026. | max(date) <= 2026-11-20
R-WS-14 | hard | A missed session is never replaced by an EXTRA session and never creates a sixth training day. Re-ordering the week afterwards, including days already past, is allowed and encouraged so the record matches what was really done. | no compensation session; reorder always allowed
R-WS-15 | hard | Week 1 (7-13 Sep) is frozen as approved (WEEK_1_FINAL v3). Week 2 stays as trained. Week 3 stays as locked on 22 Sep. | weeks 1-3 unchanged
R-WS-44 | hard | A crossfit_plus Saturday (W6 17 Oct, W9 7 Nov) is a CrossFit day: nothing planned on it, counted as hard for R-WS-10. | crossfit_plus day = hard, no content
```

## The power slot

```
R-WS-41 | hard | Both police sessions end their warm-up with broad jumps (card S00_broad_jumps): the number of jumps comes from season_plan.md (3 or 5), landing held, walk back as rest. Not scored. W11 has none. The engine chain also carries the POWER EMOM 6 (broad jumps + slalom, jump squats). | warmup ends with power slot when season_plan.power != null
```

## The skill block

```
R-WS-24 | hard | Skill is a MODE, not a list of stations: enough time, no clock, no race, low cardio, the drill stops when quality drops. Any station can be trained in skill mode. | skill_block.pressure == none
R-WS-25 | hard | The skill block trains ONE station (season_plan.md focus), two cards at most, 16 to 20 min, and comes first and fresh in the session. | count(stations) == 1 and 16 <= min <= 20 and index == first
R-WS-26 | hard | Every drill in a skill block carries its own score. | every drill has a measure
R-WS-27 | hard | The rotation is the season_plan.md focus column. The same station always gets the same drills and measures, so its scores sit side by side (R-SP-05). | focus from table
```

## The cardio block

```
R-WS-16 | hard | Every POLICE session (skill, engine chain, taper) contains exactly ONE cardio block. A chain block does not count as one. The CrossFit class and the runs are not bound by this rule. | police: count(block.kind == cardio) == 1
R-WS-28 | hard | The cardio block may use ANY card in the library. Filler atoms (station 0) are glue between real movements, never the whole block. | cardio.cards not all station 0
R-WS-29 | hard | EVERY atom in the library may be used in a cardio block (the athlete's rule of 23 Sep; skipping under fatigue is wanted). The only exclusion: the week's skill focus station. | skill_focus not in cardio.cards
R-WS-30 | hard | THREE atoms maximum in one cardio block. Recorded exception: W5 Wednesday "Four corners" (4 atoms, accepted at "lock week 5"). | count(atoms) <= 3
R-WS-31 | hard | The cardio block carries NO target of any kind. The athlete records what she did (rounds, minutes held) and her effort score, nothing else. | cardio.target == null
R-WS-32 | hard | Duration = the season_plan.md cardio column, as ONE block or TWO (for example 7 min EMOM then 8 min AMRAP): W3 10 · W4 12 · W5 10 · W6 12 · W7 13 · W8 15 · W9 15 · W10 12 · W11 6. | min == SEASON_PLAN[week].cardio
R-WS-33 | hard | Progression of cardio is sought across BUILD weeks only (W4, W6, W7, W8, W9), as volume and work density, never as a time target. In the down weeks (W5 trail, W10 sharpen, W11 taper) the dose goes down on purpose. The app shows last week's number of the same shape beside the block, read only. | dose(build n) >= dose(previous build)
R-WS-45 | soft | Cardio variety (her rule, 1 Oct): new formats and unused atoms first; slalom, wall bars and burpees are overused. | warn
```

## The tails

```
R-WS-34 | hard | TAIL A: dropped from the chain session from W5 (engine chain, cardio first, her ask of 1 Oct). Kept as a definition (one skill drill of 30 to 45 s after every chain round) in case a later week brings it back. | no tail_a in engine chain
R-WS-35 | hard | TAIL B is standalone at the end of the session: 4 to 5 x 1 min, a balance challenge of rising difficulty, scored. It is the only block allowed after the cardio block, because it is a measure and not learning. | tail_b.index == last_before_cooldown
R-WS-36 | hard | The tail skill (season_plan.md tails column) is NEVER the week's skill-block station. In a racket-focus week the tails use the balance ladder (card S09_balance_ladder, locked 23 Sep). | tail.station != skill_focus.station
R-WS-37 | hard | A tail is only measurable against a FRESH REFERENCE taken the same day, right after the warm-up, before any hard work: one clean minute of each tail drill, scored. | session has fresh_reference when it has a tail
R-WS-38 | hard | Every tail carries a stop rule (racket: stop if the grip opens or the drops double; balance: stop if dizzy or 3 touchdowns in one minute). A shortened tail still counts and is recorded as shortened. | tail.stop_rule != null
R-WS-39 | soft | When the cardio block and the tail both load the same quality (balance, grip), the session says so and the athlete may cut the tail short. | warn
```

## Memory

```
R-WS-12 | hard | Each police session has ONE memory block, at the START (index 1 in the skill session, 2 or 3 in the engine chain session, after the fresh reference), 4 to 6 min, on the week's module from season_plan.md. The skill session's memory block ends with the weekly recall check (memory_modules.md v2, R-MM-04). Never at the end. | memory early; one per police session
R-WS-40 | hard | M5, fatigued recall, is OUT of every session shape (the athlete's decision of 22 September). It stays defined in memory_modules.md but unused. | M5 not in any session
```

Memory-block constraint carried from the 10 Sep decision: a memory block may ask the athlete to
**visualise**, **recite the order** or **state action / completion / next station**; it never
asks her to **explain** the circuit or a rule. The memory game (CR-018 to come) respects this.

## The chain block and the ghost circuit

```
R-WS-42 | hard | The chain block type comes from season_plan.md v3: chain A (W4), chain B (W5-W6), travel chain T (W7-W8), then the GHOST CIRCUIT (W9-W10). The ghost circuit is a PLACEHOLDER until its card is written with the athlete: until then the app keeps a normal chain block and labels it "Circuit fantôme : à venir". | ghost rendered as placeholder until card exists
```

What the ghost circuit will be (agreed idea, 23 Sep, not a card): the 11 stations in order in
one space; a trainable station → its drill; a missing station → say the action aloud plus a
short stand-in move. No clock, no prediction. Design before Mon 2 Nov.

## The weekend run

```
R-WS-43 | hard | Before the race: the weekend run progresses toward 12 km, mostly easy. After the race: easy, shorter (7-8 km). Hill sprints (card S01_hill_sprints) follow season_plan.md v3: W9 6 on TUESDAY 3 Nov in place of the intervals, W10 6 at the end of the Saturday run; none in W5-W8 and W11; never on a treadmill. | hill_sprints == SEASON_PLAN[week].hill
```

## Running intervals (Tuesday)

```
R-WS-19 | hard | run_intervals has a fixed frame: warm-up 15 min easy + 3 x 20 s strides, one main set, cool-down 10 min easy. Recovery between reps is an easy jog, never a stop. | blocks == [warmup, main, cooldown]
R-WS-20 | hard | The main set comes from the progression table in run_intervals_progression.md v4. The generator never invents a set. | main == progression[week]
R-WS-21 | hard | Pace targets are per-kilometre paces read on the watch auto-lap (W7-W8 treadmill: the km/h given in v4); the athlete runs by pace, not by distance. | target.unit == min_per_km
R-WS-22 | hard | Repeat rule: see run_intervals_progression.md v4. The plan and its objective are fixed; session feedback produces only slight protective adjustments, never a drift of the target. | from recorded rep paces
R-WS-23 | hard | Pace zones come from the ONE baseline (2 Oct, VMA 12.2 km/h) and are reviewed only in Cowork, never automatically: R 4:55-5:05 · I 5:15-5:30 · T 5:45-5:55 · E >= 7:00 min/km. | zones == f(baseline)
```

Rule ids R-WS-09, R-WS-17 and R-WS-18 stay unused so older references remain valid.

Links: `season_plan.md` v3, `phase_calendar.md` v4, `test_battery.md` v2, `memory_modules.md`
v2, `run_intervals_progression.md` v4; the locked reference sessions
`03_Weekly_plans/WEEK_3_SKILL_SESSION_2026-09-22.md` and `WEEK_3_CHAIN_SESSION_2026-09-22.md`;
the week 4 plan `WEEK_4_PLAN_2026-09-28.md`; the week 5 final `WEEK_5_FINAL_2026-10-05.md`.
