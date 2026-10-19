# Luc Léger test (20 m multistage shuttle run, the real format)

Replaces the card S00_luc_leger_shuttles (19 Oct, archived): that card used fixed-speed bouts with
rest, which is not the Luc Léger format (her correction, 19 Oct).

```yaml
id: S00_luc_leger_test
name: Luc Léger test (20 m multistage shuttle run, continuous, progressive)
station: 0
stations_secondary: [1, 4, 5, 7]
quality: [conditioning]
role: C
state: fresh
fresh_only: true
location: [outdoor, any]
equipment: [cones, phone_beep_app]
intensity: hard
complexity: 1
fidelity: approximation
duration_min: 10
dose:
  reps: {min: 1, max: 1}
  sets: {min: 1, max: 1}
  work_s: null              # continuous, until two missed beeps in a row
  rest_s: null
progression_next: null
regression_prev: null
crossfit_overlap: [running, change_of_direction]
measures: [last_stage_and_leg, vma_kmh, effort_1_5]
memory_module: null
version: 1
```

## Purpose
Measure her current VMA with the turns of a 20 m shuttle, to reset the interval paces (the 6-min
run of 2 Oct, 12.2 km/h, is out of date). Her decision, 19 Oct: the real test, maximal, once in W7.
This amends her rule "one baseline, never repeated" for this test only.

## Set-up
Two cones or lines exactly 20 m apart (tape measure), flat, non-slippery. Beep app set to the
Léger 1988 protocol: 1-minute stages, stage 1 at 8.5 km/h, +0.5 km/h per stage.

```
 stage   speed       one 20 m leg every
 5       10.5 km/h   6.9 s
 7       11.5 km/h   6.3 s
 8       12.0 km/h   6.0 s
 9       12.5 km/h   5.8 s
 10      13.0 km/h   5.5 s
 11      13.5 km/h   5.3 s
 12      14.0 km/h   5.1 s
```

## Execution
1. Warm-up about 10 min, jog, 2-3 short strides.
2. Start at stage 1, run continuously: reach the line ON each beep, turn, go back.
3. The speed rises every minute. No rest at any point.
4. End when she misses the line at the beep TWICE IN A ROW (or stops).

Cues: foot on the line · hips low into the turn · push off · eyes up · do not race ahead of the beep.

## Score
Last stage and leg completed (example "stage 9, leg 6"). VMA = the speed of the last fully
completed stage. Effort 1 to 5. Note the surface and whether the 20 m was measured.

## Stop if
- Pain on a turn, dizziness: stop, it still counts.

## Uses
- TEST (W7, Wed 21 Oct): to exhaustion, once, fresh, at the start of the session.
- A capped version (progressive from stage 1, stop at a set stage, never maximal) was proposed as
  a reusable drill for W8-W10: NOT decided by the athlete.

## Sources
Léger, Mercier, Gadoury, Lambert, "The multistage 20 metre shuttle run test for aerobic fitness",
Journal of Sports Sciences 1988 (protocol, stage speeds, end rule).
**This drill is an approximation, not the official station.** (The Luc Léger is not part of the
Vaud exam; it is used here to measure the engine.)
