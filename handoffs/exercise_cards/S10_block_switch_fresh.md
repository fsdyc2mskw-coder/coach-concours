# S10 block switch

```yaml
id: S10_block_switch_fresh
name: Block switch, 10 both then 5 right then 5 left, foot order at random
station: 10
stations_secondary: []
quality: [coordination, precision, balance, conditioning]
role: A
state: both                     # 23 Sep: fresh in a skill block, AND tired in cardio
location: [home, outdoor]
equipment: [skipping_rope]
intensity: moderate
complexity: 3
fidelity: close
duration_min: 7
dose:
  reps: null
  sets: {min: 4, max: 6}        # rounds of 45 s (skill block)
  work_s: 45
  rest_s: {min: 30, max: 45}
progression_next: null          # round 2 defines levels 2-3
regression_prev: null
crossfit_overlap: [jumping, heavy_legs]
measures: [rope_catches, catch_location, clean_rounds, confidence_1_5]
memory_module: null
version: 2
```

Version 2 (23 September 2026): the athlete wants skipping under fatigue as cardio ("great
cardio, keep it"), and station 10 comes late in the real test. The id keeps its old name so
nothing that points at it breaks.

## Purpose (one sentence)

Train the exact moment the station tests: the switch from both feet to one foot and from one foot to the other, without stopping the rope, with the foot order unknown in advance; fresh to learn it, tired because that is how it comes in the test.

## Set-up

- Skipping rope, ends reach the armpits when standing on the middle.
- Flat floor, 2 m free around you.
- A coin: heads = right foot first, tails = left foot first.
- Timer: 45 s work, 30 to 45 s rest.

## Execution (skill block, fresh)

1. Flip the coin, say the order out loud ("right first" or "left first").
2. Rope on: 10 both feet, 5 first foot, 5 other foot, 10 both feet, then repeat the cycle with the other order.
3. Switch on the next turn of the rope, no extra hop, no pause.
4. Count out loud.
5. Rope catches: stand still 2 s, breathe, restart the block you were in (not the cycle), as in the test.
6. 45 s, then rest. 4 to 6 rounds.

## In a cardio block (tired)

- One piece = 10 both feet, 5 right, 5 left (20 skips, about 30 s at her 40 skips per minute).
- A catch = restart the block you were in, as in the test. It costs time, never a penalty.
- Nothing to score beyond the cardio block's own rounds and effort.

## Quality criteria (what "clean" means)

- the rope never stops between blocks;
- the count is right (10, 5, 5, 10), no extra skip;
- bounce 2 to 5 cm, wrists turn the rope, shoulders quiet;
- the free foot stays close to the standing foot on the single-foot blocks.

## Stop / regress if

- two catches at the same switch in one round: next round, do 10 both then 5 on one foot only, then 10 both, until clean;
- knees or calves hurt: stop the card for the day;
- the count is lost: slow the rope, keep the order.

## Progress to next card when

- 6 rounds with 0 or 1 catch in total, on two separate sessions, at confidence 4 or more.

## Recorded numbers this card starts from (17 Sep 2026)

- both feet: 40 skips per minute, EMOM real capacity (11 Sep);
- one foot: about 15 clean skips maximum (17 Sep). Official block is 5, so the dose sits at about 33 % of capacity.

## Official reference

Station 10, rule text quoted from `01_Official_police_sources/01_PARCOURS_11_stations_official_(Explications-sport).pdf`, panel "Corde à sauter":
"Sauter à la corde comme indiqué sur la fiche contre le mur. Le choix de la fiche est aléatoire. Si le candidat commet une erreur, il recommence le bloc en cours jusqu'à la réussite de ce dernier."
Pattern used here (10 both, 5 right, 5 left, order may vary) is the athlete's recollection, not the official text. **This drill is an approximation, not the official station.**

## Block format it fits

Skill block (fresh), and cardio block (tired), since 23 September 2026.
