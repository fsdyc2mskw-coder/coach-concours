# APP_REPORT_007 — Week 1 Tuesday and Wednesday as trained

Direction: App code → Training brain. Date: 13 September 2026. Tier: MID (Claude Sonnet 5, matches).

## What changed

Implemented `CHANGE_REQUEST_007` exactly, following the pattern already used for CR-003's
Thursday/Friday/Saturday overrides:

- **Tuesday 8 September**: new session, kind `running_intervals_exception`, recipe
  `week1-tue-2026-09-08-as-trained`, title "Intervalles course (exception documentée)",
  status `proposed`, load `moderate` (not specified by the CR; chosen as the simplest reading —
  not a sporting decision, only affects the internal "two hard days adjacent" check). Three
  blocks, in order: échauffement course facile 20 min · 2 × 6 min à 6:00 min/km (récupération
  non enregistrée) · course facile 15 min. Total 47 min, matching `WEEK_1_FINAL` v3. The
  session is excluded from the week's run count (`running_intervals_exception` is not in the
  `runs` filter used by `validateWeek`); Saturday's `trail_event` stays the only run.
- **Wednesday 9 September**: no override entry added, so the day falls through the existing
  "no planned session → rest day" rendering path (same as Sunday). No new rest-day code was
  needed.
- Added the two optional record fields the CR asked for: `intervalDistance1M` and
  `intervalDistance2M` (metres, both optional), shown only on this session's feedback form,
  alongside the existing generic effort/status/note fields.
- Week header count ("N séances · N repos") is computed from `days.length - week.sessions.length`
  as before; not hard-coded. Week 1 now has 5 sessions (Mon, Tue, Thu, Fri, Sat) and 2 rest days
  (Wed, Sun).
- `coordination-balance-v2` and `room-explosive-v2` recipes were not touched, only Week 1's
  references to them removed (they were already absent from Thu/Fri/Sat via CR-003; now also
  absent from Tue/Wed).
- Any previously saved result under `2026-09-08:police_balance_coordination` or
  `2026-09-09:room_explosive_intervals` is untouched in `results` — no code path deletes by id,
  it simply has no matching session to display against any more.

## Kind substitution

No existing `SessionKind` fit a documented-exception running session, so `running_intervals_exception`
was added as a new kind (technical/data choice, not a sporting one — mirrors how CR-001 will
later need real kinds for `police_strength_transitions` / `trail_maintenance`).

## No sporting decision needed

The CR's own "three blocks" spec matched `WEEK_1_FINAL` v3 word for word (échauffement 20 min /
2×6 min @ 6:00/km / course facile 15 min), so nothing was ambiguous and no simplification had
to be taken.

## Files touched

- `src/coach/types.ts` — new `SessionKind`, two new optional `SessionResult` fields
- `src/coach/recipes.ts` — new `week1Tue8Sep` recipe
- `src/coach/planner.ts` — extended `WEEK1_OVERRIDE_DATES`, added the Tuesday override
- `src/CoachConcoursApp.tsx` — two new optional inputs on the feedback form for this session
- `handoffs/CHANGE_REQUEST_007_week1_tue_wed_as_trained.md` — copied in from Drive

## Verification

No Node/pnpm toolchain was available in the local execution environment, so `pnpm typecheck`,
`pnpm test` and `pnpm build` were not run locally. CI ran them on push and passed:

- GitHub Actions run `34776962028` ("Deploy to GitHub Pages") on commit `0c0c7a0`: **success**.
- GitHub Pages deployment for `0c0c7a0`: live at `https://fsdyc2mskw-coder.github.io/coach-concours/`.

CI steps were left unchanged, as instructed.

## Commit and tag

- Commit: `0c0c7a04756d`
- Tag: `cr-007`
