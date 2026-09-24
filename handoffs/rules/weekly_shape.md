# Rules: weekly shape

version: 6 (23 September 2026, afternoon). v5 (same morning) archived in `90_Archive/`.
Changes from v5: every atom may be used in a cardio block (only the week's skill station
stays out, R-WS-29); one baseline only, this week, no test rows later (R-WS-20, R-WS-23,
R-WS-41); the balance ladder is a real card. v5 carried the changes from v4 listed below.

```
 CHANGES FROM v4
 · week-by-week numbers now come from season_plan.md (one table)
 · POWER SLOT added: broad jumps at the end of both police warm-ups
 · cardio minutes follow the season curve; down weeks go below 12 on purpose
 · memory: one block at the start of each police session, the week's module
   (fixes the "four exposures" line the locked week 3 never matched)
 · the skill session is a MODERATE day (was low)
 · R-WS-08 clause on running intervals as a cardio form removed
 · the cardio-block rule binds the two police sessions only
 · weekend run after the trail: easy, shorter, hill sprints
 · week 11 shape added
 · the trail race is SUNDAY 11 October (v4 and older files said Saturday)
```

Week shape, weeks 3 to 10. The athlete may reorder the days freely; a session belongs to a
session TYPE, not to a weekday.

```
Mon         Tue            Wed    Thu        Fri        Sat          Sun
crossfit    run_intervals  rest   SKILL      CHAIN      trail run    rest
(external)  flat, speed           session    session    (Sun W5)
            moderate→hard         moderate   hard       moderate
```

Week 11 has its own shape (season_plan.md): Mon CrossFit · Tue intervals · Wed taper
session · Thu nothing · Fri police test.

## The two session shapes

```
 SKILL SESSION  about 45 min                                     load: moderate
 warm-up 6 (+ POWER) · MEMORY 6 · SKILL BLOCK 16-20 · CARDIO · cool-down 5

 CHAIN SESSION  about 45 min                                     load: hard
 warm-up 6 (+ POWER) · FRESH REFERENCE 3 · MEMORY 4 · CHAIN BLOCK 12 (moderate,
 tail A in every round) · CARDIO (hard) · TAIL B 5 · cool-down 5
```

```
R-WS-01 | hard | A complete week has 5 principal sessions and 2 days without one. A stacked day (CR-014) is the accepted exception and is flagged, not blocked. Week 11 is the exception by its dates (it ends on Friday 20 Nov). | count(principal) == 5 except W11
R-WS-02 | hard | Monday is the coached CrossFit class; the app never writes its content. It is the athlete's only strength work (season_plan.md, objective 4). | monday.type == crossfit and content == external
R-WS-03 | hard | Exactly two runs per week: run_intervals on Tuesday and the weekend run (trail_maintenance, or trail_event in W5). W11 has one. | count(run) == 2 except W11
R-WS-04 | hard | A run is run-only: no police, balance, memory or conditioning finisher attached. Hill sprints are running and are allowed at the end of the weekend run. | run.blocks subset of {warmup, run_main, hill_sprints, cooldown}
R-WS-05 | hard | Weekend run distance is taken from season_plan.md and never exceeds 12 km / 450 m D+; it never goes below 7 km. | 7 <= km <= 12 and dplus <= 450
R-WS-06 | hard | In W5 (5-11 Oct) trail_event on Sunday 11 October replaces the weekend run; it never adds a sixth day. | count(trail) == 1
R-WS-07 | hard | Two police sessions per week, one of each shape: a SKILL session and a CHAIN session. W11: one taper session only. The mock-test option is dead (R-PC-04). | kinds == {skill_session, chain_session}
R-WS-08 | hard | A police cardio block never contains running intervals; its format is EMOM, AMRAP or for time. | cardio.format in {emom, amrap, for_time}
R-WS-10 | hard | Never three consecutive hard days. | no window of 3 all hard
R-WS-11 | soft | Avoid two adjacent hard days (Mon CrossFit + Tue intervals is the accepted pair). | warn
R-WS-13 | hard | No session is generated after 20 November 2026. | max(date) <= 2026-11-20
R-WS-14 | hard | A missed session is never replaced by an EXTRA session and never creates a sixth training day. Re-ordering the week afterwards, including days already past, is allowed and encouraged so the record matches what was really done. | no compensation session; reorder always allowed
R-WS-15 | hard | Week 1 (7-13 Sep) is frozen as approved (WEEK_1_FINAL v3). Week 2 stays as trained. Week 3 stays as locked on 22 Sep. | weeks 1-3 unchanged
```

## The power slot (new, 23 Sep)

```
R-WS-41 | hard | Both police sessions end their warm-up with broad jumps (card S00_broad_jumps): the number of jumps comes from season_plan.md (3 or 5), landing held, walk back as rest. Not scored. W11 has none. | warmup ends with power slot when season_plan.power != null
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
R-WS-16 | hard | Every POLICE session (skill, chain, taper) contains exactly ONE cardio block. A chain block does not count as one. The CrossFit class and the runs are not bound by this rule. | police: count(block.kind == cardio) == 1
R-WS-28 | hard | The cardio block may use ANY card in the library. Filler atoms (station 0) are glue between real movements, never the whole block. | cardio.cards not all station 0
R-WS-29 | hard | EVERY atom in the library may be used in a cardio block (the athlete's rule of 23 Sep; skipping under fatigue is wanted). The only exclusion: the week's skill focus station. | skill_focus not in cardio.cards
R-WS-30 | hard | THREE atoms maximum in one cardio block. | count(atoms) <= 3
R-WS-31 | hard | The cardio block carries NO target of any kind. The athlete records what she did (rounds, minutes held) and her effort score, nothing else. | cardio.target == null
R-WS-32 | hard | Duration = the season_plan.md cardio column, as ONE block or TWO (for example 7 min EMOM then 8 min AMRAP): W3 10 · W4 12 · W5 10 · W6 12 · W7 13 · W8 15 · W9 15 · W10 12 · W11 6. | min == SEASON_PLAN[week].cardio
R-WS-33 | hard | Progression of cardio is sought across BUILD weeks only (W4, W6, W7, W8, W9), as volume and work density, never as a time target. In the down weeks (W5 trail, W10 sharpen, W11 taper) the dose goes down on purpose. The app shows last week's number of the same shape beside the block, read only. | dose(build n) >= dose(previous build)
```

## The tails

```
R-WS-34 | hard | TAIL A sits inside a chain block: after every round, one skill drill of 30 to 45 s, the same drill all session. | chain.round ends with tail_a
R-WS-35 | hard | TAIL B is standalone at the end of the session: 4 to 5 x 1 min, a balance challenge of rising difficulty, scored. It is the only block allowed after the cardio block, because it is a measure and not learning. | tail_b.index == last_before_cooldown
R-WS-36 | hard | The tail skill (season_plan.md tails column) is NEVER the week's skill-block station. In a racket-focus week the tails use the balance ladder (card S09_balance_ladder, locked 23 Sep). | tail.station != skill_focus.station
R-WS-37 | hard | A tail is only measurable against a FRESH REFERENCE taken the same day, right after the warm-up, before any hard work: one clean minute of each tail drill, scored. | session has fresh_reference when it has a tail
R-WS-38 | hard | Every tail carries a stop rule (racket: stop if the grip opens or the drops double; balance: stop if dizzy or 3 touchdowns in one minute). A shortened tail still counts and is recorded as shortened. | tail.stop_rule != null
R-WS-39 | soft | When the cardio block and the tail both load the same quality (balance, grip), the session says so and the athlete may cut the tail short. | warn
```

## Memory

```
R-WS-12 | hard | Each police session has ONE memory block, at the START (index 1 in the skill session, 2 in the chain session), 4 to 6 min, on the week's module from season_plan.md. The skill session's memory block ends with the weekly recall check (memory_modules.md v2, R-MM-04). Never at the end. | memory.index in {1, 2}; one per police session
R-WS-40 | hard | M5, fatigued recall, is OUT of every session shape (the athlete's decision of 22 September). It stays defined in memory_modules.md but unused. | M5 not in any session
```

Memory-block constraint carried from the 10 Sep decision: a memory block may ask the athlete
to **visualise**, **recite the order** or **state action / completion / next station**; it
never asks her to **explain** the circuit or a rule. The memory game (drag the order, one-station
quiz, CR-018 to come) respects this: it asks to order and to recognise, never to explain.

## The chain block and the ghost circuit

```
R-WS-42 | hard | The chain block type comes from season_plan.md: chain A (W4), chain B (W5-W6), then the GHOST CIRCUIT (W7-W10). The ghost circuit is a PLACEHOLDER until its card is written with the athlete: until then the app keeps a normal chain block and labels it "Circuit fantôme : à venir". | ghost rendered as placeholder until card exists
```

What the ghost circuit will be (agreed idea, 23 Sep, not a card): the 11 stations in order in
one space; a trainable station → its drill; a missing station → say the action aloud plus a
short stand-in move. Trains memory in motion, transitions, rhythm. No clock, no prediction.
Space confirmed: the place with the ladder has room for cones.

## The weekend run

```
R-WS-43 | hard | Before the race: the weekend run progresses toward 12 km, mostly easy. After the race: easy, shorter (7-8 km), and from W7 it ends with hill sprints (card S01_hill_sprints) in the count given by season_plan.md: W7 6 · W8 8 · W9 10 · W10 6 · none in W6 and W11. | hill_sprints == SEASON_PLAN[week].hill
```

## Running intervals (Tuesday)

```
R-WS-19 | hard | run_intervals has a fixed frame: warm-up 15 min easy + 3 x 20 s strides, one main set, cool-down 10 min easy. Recovery between reps is an easy jog, never a stop. | blocks == [warmup, main, cooldown]
R-WS-20 | hard | The main set comes from the progression table in run_intervals_progression.md v3. The generator never invents a set. | main == progression[week]
R-WS-21 | hard | Pace targets are per-kilometre paces read on the watch auto-lap; the athlete runs by pace, not by distance. | target.unit == min_per_km
R-WS-22 | hard | Repeat rule: see run_intervals_progression.md. The plan and its objective are fixed; session feedback produces only slight protective adjustments, never a drift of the target. | from recorded rep paces
R-WS-23 | hard | Pace zones come from the recorded baselines and are reviewed in Cowork from the 6-min baseline of 27 Sep, never automatically. Until then: R 5:20-5:30, I 5:50-6:00, T 6:35-6:45, E >= 7:30 min/km. | zones == f(baselines)
```

Rule ids R-WS-09, R-WS-17 and R-WS-18 stay unused so older references remain valid.

Links: `season_plan.md` v2, `phase_calendar.md` v4, `test_battery.md` v2, `memory_modules.md`
v2, `run_intervals_progression.md` v3; the locked reference sessions
`03_Weekly_plans/WEEK_3_SKILL_SESSION_2026-09-22.md` and `WEEK_3_CHAIN_SESSION_2026-09-22.md`;
the week 4 plan `03_Weekly_plans/WEEK_4_PLAN_2026-09-28.md`.
