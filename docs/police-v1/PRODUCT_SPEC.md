# Coach Concours V1 - product specification

## Product statement

Coach Concours is a private French-language, mobile-first app that tells the athlete what to do
today, keeps five weekly training days focused on the 20 November police test, teaches the
11-station circuit by heart, and records clean technical progress. It also maintains just
enough trail capacity for the 12 km/400 m D+ event on 11 October.

## Primary outcome

Arrive at the police test able to:

- recall all 11 stations, transitions, and critical rules without prompts;
- execute all stations correctly under fatigue;
- manage the obstacle/box without hesitation;
- execute basketball colour-foot-hand coordination reliably;
- maintain balance and precision through stations 9-11;
- complete an exact clean circuit inside the official 6:15 limit, with 6:11 stored as the
  user's initial personal target.

The app supports the goal but does not claim that a plan guarantees the result.

## V1 user

One user, the athlete, primarily on an iPhone-sized screen. There are no accounts, coaches,
subscriptions, social features, leaderboards, or administration roles.

## V1 navigation

1. **Aujourd'hui** - police-first status and next action.
2. **Plan** - five-day week with focus validation.
3. **Circuit** - official sequence, learning chunks, quizzes, visualization, station
   progress, and attempts.
4. **Activités** - completed sessions and manual records.
5. **Réglages** - profile, equipment, CrossFit day, Drive/export, and reset controls.

The persistent global action is **Idée / feedback**.

## Included

- police-first onboarding;
- fixed primary and secondary event structure;
- deterministic five-day plan;
- focus-policy validation;
- one coached Monday CrossFit class;
- one self-directed CrossFit-room explosiveness session on another day;
- one weekly outdoor explosive interval run;
- one station/circuit technique session and one coordination/balance session;
- official station catalogue;
- memory and visualization practice;
- equipment/facility fidelity;
- station and circuit attempts;
- clean versus corrected/failed result separation;
- weakness/confidence tracking;
- manual completion and activity history;
- local/offline persistence and explicit migration;
- Google Drive support as an optional setting;
- structured export and guarded plan-update import;
- application ideation feedback with optional screenshot and technical context.

## Explicitly excluded

- Swiss trail catalogue, maps, trail search, proximity, region filters, and generated
  trail routes;
- Garmin UI, provider, bridge, state, settings, roadmap, or future-integration teaser;
- a second weekly running session or an additional easy trail-maintenance run;
- direct API calls to Claude from the browser;
- chat with a coach;
- community or competitive leaderboards;
- automatic video analysis;
- prediction of official test success from approximation drills;
- invented official equipment dimensions or scoring rules;
- literal blindfolded obstacle practice;
- App Store/Capacitor work in this implementation;
- product-level medical-disclaimer language.

## Product principles

- Rule 0: learning the complete circuit by heart is the governing product objective.
- Police is visually and algorithmically primary.
- Correctness precedes speed.
- Specific practice is labelled by fidelity.
- A substitute drill is useful without pretending to be the official test.
- Five days means five, not five plus hidden extras.
- Room and outdoor interval loads are counted and separated by recovery.
- Trail is a compact secondary card, not a product section.
- The user can understand why every session exists and which station it supports.
- Unknown personal or official data remains unknown rather than receiving invented values.
- Product feedback and training-plan adaptation remain separate concepts.
- Memory practice is active and playful, embedded once in each police session, and never
  reduced to passive reading/recitation or duplicated as a final session test.
- A station normally receives 2-3 complementary drills selected for technique,
  strength/capacity, coordination, balance/proprioception, or fatigue transfer.

## Success measures

V1 product success is demonstrated when the athlete can, for two consecutive weeks:

```text
open -> understand today's police priority -> train -> record technical result ->
practise recall -> see focus status -> continue without editing internal files
```

Core progress measures:

- best exact clean circuit time;
- latest exact attempt result;
- station clean-rate trends;
- sequence/rule/visualization mastery;
- weakness confidence trend;
- weekly focus-policy status;
- adherence to 1 CrossFit + 1 room explosiveness + 1 outdoor interval + 1 station
  technique + 1 coordination/balance session.

Trail pace, kilometre volume, and D+ are secondary measures only.
