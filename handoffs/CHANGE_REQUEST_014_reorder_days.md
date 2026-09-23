# CHANGE_REQUEST_014 v3: past days can be re-ordered

tier: TOP · version 3, 22 September 2026 · branch `cr-014-reorder-past-days`
Self-contained. Everything built in v2 stays as it is, except what this page lists.

## Why

The athlete skipped the Monday CrossFit class, did not re-order the week that evening, and on
Tuesday the app refused to let her fix it. The week in the app now shows something that did not
happen. The app must let her make the week match reality.

## The rule, in one line

Every day of the current week can be dragged and can receive a session, **including days already
past**. Only the two fixed events stay locked.

## The rule behind it (already changed, nothing to decide)

R-WS-14 in `weekly_shape.md` v4 (22 September 2026) now reads: "A missed session is never replaced
by an extra session and never creates a sixth training day. Re-ordering the week afterwards,
including days already past, is allowed." No other rules file changes.

## Exactly what changes in the code

```
 src/coach/dayMoves.ts
   isMovable       a session on a past day IS movable
                   (the only non-movable session is a fixed_event)
   canReceive      a past day ACCEPTS a drop
                   (the only refused targets are the two fixed-event dates)
   applyDayMoves   a stored move to a past date is KEPT
                   still dropped silently: unknown sessionId, a date outside the
                   session's own week, a move onto a fixed-event date
   isPastDay       stop using it to block anything; keep it only if used elsewhere

 src/CoachConcoursApp.tsx
   remove the "passé" lock chip, the `past` card class, the `blocked` slot class
```

## What does not change

```
 the checker (checkWeek) and every flag it raises
 the two fixed events: trail race 11 Oct, police test 20 Nov
 session ids, so recorded numbers stay bound to their session
 one move per session, a new move replaces the previous one
 a move stays inside its own week
 a move never adds a session and never creates a sixth training day
```

The mockup `MOCKUP_CR014.html` still says a drop on a past day is refused ("the date has passed").
That sentence is obsolete. Ignore it; everything else in the mockup stands.

## Tests

```
 changed   applyDayMoves keeps a move into the past        (was: dropped)
 new       a session on a past day is movable
 new       a past day accepts a drop
 new       a move onto a fixed-event date is still refused
 kept      every other v2 test, unchanged
```

## Checks

Run `pnpm typecheck`, `pnpm test`, `pnpm build`. If they cannot run on this machine, say so plainly
in the report. Never claim a pass that was not seen.

## Deliverable

1. Save this page as `handoffs/CHANGE_REQUEST_014_reorder_days.md` in the same branch, replacing v2,
   so the repository copy is current.
2. `handoffs/APP_REPORT_014_v3.md`, ending with the commit hash.
3. Pull request titled `CR-014 v3 past days can be re-ordered`. Do not merge, do not tag.

Never a person's name, e-mail, hostname, device name or personal folder path.
