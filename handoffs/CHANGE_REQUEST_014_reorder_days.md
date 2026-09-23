# CHANGE_REQUEST_014: move a session to another day, with a checker that flags

tier: TOP (engine + persistence + UI)
version: 2 (17 September 2026, evening). Changes from v1: fixed events are not movable
(section C), and the effect of a stacked day on R-WS-01 is stated (section D).
mockup: `MOCKUP_CR014.html`, in this folder. When the mockup and this text disagree, the mockup wins.
depends on: CR-010 (week screen), CR-011 (run_intervals)

## A. What the athlete asked for

She wants to move a day when life or her legs say so, without the app
arguing with her. The app never refuses a move. It looks at the week
afterwards and tells her what it sees. She decides.

```
MOVE MODEL

before               drag Friday onto Saturday        then move it on
┌────┬─────────────┐ ┌────┬─────────────┐             ┌────┬─────────────┐
│Thu │ technique   │ │Thu │ technique   │             │Thu │ technique   │
│Fri │ integration │ │Fri │ libre       │             │Fri │ libre       │
│Sat │ trail       │ │Sat │ trail       │             │Sat │ trail       │
│Sun │ repos       │ │    │ integration │ ⚠ stack     │Sun │ integration │
└────┴─────────────┘ └────┴─────────────┘             └────┴─────────────┘
```

Decisions taken with her on 17 September:

```
MOVE      one session at a time, never a swap. The source day becomes free.
STACK     a day may hold two sessions or more. That is a flag, never a block,
          and it survives closing the app.
NEIGHBOURS  while a day is stacked, ONLY the stack flag is shown. Every other
          check is silent until the second session is moved on.
MONDAY    the CrossFit class is draggable like any other session, and moving it
          says nothing at all. She knows her class schedule.
PAST      a day whose date has passed cannot be dragged and cannot receive a
          session. Today is still movable. This keeps R-WS-14 (no session is
          moved into the past).
SCOPE     the move applies to that week only, always. The following weeks and
          the rules files are never touched, and nothing is asked.
FLAG      shown once in the banner and forgotten. Nothing about the flag is
          stored. The new order is stored, so the Sunday review still sees the
          week as she actually shaped it.
```

## B. Two constraints found in the code on 17 September

1. `loadCoachState()` in `src/infrastructure/coachStorage.ts` returns
   `{ ...envelope.state, weeks: generatePlan(envelope.state.results) }`. The
   stored weeks are thrown away and rebuilt at every start. A move written into
   `state.weeks` would therefore disappear at the next reload.
   **Therefore: the move is persisted as its own small layer, not as a week.**

2. `PlannedSession.id` is built as `${date}:${kind}` in `planner.ts`, and
   `state.results` is keyed by that id. A move must never rename a session, or
   the numbers already recorded lose their session.
   **Therefore: a move changes `date` and `dayLabel` only. The id stays as the
   generator wrote it.**

## C. Data and engine

```ts
// New, persisted in CoachState (schemaVersion stays 2; the field is optional
// so a state written before CR-014 loads unchanged).
export interface DayMove {
  sessionId: string;   // the generator's id, never rewritten
  toDate: string;      // YYYY-MM-DD, inside the same week
  movedAt: string;     // ISO, for the Sunday review
}
// CoachState.dayMoves?: DayMove[]
```

- `applyDayMoves(weeks, moves)` runs immediately after `generatePlan(...)`, in
  `loadCoachState()` and everywhere else a plan is built. For each move it finds
  the session by `sessionId` and sets `date` and `dayLabel`. It keeps `id`,
  `recipeId`, `load`, `phase` and `volumeFactor` untouched.
- A move whose `sessionId` no longer exists (a later change request regenerated
  that week) is dropped silently.
- A move whose `toDate` is in the past, or outside the session's own week, is
  dropped silently.
- One move per `sessionId`: a new move replaces the previous one.
- A session whose `status` is `fixed_event` is never movable and never carries a
  handle: the trail race of 11 October and the police test of 20 November keep
  their dates. A move that targets one of those two dates is refused like a past
  day.
- A week may hold several sessions on one date. Nothing in the engine forbids it.
- `generatePlan` itself is not touched. The rules keep producing the standard
  week; the moves are a layer on top.

## D. The checker

Reads the intensity the app already draws: `load === 'hard' | 'event'` is a hard
day (three bars), `moderate` is two bars, `low` is one.

```
STACK  a day holds two sessions or more.
       While any day is stacked, the checker returns ONLY the stack flags.
C1     two hard days side by side.
       Accepted pair, never flagged: crossfit_class next to run_intervals, in
       either order (her decision of 15 September, the change of stimulus).
       Suppressed when both days are already inside a C2 window.
C2     three hard days in a row. Hard rule R-WS-10, shown in red.
C3     more than three training days in a row with no free day.
C4     a police session whose HIIT block has format 'intervals', the day after
       run_intervals (R-WS-08).
C5     the two runs (run_intervals, trail_maintenance, trail_event) side by side.
C6     the trail is no longer on Saturday or Sunday (R-WS-03).
```

The checker is a pure function, `checkWeek(week): Flag[]`, with unit tests per
check. It never blocks a move, never rewrites the plan and never writes a file.

Note for `weekly_shape.md` v4, to write when this change request is merged: while a
day is stacked, the week has 5 sessions over fewer than 5 days, so the "2 days
without a session" half of R-WS-01 does not hold. The stack flag is what stands in
for it. The count of 5 principal sessions is never touched by a move.

## E. Screens

The mockup is the reference. In words:

- The week screen gains one button, `Modifier l'ordre`, which becomes `Terminer`.
- In edit mode every movable session card shows a handle. Past days show `🔒 passé`
  and refuse a drop; a free day shows `Libre · dépose ici`.
- Drag works with a finger and with a mouse (pointer events, not HTML5 drag).
- After each drop, a day carrying a flag shows `⚠` beside its date, amber for a
  soft flag, red for the hard rule, and a banner lists the flags in plain French
  with two buttons: `Annuler le déplacement` and `Je garde`.
- `Je garde` closes the banner and stores nothing but the move itself.
- Leaving edit mode with flags still open is allowed.

## F. Tests the worker must add

```
applyDayMoves: a move survives a reload (generatePlan then apply)
applyDayMoves: the session id and the recorded result stay bound after a move
applyDayMoves: a move into the past is dropped
applyDayMoves: a move of an unknown sessionId is dropped
applyDayMoves: two sessions may sit on one date
applyDayMoves: a fixed_event (11 Oct trail race, 20 Nov police test) is never moved
checkWeek: the generated standard week returns no flag at all
checkWeek: a stacked day silences every other check
checkWeek: C1 is not raised for crossfit next to run_intervals
checkWeek: C1 is suppressed inside a C2 window
checkWeek: C2, C3, C4, C5, C6 each fire on a built week and not otherwise
```

The standard week returning no flag is the test that matters most: the checker
must be silent until she moves something.
