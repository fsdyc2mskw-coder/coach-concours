# APP_REPORT_017 — the baseline in the app

Change request: `handoffs/CHANGE_REQUEST_017_baseline.md` v2 (23 September 2026, afternoon).
Tier declared in the CR header: **TOP**. Run on Claude Opus 5, effort high — the TOP row of
`00_AGENT_ROUTING.md` section 4. No mismatch to flag.
Branch `cr-017-baseline`, cut from `main` at `e6eab41` (CR-014 v3, PR #8), which is the commit
the change request itself names. Not merged, not tagged. See "How this branch reached `main`"
at the end: the same accident as CR-014 v3 happened again, and was undone the same way.

## What changed

**The baseline is bound to a session id.** Two ids, written once in `src/coach/baseline.ts`:

```
 2026-09-24:skill_session      broad jump + 20 m sprint   (trained Wed 23 Sep)
 2026-09-26:trail_maintenance  the 6-min run              (trained Sun 27 Sep)
```

These are the ids as the generator writes them (`${date}:${kind}`), not the days the athlete
trains them. That is the point: she moves both sessions with CR-014, and a `DayMove` rewrites
a session's `date` and `dayLabel` but never its `id` — which is also what `state.results` is
keyed by. Binding to the id is what makes the block *and the numbers already recorded against
it* follow the session when it moves, and move again if she moves it twice.

**The block is never written into `recipeById`.** This is the one real trap in this request
and it is worth recording. Week 3's trail run uses `trail-maintenance-v1` — the *same recipe
object* every other week's weekend run uses. A block pushed into that recipe would have
appeared on every weekend run of the whole plan and broken R-TB-01 silently. So
`recipeForSession(planned)` lays the baseline block on top at read time, on a copy, and every
screen resolves its recipe through it. The shared recipe is never mutated; a test pins that.

**Position.** "Right after the warm-up" is index 0 of `recipe.blocks`: in this codebase
`warmup` is not an `ExerciseBlock`, it is its own string on `SessionRecipe`, rendered before
`blocks`. The skill session therefore reads warm-up → Référence → mémoire → cerceaux → cardio
→ retour au calme, which is how `WEEK_3_BASELINE_WEEK_2026-09-23.md` draws Wednesday.

**Stored** (`SessionResult`, all optional, `schemaVersion` stays 2):

```ts
broadJumpCm?: number[];   // up to 3 attempts, cm
sprint20mS?: number[];    // up to 3 attempts, s, two decimals
sixMinRunM?: number;      // metres
```

**Computed, never typed** (R-TB-02, R-TB-03): best jump = max, best sprint = min,
VMA km/h = `sixMinRunM / 100`. None of the three has a stored field, and none has an input on
the screen either: they are rendered as read-only text, live, as she types the attempts. Both
the Retour tab and the Référence card compute them through the same three functions, so there
is one definition of "best" in the app.

**The Référence card** sits on the Parcours tab, under the week timeline. Recorded values
only: a test with no number has no row, and the card is absent entirely until the first value
is recorded. No target, no arrow, no comparison, no predicted time (R-TB-04). It reads, with
the change request's own formats:

```
 RÉFÉRENCE, SEMAINE DU 21 SEPTEMBRE
 Saut en longueur    212 cm
 Sprint 20 m         4.12 s
 6 minutes           1 040 m · VMA 10.4 km/h
```

The conditions sentence — "Mêmes chaussures, même surface, heure semblable, même méthode de
chronométrage." — is shown before the block on the plan and again above the fields in Retour.

## Substitutions (where a decision had to be made, and why)

1. **The 15-minute frame of the 6-min run lives inside the baseline block.**
   `test_battery.md` v2 frames the test as "15 min easy + 3 × 20 s strides · TEST · 5 min easy
   jog · easy running after", but `trail-maintenance-v1` has `warmup: null` and is shared by
   every week. Adding a warm-up to it would have given every weekend run of the plan a warm-up
   it was never written with. The frame is carried in the block's own `faire` instead.

2. **The baseline blocks carry no duration in their titles.** Every other block in this app is
   titled "… — N min", which is where the app reads its minutes from. Neither input file gives
   the baseline block a length. A number invented here would be displayed to the athlete as if
   it had been decided, so the titles are "Référence — saut en longueur et sprint 20 m" and
   "Référence — 6 minutes", and the plan shows no minutes against them. See the question below.

3. **Three attempt boxes are always on screen; only the ones holding a number are stored.**
   `test_battery.md` fixes 3 attempts for each test. A baseline stopped after two attempts
   therefore stores two values and the best is computed from those two — the same rule
   `repPacesSec` already follows for a run stopped early.

4. **The week card and the week's shape are untouched.** The request says it does not touch
   days, so nothing was changed in the generator, in `dayMoves.ts`, or in the week screen's
   layout. The baseline block does add one to the block count shown on the session's "Prévu"
   chip, which is correct — it is a block.

## Questions for Cowork (not decided here)

1. **How long is the baseline block?** Nothing in the two input files gives it a duration, so
   nothing is shown (substitution 2). The reshaped week puts Wednesday at about 55 min against
   a 45-min locked skill session, which suggests roughly 10 min for jump + sprint, but that is
   an inference from a total and not a decided number, so it was not written into the app.

2. **The trail run's own text still says 7-8 km.** `trail-maintenance-v1`'s single block reads
   "7-8 km au départ, jusqu'à 12 km / 450 m D+ maximum", while the baseline block above it says
   "environ 8-9 km au total" for 27 September. Both are on the same screen on that one day.
   The block was left exactly as it is because the CR requires the week 3 fixtures to be
   otherwise unchanged block for block, and because that block is shared by every other week.
   If the 8-9 km should replace it for this session only, that is a one-line follow-up.

3. **R-TB-05, the Tuesday pace zones (R-WS-23), is out of scope by the CR's own words** and
   nothing in the app reads the baseline to change them. The reset stays a Cowork decision;
   the app will not do it by itself.

## Unrelated things noticed, not fixed

- `npm run validate:repository` reports 10 broken relative links in `README.md` and `docs/`
  (`./LICENSE`, `./NOTICE.md`, `./VALIDATION_REPORT.md`, `./claude/COACH_PROMPT.md`,
  `./CODEX_START_HERE.md`, `./.github/workflows/deploy-pages.yml`). Pre-existing: the output
  is byte-for-byte identical on a clean `origin/main` worktree, and the script exits 0. Not
  touched.
- `tsconfig.app.tsbuildinfo` and `tsconfig.node.tsbuildinfo` are build artefacts left untracked
  in the working tree and not covered by `.gitignore`. Not committed, not fixed.

## Files touched

```
 handoffs/CHANGE_REQUEST_017_baseline.md   new   the request, copied from Drive 04_App_handoffs/
 src/coach/baseline.ts                     new   the two ids, the two blocks, the computed values
 src/coach/types.ts                        mod   BlockKind 'baseline', BaselineBlockSpec, 3 result fields
 src/CoachConcoursApp.tsx                  mod   recipeForSession, the Retour group, the Référence card
 src/__tests__/cr017.test.ts               new   18 tests
```

## Verification

Run locally on this machine, Node v24.19.0, with the repository's own scripts.

```
 pnpm typecheck   tsc -b --pretty false      PASSED, exit 0, no diagnostics
 pnpm test        vitest run                 PASSED, 13 files, 163 tests
                                             (145 before this branch, all still green, + 18 new)
 pnpm build       tsc -b && vite build       PASSED, built in 741 ms, PWA 10 entries precached
 validate:schemas                            PASSED, 3 schemas OK
 validate:repository                         unchanged from origin/main (see above), exit 0
```

The change request's own test list, line by line:

- [x] only the week 3 skill session and the week 3 trail run carry a baseline block — asserted
      across **every session of the whole plan**, not just week 3
- [x] after a CR-014 move of either session, the baseline block and its values follow it —
      including a second move of the same session
- [x] the week 3 fixtures are otherwise unchanged block for block — the chain session compared
      whole, the other two compared block for block after the prepended baseline
- [x] the fields accept values on a past session — driven through the real screen, with the
      clock set to 27 September, both sessions already in the past
- [x] best jump, best sprint and VMA are computed; no stored field for any of them — the record
      is asserted to have no such key, under six possible names
- [x] the Référence card shows only recorded values, no target word — asserted against
      *cible, objectif, prévu, prédit* and the arrow glyphs
- [x] a moved session (CR-014) keeps its baseline results bound to it
- [x] `pnpm typecheck`, `pnpm test`, `pnpm build` pass

Standing rules:

- [x] no person's name, e-mail, hostname, device name or personal folder path in the diff
      (the diff was grepped for all of them before committing)
- [x] no secret added
- [x] no session dated after 20 November 2026 introduced
- [x] no invented heart-rate target or load — and no invented duration either (substitution 2)
- [x] Week 1 not regenerated; `generatePlan` not touched
- [x] CI steps left exactly as they are
- [x] one change request only; nothing out of scope touched
- [x] not merged, not tagged — the athlete merges, then publishes `cr-017` on the merge commit

A visual check in a real browser was attempted and could not be completed: the preview pane in
this session never cleared its policy check. Instead the two screens were rendered for real in
the test environment and their DOM read back — the plan order (warm-up → Référence → mémoire →
cerceaux → cardio → calme), the Retour group with its six attempt boxes and its computed lines,
and the card reading "6 minutes 1 040 m · VMA 10.4 km/h". Worth one look on the phone after the
merge deploys.

## How this branch reached `main` (recorded, not intended)

It happened again, exactly as for CR-014 v3, and it is written down for the same reason.

The coder session that wrote this branch has no git push credentials — `git push` fails with
`could not read Username for 'https://github.com'`. While the session was still working, the
implementation commit `ca7f815bcf919ead378320c2a3cacb348341a671` was pushed from outside it and
went to **`main`** instead of to `cr-017-baseline`. The repository's own reflog records it as
`refs/remotes/origin/main@{0}: update by push`, and `git ls-remote` confirmed `refs/heads/main`
sitting on that commit with no `cr-017-baseline` on the remote at all. The Pages workflow
deploys on every push to `main`, so the build went out unreviewed. The session did not do this
and could not have.

**Undone the same way as CR-014 v3**, by the athlete's decision on 23 September 2026: an
ordinary revert commit on `main`, no force-push and nothing rewritten, and the change comes
back through the pull request on this branch — where it should have arrived in the first place.

One mechanical detail matters here and is the reason the hash below is not the one above. Once
`main` carries both `ca7f815` and its revert, a branch that still *contained* `ca7f815` would
merge as a no-op for the code: the merge base would be `ca7f815` itself, so git would see the
revert as the newer state and keep it, and merging the pull request would have quietly landed
the APP_REPORT without the baseline. The implementation is therefore **reapplied on top of the
revert as a fresh commit**, so that merging this pull request really does bring the code back.
The content is identical to `ca7f815`; only the hash differs.

The route, in order:

```
 main             e6eab41 ─ ca7f815 ─ 2b2e95e (revert)   ← main back to pre-CR-017 content
 cr-017-baseline                      └─ 6ef0643 ─ (this report)
```

The revert redeploys the pre-CR-017 build; merging the pull request deploys the baseline again.
The same route was used for CR-011 and for CR-014 v3.

Worth raising in Cowork, since this is now the second time: something outside the coder session
is pushing its commits straight to `main`. Until that is found, a coder session cannot assume
its local commits stay local.

Implementation commit: `6ef0643105110c7313c5a85f211aabaf1d8d4726`
