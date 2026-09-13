# CHANGE_REQUEST_007 — Week 1 Tuesday and Wednesday as trained

Direction: Training brain → App code. Date: 13 September 2026. Author: the athlete + Claude.
Status: **open**. Order: **first** (then CR-005, CR-008, CR-009, CR-001, CR-002). Own session.
Kind: data · **Tier: MID**

## Read first
`handoffs/00_COCKPIT.md` section 9, `handoffs/00_AGENT_ROUTING.md`, then the one input below.
State the tier of this request in your first reply and say if the model you run on does not match.

## Why

CR-003 replaced Thursday to Sunday of Week 1 with `WEEK_1_FINAL` v3 but left Monday to
Wednesday on the generic template. The live app therefore shows Tuesday 8 as
"Coordination & équilibre" and Wednesday 9 as "Explosivité en salle". Neither happened.
The athlete ran intervals on Tuesday and rested on Wednesday, exactly as `WEEK_1_FINAL` v3
already records. Rule R-WS-15 says Week 1 equals the FINAL file; this patch closes the gap.
The two template sessions are not lost: "Coordination & équilibre" is reused in Week 2
(Cowork decides, not this request).

## Inputs

| File | Ids | What changed |
|---|---|---|
| `handoffs/WEEK_1_FINAL_2026-09-07_to_13.md` v3 | Tue 8, Wed 9 | replace these two days as data; Mon, Thu-Sun unchanged |

## Expected behaviour after the change

- Tuesday 8 September: one session, title "Intervalles course (exception documentée)",
  kind `running_intervals_exception` (or the closest existing kind; name the substitution
  in the report), duration 47 min + unrecorded recovery. Three blocks in this order:
  1. Échauffement course facile, 20 min
  2. 2 × 6 min à 6:00 min/km, récupération entre les deux non enregistrée
  3. Course facile, 15 min
  Record fields: distance per interval (m, two values, optional), effort 1-5, note.
  Status shown: `proposed` like the other days (the athlete validates it herself in the app).
- Wednesday 9 September: rest day, same rendering as Sunday 13 ("Repos · Récupération et sommeil"),
  no session, no form.
- Week 1 header still reads 6 séances · 1 repos or becomes 5 séances · 2 repos, whichever
  the count logic gives; do not hard-code it.
- Tuesday is **not** counted as the week's run (R-WS-08); Saturday stays the single run.
- Recipe ids `coordination-balance-v2` and `room-explosive-v2` remain in the recipe library
  untouched; only Week 1's references to them are removed.
- Any result already saved for `2026-09-08:police_balance_coordination` or
  `2026-09-09:room_explosive_intervals` is kept in `results` (not deleted) but no longer displayed.
- Nothing after 13 September changes.

## Tests that must pass

- [ ] Week 1 equals `WEEK_1_FINAL` v3 day by day: Mon crossfit · Tue 3 blocks · Wed rest · Thu 5 blocks · Fri 7 blocks · Sat run · Sun rest
- [ ] run counter for Week 1 == 1 (Saturday)
- [ ] no session dated after 2026-11-20 (unchanged)
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm build` pass; deployed page shows Tuesday intervals

## Out of scope

Weeks 2 to 11 (still template until CR-001 and the Week 2 data patch). Generator, rules,
tests harness (CR-008), theme (CR-009). No sporting decision: if a block name or field is
ambiguous, write the question in `APP_REPORT_007.md` and take the simplest reading.

## Deliverable back

`handoffs/APP_REPORT_007.md`: what changed, any kind substitution, commit hash and tag `cr-007`.
The athlete copies the report to Drive `04_App_handoffs/`.
