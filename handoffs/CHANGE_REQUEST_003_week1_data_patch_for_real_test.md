# CHANGE_REQUEST_003 — Week 1 data patch so the athlete can test the app for real this week

Direction: Training brain → App code. Date: 10 September 2026. Author: the athlete + Claude.
Status: **open**. Priority: **first, before CR-004, CR-001 and CR-002.** Data only, no engine
change. Kind: data · **Tier: MID**. Premise: nothing has been executed before this request;
the repo is the 9 September package unchanged.

## Read first
`handoffs/00_COCKPIT.md` section 9, `handoffs/00_AGENT_ROUTING.md`, then the one input below.
State the tier of this request in your first reply and say if the model you run on does not match.

## Why

the athlete wants to use the app for real for the rest of Week 1 (Friday session, Saturday run,
Sunday rest) and record what she does in it. The app currently holds the 9 September
Week 1. Thursday was trained differently, Friday was redesigned, Saturday is now fixed.
This request replaces the Week 1 data only; the generator, rules and session types are
untouched (they are CR-001 and CR-002).

## Inputs

| File | Ids | What changed |
|---|---|---|
| `handoffs/WEEK_1_FINAL_2026-09-07_to_13.md` **v3** | Thu 10, Fri 11, Sat 12, Sun 13 | replace these four days as data; Mon-Wed unchanged |

## Expected behaviour after the change

- Thursday 10 shows the five blocks as trained, status **done**, with the recorded
  measures (rope round ≈ 50 s × 4; box 20 inch; legs very heavy; fatigued racket drops:
  not recorded). Free text is acceptable for this patch; card ids come later.
- Friday 11 shows the seven blocks in this exact order: warm-up · circuit memory ·
  station-2 ball crossing · fresh racket reference · AMRAP 10 min · station-8 colours ·
  finish. Block titles and durations as in the file. The AMRAP lists 60 rope skips,
  ladder up-and-down ×2, 10 jump squats.
- Friday has these **record fields**, each optional: memory errors (integer), ball
  fumbles (integer), racket drops R1 / R2 / R3 (three integers), AMRAP rounds (decimal,
  e.g. 4.5), landing quality (clean / mixed / sloppy), effort 1-5, note.
- Saturday 12 is type `trail_maintenance` (or the closest existing run type if that type
  does not exist yet; name the substitution in the APP_REPORT), 8 km, 150 m D+, easy,
  with record fields: distance km, D+ m, time, effort 1-5, note.
- Sunday 13 is a rest day with no session.
- Nothing after 13 September is generated or changed by this patch.
- Existing done / partial / skipped + effort + note feedback keeps working on every day.
- `dist/` is rebuilt and published through the existing `.openai/hosting.json` so the
  URL shows the new data (if publishing needs a click from the athlete, say exactly which).

## Tests that must pass

- [ ] Week 1 (7-13 Sep) equals `WEEK_1_FINAL` v3 day by day (types, block order, durations)
- [ ] Friday record fields save and reload after closing the app (IndexedDB)
- [ ] Saturday is counted as the week's single run; Tuesday intervals are not counted as a run
- [ ] Mon-Wed data unchanged (diff against the current build)
- [ ] no session after 13 Sep is touched
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm build` pass

## Out of scope

Generator, rules R-WS-16/17/18 (CR-002), session-type refactor (CR-001), Google Drive
sync, visual redesign, exercise cards. If a sporting question comes up (block name
unclear, a field ambiguous), write it in `APP_REPORT_003.md` and choose the simplest
reading; do not decide sport.

## Deliverable back

A pull request + `handoffs/APP_REPORT_003.md` (what was changed, what was substituted,
how the athlete opens the app, how the publish was done or what click she must do). the athlete copies
the report to Drive `04_App_handoffs/` and a snapshot zip + SHA256 to `05_App_code/snapshots/`.
