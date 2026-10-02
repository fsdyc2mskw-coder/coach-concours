# Rules: season plan, weeks 3 to 11

version: 3 (2 October 2026), confirmed by the athlete. v2 (23 Sep) archived.
Changes in v3:
- TRAVEL CONFIRMED, 19 Oct to 1 Nov (weeks 7 and 8): hotel gym, no ladder, no hoops,
  no CrossFit. Weeks 7 and 8 become TRAVEL weeks (see "Travel weeks" below).
- The two lost CrossFit classes (Mon 19 Oct, Mon 26 Oct) move to SATURDAY 17 Oct (W6) and
  SATURDAY 7 Nov (W9), column `crossfit_plus`. The athlete may move the day later.
- Ghost circuit starts in W9 (rule agreed 23 Sep, now applied). Slalom skill block moves
  from W7 to W8 (or W9 if no 18 m space is found while travelling).
- Hill sprints start in W9 (6), then W10 (6). A treadmill is not used for sprints.
- W9 and W10 focus = RACKET, tails = BALANCE (decided 24 Sep, DECISIONS_APP_REPORTS file).
- Weekend run moves to Sunday in W6 and W9, because Saturday is the CrossFit class.

It holds the ONE table the app reads week by week. Every other rules file refers to it
instead of repeating numbers. The coder copies the table into a single constant
(`SEASON_PLAN` in `src/coach/sessionShapes.ts`), which replaces `SKILL_FOCUS_BY_WEEK` and
`cardioDurationForWeek`.

## The objective (23 September 2026)

The official time cannot be trained against, because the circuit can never be recreated.
So the goal is the parts that make the circuit, each one measurable:

```
 ON 20 NOVEMBER THE ATHLETE ARRIVES WITH
 1 MEMORY      the 11 stations cold: order, action,      recall check, errors → 0
               when it counts as done, what fails it
 2 SKILLS      slalom, wall bars, hoops, skipping,       error scores, and the gap
               racket: clean, also when tired            fresh vs tired
 3 ENGINE      more explosive, faster to recover         ONE baseline, then feedback
               between hard efforts                      (baseline 21-27 Sep, test_battery.md)
 4 STRENGTH    the Monday CrossFit class                 not measured by the app
 5 FEAR,       obstacle (2) and bench (9): on hold,      none yet
   BALANCE     switch ready when an outdoor place exists
```

The 6:15 limit stays the official rule. It is never tracked, never compared, never
predicted (R-PC-04).

## The phases

```
 COMBINE    W3-4   build the engine, link stations, long run grows
 TRAIL      W5     load down, the race replaces the weekend run
 RESET      W6     recover from the race, one extra CrossFit on Saturday, no other new stress
 TRAVEL     W7-8   hotel gym: skipping and racket skills, engine on treadmill and floor atoms
 PEAK       W9-10  ghost circuit, hardest work in W9, then sharper and shorter in W10
 TAPER      W11    fresh legs, crisp technique, memory rehearsed, test Friday
```

## THE TABLE

One block per week. Field names are the ones the constant uses.

```
week start   phase   load focus      cardio power memory chain               tails      run_weekend                crossfit_plus  tests
 3  21 Sep   combine 3   8           10     -     locked locked 1→3          racket     6-min run + 8-9 km         -              BASE
 4  28 Sep   combine 4   11          12     3 j   M1     A 1→3→8 (a)         BALANCE    Sat 10-11 km easy          -              -
 5  5 Oct    trail   2   10          10     3 j   M2     B 8→10→11 (e)       BALANCE*   RACE Sun 11 Oct 12 km      -              -
 6  12 Oct   reset   3   8           12     3 j   M2     B 8→10→11, light    BALANCE*   SUN 18 Oct 7 km easy       SAT 17 Oct     -
 7  19 Oct   travel  3   10 (f)      13     5 j   M3     T 10→11 flat (g)    racket     Sat 7-8 km (treadmill ok)  -              -
 8  26 Oct   travel  4   1 or 11 (h) 15     5 j   M3     T 10→11 flat (g)    racket(h)  Sat 7-8 km (treadmill ok)  -              -
 9  2 Nov    peak    5   11          15     5 j   M4     GHOST 1-11 (b)      BALANCE    SUN 8 Nov 7-8 km easy (i)  SAT 7 Nov      -
10  9 Nov    peak    3   11          12     5 j   M4     GHOST 1-11 (b)      BALANCE    Sat 7 km + 6 hill spr.     -              -
11  16 Nov   taper   1   light       6      -     M4     ghost walk (d)      -          none                       -              -
```

Reading the columns:

```
 load           weekly load, 1 to 5 squares; drawn in the app as the week bar
 focus          the ONE station of the skill block (R-WS-25); 11 racket, 10 skipping,
                8 hoops, 1 slalom
 cardio         minutes of the cardio block, same in both police sessions (R-WS-32)
 power          broad jumps at the end of the warm-up of both police sessions
                (card S00_broad_jumps): 3 j = 3 jumps (about 2 min), 5 j = 5 jumps
 memory         the week's module, at the start of both police sessions (memory_modules v2)
 chain          the chain block of the chain session
 tails          the skill used by tail A and tail B; never the week's focus (R-WS-36)
 run_weekend    the weekend run; hill sprints = card S01_hill_sprints
 crossfit_plus  the extra CrossFit class that replaces a class lost to travel; the app
                shows it as a CrossFit day, records it only, never plans its content
 tests          BASE = the one baseline (test_battery.md v2). No test in any later week.
```

Notes:

```
 (a) W4 chain A: slalom → wall bars → hoops (5, ball in the arms).
 (b) GHOST CIRCUIT = PLACEHOLDER. Its card is not written yet (to design together before
     W9, i.e. before Mon 2 Nov). Until it exists as a real card, the app generates a normal
     chain block and shows "Circuit fantôme : à venir" on it. Never invent it.
 (d) W11 has no chain session: see "Week 11" below.
 (e) W5 chain session: pending "lock week 5" (engine chain, weekly_shape v7).
 (f) W7 focus = skipping (S10 cards), because the rope travels and the slalom needs space.
 (g) T = TRAVEL CHAIN: skipping card (S10_block_switch_fresh) → racket on flat ground
     (S11 cards, no obstacles unless the 3 low obstacles travel). No hoops, no wall bars.
 (h) W8 focus = SLALOM (S01 cards, 4-6 flat cones packed) IF an 18 m flat space is found;
     otherwise RACKET on flat ground, and then the tails switch to BALANCE (R-WS-36).
     The slalom skill block is written in the W8 build either way, so it is ready for W9+.
 (i) W9 hill sprints (6) move to TUESDAY 3 Nov in place of the run intervals, so that
     Sat (CrossFit+) · Sun (easy run) · Mon (CrossFit) never makes three hard days in a
     row (R-TL-06). Reversible.
 *   W5-W6 tails: BALANCE, not racket, because chain B already ends on the racket.
 BALANCE = card S09_balance_ladder: fresh reference = its min 2 and min 4; tail A = its
     min 3 (30 s, switch leg each round); tail B = its 4 minutes.
```

## Travel weeks, 19 October to 1 November

```
 PACK       skipping rope · racket + ball · 4-6 flat cones
 PLACE      hotel gym (assume no ladder, no hoops, no bench)

 Mon        no CrossFit (the class moves to Sat 17 Oct and Sat 7 Nov)
 Tue        run intervals on the treadmill (run_intervals_progression)
 Wed        SKILL SESSION   warm-up + broad jumps · memory · skill block (focus) · cardio
 Thu        CHAIN SESSION   warm-up + broad jumps · fresh reference · memory · travel chain
                            · cardio · tail B · cool-down
 Sat        weekend run, outdoor or treadmill, easy

 CARDIO POOL  air squats · jumping jacks · jump squats · half burpees · high knees ·
              skipping (W8 only, never in its own skill week) · rower or bike if present
 NOT USED     wall bars, hoops, ghost circuit, hill sprints on a treadmill
```

The days may be reordered by the athlete (R-TL-06 still applies).

## Week 11, the taper (16 to 20 November)

```
 Mon 16   CrossFit class, her call to go or not (the app only records it)
 Tue 17   run intervals, 4 × 1 min (run_intervals_progression.md v3)
 Wed 18   TAPER SESSION (the skill session, moved from Thursday):
          warm-up 6 · memory M4 full visualisation 6 · ghost walk-through at walking
          pace, one clean pass of each trainable skill 15 · cardio 6 · cool-down 5
 Thu 19   no session. Visualisation at home, optional, not recorded
 Fri 20   POLICE TEST (fixed event)
```

## Build weeks and down weeks (R-SP-04)

```
 build weeks   W4 · W6 · W7 · W8 · W9      cardio 12 · 12 · 13 · 15 · 15
 down weeks    W5 (trail) · W10 (sharpen) · W11 (taper)
```

Progression is compared across build weeks only. A down week is lower on purpose. W7-W8
are compared with care: different place, different equipment.

## Rules

```
R-SP-01 | hard | The app reads focus, cardio minutes, power dose, memory module, chain type, tail skill, weekend run, crossfit_plus and baseline flag from this table, week by week. It never invents a value missing from it. | sessionFor(week) uses SEASON_PLAN[week] only
R-SP-02 | hard | A focus with two options (W8: slalom or racket) stays open until the athlete confirms it at the W8 build. | focus shows both options until set
R-SP-03 | hard | A placeholder (ghost circuit, a chain or skill block not yet built) is shown as a named gap, never replaced by content from another week. | placeholder text shown, no week 3 copy
R-SP-04 | hard | Cardio progression is compared across build weeks only (W4, W6, W7, W8, W9); in down weeks (W5, W10, W11) the dose goes down on purpose. | dose(build n) >= dose(previous build)
R-SP-05 | hard | The skill-block content of a station is written once, in a Cowork week build session, and reused each time that station is the focus, so the scores are comparable side by side. | same station → same drills and measures
R-SP-06 | soft | A week that has no content yet for its focus station shows the skill block as "à construire" and still counts as a skill session. | warn
R-SP-07 | hard | A crossfit_plus day is a CrossFit day: the app plans nothing on it and counts it as a hard day for R-TL-06. | crossfit_plus day = hard, no content
```

Links: `phase_calendar.md` v4, `weekly_shape.md` v6, `test_battery.md` v2,
`memory_modules.md` v2, `run_intervals_progression.md` v3, `03_Weekly_plans/WEEK_5_PLAN_2026-10-05.md`.
