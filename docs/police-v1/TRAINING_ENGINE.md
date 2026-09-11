# Police-first deterministic training engine

## Role

Generate a transparent five-day plan that prioritizes police-test technique,
explosiveness under fatigue, and clean integration. The engine is deterministic for
identical inputs and an injected reference date.

## Inputs

- V2 athlete profile and availability;
- fixed goal set;
- station progress and concern tags;
- recent police attempts;
- recent recall attempts;
- recent session completion, effort, explosive-work quality, and recovery response;
- reference/start date;
- selected CrossFit-room weekday for the week;
- exact-circuit access dates.

No internet service is required to generate or view the plan.

## Rule 0 - circuit mastery

Before all ranking and scheduling rules, the engine must protect progressive mastery of
the complete circuit. Every police session contains exactly one short, active memory game
linked to the stations trained that day. It is embedded in the session, not added as a
sixth day and not repeated as a final test. Passive instructions such as only “read” or
“recite” are invalid.

## Personal phase calendar

For this V1 goal set, use these explicit phases and cover the boundary dates with tests:

| Dates | Phase | Primary intent |
|---|---|---|
| 2-6 Sep | Baseline partial week | Classify 8:30 attempt; learn circuit chunks; equipment audit |
| 7-20 Sep | Learn and decompose | Rules, obstacle confidence, basketball mapping, balance baseline |
| 21 Sep-4 Oct | Combine | Station chunks, strength/transitions, fatigue-conditioned coordination |
| 5-11 Oct | Trail-event week | Preserve police technique; reduce load; trail event replaces weekly run |
| 12-18 Oct | Reset and reassess | Low-load recovery, technique, updated station priorities |
| 19 Oct-1 Nov | Integrate | Longer chunks, transition timing, exact-room work when available |
| 2-15 Nov | Specific peak | Clean exact simulations, weakness correction, no junk volume |
| 16-20 Nov | Police taper partial week | Recall, crisp technique, reduced volume, event on Friday |

Do not place sessions after 20 November in this plan.

## Weekly template

Every complete week contains:

1. `crossfit` - coached Monday class; external content recorded after completion.
2. `room_explosive_intervals` - self-directed hard work on a different day in the
   CrossFit room, 35-50
   minutes including warm-up and recovery; use the agility ladder, large box, and other
   confirmed equipment.
3. `outdoor_explosive_intervals` - short hard running repetitions, 30-45 minutes
   including warm-up and cool-down; this is the only weekly run.
4. `police_technique` or eligible `police_mock_test` - low/moderate, 40-60 minutes.
5. `police_balance_coordination` - low/moderate, 35-55 minutes.

In race week, `trail_event` replaces `outdoor_explosive_intervals`. It does not create a
sixth day.

The room, technique, and coordination/balance sessions each contain one short memory
game, normally 3-8 minutes. Across the week the games cover ordering, transitions, and
critical rules. They do not count as separate principal training days.

## Scheduling algorithm

1. Reserve protected event dates.
2. Reserve Monday for the coached CrossFit class.
3. Reserve a different CrossFit-room day for the self-directed explosive session.
4. Place the outdoor interval run with at least 48 hours from the room explosive session
   where possible and not immediately after a hard Monday class; place the 11 October
   event on its fixed date instead.
5. Place exact circuit chunks inside the prescribed room or technique session when
   verified equipment is available.
6. Place technique/cognition and balance/coordination in low-load slots to protect
   movement quality and break up hard days.
7. Ensure two days contain no principal training.
8. Embed one active memory game in each police session.
9. Validate the whole week with the focus policy. If constraints cannot be satisfied,
   return a typed conflict explaining which user choice is required; do not emit a subtly
   invalid plan.

No compensation session may be placed in the past or added as day six.

## Session content selection

Rank candidate station objectives using:

1. failed/corrected exact attempt;
2. explicit very-high/high concern;
3. low confidence;
4. poor recall of its rule or transition;
5. time since last mapped practice;
6. phase relevance.

Until assessed otherwise, always include station 2, station 8, and at least one of
stations 9-11 each week. Rotate other stations and chunks so all 11 remain represented.

Apply these personal priorities until newer evidence replaces them:

- station 2 fear/hesitation: very high;
- station 8 basketball coordination: very high;
- station 10 wrong-foot start: high technical correction;
- stations 9 and 11 slow/hesitant but correct: high fluency priority;
- all other stations: maintain and verify.

For each targeted station, normally select 2-3 coherent drills: one technical/specific
drill, one physical-capacity or proprioception drill, and when useful one linked or
fatigue-conditioned drill. Do not fill sessions with unrelated exercise variety.

A strength/transitions day must provide meaningful training load. When exact apparatus
is unavailable, use a confirmed lower stable obstacle for station 2 and a confirmed
lighter draggable object for station 4, while recording approximation fidelity.

Memory game rotation includes: replay a short official-video segment and identify what
comes next or what rule matters; reorder shuffled station cards using drag-and-drop or
tap-to-swap; match a station to its rule; select the correct transition; detect an error
in a proposed sequence. Avoid repeating the same game in consecutive police sessions.

Generic exercise is police-specific only when the plan records its station mapping and
rationale. For example, a rope pull maps to station 7; generic burpees without a station
or circuit rationale remain general conditioning and cannot satisfy the 3-police minimum.

## Exact-room gate

Generate a full exact mock only when:

- an exact/verified replica facility is recorded as available;
- all 11 stations can be attempted in official order;
- the week does not already contain the trail event;
- it does not create three consecutive hard days.

Otherwise generate partial chunks or approximation work. Never predict an official time
from substitute-layout timing.

## Correctness-before-speed progression

Progress station work through:

1. recall and slow technical execution;
2. repeatable clean execution;
3. clean execution after a short fatigue primer;
4. clean linked chunks;
5. longer integration;
6. exact clean full circuit;
7. time reduction without loss of correctness.

An error does not trigger extra volume in the same week. It increases the station's
priority and selects a lower-complexity correction in the next suitable session.

## Outdoor explosive interval rules

The outdoor run develops repeated acceleration, tolerance of short high-intensity
efforts, and recovery while heart rate is elevated:

- one run per complete week maximum;
- police shuttles do not count as a second run;
- use short repetitions with generous enough recovery to preserve speed and mechanics;
- begin with work intervals of roughly 10-30 seconds or short hills, and progress total
  quality repetitions before reducing recovery;
- stop the quality block when speed, posture, or foot placement clearly deteriorates;
- do not use long threshold intervals or turn this into a distance-volume session;
- race day replaces the weekly run;
- the warm-up and cool-down remain easy; the hard repetitions are the purpose of the
  session;
- trail readiness is maintained through the total easy running around the repetitions
  and the October event itself, without adding another run.

If current running tolerance is unknown, the engine must request it or generate a
conservative time-based interval session with fewer repetitions rather than assume high
sprint volume or 12 km readiness.

## Explosive-session response rules

After completion:

- effort 1-3: keep the next session unless the same movement pattern overlaps heavily;
- effort 4-5, heavy legs, or repeated jumps: reduce lower-body volume in the next
  integration session or swap it with technique/balance;
- heavy pulling/grip: reduce pulling volume in the next room or technique session;
- Monday CrossFit at effort 4-5 or with heavy legs: reduce the next room-session volume
  and keep the following day low load;
- hard room conditioning: do not schedule the outdoor intervals or hard integration the
  following day;
- poor landing control or box hesitation: regress box height/complexity at the next room
  session and retain full recovery rather than adding repetitions.

These rules change content within five days; they never add a session.

## Focus validation API

Implement a pure function returning errors, warnings, and a status:

```ts
validateFocusPolicy(plan, weekStart, goals): {
  status: 'on_focus' | 'at_risk' | 'off_focus';
  errors: FocusIssue[];
  warnings: FocusIssue[];
}
```

Errors include more than one run, more than five principal days, a missing Monday
CrossFit class, room explosive session, outdoor interval run, technique session, or
coordination/balance session in a complete generated week, three consecutive hard days,
adjacent explosive days, or a moved event.

Warnings include two adjacent hard days, fewer than three embedded memory games, missing exact
practice coverage over a configurable period, and no work mapped to a high-priority
weakness.

## Deterministic tests

At minimum cover:

- every phase boundary;
- partial first and final weeks;
- fixed and variable CrossFit-room weekdays;
- room/outdoor explosive conflict resolution and recovery spacing;
- trail event replacing, not supplementing, the run;
- exactly 1 CrossFit + 1 room explosive + 1 outdoor explosive run + 1 technique + 1
  coordination/balance session in ordinary weeks;
- no second run through plan update;
- high-priority weakness inclusion;
- no room access still producing meaningful police sessions;
- exact-room day producing a protected integration opportunity;
- clean-only best-time derivation;
- no sessions after 20 November;
- stable output for injected time/IDs.
