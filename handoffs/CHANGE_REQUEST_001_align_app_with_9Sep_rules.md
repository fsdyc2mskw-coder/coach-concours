# CHANGE_REQUEST_001 — Align the app with the 9 September rules (v2)

Direction: Training brain → App code. Date: 9 September 2026, v2 on 13 September 2026.
Author: the athlete + Claude. Status: **open**. Order: after CR-007, CR-005, CR-008, CR-009. Own session.
Kind: engine · **Tier: TOP**
v2 changes: sanitised wording; coder is Claude Code; tests land on the CR-008 harness;
Tue/Wed template mismatch and `AGENTS.md` rename folded in; deliverable without zip.

## Read first
`handoffs/00_COCKPIT.md` section 9, `handoffs/00_AGENT_ROUTING.md`, then the inputs below.
State the tier of this request in your first reply and say if the model you run on does not match.

## Why

The generator still follows the 8 September logic: Tuesday coordination, Wednesday
explosive, Friday outdoor intervals as the only run, Saturday circuit technique, no weekend
trail run. The athlete decided on 9 September that a week has one weekend
trail-maintenance run and that running intervals are a floating HIIT block inside police
sessions. Weeks 2 to 11 in the live app break R-WS-03, R-WS-07 and R-WS-08. The app must
follow the rule files, not the old package.

## Inputs

| File | Ids | What changed |
|---|---|---|
| `01_Official_police_sources/01_PARCOURS_11_stations_official_(Explications-sport).pdf` | | station names, order, rules: app text must match word for word |
| `02_Training_brain/rules/weekly_shape.md` v2 | R-WS-01 … R-WS-18 | canonical week (R-WS-16/17/18 are implemented by CR-002, not here) |
| `02_Training_brain/rules/selection.md` | R-SEL-01 … R-SEL-14 | cards, not free text; ranking |
| `02_Training_brain/TRAINING_ENGINE.md` | interval rule section | prose reference |
| `03_Weekly_plans/WEEK_1_FINAL_2026-09-07_to_13.md` v3 | | frozen, loaded as data (CR-003 + CR-007), never regenerated |

## Expected behaviour after the change

- Session types available: `crossfit`, `police_technique`, `police_strength_transitions`,
  `police_integration`, `police_mock_test`, `trail_maintenance`, `trail_event`.
  Old types (`police_balance_coordination`, `room_explosive_intervals`,
  `outdoor_explosive_intervals` or similar) are removed from active contracts; existing
  recipes are re-tagged, not deleted.
- Generating any complete week from 14 September on yields exactly 1 CrossFit + 3 police +
  1 weekend trail run + 2 empty days, and passes every hard rule R-WS-01 … R-WS-15.
- An interval block appears only inside a police session and is never counted as a run.
- Week 1 is loaded from `WEEK_1_FINAL` v3 as data and is never regenerated (R-WS-15).
- The 11 stations (names, order, rule text) are loaded from one data file that mirrors the
  official PDF; the 5 → 6 → 5 → 6 alternation is represented.
- Every drill in a generated session references an exercise card id (R-SEL-01). While the
  card library is still small, the generator returns a typed "no eligible card" gap
  instead of inventing text; the gap is rendered as a visible placeholder.
- The Level 1 feedback (done / partial / skipped, effort 1-5, note, run fields) stays as is.
  **The Level 2 fields and the adaptation rules (`rules/adaptation.md`) are a later request.**
- `AGENTS.md` (or equivalent) is renamed from "Trail Coach" to Coach Concours.
- A Week 2 data file, when `WEEK_2_FINAL` exists in `handoffs/`, is loaded the same way as
  Week 1; if it does not exist at the time of this request, say so in the report.

## Tests that must pass (added to the CR-008 harness)

- [ ] one test per hard rule R-WS-01 … R-WS-15 on a generated week
- [ ] interval block inside a police session is not counted by the run counter
- [ ] Week 1 equality with `WEEK_1_FINAL` v3 (unchanged from CR-008)
- [ ] station data equals the official list (11 entries, order, colour mapping of station 8)
- [ ] no session after 20 November 2026
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm build` pass; deployed page shows a rule-compliant Week 3+

## Out of scope

HIIT block rules R-WS-16/17/18 (CR-002). Feedback form Level 2 and adaptation (later).
Visual redesign (CR-009). Drive sync (CR-005). Any sporting decision: if a rule is
ambiguous, write the question in `APP_REPORT_001.md`, do not guess.

## Deliverable back

`handoffs/APP_REPORT_001.md`: types before/after, rule test list, questions raised,
commit hash and tag `cr-001`.
