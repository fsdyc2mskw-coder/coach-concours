# Coach Concours V1 mobile UX

## Language and viewport

- All visible copy: natural French for Switzerland.
- Reference viewport: 393 x 852 CSS pixels, portrait.
- One principal action per screen.
- Critical police status appears above trail information.
- No wide tables or station content requiring horizontal scrolling.

## Bottom navigation

| Route | Label | Purpose |
|---|---|---|
| `#/dashboard` | Aujourd'hui | Next action and police-focus status |
| `#/plan` | Plan | Five-day weekly plan |
| `#/circuit` | Circuit | Learn, visualize, practise, and record the 11 stations |
| `#/activities` | Activités | Completed-session history |
| `#/settings` | Réglages | Availability, equipment, Drive/export, maintenance |

Remove `#/trails`. An old link to it redirects to the dashboard without an error loop.

## Global ideation action

Retain the floating/persistent feedback control and rename it:

- button: **Idée / feedback**;
- modal title: **Améliorer l'application**;
- prompt: **Qu'est-ce qui t'aiderait à mieux préparer le concours ?**;
- categories: Idée, Problème, Séance peu claire, Donnée manquante, Amélioration du circuit;
- submit: **Enregistrer l'idée**.

Preserve optional screenshot, route, feature, app version, viewport, browser, network state,
and last technical error. This feature improves the product; it is distinct from importing
a training-plan update.

## Onboarding

Goal: collect the minimum unknown data needed for a truthful first plan in under three
minutes.

### Step 1 - objective

Show fixed, prefilled cards:

```text
Objectif principal
Test d'aptitude physique - 20 novembre 2026
Limite officielle 6:15 · objectif personnel 6:11

Objectif secondaire
Trail 12 km · 400 m D+ - 11 octobre 2026
Maintien: une course à pied par semaine
```

### Step 2 - baseline

- Reported circuit time prefilled at 8:30.
- Ask whether it was clean, corrected, failed, or unknown.
- Ask which stations caused errors/hesitation.
- Prefill station 2 fear, station 8 basketball coordination, station 10 wrong-foot-start
  error, and stations 9/11 as correct but slow and hesitant.
- Keep an editable placeholder for the exact detailed home score, to be supplied later.

### Step 3 - week

- Training days fixed to five.
- Fix the coached CrossFit class on Monday. Ask the athlete to choose a different day for the
  self-directed CrossFit-room session.
- Choose available training days/rest days.
- Prefill the comfortable continuous-run reference at approximately 6 km and collect the
  recent weekly running baseline.

### Step 4 - equipment

Fast checklist with available/sometimes/unavailable/unknown. Ask for exact-room access
dates. Explain that lack of a room produces decomposed practice, not an empty plan.

Google Drive is optional in Settings, not an onboarding gate.

## Dashboard

Above the fold:

```text
OBJECTIF POLICE · 20 NOVEMBRE
Dernier circuit propre       --
Meilleur circuit propre      --
Limite officielle          6:15
Objectif personnel         6:11
Point de départ déclaré    8:30

Focus de la semaine       Sur la cible
1 CrossFit · 1 Salle explosive · 1 Intervalles
1 Ateliers · 1 Équilibre/coordination
```

Then:

1. today's/next session;
2. current priority weakness;
3. memory task and mastery summary;
4. this week's five principal sessions;
5. compact secondary trail card.

Before 11 October, trail card:

```text
Trail secondaire · 11 octobre
12 km · 400 m D+
1 séance de maintien cette semaine
```

After completion, collapse it to event history. Do not keep a dominant countdown.

## Plan screen

The week header shows:

- focus status;
- `1 CrossFit · 1 Salle explosive · 1 Intervalles · 1 Ateliers · 1
  Équilibre/coordination` counts;
- hard-day warning if applicable;
- one embedded memory game per police session;
- phase name and event proximity.

Station sessions show mapped badges and fidelity. The room card shows “explosivité en
salle” and the selected ladder/box micro-circuit. The outdoor card shows work and
recovery intervals. The trail event remains a compact secondary item.

An invalid imported update is explained in plain language, for example:

```text
Modification refusée : elle ajouterait une deuxième séance de course et réduirait la
préparation spécifique police à deux séances.
```

## Circuit screen

Top summary:

- sequence mastery;
- rule mastery;
- visualization mastery;
- exact-practice coverage;
- high-priority stations.

Primary actions:

- **Apprendre le circuit**;
- **Tester ma mémoire**;
- **Visualiser les 11 ateliers**;
- **Enregistrer un essai**.

Station cards display official number/name, concern, confidence, latest exact result, and
practice availability. Opening a card gives:

- official steps;
- critical rules;
- “Version exacte”, “Sans salle”, and “Visualisation” tabs;
- errors to record;
- related sessions.

Stations 5 and 6 include a prominent interleaved-sequence visual.

## Recall interaction

Support:

- short official-video replay followed by a “what comes next?” or rule question;
- shuffled station cards reordered by drag-and-drop, with tap-to-swap as an accessible
  phone fallback;
- random rule multiple choice;
- guided text/audio-style visualization using on-screen text (no generated audio required
  in V1);
- unprompted timer and self-check.

Never instruct physical blindfolded performance.
Do not use “read the list” or “recite the circuit” as a complete exercise. Break recall
into small interactions with immediate feedback. Include exactly one such game inside
each police session and do not append a second memory test at the end.

## Session screen

Every police session answers:

- Which station(s) does this train?
- Is it exact, approximation, or mental?
- Why today?
- What counts as clean?
- What should be recorded?

Completion forms are type-specific:

- police: fidelity, outcome, errors, station splits/notes, effort, confidence;
- CrossFit class: duration, supplied emphasis, effort, overlap tags, notes;
- room explosive: work/recovery duration, repetitions, movement quality, effort,
  optional peak and one-minute recovery heart rate, notes;
- outdoor intervals: completed repetitions, work/recovery duration, speed quality,
  effort, optional heart-rate response, distance and notes;
- memory: recall scores and prompt use.

For station 2, allow the user to record the height/type of a lower stable substitute and
fear before/after. For station 4, record the lighter dragged object and approximate load
when known. For balance-board exercises, show a nearby-support safety cue and clearly
label the work as proprioception/support rather than exact station completion.

Do not show pace and D+ fields for a balance or strength station unless relevant.

## Activities

Use neutral source labels: Manuel, Démo, Importé. There is no Garmin button or logo.
Filters: Tout, Police, Salle, Course, Mémoire.

## Settings

Include:

- training weekdays, fixed Monday CrossFit, and the separate room-session schedule;
- equipment/facility availability;
- personal target time;
- Google Drive and local export;
- guarded plan-update import;
- feedback screenshot preference;
- data reset/export.

Exclude trail region, trail catalogue, Garmin, and future integration teasers.

## Empty/error/offline states

Test each screen with no attempts, unknown equipment, variable room day, no exact-room
access, offline mode, long text, enlarged text, and migration from V1. Lack of exact-room
access is a normal supported state, not an error.
