# CHANGE_REQUEST_002 — One HIIT block in every police session (v2)

Direction: Training brain → App code. Date: 10 September 2026, v2 on 13 September 2026.
Author: the athlete + Claude. Status: **open**. Order: after CR-001. Own session.
Kind: engine · **Tier: TOP**
v2 changes: sanitised wording; coder is Claude Code; HIIT realism note added; deliverable without zip.

## Read first
`handoffs/00_COCKPIT.md` section 9, `handoffs/00_AGENT_ROUTING.md`, then the inputs below.
State the tier of this request in your first reply and say if the model you run on does not match.

## Why

The athlete wants stamina and explosiveness trained in every police session, not only in
the strength session. A skill or learning session keeps its HIIT part short (at most
10 min) and puts it last, just before the cool-down, so the fresh-skill and benchmark
blocks are done fresh. Week 1 Friday (v3) is the first session built this way. Friday also
showed that the first HIIT dose was overestimated (40 rope skips + ladder were feasible,
not 60 + ladder + 10 jump squats): a HIIT block starts from a recorded capacity, never
from a fixed assumption.

## Inputs

| File | Ids | What changed |
|---|---|---|
| `02_Training_brain/rules/weekly_shape.md` v2 | R-WS-16, R-WS-17, R-WS-18 | new rules |
| `02_Training_brain/rules/weekly_shape.md` v2 | R-WS-08, R-WS-09, R-WS-15 | amended wording |
| `03_Weekly_plans/WEEK_1_FINAL_2026-09-07_to_13.md` v3 | Thursday, Friday | data, already loaded |
| `02_Training_brain/rules/adaptation.md` (v2 when written) | HIIT realism | dose starts from the last recorded completion |

## Expected behaviour after the change

- Every generated police session has exactly one block of kind `hiit` (AMRAP, EMOM,
  intervals, for-time, chipper), built from cards whose `quality` includes `conditioning`
  or `explosive`.
- In `police_technique` the `hiit` block is ≤ 10 min and is the last block before the
  cool-down block.
- In `police_strength_transitions` and `police_integration` the block is 10-20 min and
  may be followed by role-C cards (precision or integration under fatigue).
- The day before the weekend run, and the day after a CrossFit class recorded with
  effort 4-5, the block takes the short form (≤ 10 min), whatever the session type.
- A running-interval block is one possible `hiit` block; it still never counts as a run.
- HIIT dose: when a previous result exists for the same card, the next prescription starts
  from that recorded completion (same dose, or one step per `rules/adaptation.md`); when no
  result exists, the card's lower bound is used. No dose above a card's bounds.
- Week 1 is loaded from `WEEK_1_FINAL` v3 (Thursday as trained, Friday with the AMRAP).
- A memory block never carries an "explain" prompt: only visualise, recite order, or
  state action / completion / next station.

## Tests that must pass (added to the harness)

- [ ] every police session in any generated week has count(hiit) == 1
- [ ] police_technique: hiit.duration_min ≤ 10 and hiit is the last block before cool-down
- [ ] day before run → hiit.duration_min ≤ 10
- [ ] interval block is not counted by the run counter (unchanged from CR-001)
- [ ] first HIIT dose of a card with no result == card lower bound
- [ ] Week 1 equality with `WEEK_1_FINAL` v3
- [ ] no memory prompt contains "explain" / "expliquer"

## Out of scope

Card library content (Cowork writes the cards). Adaptation rules beyond the dose start
rule above. Visual redesign. Any sporting decision: if a rule is ambiguous, write the
question in `APP_REPORT_002.md`.

## Deliverable back

`handoffs/APP_REPORT_002.md`, commit hash and tag `cr-002`.
