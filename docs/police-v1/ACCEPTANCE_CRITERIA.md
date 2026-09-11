# Coach Concours V1 acceptance criteria

## A. Repository and migration

- [ ] Clean dependency installation succeeds.
- [ ] `npm run check` succeeds, including schemas, TypeScript, tests, and production build.
- [ ] A valid V1 state migrates to V2 without losing activities, feedback, screenshots,
  or Drive file registry data.
- [ ] A V1 `garmin` activity becomes neutral `imported` with the same ID and metrics.
- [ ] Old future trail workouts are not falsely relabelled as police workouts.
- [ ] Failed migration produces a recoverable visible error and does not silently reset.
- [ ] Refresh after migration preserves V2 state.

## B. Removed scope

- [ ] No Swiss trail data file, catalogue module, sync script, screen, route, navigation,
  setting, geolocation request, session suggestion, or test remains.
- [ ] No Garmin provider, bridge URL, environment variable, state, button, demo import,
  documentation, or future-work teaser remains.
- [ ] No current user-facing/product-invariant medical-disclaimer language remains.
- [ ] The current README, product docs, roadmap, and status do not advertise removed scope.
- [ ] Build artefacts and manifests contain no stale references to deleted source files.

## C. Onboarding and fixed goals

- [ ] The police event is fixed at 20 November 2026.
- [ ] Official limit displays as 6:15 and personal target as 6:11.
- [ ] Reported baseline displays as 8:30 and initially permits unknown cleanliness.
- [ ] Trail event is fixed at 12 km/400 m D+ on 11 October 2026 and labelled secondary.
- [ ] Training days are fixed to five.
- [ ] One self-directed CrossFit-room session is fixed per week and collects a
  fixed/variable weekday.
- [ ] The user can record running baseline, available equipment, and exact-room dates.
- [ ] Unknown values remain unknown and are not silently invented.
- [ ] Google Drive does not block local onboarding.

## D. Focus guardrail

- [ ] Every complete generated week has exactly five principal days.
- [ ] Counts are exactly 1 Monday CrossFit, 1 room explosive, 1 outdoor explosive run,
  1 station/circuit technique, and 1 coordination/balance session.
- [ ] A second run is rejected by local generation and imported plan updates.
- [ ] Each of the three police sessions contains exactly one short active memory game.
- [ ] No separate memory test is appended at the end of a police session.
- [ ] At least one weekly police session maps to a current high-priority weakness.
- [ ] Three consecutive hard days are rejected.
- [ ] Adjacent hard days produce a visible warning.
- [ ] Room or outdoor interval effort and movement-quality feedback can reduce or swap
  the next overlapping session without creating a sixth day.
- [ ] A conflict reduces explosive repetitions or integration volume before deleting
  police technique; the 11 October event is not automatically moved/deleted.
- [ ] Partial first/final weeks do not backfill past or post-event dates.
- [ ] Police test and trail event dates cannot be moved by imported updates.

## E. Outdoor intervals and trail event

- [ ] No complete week contains more than one running session.
- [ ] The generated weekly run contains short explosive repetitions plus easy warm-up,
  recovery, and cool-down.
- [ ] The app does not add an easy maintenance run beside the interval session.
- [ ] Race week contains the event and no additional run.
- [ ] After 11 October, the outdoor interval run resumes and the trail countdown collapses
  to history.
- [ ] There is no trail route-search or performance-plan UI.

## F. Official circuit content

- [ ] Circuit screen lists all 11 stations in official order.
- [ ] Station 2 states five outward crossings with a ball and four returns without.
- [ ] Station 3 prohibits the bascule technique.
- [ ] Station 4 prohibits the handle behind the mannequin's head.
- [ ] Stations 5/6 teach `push -> place nuts -> pull -> remove nuts`.
- [ ] Station 7 identifies the official 30 kg bag.
- [ ] Station 8 maps yellow/blue/red correctly.
- [ ] Station 9 requires both feet before taking the ball and prohibits support on the
  ball/cone when turning.
- [ ] Station 10 repeats the current failed block.
- [ ] Station 11 uses the racket centre, handle with closed hand, and resume-at-drop rule.
- [ ] No unverified dimensions, weights, penalty values, or variants are presented as
  official facts.

## G. Recall and visualization

- [ ] User can practise ordered station names.
- [ ] User can practise critical rules and transitions.
- [ ] Stations 5/6 interleaving is explicitly tested.
- [ ] User can complete guided and unprompted visualization.
- [ ] User can reorder shuffled station cards by drag-and-drop or tap-to-swap on a phone.
- [ ] At least one supported game uses a short official-video replay and an active
  prediction or rule question.
- [ ] Passive “read” or “recite” copy is not used as a complete memory exercise.
- [ ] Recall stores prompt status, order score, rule score, transition score, and date.
- [ ] Mastery distinguishes sequence, rules, and unprompted visualization.
- [ ] App schedules exactly one embedded memory game per police session.
- [ ] No copy tells the user to perform physical obstacles with eyes closed.

## H. Weakness and no-room support

- [ ] Station 2 starts with fear/very-high priority.
- [ ] Station 8 starts with coordination/very-high priority.
- [ ] Station 9 starts as correct but slow/hesitant and receives a fluency priority.
- [ ] Station 10 starts with the recorded wrong-foot-start error.
- [ ] Station 11 starts as correct but slow/hesitant and receives a fluency priority.
- [ ] Every station offers exact, approximation, and mental information where meaningful.
- [ ] No-room availability still generates three useful police-specific sessions.
- [ ] Approximation is visibly labelled and never presented as exact readiness.
- [ ] Box progression records level, confidence/fear, hesitation, clean repetitions, and
  fidelity.
- [ ] Basketball progression records mapping, foot, and dribble errors.
- [ ] Balance/precision work records falls/drops/restarts relevant to the station.
- [ ] Balance work offers several proprioception families, including safe use of the athlete's
  balance board, and never equates balance-board success with exact station-9 success.
- [ ] Station 2 can use a confirmed lower stable substitute; station 4 can use a
  confirmed lighter draggable object; both are visibly labelled approximations.
- [ ] A police station focus normally receives 2-3 complementary drills rather than a
  single token exercise.

## I. Attempts and performance

- [ ] User can record station, chunk, and full-circuit attempts.
- [ ] Attempt records fidelity and clean/corrected/failed outcome.
- [ ] Full attempts may record splits and errors per station.
- [ ] Only exact, clean, complete 11-station attempts update best clean time.
- [ ] Corrected, failed, approximation, and baseline-unknown times remain visible but do
  not overwrite the best clean result.
- [ ] Dashboard always places correctness status beside time.

## J. Explosiveness and CrossFit-room access

- [ ] Every complete week reserves the coached CrossFit class on Monday.
- [ ] Every complete week reserves one self-directed CrossFit-room explosive session.
- [ ] The room session is scheduled on a different day from the CrossFit class.
- [ ] The room library uses confirmed equipment including the agility ladder and large
  box and maps each drill to police-test demands.
- [ ] Every complete week reserves one outdoor explosive interval session, which is the
  only run and is replaced by the trail event in event week.
- [ ] Completion collects work/recovery duration, repetitions, effort, movement quality,
  peak heart rate when available, and one-minute heart-rate recovery.
- [ ] The engine separates the two explosive sessions by at least 48 hours where possible
  and never schedules them on adjacent hard days.
- [ ] Reduced speed, unstable landing, or repeated technical errors stop the quality block
  rather than triggering extra volume.

## K. Dashboard and navigation

- [ ] Above-the-fold card leads with police date, clean time, official limit, personal
  target, baseline, and focus status.
- [ ] Weekly allocation displays `1 CrossFit · 1 Salle explosive · 1 Intervalles · 1
  Ateliers · 1 Équilibre/coordination`.
- [ ] High-priority weakness and next memory action are visible.
- [ ] Trail is a compact secondary card.
- [ ] Bottom navigation is Aujourd'hui, Plan, Circuit, Activités, Réglages.
- [ ] Old `#/trails` links safely redirect.

## L. Idée / feedback and plan adaptation

- [ ] Global control is labelled `Idée / feedback` on all application screens.
- [ ] Modal is clearly for improving the app and offers the specified categories.
- [ ] Screenshot and technical context still work.
- [ ] Product feedback persists offline and can sync through the existing Drive flow.
- [ ] Plan-update import remains separate and passes the police focus validator.
- [ ] Safe-auto cannot apply any off-focus update.

## M. Mobile, offline, and quality

- [ ] No horizontal overflow at 393 x 852 CSS pixels.
- [ ] All primary text and cards remain readable in dark mode; foreground and background
  contrast never collapse to black-on-black.
- [ ] Principal touch targets are at least 44 CSS pixels.
- [ ] Long station instructions, enlarged text, keyboard-open state, and safe-area insets
  remain usable.
- [ ] Dashboard, plan, circuit, session, activities, and settings remain readable offline
  after initial load.
- [ ] Empty, unknown-equipment, no-room, loading, migration, and error states are explicit.
- [ ] No secret or durable OAuth token is stored or exposed.
- [ ] Domain logic remains independent of React/browser/infrastructure.
