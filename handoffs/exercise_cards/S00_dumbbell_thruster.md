# Dumbbell thruster

```yaml
id: S00_dumbbell_thruster
name: Dumbbell thruster, squat to overhead press in one move
station: 0
stations_secondary: [4, 5, 7]
quality: [strength, power]
role: P
state: fresh
fresh_only: false
location: [gym]
equipment: [dumbbells_pair]
intensity: hard
complexity: 2
fidelity: approximation
duration_min: 12
dose:
  reps: {min: 8, max: 8}
  sets: {min: 5, max: 5}
  work_s: null
  rest_s: {min: 90, max: 90}
progression_next: null
regression_prev: S00_air_squats
crossfit_overlap: [heavy_legs, shoulders]
measures: [load_kg, reps_done, effort_1_5]
memory_module: null
version: 1
```

## Purpose
Whole-body strength for the drag, trolley and bag stations when only a hotel gym is around.
Her own idea (parked 18 Oct), written at the W8 build.

## Execution
A dumbbell in each hand at the shoulders. Squat below parallel, drive up and press both dumbbells
to lock-out in one move. Lower to the shoulders and go straight into the next squat.
First pass (W8): 5 × 8 at 2 × 10 kg (the heaviest she expects in Kingston), 90 s rest.

## Score
Load, reps done, effort 1-5. First session records the real number.

## Stop if
Back rounds, or the press turns into a lean back.

Fits: strength piece before a Cross Ops WOD. Trains: legs, shoulders, power.
**This drill is an approximation, not an official station.**
