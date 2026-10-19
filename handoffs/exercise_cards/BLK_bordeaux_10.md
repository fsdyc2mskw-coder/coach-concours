# Block: BORDEAUX 10 (enchaînement, 2 laps for time)

```yaml
id: BLK_bordeaux_10
name: BORDEAUX 10, 2 laps for time, cap 10 min (the test simulation, R-SP-15)
station: 0
stations_secondary: [1, 2, 3, 10]
quality: [conditioning, explosive, transitions, breath]
role: D
state: fatigued
fresh_only: false
location: [outdoor]
equipment: [cones_or_poles, wall_or_backup, bar_or_none, rope, tennis_balls_5, cap]
intensity: to_the_limit
complexity: 3
fidelity: approximation
duration_min: 10
dose:
  reps: 2   # laps
  sets: 1
  work_s: 600   # cap
  rest_s: 0
progression_next: null
regression_prev: BLK_acheron_park
crossfit_overlap: [burpees, rows, jumping]
measures: [total_time_or_station_at_cap, effort_1_5, backup_used]
memory_module: null
version: 1
```

## Format
Two laps for time, cap 10:00, no planned rest. One lap, in this order: sprint 20 m · slalom about
15 m, out straight, weave back · obstacle, official rhythm: 5 crossings out (a tennis ball into the
cap each time), 4 back without ball = 9 crossings · 10 bar rows · 8 full burpees · 45 s rope skip,
continuous. Score: total time, or the station reached at 10:00.

## Rules
Burpees chest to the floor · rows body straight, chest to the bar · a sloppy crossing → backup C
(1 burpee + 1 squat jump per crossing) for the rest of the block · dizzy → stop, it still counts.
Followed within 30 s by the fatigue test (bench with ball 1 swap · racket 1 pass).
Backups: obstacle A wall · B stairs · C burpee + squat jump; no bar → push-ups, same number.

Fits: the enchaînement, from W7. Trains: breath and speed of the test, obstacle under fatigue,
transitions. First used: W7 Thursday (first pass: 2 laps, time recorded).
**This block is an approximation, not an official station.**
