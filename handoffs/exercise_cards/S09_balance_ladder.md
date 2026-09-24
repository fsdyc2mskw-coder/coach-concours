# S09 balance ladder

```yaml
id: S09_balance_ladder
name: Balance ladder, one leg to the wobble board, 4 x 1 min of rising difficulty
station: 9                      # bench proxy (the bench itself is on hold, no equipment)
stations_secondary: [10, 11]    # single-foot skipping, the racket course
quality: [balance]
role: A
state: both                     # fresh as the reference, tired as tail B
fresh_only: false
location: [home, outdoor]
equipment: [basketball, balance_board, wall]
intensity: low
complexity: 2
fidelity: approximation
duration_min: 5
dose:
  reps: null
  sets: {min: 4, max: 4}        # the 4 minutes below, in order
  work_s: 60                    # 30 s per leg on the one-leg minutes
  rest_s: {min: 20, max: 20}
progression_next: null          # later: one leg on the board, once two feet is clean
regression_prev: null
crossfit_overlap: [heavy_legs]
measures: [touchdowns, ball_drops]
memory_module: null
version: 1
```

Locked by the athlete on 23 September 2026. Her own idea (one leg, eyes closed, then more
difficulty), shaped with Claude. First used in week 4 (the racket week), because a tail can
never use the week's skill station (R-WS-36).

## Purpose (one sentence)

A balance measure that does not use the racket, so the tails still work in a racket week and the
fresh-to-tired gap of the balance itself can be tracked.

## Set-up

- Flat, non-slip ground. A wall within arm's reach.
- Basketball. Wobble board (two feet only for now).
- Timer: 1 min work, 20 s between minutes.

## Execution

```
 min 1   one leg, eyes open                              30 s each leg
 min 2   one leg, eyes closed, near a wall               30 s each leg
 min 3   one leg, basketball passed around the waist     30 s each leg
 min 4   two feet on the wobble board, basketball passed around the waist
```

As a FRESH REFERENCE (start of the chain session): min 2 and min 4, 1 min each.
As TAIL A (inside the chain block): min 3, 30 s, switch leg each round.
As TAIL B (end of the chain session): the four minutes in order.

## Score

- touchdowns: the free foot touches the ground, or a board edge touches the floor;
- ball drops;
- both counted per minute. Aim 0.

## Quality criteria (what "clean" means)

- the standing knee stays soft, the hips level;
- the correction comes from the ankle and the hip, not from throwing the arms;
- eyes closed only on flat ground, never on the board.

## Stop / regress if

- dizzy: stop at once;
- 3 touchdowns in one minute: stop the tail, it still counts and is recorded as shortened;
- any ankle discomfort: stop for the day.

## Progress

- two sessions with 0 touchdowns on min 4 → min 4 becomes one leg on the board.

## Official reference

Station 9, mobile bench: "no leaning on the ball or the cone" (official sheet, summarised in the
ledger). The bench itself is not available; this ladder trains the balance it needs.
**This drill is an approximation, not the official station.**
