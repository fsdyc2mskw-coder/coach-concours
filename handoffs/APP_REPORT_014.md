# APP_REPORT_014 — CR-014 move a session to another day, with a checker that flags

Tier stated: **TOP** (engine + persistence + UI), matching the `tier:` line of
`CHANGE_REQUEST_014_reorder_days.md` v2. This session ran on Claude Opus 5 at
high effort, the TOP model per `00_AGENT_ROUTING.md` v2.

Reference used: **`handoffs/MOCKUP_CR014.html`**, the v2 mockup copied from the
Drive folder `04_App_handoffs`. The copy that was sitting in the athlete's
Downloads folder (`MOCKUP_CR014_reorder.html`) is the **v1** mockup — it still
carries a `C7` check ("the CrossFit class moves off Monday") and has no C2
suppression. It was not used. Where the change request text and the v2 mockup
disagree, the mockup won; the two disagreements are listed under
*Substitutions* below.

## Environment note

Unlike CR-002, CR-009 and CR-010, this session **could** run the full gate.
There is no `node` or `pnpm` on this machine's `PATH`, but the repository's
`node_modules` was already installed, and a Node 24.20.0 runtime exists on the
machine inside another application's bundle. Loading the project's native
`@rollup/rollup-darwin-arm64` module with that binary fails under macOS library
validation (different code-signing Team ID), so the binary was copied into this
session's scratchpad and re-signed ad hoc; `pnpm` came from `corepack` (9.15.9).
Nothing outside the scratchpad was installed or modified, and no repository file
records any of these paths. **`pnpm typecheck`, `pnpm test` and `pnpm build` all
ran and all passed** — see *Verification*.

## What changed

### 1. The move is its own persisted layer (section C)

`src/coach/types.ts`

```ts
export interface DayMove { sessionId: string; toDate: string; movedAt: string; }
// CoachState.dayMoves?: DayMove[]
```

`schemaVersion` stays `2` and the field is optional, so a state written before
CR-014 loads unchanged and `isCoachState` needed no change.

`src/coach/dayMoves.ts` (new) holds the whole layer:

- `applyDayMoves(weeks, moves, reference)` — finds the session by `sessionId`,
  sets `date` and `dayLabel`, and touches nothing else. `id`, `recipeId`,
  `kind`, `load`, `phase` and `volumeFactor` are carried through untouched, so
  a result already recorded under `${date}:${kind}` stays bound to its session.
- Dropped silently: an unknown `sessionId`; a `toDate` in the past; a `toDate`
  outside the session's own week; a move of a `fixed_event`; a move onto a date
  a fixed event already holds. One move per `sessionId` — the last wins.
- `planWithMoves(results, moves, reference)` — `generatePlan` then
  `applyDayMoves`, the single call every other file uses.
- `withMove(moves, sessionId, toDate)` — replaces any earlier move of the same
  session, so `dayMoves` never holds two entries for one session.
- `isPastDay`, `isMovable`, `canReceive` — the same three predicates the screen
  uses to draw the lock, the handle and the blocked slot, so the engine and the
  UI can never disagree about what is allowed.

`generatePlan` itself is **not touched**: the rules keep producing the standard
week, and the moves are a layer on top.

Every place a plan is built now goes through `planWithMoves`:
`loadCoachState()` and `parseCoachState()` in
`src/infrastructure/coachStorage.ts`, and `persistResult`/`removeResult` in
`src/CoachConcoursApp.tsx`. `createInitialState()` still calls `generatePlan()`
directly: a brand-new state has no moves.

### 2. The checker (section D)

`src/coach/weekChecker.ts` (new), one pure function `checkWeek(week): Flag[]`.
It never blocks a move, never rewrites the plan and never writes a file. It
reads the intensity the app already draws (`load === 'hard' | 'event'` is a
hard day).

| Code | Fires on | Colour |
| --- | --- | --- |
| `STACK` | a day holds two sessions or more — and then **only** the stack flags are returned | amber |
| `C1` | two hard days side by side; the crossfit + run-intervals pair is accepted in either order; suppressed inside a C2 window | amber |
| `C2` | three hard days in a row (R-WS-10) | **red** |
| `C3` | more than three training days in a row with no free day | amber |
| `C4` | a police session whose one HIIT block has format `intervals`, the day after the running intervals (R-WS-08) | amber |
| `C5` | the two runs side by side | amber |
| `C6` | `trail_maintenance` no longer on Saturday or Sunday (R-WS-03) | amber |

A `Flag` carries `code`, `hard`, `date`, `lead` and `text`. The mockup writes
its flag text with an inline `<b>` tag; splitting it into `lead` + `text` gives
the same rendering (`<b>{lead}</b> {text}`) without the app ever injecting HTML.

### 3. The screens (section E)

`src/CoachConcoursApp.tsx` — `WeekScreen` rebuilt, plus `usePointerDrag`.
`src/coach.css` — the mockup's `.editRow`, `.ghost`, `.slot`, `.free`,
`.handle`, `.floating`, `.banner`, `.okline`, `.day .lock`, `.day .warnDot`,
`.card.past`, `.card.stacked`, `.card.lifted` rules, copied from the mockup.

- One new button, `Modifier l'ordre`, which becomes `Terminer`.
- In edit mode every movable card shows a handle. A past day shows `🔒 passé`
  and refuses a drop (its slot goes red under the finger); a free day shows
  `Libre · dépose ici`.
- Drag is **pointer events**, not HTML5 drag, so it works with a finger and
  with a mouse. The listeners sit on the document so a finger leaving the card
  still drives the move; the floating copy is a clone appended to
  `document.body`, removed on release or on `pointercancel`.
- A day carrying a flag shows `⚠` beside its date, amber for a soft flag, red
  for the hard rule. The banner lists the flags in plain French with
  `Annuler le déplacement` and `Je garde`.
- `Je garde` closes the banner and stores nothing but the move itself.
  `Annuler le déplacement` writes back the `dayMoves` array exactly as it was
  before the drop — so it also undoes correctly when the session had already
  been moved once before.
- Leaving edit mode with flags still open is allowed.
- A day may now hold several cards, so the week screen iterates the sessions of
  each day instead of taking the first one.

Nothing about a flag is persisted. What is persisted is the new order, so the
Sunday review still sees the week as she actually shaped it.

## Substitutions and judgement calls

1. **`run_intervals` does not exist in this repository.** The change request
   declares `depends on: CR-011 (run_intervals)`, and C1's accepted pair, C4 and
   C5 all name that kind. **CR-011 is not on `main`** — commits `34355c0` and
   `9ce1dd8` were reverted by `485eef3` and `94ff5b4`, and no week the generator
   produces contains a `run_intervals` session. The kind that carries the
   running intervals today is `running_intervals_exception` (Week 1's documented
   Tuesday, R-WS-08). The checker therefore matches **both names** as plain
   strings rather than through the `SessionKind` union, so the checks are live
   for Week 1 now and become live for the ordinary weeks the day CR-011 lands,
   with no further code change. See the first question below.
2. **The week-range label.** The mockup's edit row carries only
   `Séances 3/5` and the button; the app's row also carries the week range
   (`14 sept – 20 sept 2026`, from CR-010). The range was kept and the row set
   to wrap, rather than dropping data the mockup simply had no room for.
3. **C6 checks `trail_maintenance` only**, exactly as the mockup does; the fixed
   `trail_event` keeps its own date and cannot be moved at all, so it can never
   leave the weekend.
4. **The ⚠ day markers are drawn whether or not edit mode is on**, as in the
   mockup (which computes the flags on every render); only the banner is
   confined to edit mode. On a standard week there are no flags, so nothing
   shows until she moves something.

## Questions for the chat (not decided here)

1. **CR-011 and `run_intervals`.** CR-014 v2 is written against a Tuesday
   `run_intervals` session that the app does not currently generate, because
   CR-011 was reverted on `main`. Nothing in CR-014 is blocked by that — but
   C1's accepted pair (CrossFit next to the intervals) and C4 (a police
   intervals HIIT the day after the intervals) will stay silent on ordinary
   weeks until CR-011 is back. Does CR-011 get re-landed, or is it now a
   different number?
2. **`weekly_shape.md` v4.** Section D of the change request asks for a note to
   be written when this is merged: while a day is stacked the week has 5
   sessions over fewer than 5 days, so the "2 days without a session" half of
   R-WS-01 does not hold, and the stack flag stands in for it. That is a rules
   file in Drive — not written here.
3. **`validateWeek` and a moved week.** `validateWeek` in `planner.ts` validates
   what the generator produced; it is called only from `weeklyShape.test.ts`,
   never from the app, and it is **not** run over a moved week. It would report
   "Deux journées explosives sont adjacentes" and similar on a week she has
   deliberately reshaped. Left untouched, since CR-014 says the app never argues
   with her — but if the Sunday review is ever meant to run `validateWeek` over
   the week as lived, that needs a decision.
4. **The banner sits sticky at the bottom**, as in the mockup. On a long week
   it can cover the last day's drop slot while it is open, so a drop onto Sunday
   may need a scroll first. Kept as the mockup has it; say the word if it should
   float above the tab bar instead.

## Bugs noticed, not fixed (out of scope)

- `tsconfig.app.tsbuildinfo` and `tsconfig.node.tsbuildinfo` are written into
  the repository root by `tsc -b` and are **not** in `.gitignore`. They were
  already untracked on `main` before this branch and were left untracked here;
  they belong in `.gitignore`.
- `scripts/validate-repository.mjs` still requires `AGENTS.md`; it is not run in
  CI (see the `deploy.yml` comment from CR-004). Untouched.

## Files touched

```
handoffs/CHANGE_REQUEST_014_reorder_days.md   new (copied from Drive 04)
handoffs/MOCKUP_CR014.html                    new (copied from Drive 04, v2)
handoffs/APP_REPORT_014.md                    new (this file)
src/coach/dayMoves.ts                         new
src/coach/weekChecker.ts                      new
src/__tests__/cr014.test.ts                   new
src/coach/types.ts                            DayMove, CoachState.dayMoves
src/infrastructure/coachStorage.ts            planWithMoves on load and import
src/CoachConcoursApp.tsx                      setDayMoves, WeekScreen, usePointerDrag
src/coach.css                                 the mockup's edit-mode rules
```

`src/coach/planner.ts`, `src/coach/recipes.ts`, the Week 1 data and every CI
step are untouched.

## Verification

```
pnpm typecheck        pass (tsc -b, no errors)
pnpm test             pass — 10 files, 77 tests (57 existing + 20 new), 0 failures
pnpm build            pass — tsc -b && vite build, 37 modules, dist/ written, PWA generated
pnpm validate:schemas pass — app-export, feedback, plan-update
```

The 20 new tests in `src/__tests__/cr014.test.ts` cover every line of the change
request's section F list:

```
applyDayMoves: a move survives a reload (generatePlan then apply)
applyDayMoves: the session id and the recorded result stay bound after a move
applyDayMoves: a move into the past is dropped
applyDayMoves: a move outside the session own week is dropped
applyDayMoves: a move of an unknown sessionId is dropped
applyDayMoves: two sessions may sit on one date
applyDayMoves: a fixed_event (11 Oct trail race, 20 Nov police test) is never moved
applyDayMoves: a move onto a fixed_event date is refused like a past day
applyDayMoves: one move per sessionId, a new move replaces the previous one
checkWeek: the generated standard week returns no flag at all
checkWeek: a stacked day silences every other check
checkWeek: C1 is not raised for crossfit next to run_intervals
checkWeek: C1 is suppressed inside a C2 window
checkWeek: C2, C3, C4, C5, C6 each fire on a built week and not otherwise
week screen: Modifier l'ordre becomes Terminer and reveals one handle per movable session
week screen: a week with no flag shows the silent line, not the banner
```

"The generated standard week returns no flag at all" is asserted over **all
eleven** generated weeks, not only week 2 — the checker must be silent until she
moves something.

### Checked in a real browser

jsdom has no layout, so `document.elementFromPoint` always returns `null` there
and a synthetic drag cannot be tested in the suite. The drag was therefore driven
by hand against `pnpm dev` at phone width, on week 2 (14–20 September):

- dragging Friday's session onto Saturday: the ghost card follows the pointer,
  the target day highlights, both cards land on Saturday with the amber
  "stacked" border, `⚠` appears beside `SAM 19`, and the banner reads
  *"1 signalement · Deux séances le SAM 19 …"* with both buttons;
- **reloading the page**: the stack is still there and the count is still
  `Séances 0/5`, so the move survived the rebuild from `generatePlan`;
- moving the trail on to Sunday: the stack clears, the `⚠` disappears and the
  feedback becomes *"✓ Semaine cohérente, aucun signalement."*;
- `Annuler le déplacement`: the trail returns to the day it was on before that
  drop, including when it had already been moved once;
- dragging onto Monday 14 (past): the slot turns red, the drop is refused and
  nothing moves.

The local data written during that check was cleared afterwards.

Implementation commit: `PENDING`
