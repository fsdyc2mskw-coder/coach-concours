# APP_REPORT_010 — CR-010 screens from the approved mockup

Tier stated: **MID** (matches the CR-010 header; this session ran on Claude Sonnet 5, the MID model per `00_AGENT_ROUTING.md` v2 section 4).

## Fix after merge: `blockFields` was keyed only by block index

After PR #4 merged and deployed, checking the live app at 375 px (the CR's own
"deployed page checked after a hard reload" step) surfaced a real bug:
`blockFields(blockIndex)` returned Friday's field names for **any** session's
blocks 0-3, not just Week 1 Friday's. Concretely, opening the Thursday
session ("Box jump, frais") or the coordination session ("Couleurs et
ballon") and going to Retour showed "Erreurs de mémoire", "Balles
échappées", etc. attached to blocks that have nothing to do with those
fields — because the mapping only ever looked at the block's position, never
which recipe it belonged to. Fixed on `cr-010-fix-block-fields-by-recipe` by
gating on `recipe.id === 'week1-fri-2026-09-11-v3'` before applying the
Friday mapping; every other session's blocks now correctly get no group
(only the final "Toute la séance" group). Added a regression test
(`retour.test.ts`, the Thursday session) so this can't silently come back.
No screens.test.ts/original retour.test.ts assertions needed to change: they
only ever exercised the one session (Friday) the bug didn't affect.

## Environment note (read this first)

This coder session had **no Node.js / pnpm in its sandbox** — the same gap
recorded for CR-002 and CR-009 in `00_COCKPIT.md`, and documented in
`NOTE_no_terminal_git_workarounds.md`. `pnpm typecheck`, `pnpm test` and
`pnpm build` could **not** be run locally. Everything below was verified by
careful manual review (type-by-type read-through of every edited file,
cross-checking every `className` used against `coach.css`, and re-reading
`recipes.ts`/`planner.ts` for the exact data shapes touched) rather than by
a real compiler/test run. **CI is this change's first real
typecheck/test/build.** If CI fails, fix from inside a Claude session using
the GitHub web-UI techniques in `NOTE_no_terminal_git_workarounds.md` (no
terminal push credentials are available here either) rather than asking the
athlete to run anything locally.

## What changed

- `handoffs/CHANGE_REQUEST_010_screens_from_approved_mockup.md` and
  `handoffs/MOCKUP_CR010.html` copied into the repo from Drive (per
  CLAUDE.md, the worker copies the CR and mockup into `handoffs/` itself).
- `src/coach.css` — full rewrite to the mockup's dark theme tokens and the
  mockup's own class names (`.card`, `.tile`, `.vbars`, `.snav`, `.seg`,
  `.panel`, `.chips`, `.steps`, `.pill`, `.grp`, `.field`, `.kv`, `.sum`,
  `.circ`, `.ex`, `.actionsBar`/`.act`, `.tabbar`, …), adapted from the
  mockup's compiled CSS with the phone-chrome-only rules (notch, status bar,
  `.phone`/`.stage`/`.scroll` frame) dropped since the real app fills the
  viewport itself.
- `index.html` — dark `theme-color`, Google Fonts `<link>` for Plus Jakarta
  Sans + Manrope (system fallbacks stay in `coach.css` if the request fails).
- `vite.config.ts` — PWA manifest `background_color`/`theme_color` → `#0A0B0E`.
- `src/coach/types.ts` — `ResultStatus = CompletionStatus | 'draft'`;
  `SessionResult.status` widened to `ResultStatus`; `SessionResult.effort`
  made optional; new optional field `obstacleHesitations` (named by the
  mockup's Retour group for the Friday station-2 block). No field renamed,
  no field removed.
- `src/coach/planner.ts` — two `result.effort >= 4` / `< 4` comparisons
  guarded with `?? 0` now that `effort` is optional (typecheck-only change,
  same behaviour: an unset effort never counts as "high effort" for the
  CrossFit-Monday adaptation rule).
- `src/CoachConcoursApp.tsx` — the expand-in-place session card replaced by
  the week → session (Prévu/Fait/Retour tabs) → block drill-down described
  in CR-010 sections B–F. `FeedbackForm`/`BlockCard`/`ContentBlock`/old
  `StatusDot` removed; `JourneyView`/`DriveView` kept as-is (theme only, per
  section G).
- `src/__tests__/screens.test.ts`, `src/__tests__/retour.test.ts` — new.

## Mockup element → component

| Mockup frame/element | Component |
|---|---|
| `1 · Semaine` phone frame | `WeekScreen` |
| `.hero`/`.wtabs`/`.prog`/`.track` | `WeekScreen`'s header, week switcher, progress |
| `.day` / `.card` / `.rest` | `WeekScreen`'s day loop |
| `.tabbar` | the bottom `<nav className="tabbar">` in `CoachConcoursApp` (shown only when `drill.screen === 'list'`) |
| `2 · Séance` phone frame, tab **Prévu** | `SessionScreen` + `PrevuTab` |
| `.panel`/`.chips`/`.steps` | `PrevuTab` |
| tab **Fait** | `FaitTab` |
| tab **Retour**, `.grp`/`.field`/`.eff`/`.qrow` | `RetourTab` |
| `3 · Un bloc` phone frame | `BlockScreen` |
| `.sum`/`.circ`/`.ex` | `BlockScreen` |

## Substitutions (documented, not invented)

1. **Week-card subtitle hint.** The mockup's curated hints ("postes 8 à 11",
   "selon le cours") are copy, not a data field. `sessionHint()` derives an
   equivalent from what the recipe already has: a station range/list when
   the blocks declare `stationMappings`, a fixed phrase for crossfit/trail
   kinds, else a block count.
2. **Week headline (`<h2>`).** The mockup's "Technique d'abord" is curated
   per-week copy with no backing field. Used the title of the week's first
   `police_*` session instead (falls back to the phase label when a week has
   none) — grounded in real data rather than invented text.
3. **Block screen's exercise list.** The mockup shows several named
   sub-exercises per block (rope, ladder, jump squats, each with its own
   dose). The data model stores one `faire` paragraph per block, not a list
   of sub-exercises — recipes content is explicitly out of scope (section
   G). `BlockScreen` renders one row for the block as a whole (pictogram +
   title + the block's `faire` text) instead of decomposing it. A future CR
   could add a structured per-exercise list to `ExerciseBlock` if wanted.
4. **`draft` status.** Section D explicitly asks for a `draft` status
   distinct from Terminée/Partielle/Passée, which does touch the data model
   (section G's "not touched" list predates this specific ask). Added the
   minimal change: `ResultStatus` adds `'draft'`, `effort` becomes optional.
   No existing field renamed or removed; an old export still round-trips
   (its `status` is always a `CompletionStatus`, itself still a subset of
   `ResultStatus`, and its `effort` was always set).
5. **Retour field-to-block grouping.** Only Week 1 Friday/Saturday/Tuesday's
   record fields are named against a specific block anywhere in the CR or
   the mockup (the mockup's own Retour tab is the Friday session). Every
   other session's kind-based fields (`movementQuality`, `boxHesitation`,
   `overlapTags`) are not named against a block anywhere, so they stay in
   the final "Toute la séance" group rather than being guessed onto a block.
6. **`emomMinutesCompleted`.** This field exists in `SessionResult` since
   CR-002 but has never had a Retour input (`FeedbackForm` before this CR
   didn't reference it either). CR-010 doesn't name it in its Inputs or
   mockup (the mockup's example session, Friday, doesn't have an EMOM
   block), so no input was added for it here — pre-existing gap, listed but
   not fixed, per "do not fix unrelated bugs; list them."
7. **Shared `.actionsBar`.** The mockup's static demo swaps the label/icon
   of one shared bottom bar per active tab via a script. Implemented instead
   as each tab (Prévu/Fait/Retour) rendering its own `.actionsBar` with the
   tab-appropriate two buttons — visually identical, avoids lifting form
   submit state out of `RetourTab`.
8. **True "survives closing the app" draft persistence.** Implemented:
   every field write debounces (500 ms) into `results[id]` via the same
   `mutate`/`saveCoachState`/Drive-sync path as a validated save, so it does
   survive a reload, a tab switch, or the app being closed and reopened —
   this matches section D's actual wording. Flagging only that this is a
   more literal reading of "draft" than "never touches persistent storage
   until validated"; if the athlete meant the latter, say so and it's a
   small follow-up (buffer drafts in memory only, e.g. `sessionStorage`).

## Files touched

`index.html`, `vite.config.ts`, `src/coach.css`, `src/coach/types.ts`,
`src/coach/planner.ts`, `src/CoachConcoursApp.tsx`,
`src/__tests__/screens.test.ts`, `src/__tests__/retour.test.ts`,
`handoffs/CHANGE_REQUEST_010_screens_from_approved_mockup.md`,
`handoffs/MOCKUP_CR010.html`.

## Verification

- [x] Manual read-through of every edited file for type consistency
      (optional/required fields, exhaustive `Record` lookups used instead of
      switch statements specifically so exhaustiveness doesn't depend on a
      compiler I couldn't run).
- [x] Every `className` used in `CoachConcoursApp.tsx` cross-checked against
      a rule in `coach.css`.
- [x] `recipes.ts`/`planner.ts`/`week1.test.ts` re-read to ground the Week 1
      Friday block order (mémoire, poste 2, raquette référence, AMRAP, poste
      8) used by the Retour block-grouping and by the new tests.
- [ ] `pnpm typecheck` — **not run** (no Node in this sandbox); CI will run it.
- [ ] `pnpm test` — **not run** (no Node in this sandbox); CI will run it.
- [ ] `pnpm build` — **not run** (no Node in this sandbox); CI will run it.
- [ ] 375 px screenshots — **not captured** (no way to run/screenshot the
      dev server from this sandbox). Once CI is green, the deployed Pages
      build (or a Cowork/browser session with dev-server access) should
      capture the four screens at 375 px for this report before the athlete
      merges, per the CR's "Tests that must pass" checklist.

## Questions for the athlete / Claude (Cowork)

- Is the literal "value survives even if the app is force-closed before any
  status is chosen" reading of the draft requirement (substitution 8 above)
  the intended one, or would a lighter in-memory-only draft (lost on force
  quit, kept across tab switches) have been preferred?
- Is the week headline substitution (2 above — first police session's title)
  an acceptable stand-in for curated per-week copy, or should a `headline`
  field be added to `TrainingWeek` in a follow-up CR?
- `emomMinutesCompleted` (substitution 6) still has no Retour input after
  two change requests that touch the Retour form (CR-002 introduced the
  field, CR-010 rebuilds the form) — worth its own small CR if the athlete
  wants it recorded.

Commit hash: `<recorded after commit, see git log for
cr-010-screens-from-mockup>`.
