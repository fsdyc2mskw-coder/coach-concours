# APP_REPORT_011 — CR-011 Tuesday run intervals and two police sessions

Tier stated: **TOP** (matches the CR-011 header). `00_AGENT_ROUTING.md` v1 section 4 names Claude
Fable 5.1 or Opus 5 (effort high) as the TOP model for Claude Code; this session ran on **Claude
Sonnet 5**, the MID model — a mismatch, flagged here as the CR asks, not silently absorbed.

## Environment note (read this first)

This coder session had **no Node.js / pnpm and no git push credentials** in its sandbox — the
same gap recorded for CR-002, CR-009 and CR-010 in `00_COCKPIT.md`, and documented in
`NOTE_no_terminal_git_workarounds.md`. `pnpm typecheck`, `pnpm test` and `pnpm build` could
**not** be run locally. Everything below was verified by careful manual read-through (type-by-type
read of every edited file, tracing every new field through `types.ts` → `recipes.ts` →
`planner.ts` → `CoachConcoursApp.tsx`, and re-deriving the Week 2/5/11 arithmetic by hand against
`run_intervals_progression.md`) rather than a real compiler/test run. **CI is this change's first
real typecheck/test/build.** The branch (`cr-011-tuesday-run-intervals`, based on `origin/main`,
which already has CR-002 and CR-010) is committed locally but not yet pushed or opened as a pull
request, for the same no-credentials reason — see the note at the end of this report.

## What changed

- `src/coach/types.ts` — `SessionKind` gains `'run_intervals'`. `SessionResult` gains optional
  `repPacesSec?: number[]` and `repsDone?: number` (section D). No field renamed or removed.
- `src/data/runIntervalsProgression.ts` — new. The progression table (weeks 2-11, verbatim from
  `run_intervals_progression.md` v1), the R-WS-23 zone constants, the R-WS-23 baselines, and
  `nextRow()` (R-WS-22's repeat rule) as a pure, independently testable function.
- `src/coach/recipes.ts` — `buildRunIntervalsRecipe(row)`: builds one week's `run_intervals`
  recipe on the fly (unlike every other recipe, its content changes every week) and registers it
  into `recipeById`/`runIntervalsRepsById` so the rest of the app reads it exactly like a static
  recipe.
- `src/coach/planner.ts` — `computeRunIntervalsRows()` picks each week's table row before
  generation, applying R-WS-22 sequentially (repeat / advance / advance-faster) from any saved
  Tuesday result; Week 11 is never moved. `sessionsForWeek` rebuilt to the v3 weekly template:
  Mon crossfit, **Tue run_intervals**, Wed rest, **Thu police_technique**, **Fri
  police_integration/police_strength_transitions alternating by week parity** (integration on even
  weeks), Sat/Sun trail, the other rest day. `validateWeek` updated for R-WS-03/04/07/08 and the
  R-WS-11 Monday→Tuesday exception (see "Open questions" below).
- `src/CoachConcoursApp.tsx` — Retour tab: a new "Intervalles" group for `run_intervals` sessions
  (one `PaceField` per rep, "Rép 1 … Rép n"; `PaceField` is a plain text input, unlike the existing
  `NumberField`, because a pace is typed as `m:ss` or a decimal number of minutes, not a bare
  number) plus "Répétitions faites"; a `parsePaceToSec`/`paceSecToText` pair converts to/from
  `repPacesSec`.
- `src/__tests__/runIntervals.test.ts` — new: Week 2/5/11 main sets and Week 2's duration, the
  fixed-frame check for every week 2-11, `nextRow`'s three named vectors from the CR, and the
  Retour tab's pace-box count/persistence.
- `src/__tests__/weeklyShape.test.ts` — updated in place for the v3 template (R-WS-03/07/08/11/12
  assertions rewritten; a second fixture week, `oddWeek` = 2026-09-21, added for the
  `police_strength_transitions` cases now that Friday alternates rather than always carrying
  `outdoor`). R-WS-01/02/10/13/14/15/06/taper and the R-WS-16/17/18 describe block are otherwise
  unchanged.

## Substitutions and open questions (not invented, flagged here)

1. **R-WS-11 (Monday→Tuesday adjacent hard days).** `weekly_shape.md` v3 lists R-WS-09/12 among
   the amended rules but **not** R-WS-11 — its text still names only "Thursday and Friday" as the
   accepted adjacent-hard-day exception. CR-011's own "Why" section is explicit that Tuesday's
   run_intervals is deliberately placed right after Monday's CrossFit ("the change of stimulus is
   wanted"), which makes Monday+Tuesday adjacent-hard by construction — every generated week would
   otherwise fail `validateWeek` permanently. `validateWeek` now treats Monday(crossfit) →
   Tuesday(run_intervals) as an accepted exception alongside Thursday/Friday, with a comment
   pointing at this report. **Question**: should `weekly_shape.md` v3's R-WS-11 text be corrected
   to list this exception explicitly, or is the current text intentional and the engine should
   flag Monday/Tuesday instead?
2. **R-WS-12 (four memory exposures, two per police session).** The v3 text amends this to "two in
   each police session" now that only two police sessions remain per week. `SessionRecipe.memory`
   is still a single optional prompt (one per recipe) — recipe content is explicitly out of
   CR-011's scope ("Not touched: … the police recipes' content"). `countMemoryExposures` is
   unchanged (counts memory-bearing sessions); a generated week now reports **3** exposures
   (crossfit + the two police sessions), not 4. `weeklyShape.test.ts` asserts the real, current
   number (3) rather than the CR's literal target, and this gap is recorded here rather than
   silently building a second memory prompt per police recipe (that content — which module, what
   prompt/answer text — is a sporting/content decision, per CLAUDE.md's "sporting decisions are
   never guessed by the coder"). **Question**: is a second memory prompt per police session wanted
   now, and if so, what should M1-M5's actual prompts be (the CR references "M1+M4, M2" etc. from
   a module system not otherwise described in the files this CR names under "Inputs")?
3. **Week 9's second-group jog.** `run_intervals_progression.md` gives "2 × 6 min @ 5:45, jog 4
   min, then 4 × 1 min @ 5:20" — the 4-minute jog is used here as the (reps−1) recovery *within*
   the first group; the second group's own between-rep recovery is not given anywhere in the
   source table. Implemented as 60 s (equal to the rep length, matching the CR's own research
   summary — "jog recovery equal to the work time"), and the block is flagged
   `approximation: true` (the existing field for exactly this situation) rather than silently
   presented as exact. **Question**: confirm 60 s, or give the real number.
4. **`police_mock_test` gate.** R-WS-07 v3 allows Friday to be `police_mock_test` "once the
   exact-room gate passes" — no gate mechanism exists anywhere in the generator (not before this
   CR, not added by it: out of scope, "the count per week" only). Friday still only alternates
   `police_integration`/`police_strength_transitions` by week parity. Unchanged from the status
   quo, just restated here since the CR's rule text names the third option.
5. **R-WS-23 zone reset on the Week 8 re-test.** The zones are exported as constants
   (`runIntervalsZones`); resetting them from a recorded 1 km time after Week 8 is a sporting
   decision made from a result, not automated — left for a future CR/rule update, consistent with
   how `adaptFromPreviousWeek`/`adaptCurrentWeek` already surface adaptation as a note rather than
   silently rewriting content.

## Files touched

`src/coach/types.ts`, `src/coach/recipes.ts`, `src/coach/planner.ts`,
`src/CoachConcoursApp.tsx`, `src/data/runIntervalsProgression.ts` (new),
`src/__tests__/runIntervals.test.ts` (new), `src/__tests__/weeklyShape.test.ts`,
`handoffs/APP_REPORT_011.md` (this file).

## The generated Weeks 2 and 5 (as text, per the CR's "Deliverable back")

**Week 2 (Tue 15 Sep) — `run_intervals`, 46 min:**
- Échauffement (15 min) : 15 min facile, puis 3 × 20 s d'accélérations progressives.
- Bloc principal : 4 × 3 min à 6:00 /km, récupération 3 min en trottinant. *(base, apprendre
  l'allure I ; allure lue au tour auto 1 km.)*
- Retour au calme (10 min) : 10 min facile.

**Week 5 (Tue 6 Oct) — `run_intervals`, 35 min:**
- Échauffement (15 min) : 15 min facile, puis 3 × 20 s d'accélérations progressives.
- Bloc principal : 3 × 2 min à 5:50 /km, récupération 2 min en trottinant. *(léger : trail le
  samedi 11 oct. ; allure lue au tour auto 1 km.)*
- Retour au calme (10 min) : 10 min facile.

## Verification

- [x] Manual read-through of every edited file for type consistency.
- [x] Week 2/5/11 main sets and Week 2's 46 min duration hand-computed against
      `run_intervals_progression.md` and cross-checked against the new `runIntervals.test.ts`
      assertions.
- [x] `nextRow`'s three test vectors from the CR hand-computed against the R-WS-22 text.
- [x] Re-read `weeklyShape.test.ts` in full and rewrote every assertion the v3 template actually
      changes (R-WS-03/07/08/11/12 and the "day before the run" fixture), left the rest untouched.
- [ ] `pnpm typecheck` — **not run** (no Node in this sandbox); CI will run it.
- [ ] `pnpm test` — **not run** (no Node in this sandbox); CI will run it.
- [ ] `pnpm build` — **not run** (no Node in this sandbox); CI will run it.
- [ ] Retour "Intervalles" group checked on the deployed page at 375 px after a hard reload — not
      captured (no dev-server/screenshot access from this sandbox).

## Push / pull request

No git push credentials in this sandbox (`git push` fails with "could not read Username for
'https://github.com': Device not configured", same as `NOTE_no_terminal_git_workarounds.md`
describes). The branch `cr-011-tuesday-run-intervals` is committed locally, based on
`origin/main`. It still needs to be pushed and opened as a pull request titled
`CR-011 Tuesday run intervals and two police sessions` from a session that has either real git
credentials or browser access to `github.dev`/the GitHub web UI.

Commit hash: `34355c0` (`cr-011-tuesday-run-intervals`, based on `origin/main`).
