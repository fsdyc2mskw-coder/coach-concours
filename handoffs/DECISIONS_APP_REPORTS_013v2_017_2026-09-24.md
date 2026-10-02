# Decisions on APP_REPORT_013_v2 and APP_REPORT_017 (24 September 2026)

Taken by the athlete with Claude (Cowork), one question at a time. Tier TOP. These answers are
the athlete's explicit current decision (precedence 1). They go into the rule files and into
CR-013 v3 at the week 5 build (before Mon 5 Oct); until then this file wins.

```
 #   question                        decision                               lands in
 1   baseline block length           no minutes shown, no app change        -
 2   Sun 27 run text                 run 8-9 km as the week 3 plan says;    -
                                     no app change
 3   Tuesday pace zones              rule: 4-min reps at about 90 % of      run_intervals_progression
                                     VMA (6-min metres / 100), from W5;     CR-013 v3
                                     Tue 29 stays 4 x 4 @ 6:00
 4   week 3 skill load               stays "low"                            -
 5   taper Wed 18 Nov                keep memory M4 + recall check, ghost   CR at the W10 build
                                     walk, 6-min cardio short and crisp,
                                     stop fresh
 6   M4 length                       6 min everywhere: the chain session    memory_modules, weekly_shape
                                     memory slot grows to 6 min in W9-W11   CR-013 v3
 7   chain B (W5-W6)                 built at the week 5 build, before      W5 build, CR-013 v3
                                     Mon 5 Oct; NO fallback to chain A
 8   ghost circuit (W7-W10)          empty placeholder until designed;      weekly_shape (R-WS-42 wording)
                                     design before 19 Oct
 9   cardio atoms                    FRESH cardio each week build, from     weekly_shape, CARDIO_BY_WEEK
                                     all atoms except the week's skill      each week's CR
                                     station; week 4 set = safety net only
 10  balance score (tail B)          1 box per minute, touchdowns + drops   ✓ as built
 11  racket score                    1 row per set (6 boxes)                CR-013 v3
 12  weeks 9-10 focus                RACKET, picked now (not the W8         season_plan, CR-013 v3
                                     worst score); tails switch to the
                                     balance ladder in W9-W10
 +   week 8 Tuesday "Re-test 1 km"   deleted (no re-test, ever)             CR-013 v3
```

## Consequences to carry into the week 5 build

- `season_plan.md` v3: W9 and W10 focus = 11 (racket), tails = balance; note (c) removed.
- `weekly_shape.md` v7: chain session memory 6 min in W9-W11 (session +2 min); R-WS-42 says
  placeholder; cardio atoms written fresh per week build.
- `run_intervals_progression.md` v4: the 90 % VMA rule from W5; no re-test line anywhere.
- CR-013 v3 (data only): W5 content (skipping skill block, chain B, W5 cardio), racket score per
  set, the chain memory length, W9-W10 focus and tails, delete "Re-test 1 km".
- Thu 1 Oct (before CR-013 v3): the app shows 3 racket boxes; write set 1 and set 2 separately
  in `WEEK_4_NOTES.md`.
