# Rules: weekly shape

version: 8 (18 October 2026). v7 (2 Oct) archived in `90_Archive/`.

```
 CHANGES FROM v7 (they win over anything below that disagrees)
 · folds in the 2 Oct decisions (DECISIONS_APP_REPORT_013v3) and the 18 Oct decisions
 · R-WS-10 REWRITTEN: hard days in a row have no limit; Claude warns, she decides
   (R-SP-13). R-WS-11 kept as a warning only.
 · R-WS-30 REWRITTEN: FOUR atoms maximum in a cardio block (rule of three killed, 2 Oct).
 · heat rule killed (2 Oct): no heat clause anywhere.
 · from W6 the week shape of season_plan.md v5 applies (park weeks: Wed SKILL at the park,
   Fri ENCHAÎNEMENT). The ENGINE CHAIN session below is history (W5).
 · R-WS-07 REWRITTEN: from W7 the two police sessions are a SKILL session and an
   ENCHAÎNEMENT; the enchaînement = ONE 8-10 min high-speed circuit of 5-6 stations or atoms,
   then the fatigue test (R-SP-15). W10 Friday = rematch of the W6 storms (the one exception).
 · R-WS-42: the ghost circuit is replaced by the enchaînement (season_plan v4 and v5).
 · R-WS-16: the cardio block of a skill session is done, never skipped (W6 WILL 10 was skipped).
 · links moved to season_plan.md v5 and claude/week-build-standard.md (the build steps 0-7).
```

v7 changes, kept as history: the engine chain session "to the limit" (W5); tail A dropped from
W5; zones anchored on VMA 12.2 km/h (2 Oct); crossfit_plus Saturday counts as hard (R-WS-44).

Week shape, weeks 3 to 5 (history; from W6 see season_plan.md v5). The athlete may reorder the
days freely; a session belongs to a session TYPE, not to a weekday.

```
Mon        Tue            Wed    Thu        Fri           Sat         Sun
crossfit   run_intervals  rest   SKILL      ENGINE CHAIN  trail run   rest
(external) flat, speed           session    session       (Sun W5, W6, W9)
           hard                  moderate   to the limit  moderate
```

Week 11 has its own shape (season_plan.md v5): offload, skill + mental, Fri police test.

## The session shapes

```
 SKILL SESSION                          about 45-60 min                 load: moderate
 warm-up (one line) · MEMORY · SKILL BLOCK (fresh) · CARDIO (Cross Ops WOD) · cool-down

 ENCHAÎNEMENT (from W7)                 about 40-50 min                 load: to the limit
 warm-up (one line) + priming · FRESH TEST · MEMORY · THE 8-10 MIN CIRCUIT (5-6 stations or
 atoms, test speed) · FATIGUE TEST right after (hoops + bench with ball) · Cross Ops block
 if the day carries one · cool-down

 ENGINE CHAIN SESSION (W5, history)     about 49 min                    load: to the limit
 warm-up 8 (+ POWER) · FRESH REFERENCE 2 · MEMORY 4 · POWER EMOM 6 (hard)
 · CHAIN BLOCK 11 (hard, 60 s rests, no tail A) · CARDIO AMRAP (to the limit)
 · TAIL B 4 · cool-down 4
```

Safety (all shapes): rests short but never zero; chest pain or dizziness stops the block, the
session still counts.

```
R-WS-01 | hard | A complete week has 5 principal sessions and 2 days without one. A stacked day (CR-014) is the accepted exception and is flagged, not blocked. Week 11 is the exception by its dates (it ends on Friday 20 Nov). Travel weeks (W7, W8) follow season_plan.md v5. | count(principal) == 5 except W7, W8, W11
R-WS-02 | hard | Monday is the coached CrossFit class; the app never writes its content. It is the athlete's only strength work (season_plan.md, objective 4). | monday.type == crossfit and content == external
R-WS-03 | hard | Two runs per week in park weeks: run_intervals on Tuesday and the weekend trail day. W9 Tuesday = hill sprints or easy (jet lag). W11 has one. | count(run) == 2 except W7, W8, W11
R-WS-04 | hard | A run is run-only: no police, balance, memory or conditioning finisher attached. Low-lung sprints and hill sprints are running and are allowed. | run.blocks subset of {warmup, run_main, low_lung, hill_sprints, cooldown}
R-WS-05 | hard | The trail day shows "TRAIL day" only, no distance (R-SP-10). | trail.detail == null
R-WS-06 | hard | In W5 (5-11 Oct) trail_event on 10-11 October replaced the weekend run (history). | count(trail) == 1
R-WS-07 | hard | Two police sessions per week: a SKILL session and an ENCHAÎNEMENT (from W7: the 8-10 min circuit + fatigue test, R-SP-15; W10 Friday = the W6 storms rematch). W11: offload only. The mock-test option is dead (R-PC-04). | kinds == {skill_session, enchainement}
R-WS-08 | hard | A police cardio block never contains running intervals; its format is EMOM, AMRAP or for time. | cardio.format in {emom, amrap, for_time}
R-WS-10 | soft | Hard days in a row: no limit. Claude warns, she decides (18 Oct, R-SP-13). | warn
R-WS-11 | soft | Two adjacent hard days are flagged (Mon CrossFit + Tue intervals is the accepted pair). | warn
R-WS-13 | hard | No session is generated after 20 November 2026. | max(date) <= 2026-11-20
R-WS-14 | hard | A missed session is never replaced by an EXTRA session and never creates a sixth training day. Re-ordering the week afterwards, including days already past, is allowed and encouraged so the record matches what was really done. | no compensation session; reorder always allowed
R-WS-15 | hard | Weeks 1-6 are frozen as approved or as trained. | weeks 1-6 unchanged
R-WS-44 | hard | A crossfit_plus day is a CrossFit day: nothing planned on it, counted as hard. | crossfit_plus day = hard, no content
```

## The power slot

```
R-WS-41 | hard | Police warm-ups end with broad jumps (card S00_broad_jumps) or the priming sprints (2 × 10 s) named in the plan. Not scored. W11 has none. | warmup ends with power slot or priming
```

## The skill block

```
R-WS-24 | hard | Skill is a MODE, not a list of stations: enough time, no clock, no race, low cardio, the drill stops when quality drops. Any station can be trained in skill mode. | skill_block.pressure == none
R-WS-25 | hard | The skill block comes first and fresh in the session. In park weeks it covers the stations of the week (obstacle, bench with ball, racket, hoops). | index == first
R-WS-26 | hard | Every drill in a skill block carries its own score. | every drill has a measure
R-WS-27 | hard | The same station always gets the same drills and measures, so its scores sit side by side (R-SP-05). | stable measures
R-WS-46 | hard | Bench with ball is trained fresh and calm on a flat surface in every skill session (R-SP-16). Hoops progress by +2 after clean passes (R-SP-17). | bench_fresh in skill_session
```

## The cardio block

```
R-WS-16 | hard | Every SKILL session contains exactly ONE cardio block (a Cross Ops WOD), done, never skipped. The enchaînement's circuit counts as its hard block. The CrossFit class and the runs are not bound by this rule. | skill: count(block.kind == cardio) == 1
R-WS-28 | hard | The cardio block may use ANY card in the library. Filler atoms (station 0) are glue between real movements, never the whole block. | cardio.cards not all station 0
R-WS-29 | hard | EVERY atom in the library may be used in a cardio block (the athlete's rule of 23 Sep; skipping under fatigue is wanted). The only exclusion: the week's skill focus station when one is named. | skill_focus not in cardio.cards
R-WS-30 | hard | FOUR atoms maximum in one cardio block (2 Oct; the rule of three is killed). | count(atoms) <= 4
R-WS-31 | hard | The cardio block carries NO target of any kind. The athlete records what she did (rounds, minutes held) and her effort score, nothing else. | cardio.target == null
R-WS-32 | hard | Cardio volume is loaded to Cross Ops level (R-SP-08), page cited. | cardio.source == cross_ops page
R-WS-45 | soft | Cardio variety (her rule, 1 Oct): new formats and unused atoms first; slalom, wall bars and burpees are overused. | warn
```

## The tails (history, W3-W5)

```
R-WS-34 | hard | TAIL A: dropped from W5. Kept as a definition (one skill drill of 30 to 45 s after every chain round). | no tail_a
R-WS-35 | hard | TAIL B: standalone at the end, 4 to 5 x 1 min of balance of rising difficulty, scored. From W6 the fatigue test replaces it. | history
R-WS-37 | hard | A fatigue test is only measurable against a FRESH TEST taken the same day, right after the warm-up, before any hard work. | session has fresh_test when it has a fatigue_test
R-WS-38 | hard | Every test or tail carries a stop rule (bench: wobbling → step down on purpose; dizzy → stop). A shortened test still counts and is recorded as shortened. | stop_rule != null
```

## Memory

```
R-WS-12 | hard | Each police session has ONE memory block, early (after the warm-up or the fresh test), on the week's card (memory_modules.md v3: A week PLAN + ORDRE, B week QUI MANQUE + RÈGLES). Never at the end. | memory early; one per police session
R-WS-40 | hard | M5, fatigued recall, is OUT of every session shape (22 Sep). | M5 not in any session
```

Memory-block constraint carried from the 10 Sep decision: a memory block may ask the athlete to
**visualise**, **recite the order** or **state action / completion / next station**; it never
asks her to **explain** the circuit or a rule.

## Running intervals (Tuesday)

```
R-WS-19 | hard | run_intervals: warm-up written as one line ("warm-up about 10 min, jog"), one main set, cool-down. Recovery between reps is an easy jog, never a stop. | blocks == [warmup, main, cooldown]
R-WS-20 | hard | The main set and pace are set by Cowork at each week build from her recorded paces (Q1 of APP_REPORT_013_v5: the automatic repeat rule stays OFF). | main == week build
R-WS-21 | hard | Pace targets are per-kilometre paces read on the watch auto-lap; treadmill sessions give km/h. | target.unit == min_per_km
R-WS-23 | hard | Pace zones come from the ONE baseline (2 Oct, VMA 12.2 km/h), reviewed only in Cowork: R 4:55-5:05 · I 5:15-5:30 · T 5:45-5:55 · E >= 7:00 min/km. W6 reps ran 5:01-5:14 at effort 5. | zones == f(baseline)
```

Rule ids R-WS-09, R-WS-17, R-WS-18, R-WS-22, R-WS-33, R-WS-36, R-WS-39, R-WS-42, R-WS-43 are
retired or folded above; the ids stay unused so older references remain valid.

Links: `season_plan.md` v5, `phase_calendar.md` v4, `test_battery.md` v2, `memory_modules.md` v3,
`run_intervals_progression.md` v4, project doc `claude/week-build-standard.md`; the locked weeks
in `03_Weekly_plans/` (WEEK_5_FINAL, WEEK_6_FINAL v2) and `WEEK_6_NOTES.md` v2.
