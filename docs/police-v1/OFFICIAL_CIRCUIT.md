# Official circuit integration specification

The user-facing station content must be generated from the facts in
`../POLICE_TEST.md` and the machine-readable seed in
`examples/police-stations.json`.

## Station content contract

Every station record contains:

- stable ID and official order;
- French display name;
- official steps;
- critical rules and prohibited actions;
- official facts with source attribution;
- primary qualities: speed, strength, agility, coordination, balance, dexterity,
  cognition, or transition;
- known personal concern and priority;
- equipment requirements;
- exact, approximation, and mental-practice options;
- readiness/confidence fields stored separately from the static catalogue.

Static official content must not be copied into mutable athlete progress objects.

## Learning chunks

The app teaches four chunks before testing the whole sequence:

1. **Opening speed:** stations 1-3.
2. **Heavy work and alternation:** stations 4-7, explicitly teaching `5 -> 6 -> 5 -> 6`.
3. **Coordination and balance:** stations 8-9.
4. **Precision finish:** stations 10-11.

It then teaches transitions between chunks: `3 -> 4`, `7 -> 8`, and `9 -> 10`.

## Recall mastery

A recall attempt stores:

- date/time;
- mode: ordered names, full rules, transitions, guided visualization, unprompted
  visualization, or random quiz;
- prompted or unprompted;
- station-order score out of 11;
- critical-rule score;
- transition score;
- duration;
- notes.

Mastery is not a single boolean. Show three independent signals:

- sequence mastery: 11/11 in order without a prompt;
- rule mastery: all critical rules correct in two consecutive attempts;
- visualization mastery: complete unprompted mental run-through recorded twice.

No physical blindfolded practice is included.

## Attempt comparability

Station and circuit attempts record fidelity:

- `exact`;
- `approximation`;
- `mental`.

Only exact attempts can be compared with the official 6:15 limit. Approximation times may
be shown as internal practice trends but must never be labelled predicted test results.

Only a complete, exact, clean attempt updates the best clean circuit time.

## Baseline treatment

The reported 8:30 result is stored with `fidelity: exact` only if the athlete confirms the real
course or a verified replica was used. Its clean status is initially `unknown`. It remains
visible as “reported baseline” but does not populate the best-clean record until
classified.

## Room-access handling

Weekly planning asks which practice fidelity is available. Lack of a room must not create
an empty plan. Each police session is assembled from:

- source-grounded official task intent;
- equipment-light station drill;
- physical quality work mapped to a station;
- recall or visualization;
- an explicit `approximation` label.

When an exact-room date becomes available, the engine protects it as the week's
integration session and reduces adjacent hard work rather than adding a sixth day.

