# Rules: memory modules M1 to M5

version: 2 (23 September 2026). v1 (22 Sep) archived in `90_Archive/`.
Changes in v2 (the athlete's decisions of 23 September): the modules follow a season
progression (one module per week, `season_plan.md`); a weekly recall check is added and
scored; the minimum length is 4 min (the locked chain session has 4); the stale placement
line (Thu M1 + M4, Fri M5) is removed.

```
 M1 order and action    stations 1 to 11 in order, and the action at each one
 M2 rules               for each station: when it counts as done, and what fails it
 M3 transitions         where she goes next, which way she turns, the 5 → 6 → 5 → 6
                        alternation
 M4 full visualisation  the whole circuit, eyes closed, at test pace, about 6 min:
                        action, completion, transition, next station, no prompts
 M5 fatigued recall     UNUSED since 22 Sep (R-WS-40). Kept defined only.
```

## The season progression

```
 W3        locked: M1 + hoop colour line (skill) · M3 (chain)
 W4        M1   order + the action at each station
 W5-W6     M2   when each station counts as done + what fails it
 W7-W8     M3   transitions
 W9-W11    M4   full visualisation, eyes closed, at test pace
```

## The weekly recall check (new)

```
 when     the last 2 min of the skill session's memory block, every week from W4
 what     11 stations × 3 items = 33: order · action · done-when
 how      she says them aloud without help, then checks against the official sheet
 score    errors (missed or wrong items), aim 0
```

```
R-MM-01 | hard | Each memory block lasts 4 to 12 minutes and does not count as a principal session. | 4 <= memory.duration_min <= 12
R-MM-02 | hard | A memory block may ask to visualise, recite the order, or state action / completion / next station; it never asks to explain the circuit or a rule (10 Sep decision). | memory.prompt.kind in {visualise, recite, state}
R-MM-03 | soft | Random quizzes rotate station order, critical rules, prohibited actions, corrections and transitions, rather than asking only station names. | warn when an exposure asks only names
R-MM-04 | hard | From W4, the skill session's memory block ends with the recall check, scored as errors out of 33 (measure recall_errors). | skill memory block has a recall_errors drill from W4
R-MM-05 | hard | The module of the week comes from season_plan.md; both police sessions of the week use it. | module == SEASON_PLAN[week].memory
```

Placement: R-WS-12 in `weekly_shape.md` v5 (one block at the start of each police session).
