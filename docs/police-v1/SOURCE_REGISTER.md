# Source register and provenance rules

## Official sources

### Current concours preparation page

- URL: https://www.policier.ch/se-preparer-au-concours/
- Publisher: Police cantonale vaudoise
- Verified: 2 September 2026
- Use: current high-level description of the physical test as an 11-station timed circuit
  assessing strength, endurance, coordination, cognition, and related qualities; confirms
  that time, penalties, and correct station completion matter.

### Official circuit guide

- URL: https://www.policier.ch/app/uploads/2022/11/Explications-sport.pdf
- Local copy: `../sources/police/official-circuit-guide.pdf`
- Publisher: Polices romandes recrutement
- PDF metadata creation date: 4 September 2018
- Verified/downloaded: 2 September 2026
- SHA-256: `35b825de1dddd21669004c579eaeb7aef4d5f3320ccce44f5b498aae016c2172`
- Use: normative local reference for station order, steps, errors, prohibited actions,
  30 kg rope-pull load, and 6:15 limit.

### Official preparation programme

- URL: https://www.policier.ch/app/uploads/2023/04/Tutoriel_sport.pdf
- Local copy: `../sources/police/official-training-program.pdf`
- Publisher: Polices romandes recrutement
- PDF metadata creation date: 24 April 2023
- Verified/downloaded: 2 September 2026
- SHA-256: `6934989c1a4ef866fa93096465bde6666de87366619764fc19509eb937884d1a`
- Use: exercise library and examples of 1-, 2-, 3-, and 4-month schedules.
- Constraint: do not copy one schedule verbatim because the athlete already has one weekly
  CrossFit session and the secondary 12 km trail event. Adapt exercise concepts inside
  the police-first guardrail.

### Official demonstration video

- URL: https://youtu.be/5PgT1ETlAtA
- Title: “Recrutement des polices romandes : démonstration du test d'aptitudes physiques.”
- Channel: Police cantonale vaudoise
- Duration observed: 3:48
- Reviewed: 2 September 2026
- Use: visual clarification of sequence, equipment, layout, transitions, and technique;
  the opening overlay labels the run as 18 m.
- Constraint: video imagery clarifies but does not override the written failure rules.
  Captions are unavailable. Do not infer unprinted dimensions, weights, or penalties.

## Review notes

The video and circuit sheet agree on the progression from opening run/slalom through the
obstacle and wall bars, heavy/manipulation middle section, hoops/basketball, mobile bench,
skipping rope, and racket-balance finish. Reviewed frames specifically confirmed the 18 m
opening instruction, the nut manipulation station, precision/balance equipment, and final
obstacle traversal.

## Engineering provenance rule

Every static official station fact in code must be traceable to `docs/POLICE_TEST.md` and
one of the sources above. Product-designed substitute drills must be labelled
`approximation`; they are not official stations or official recommendations.

If a future source conflicts with this pack, do not silently overwrite stored rules.
Record the source date, update the source register, add a migration if static IDs or
semantics change, and cover the change with tests.
