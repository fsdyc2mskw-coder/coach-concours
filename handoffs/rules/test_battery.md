# Rules: baseline tests

version: 3 (19 October 2026), the athlete's decision the same day.
v2 (23 Sep: ONE baseline only, no re-test) and v1 archived in `90_Archive/`.
Change in v3: **one Luc Léger test (20 m multistage shuttle run) is added, once, in week 7
(Wednesday 21 October), fresh, before the interval run.** Purpose: a fresh VMA to reset the
interval paces of W8-W11 (the 6-min run of 2 Oct, 12.2 km/h, is out of date). No other test is
added; the baseline of 23 Sep and 2 Oct is not repeated.

## When

```
 Wed 23 Sep   BASELINE 1: broad jump + 20 m sprint                    done
 Fri 2 Oct    BASELINE 2: 6-min run, fresh, 1 385 m, VMA 12.2 km/h    done
 Wed 21 Oct   LUC LÉGER TEST (W7), fresh, then 4 × 4 min intervals    v3
```

## 1. Standing broad jump (explosiveness)

```
 start     feet hip-width, toes behind a line
 jump      both feet, arm swing allowed
 landing   both feet, held; a hand down or a step back = redo
 measure   line → back of the rearmost heel, in cm
 attempts  3, 90 s rest, best counts
```

## 2. 20 m sprint (first metres)

```
 start     standing, front foot behind the line, she goes when ready
 finish    run THROUGH the cone
 attempts  3, 3 min rest, best counts
 timing    sprint-timer app or slow-motion video on the phone
```

## 3. Six-minute run (the circuit's engine)

```
 frame     15 min easy + 3 × 20 s strides · TEST · 5 min easy jog · easy running after
 what      as far as possible in 6 minutes, flat, even pace
 record    distance in metres, from the watch
 computed  VMA (km/h) = distance ÷ 100
```

## 4. Luc Léger test (v3, week 7 only)

```
 card      exercise_cards/S00_luc_leger_test.md
 set-up    two lines exactly 20 m apart, flat; beep app on the Léger 1988 protocol
           (1-min stages, stage 1 at 8.5 km/h, +0.5 km/h per stage)
 frame     10 min warm-up jog + strides · TEST · 10 min recovery · intervals 4 × 4 min
 what      continuous, reach the line on each beep, no rest
 end       the second missed beep in a row, or she stops
 record    last stage and leg completed, effort, surface
 computed  VMA (km/h) = speed of the last completed stage
 no strip  move the test to a day with a 20 m strip; never a shorter distance
```

## Rules

```
R-TB-01 | hard | The baseline: broad jump + 20 m sprint (23 Sep) and 6-min run (2 Oct), not repeated. One Luc Léger test is added in W7 (v3, her decision 19 Oct). No other test is generated in any later week unless she decides it. | tests on 2026-09-23, 2026-10-02, 2026-10-21
R-TB-02 | hard | Recorded: the three attempts of the jump (cm) and of the sprint (s, two decimals), the 6-min distance (m), the Luc Léger last stage + leg. The best is computed. | best = max (jump) / min (sprint)
R-TB-03 | hard | VMA is computed, never typed: 6-min distance ÷ 100; Luc Léger = speed of the last completed stage. | computed
R-TB-04 | hard | No target, no comparison with anyone, no predicted official time. A test is a reference point only. | no target field
R-TB-05 | hard | The tests are the reference Cowork reads the session feedback against; the Luc Léger result resets the interval paces of W8-W11, in Cowork at the week build, never automatically. | no automatic change
```

The athlete writes the numbers in `03_Weekly_plans/WEEK_n_NOTES.md` (W7: WEEK_7_NOTES) until the
app has a field for them.
