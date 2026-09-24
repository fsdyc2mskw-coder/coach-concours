# Rules: season plan, weeks 3 to 11

version: 2 (23 September 2026, afternoon), confirmed by the athlete. v1 (same morning) archived.
Changes in v2: ONE baseline only, this week (21-27 Sep), no re-tests (test_battery.md v2); the
balance ladder is a real card (S09_balance_ladder); chain A in W4, chain B in W5-W6; every atom
may be used in cardio except the week's skill station.
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
               racket: clean, also when tired             fresh vs tired
 3 ENGINE      more explosive, faster to recover          ONE baseline, then feedback
               between hard efforts                       (baseline 21-27 Sep, test_battery.md)
 4 STRENGTH    the Monday CrossFit class                  not measured by the app
 5 FEAR,       obstacle (2) and bench (9): on hold,        none yet
   BALANCE     switch ready when an outdoor place exists
```

The 6:15 limit stays the official rule. It is never tracked, never compared, never
predicted (R-PC-04).

## The phases

```
 COMBINE    W3-4    build the engine, link stations, long run grows
 TRAIL      W5      load down, the race replaces the weekend run
 RESET      W6      recover from the race, compare scores, no new stress
 INTEGRATE  W7-8    ghost circuit arrives, engine gets denser
 PEAK       W9-10   hardest work in W9, then sharper and shorter in W10
 TAPER      W11     fresh legs, crisp technique, memory rehearsed, test Friday
```

## THE TABLE

One block per week. Field names are the ones the constant uses.

```
week  start   phase      load  focus  cardio  power   memory  chain            tails     run_weekend           tests
 3    21 Sep  combine    3     8      10      -       locked  locked 1→3       racket    6-min run + 8-9 km    BASE
 4    28 Sep  combine    4     11     12      3 j     M1      A 1→3→8 (a)      BALANCE   10-11 km easy         -
 5     5 Oct  trail      2     10     10      3 j     M2      B 8→10→11, light BALANCE*  RACE Sun 11 Oct 12 km -
 6    12 Oct  reset      2     8      12      3 j     M2      B 8→10→11, light BALANCE*  7 km easy             -
 7    19 Oct  integrate  4     1      13      5 j     M3      GHOST 1-6 (b)    racket    7-8 km + 6 hill spr.  -
 8    26 Oct  integrate  5     10     15      5 j     M3      GHOST 6-11 (b)   racket    7-8 km + 8 hill spr.  -
 9     2 Nov  peak       5     W8     15      5 j     M4      GHOST 1-11 (b)   racket(c) 7-8 km + 10 hill spr. -
10     9 Nov  peak       3     W8     12      5 j     M4      GHOST 1-11 (b)   racket(c) 7 km + 6 hill spr.    -
11    16 Nov  taper      1     light  6       -       M4      ghost walk (d)   -         none                  -
```

Reading the columns:

```
 load          weekly load, 1 to 5 squares; drawn in the app as the week bar
 focus         the ONE station of the skill block (R-WS-25); 11 racket, 10 skipping,
               8 hoops, 1 slalom; "W8" = the station with the worst skill score in
               week 8, chosen in the week 8 review (Cowork), never by the app
 cardio        minutes of the cardio block, same in both police sessions (R-WS-32)
 power         broad jumps at the end of the warm-up of both police sessions
               (card S00_broad_jumps): 3 j = 3 jumps (about 2 min), 5 j = 5 jumps
               (about 3 min)
 memory        the week's module, at the start of both police sessions (memory_modules v2)
 chain         the chain block of the chain session
 tails         the skill used by tail A and tail B; never the week's focus (R-WS-36)
 run_weekend   the Saturday run (Sunday in race week); hill sprints = card S01_hill_sprints
 tests         BASE = the one baseline (test_battery.md v2): Wed 23 Sep jump + sprint,
               Sun 27 Sep 6-min run. No test in any later week.
```

Notes:

```
 (a) W4 chain A: slalom → wall bars → hoops (5, ball in the arms). It extends the week 3
     chain by one station. Chosen by the athlete on 23 Sep.
     W5-W6 chain B: hoops → skipping → racket, stations 8 → (9) → 10 → 11, the end of the
     test where the balance worry sits.
 *   W5-W6 tails: BALANCE, not racket, because chain B already ends on the racket
     (Claude's proposal of 23 Sep, the athlete may reverse it).
 (b) GHOST CIRCUIT = PLACEHOLDER. Its card is not written yet (to design together before
     W7). Until it exists as a real card, the app generates a normal chain block and shows
     "Circuit fantôme : à venir" on it. Never invent it.
 (c) If the W8 worst score is the racket, the tails of W9-10 switch to BALANCE (R-WS-36).
 (d) W11 has no chain session: see "Week 11" below.
 BALANCE = card S09_balance_ladder, locked 23 Sep: fresh reference = its min 2 and
     min 4; tail A = its min 3 (30 s, switch leg each round); tail B = its 4 minutes.
```

## Week 11, the taper (16 to 20 November)

```
 Mon 16  CrossFit class, her call to go or not (the app only records it)
 Tue 17  run intervals, 4 × 1 min (run_intervals_progression.md v3)
 Wed 18  TAPER SESSION (the skill session, moved from Thursday):
         warm-up 6 · memory M4 full visualisation 6 · ghost walk-through at walking
         pace, one clean pass of each trainable skill 15 · cardio 6 · cool-down 5
 Thu 19  no session. Visualisation at home, optional, not recorded
 Fri 20  POLICE TEST (fixed event)
```

## Build weeks and down weeks (R-SP-04)

```
 build weeks   W4 · W6 · W7 · W8 · W9     cardio 12 · 12 · 13 · 15 · 15
 down weeks    W5 (trail) · W10 (sharpen) · W11 (taper)
```

Progression is compared across build weeks only. A down week is lower on purpose.

## Travel (tentative, 23 September 2026)

The athlete may travel from 19 October to 2 November (weeks 7 and 8). Nothing changes
now. If it is confirmed: the ghost circuit starts in W9 instead of W7.

## Rules

```
R-SP-01 | hard | The app reads focus, cardio minutes, power dose, memory module, chain type, tail skill, weekend run and baseline flag from this table, week by week. It never invents a value missing from it. | sessionFor(week) uses SEASON_PLAN[week] only
R-SP-02 | hard | "W8" focus weeks (9 and 10) stay a placeholder until the athlete confirms the station after the week 8 review. | focus 'W8' renders as a placeholder
R-SP-03 | hard | A placeholder (ghost circuit, a chain or skill block not yet built) is shown as a named gap, never replaced by content from another week. | placeholder text shown, no week 3 copy
R-SP-04 | hard | Cardio progression is compared across build weeks only (W4, W6, W7, W8, W9); in down weeks (W5, W10, W11) the dose goes down on purpose. | dose(build n) >= dose(previous build)
R-SP-05 | hard | The skill-block content of a station is written once, in a Cowork week build session, and reused each time that station is the focus, so the scores are comparable side by side. | same station → same drills and measures
R-SP-06 | soft | A week that has no content yet for its focus station shows the skill block as "à construire" and still counts as a skill session. | warn
```

Links: `phase_calendar.md` v4, `weekly_shape.md` v6, `test_battery.md` v2,
`memory_modules.md` v2, `run_intervals_progression.md` v3, `03_Weekly_plans/WEEK_4_PLAN_2026-09-28.md`.
