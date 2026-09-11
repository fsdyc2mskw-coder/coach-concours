# Personal baseline and fixed constraints

## Athlete

- Display name: the athlete
- Locale: `fr-CH`
- Time zone: `Europe/Zurich`
- Planned principal training days: 5 per week
- CrossFit class: coached class every Monday; attendance reported, registration planned
- CrossFit room: available on one additional day per week for a self-directed session
  prescribed by the app using the athlete's own equipment
- Comfortable continuous run reference: approximately 6 km
- Complete police-circuit baseline: 8 minutes 30 seconds
- Baseline validity: complete-circuit time reported by the user; clean/error status and
  station splits have not yet been recorded

## Primary objective

- Event: Police cantonale vaudoise physical aptitude test
- Date: 20 November 2026
- Official time limit: 6 minutes 15 seconds (`375` seconds)
- Personal target: 6 minutes 11 seconds (`371` seconds)
- Current gap to official limit: 2 minutes 15 seconds (`135` seconds)
- Current gap to personal target: 2 minutes 19 seconds (`139` seconds)
- Required result: all 11 stations completed correctly; a station not attempted,
  incorrectly completed, or abandoned means failure under the official instructions

The app must never present the 4-second difference between the official limit and the
personal target as a comfortable buffer. It may display both values, but performance
progress is based on clean completion first and time second.

## Secondary objective

- Event: trail race
- Date: 11 October 2026
- Distance: 12 km
- Positive elevation gain: 400 m
- Intent: maintain sufficient trail capacity to complete the event; no personal-best or
  trail-performance objective
- Training allocation: one outdoor interval run per week; the race replaces it that week

There are 40 days between the trail event and the police test. After the trail, the
outdoor interval session resumes as recovery permits; no new trail cycle is created.

## Ultimate rule (above every other coaching rule)

the athlete must learn the complete 11-station circuit by heart: station order, transitions,
critical rules, required repetitions, and correction rules. The end state is that she can
mentally reproduce the whole circuit with her eyes closed. This means mental rehearsal
only; physical practice is always performed with eyes open.

## Known police-test weaknesses and observations

1. Station 2: the box/obstacle remains a fear and can cause hesitation.
2. Station 8: basketball/hoop coordination is a specific difficulty.
3. Station 9: technically correct in the reported attempt, but slow and hesitant.
4. Station 10: skipping-rope error in the reported attempt: started with the wrong foot.
5. Station 11: technically correct in the reported attempt, but slow and hesitant.
6. Other stations were reported correct but remain to be verified in a scored attempt.
7. Circuit recall is the governing objective, not an optional add-on.
8. Facility access: the CrossFit gym is available for personal practice. Whether the
   complete official circuit can be recreated there remains unverified.
9. Explosiveness under short, high-intensity effort and the ability to recover between
   repeated efforts are current primary physical weaknesses.

The exact detailed home score is not yet entered. The app must keep an editable
placeholder and allow the athlete to provide the exact result later without overwriting the
qualitative observations above.

## Confirmed available equipment

- basketball;
- coloured hoops or floor markers;
- skipping rope;
- table-tennis racket and ball;
- approximately 18 m of usable space;
- Decathlon floating/round balance board (about 39.5 cm, non-slip surface).
- agility ladder;
- large plyometric box at the CrossFit room.

Full official apparatus and other substitutes remain unknown until explicitly confirmed.
The engine may propose a household substitute only after the user confirms that it is
stable, safe, and available.

## Required onboarding questions not yet answered

V1 must collect these before generating the first personalized plan; the implementation
must not invent answers:

- Preferred weekdays and rest days, including the weekly CrossFit-room booking.
- Recent weekly running volume.
- Which still-unconfirmed station equipment is available: stable obstacle, wall bars,
  mannequin/sandbag, sled/trolley, rope and 30 kg bag, and stable beam/bench.
- Which parts of the CrossFit room can be verified as exact or close replicas of the
  official circuit beyond the ladder and large box.
- Whether the 8:30 baseline was clean; if not, which stations required correction.
- Current pain or constraint affecting session scheduling.

Unknown answers must be represented as `null`/unknown and surfaced in onboarding or
weekly planning. They must not silently receive optimistic defaults.
