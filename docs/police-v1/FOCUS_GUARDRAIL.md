# Police-first focus guardrail

## Goal

Prevent the secondary trail event, generic conditioning, integrations, or product ideas
from displacing the work that most directly improves the 20 November police-test result.
The guardrail must exist in domain logic, tests, and visible weekly-plan feedback. It is
not merely advisory copy.

## Complete-week allocation

A complete Monday-Sunday week generated before 20 November contains exactly five
principal training days:

| Category | Required count | Role |
|---|---:|---|
| CrossFit class | 1 | Coached Monday strength/conditioning load |
| Room explosive | 1 | Prescribed short high-intensity police support on another day |
| Outdoor explosive run | 1 | Repeated acceleration and recovery under elevated heart rate |
| Station/circuit technique | 1 | Correctness, recall, and clean integration |
| Coordination/balance | 1 | Basketball, proprioception, and precision |

Two days remain without a principal training session. The short memory game embedded in
each police session does not consume a separate principal training day.

Partial first and final weeks may contain fewer than five sessions because past dates and
post-event dates are not backfilled.

## Required police-session composition

The three police-specific sessions are the room, technique, and coordination/balance
days; they are not three maximal circuits:

1. **Room explosiveness** - short ladder, box, acceleration, and station-linked
   micro-circuit work with full enough recovery to preserve power and control.
2. **Technique and cognition** - circuit recall, rules, obstacle confidence, clean
   station chunks, and technical corrections at low/moderate load.
3. **Balance and coordination** - basketball mapping, proprioception, precision, and
   clean final-station transitions at low/moderate load.

At least one session per week must address a current high-priority weakness. Until new
assessment data changes the ranking, priorities are station 2 fear, station 8 basketball
coordination, station 10 wrong-foot-start correction, and fluency at stations 9 and 11.

## Memory requirement

Every police session contains exactly one active memory game of approximately 3-8
minutes. It is embedded within the session, never added on a rest day, and never repeated
as an end-of-session test. Across a complete week the three games rotate among:

- official-video detective and next-station prediction;
- shuffled station ordering by drag-and-drop or tap-to-swap;
- rule matching, transition choice, or find-the-mistake.

The target is 11/11 stations in order, all critical rules recalled, and no prompt. Mental
“eyes closed” reproduction means visualization only; the app must not instruct the user
to cross obstacles with vision blocked.

## Running and explosive-load ceiling

The plan validator rejects a generated week with more than one trail/running session.
The app does not offer a “second optional run” toggle in V1.

The only weekly run is the outdoor explosive interval session. Its warm-up, recoveries,
and cool-down supply easy running, but the quality block remains short and fast. The
Monday class, room session, and outdoor intervals are all counted when spacing hard load.
The room and outdoor explosive sessions should be separated by at least 48 hours where
possible and must never be adjacent hard days. Race week contains the trail event and no other
running session. After 11 October the outdoor interval session resumes; the event card
becomes historical and must not create another trail goal.

## Priority resolution

When calendar, fatigue, a hard CrossFit/room/interval session, or a missed day creates a
conflict, the engine applies this order:

1. Never add a sixth principal training day to compensate.
2. Never add a second run.
3. Keep technique/memory work when it can be performed at low load.
4. Preserve at least 48 hours between room and outdoor explosive sessions where possible;
   if recovery is poor, reduce repetitions before increasing intensity.
5. Remove redundant generic conditioning from station/skill sessions.
6. Reduce volume inside the police integration session before deleting the entire police
   exposure.
7. Do not automatically reschedule a missed hard session beside another hard session.

User-initiated changes remain possible, but any change violating the guardrail requires a
clear preview and cannot be applied by safe-auto adaptation.

## CrossFit and room handling

The Monday class and the separate prescribed room workout are distinct first-class
sessions. Class completion records its supplied emphasis and effort. Room completion
records the prescribed intervals, movement quality, and recovery response:

- session emphasis: legs, pulling, pushing, Olympic lifting, gymnastics, conditioning,
  mixed, or unknown;
- perceived effort from 1 to 5;
- optional notes.

CrossFit at effort 4-5 and the room session are hard days. Heavy pulling/grip,
high-volume jumping, or hard leg conditioning must influence the next police session.
The engine changes content or load; it does not add a replacement day.

## Hard-day spacing

The validator warns on two adjacent hard days and rejects three consecutive hard days.
Hard days include:

- full mock test or maximal integration circuit;
- high-load police strength/conditioning;
- room explosive intervals;
- outdoor explosive intervals;
- CrossFit reported or planned at effort 4-5;
- the 11 October race;
- any session explicitly marked `hard`.

Technical balance, recall, and low-load coordination may be scheduled between hard days.

## Clean-result rule

Store every timed attempt, but separate:

- `clean`: all assigned official stations completed correctly;
- `corrected`: completed after one or more corrections/restarts;
- `failed`: a required station not completed correctly or the attempt abandoned;
- `approximation`: substitute equipment/layout, never comparable to an exact mock.

Only a complete, exact, clean 11-station attempt can update `bestCleanCircuitTimeSec`.
An 8:30 baseline with unknown cleanliness remains a baseline note until classified.

## Facility-fidelity rule

Each station practice declares one fidelity level:

- `exact`: official or verified equivalent equipment and sequence;
- `approximation`: mapped physical/technical demand with substitute equipment;
- `mental`: recall, quiz, or visualization only.

Approximation and mental work count as police-specific focus but never prove exact-station
readiness. The dashboard shows exact-practice coverage separately.

## Focus status shown in the UI

Calculate status from the planned week:

- **On focus:** 1 CrossFit + 1 room explosive + 1 outdoor interval + 1 technique + 1
  coordination/balance; one memory game in each police-specific session.
- **At risk:** a missing police-specific session, missing memory work, poor explosive-session
  recovery, or adjacent hard days.
- **Off focus:** fewer than 2 police sessions, more than 1 run, more than 5 principal
  training days, or no high-priority-weakness work.

The dashboard leads with police metrics. Trail statistics remain in a compact secondary
card and never become the top progress visualization.

## Adaptation constraints

Any imported plan update must be revalidated against this policy. Safe-auto must reject
an update that:

- adds a second run;
- leaves fewer than three planned police sessions in a full future week;
- removes all work for the high-priority weaknesses;
- creates more than five principal days;
- creates three consecutive hard days;
- moves either event;
- relabels generic conditioning as police-specific without mapped station objectives.
