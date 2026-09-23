# APP_REPORT_014_v3 — past days can be re-ordered

Change request: `handoffs/CHANGE_REQUEST_014_reorder_days.md` **v3**, 22 September 2026, tier TOP.
Branch: `cr-014-reorder-past-days`. Pull request: `CR-014 v3 past days can be re-ordered`.
Not merged, not tagged.

This is a v3 of a change request already merged (pull request #6, CR-014 v2). Only what v3
lists was touched; the rest of the move layer and the whole checker are untouched.

## Environment note

Read first, because it limits what this report may claim.

- **`pnpm typecheck` — passed.** Run as `tsc -b --force --pretty false`, exit 0, no
  diagnostics, TypeScript 5.9.3. This is the `typecheck` script verbatim.
- **`pnpm test` — not run.**
- **`pnpm build` — not run.**

There is no Node.js and no pnpm on this machine: `node`, `pnpm`, `npm` and `npx` are all
absent from the path. The only runtime present is a Node 16 binary bundled inside an
unrelated desktop application. TypeScript itself still supports Node 16, so the compiler
ran for real and its result above is a real result. Vitest 3 and Vite 6 do not: both stop
before doing any work with

```
TypeError: crypto$2.getRandomValues is not a function   (vite 6.4.3, resolveConfig)
```

which is the Node 18+ requirement. That is a startup error, not a test failure: **no test
was executed, and no assertion in this repository has been seen to pass or fail on the v3
code.** Nothing below should be read as a passing suite. CI on the pull request runs on its
own Node and will give the first real answer for test and build.

This is the same gap recorded for CR-002 and CR-009 in `00_COCKPIT.md`. Installing Node 20+
on this machine removes it.

## What changed

### `src/coach/dayMoves.ts`

| Function | Before (v2) | After (v3) |
| --- | --- | --- |
| `isPastDay` | `date < today`, the source of every past-day refusal | **removed** — after the three call sites below it was used nowhere else, which is the condition v3 sets for keeping it |
| `isMovable` | not a `fixed_event` **and** not on a past day | not a `fixed_event`. That is the only reason left |
| `canReceive` | not a past day **and** not a fixed-event date | not a fixed-event date. That is the only refused target left |
| `applyDayMoves` | dropped a move whose `toDate` had passed | keeps it. Still dropped silently: an unknown `sessionId`, a `toDate` outside the session's own week, a move of a `fixed_event` or onto a fixed-event date |

`applyDayMoves` needed no new logic for the past: its past check lived entirely inside
`isMovable` and `canReceive`, so relaxing those two relaxed it. Its third parameter
(`reference`, the injected "today") is now unused — nothing in the layer is relative to
today any more. It is kept, renamed `_reference`, so every existing call site and every v2
test reads unchanged; `planWithMoves` still passes it through.

`id`, `recipeId`, `load`, `phase` and `volumeFactor` are still untouched by a move, so
recorded numbers stay bound to their session.

### `src/CoachConcoursApp.tsx`

- The `🔒 passé` chip is gone from the day header.
- The `past` card class is gone, so a past day's cards are drawn at full opacity like any
  other day's.
- Every session now carries a drag handle unless it is a fixed event.
- The `blocked` slot class **stays** — see the judgement call below.

### `src/coach.css`

Two now-dead rules removed with their markup: `.day .lock` (the chip) and `.card.past`
(the dimming). The two `CHANGE_REQUEST_014` comments that described the past-day refusal
were corrected rather than left lying. `.slot.blocked.over` stays and now means one thing
only: a fixed-event date.

### `handoffs/CHANGE_REQUEST_014_reorder_days.md`

Replaced with v3, as the deliverable section asks, so the repository copy is current.
`MOCKUP_CR014.html` is **not** touched: v3 says its "the date has passed" sentence is
obsolete and should be ignored, not edited.

## Judgement calls

### 1. The `blocked` slot class was kept. This is the one deviation from the literal text

v3 lists, under what changes in `CoachConcoursApp.tsx`: *"remove the 'passé' lock chip, the
`past` card class, the `blocked` slot class"*. The first two were removed. The third was
not, and the reason is that v3 contradicts itself on this one line:

- `blocked` is computed as `!canReceive(week, date)` — it is the screen's only expression of
  that function;
- v3 keeps `canReceive` refusing the two fixed-event dates, lists "the two fixed events" under
  **what does not change**, and asks for a test that *a move onto a fixed-event date is still
  refused*;
- the drag code reads exactly one thing when deciding whether a drop is allowed:
  `slot.classList.contains('blocked')`.

Removing the class therefore deletes the screen half of a refusal the same page keeps. The
drop onto 11 October would be accepted by the finger, then silently discarded by
`applyDayMoves`: the card would snap back with no explanation, and a dead `DayMove` would
be written to storage and re-discarded at every reload.

What made the class look like past-day machinery is that in v2 it covered both cases. It no
longer does: because `canReceive` changed, `blocked` narrowed itself to the fixed-event dates
without a line being touched at that call site. The past-day red highlight is gone, which is
what v3 is after.

**If the literal reading was meant** — the screen accepts the drop and the engine silently
undoes it — it is a one-line change, say the word. I did not take it, because it makes the app
look like it is arguing with her, which is the thing CR-014 exists to stop.

### 2. One v2 screen test had to change, beyond the test list

v3's test list names one changed test. A second one had to change too: the edit-mode screen
test asserted `3` handles and `3` locked days on Week 1 at 10 September. With past days
movable, Week 1 holds no fixed event, so all five sessions carry a handle and no day is
locked. It now asserts 5 handles, 0 locks, and — as a guard on the two classes v3 removes —
0 `.card.past` and 0 `.slot.blocked`. Nothing else in it moved.

### 3. One v2 test was renamed, not duplicated

v3 lists *"new: a move onto a fixed-event date is still refused"*. That test already existed
from v2 under the name *"a move onto a fixed_event date is refused like a past day"*, and its
body asserts exactly what v3 asks. Its name was false after v3, so it was renamed to v3's
wording and its body left alone. Writing a second identical test seemed worse than renaming
the first. Say so if you want them separate.

## Tests

| v3 asks for | What is in `src/__tests__/cr014.test.ts` |
| --- | --- |
| changed · `applyDayMoves` keeps a move into the past | `a move into the past is kept` — Saturday 19 onto Tuesday 15, decided on the Thursday. Asserts the new date and `dayLabel`, that Tuesday now holds two sessions, that Saturday is empty, and that the week still holds 5 sessions (a move never adds one, never makes a sixth day) |
| new · a session on a past day is movable | `a session on a past day is movable` — Monday 14 is not a fixed event, `isMovable` is true, and the move onto Wednesday 16 (also past) holds |
| new · a past day accepts a drop | `a past day accepts a drop` — `canReceive` is true for Monday 14 and Tuesday 15 |
| new · a move onto a fixed-event date is still refused | the renamed v2 test, body unchanged |
| kept · every other v2 test, unchanged | unchanged, except the screen test in judgement call 2 |

The checker's tests are untouched, matching "the checker and every flag it raises" under what
does not change.

**None of these have been executed.** See the environment note.

## Not checked in a real browser

The v2 report could check the drag by hand against `pnpm dev`. That is not possible here
(no Node), so the finger behaviour of v3 — a handle appearing on Monday's card once the day
has passed, and a past day lighting up green instead of red under the ghost — is **reasoned,
not seen**. It is worth two minutes on the phone before this is merged. The v2 report's last
browser line, *"dragging onto Monday 14 (past): the slot turns red, the drop is refused"*, is
the exact behaviour that should now be the opposite.

## Sporting questions (not decided here)

1. **R-WS-14 — nothing to decide, recorded for the trail.** v3 states the rule already
   changed in `weekly_shape.md` v4 (22 September 2026) and that no other rules file changes.
   The code follows the rule as quoted; it was not interpreted here. The earlier question in
   this session about whether R-WS-14 stood or changed is answered and closed.
2. **The CR-014 v2 note to `weekly_shape.md` is still owed.** v2's section D asked for a v4
   note: while a day is stacked the week has 5 sessions over fewer than 5 days, so the "2 days
   without a session" half of R-WS-01 does not hold. v3 makes stacking easier to reach — a
   session dropped onto a day already past stacks it by definition. Whether the v4 text now
   carries that note is a thinking-world question, outside this branch.
3. **A day that has passed and now holds two sessions.** The checker is unchanged, so a stack
   on a past day raises the ordinary stack flag and silences the other checks for the whole
   week, exactly as on a future day. If a past stack should read differently — she did both,
   after all, rather than planning both — that is a checker change and a separate request.
4. **Nothing stops a move that contradicts what was recorded.** A session with a saved result
   can be moved to a day it was not done on; the id and the result follow it. v3 does not
   mention it and the engine stays silent. Flagging it would be a checker change.

## Bugs noticed, not fixed (out of scope)

None new. The `_reference` parameter is dead weight kept for call-site compatibility; the
tidy-up (dropping the third parameter from `applyDayMoves` and `planWithMoves` and from the
ten test call sites) belongs in a change request that is allowed to touch v2 tests.

## Files touched

```
 handoffs/CHANGE_REQUEST_014_reorder_days.md   v2 replaced by v3
 handoffs/APP_REPORT_014_v3.md                 this file
 src/coach/dayMoves.ts                          isPastDay removed, isMovable, canReceive
 src/CoachConcoursApp.tsx                       lock chip and past class removed
 src/coach.css                                  two dead rules removed, two comments corrected
 src/__tests__/cr014.test.ts                    1 test changed, 2 added, 1 renamed, 1 screen test adjusted
```

`MOCKUP_CR014.html`, `src/coach/weekChecker.ts`, `src/coach/planner.ts` and
`src/infrastructure/coachStorage.ts` are untouched.

## Verification

- [x] `pnpm typecheck` — **passed**, `tsc -b --force`, exit 0, no diagnostics
- [ ] `pnpm test` — **not run**, no Node 18+ on this machine
- [ ] `pnpm build` — **not run**, same reason
- [ ] drag checked by hand in a browser — **not done**, no dev server without Node
- [x] no person's name, e-mail, hostname, device name or personal folder path in the diff
- [x] no session dated after 20 November 2026 introduced
- [x] no invented heart-rate target or load
- [x] Week 1 not regenerated
- [x] `generatePlan` not touched; the moves stay a layer on top
- [x] not merged, not tagged

Implementation commit: `0d09efea0bdb0a5d697f687e486d11366b70ab7c`
