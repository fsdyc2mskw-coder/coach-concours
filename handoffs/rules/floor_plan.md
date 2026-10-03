# Rules: floor plan of the circuit (canonical)

version: 1 (2 October 2026). Placed and validated by the athlete on the reference board of the
memory game mockup. This is the only source for where each station stands in the room. The official
sheet (`01/01_PARCOURS_11_stations_official`) gives no room layout, and the official video is filmed
in several halls, so neither can override this file. Station rules stay in the official sheet.

## The room, seen from above (entrance bottom left)

```
 ┌──────────────────────────────────────────┐
 │  9 Banc     7 Sac à la corde   6 Écrous   │
 │                                   ⇅ ×2    │
 │             8 Cerceaux         5 Chariot  │
 │                                           │
 │ 10 Corde                                  │
 │    à sauter              4 Mannequin      │
 │                                           │
 │ 11 Raquette                  3 Espaliers  │
 │   (arrivée)                               │
 │             1 Slalom    2 Obstacle        │
 │                                           │
 │ MOI                                       │
 └─▲ ENTRÉE ─────────────────────────────────┘
```

## The route

```
 start   entrance, bottom left
 1 → 2   along the bottom, left to right
 2 → 3   up to the right wall
 3 → 4   back toward the middle
 4 → 5   up the right side
 5 ⇄ 6   trolley and nuts alternate twice: 5 → 6 → 5 → 6
 6 → 7   along the top, right to left
 7 → 8   down to the middle
 8 → 9   up to the top-left corner
 9 → 10  down the left wall
 10 → 11 down the left wall, finish at the racket
```

## Coordinates (board 700 × 1120 px, room frame from x 30, y 66, 640 × 944; top-left of each station block)

```
 1 Slalom          147,783      7 Sac à la corde   208,88
 2 Obstacle        350,782      8 Cerceaux         216,300
 3 Espaliers       536,672      9 Banc              33,95
 4 Mannequin       406,504     10 Corde à sauter    24,380
 5 Chariot         555,294     11 Raquette          39,628
 6 Écrous          450,90       athlete (entrance)  30,948
```

```
R-FP-01 | hard | The memory game's plan exercise checks positions against these coordinates only. | plan.check uses FLOOR_PLAN v1
R-FP-02 | hard | Any change to a position is a new version of this file, made only on the athlete's word. | version bump
```
