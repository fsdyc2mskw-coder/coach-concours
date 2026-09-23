# CHANGE_REQUEST_017 v2: URGENT, this week's baseline in the app

Direction: **Training brain → App code.** Written in Cowork. Read by the coder (the athlete's Claude Code session).
Date: 23 September 2026 (afternoon) · Author: the athlete + Claude · Status: open · **Tier: TOP**
Version 2. The morning v1 (a test battery in weeks 4, 8, 10) was never implemented and is
archived: the athlete decided the same afternoon on ONE baseline only, this week.
**URGENT: first in the queue, ship today or tomorrow.** Baseline 1 is trained today (Wed 23 Sep),
baseline 2 on Sunday 27 Sep. Own session, one request per session, own branch: `cr-017-baseline`.
Small on purpose: no engine change. Kind: persistence + one small screen.
CR-014 v3 is merged (PR #8, e6eab41): the athlete moves this week's sessions to the days she
really trains them herself, by drag. This request does not touch days.

## Read first

`CLAUDE.md`, `handoffs/00_COCKPIT.md` section 9, `handoffs/00_AGENT_ROUTING.md`, then only
the files under "Inputs". State the tier in your first reply.

## Why

The athlete's weak points are explosiveness and high-intensity stamina. The circuit can never
be timed, so a one-off baseline of three cheap tests is the reference Cowork reads her session
feedback against. There is no re-test: the app records the baseline once and shows it.

## Inputs

| File | version |
|---|---|
| `02_Training_brain/rules/test_battery.md` | v2 (R-TB-01 to R-TB-05) |
| `03_Weekly_plans/WEEK_3_BASELINE_WEEK_2026-09-23.md` | the reshaped week 3 |

## A. Where the baseline sits

```
 the week 3 skill session gains a block kind 'baseline' right after the warm-up:
 (trained Wed 23 Sep) broad jump, 20 m sprint
 the week 3 trail run gains a block kind 'baseline' after the warm-up:
 (trained Sun 27 Sep) the 6-min run, then "course facile, environ 8-9 km au total"
 no other session, in any week, carries a baseline block (R-TB-01)
```

Attach the blocks by **session id**, never by date: the athlete moves these sessions with
CR-014, and the baseline must follow them. The fields must accept values on a past session,
like every other Retour field.

## B. Stored, and computed

```ts
// SessionResult, all optional (schemaVersion stays 2)
broadJumpCm?: number[];   // up to 3 attempts
sprint20mS?: number[];    // up to 3 attempts, two decimals
sixMinRunM?: number;
```

```
 computed, never typed    best jump = max · best sprint = min · VMA km/h = sixMinRunM / 100
```

## C. One card on the Parcours tab: "Référence"

```
 RÉFÉRENCE, semaine du 21 septembre
 Saut en longueur     212 cm
 Sprint 20 m          4.12 s
 6 minutes            1 040 m · VMA 10.4 km/h
```

Recorded values only. No target, no arrow, no comparison with anyone, no predicted time
(R-TB-04). Before the baseline block, show: "Mêmes chaussures, même surface, heure semblable,
même méthode de chronométrage."

## Tests that must pass

- [ ] only the week 3 skill session and the week 3 trail run carry a baseline block
- [ ] after a CR-014 move of either session, the baseline block and its values follow it
- [ ] the week 3 fixtures are otherwise unchanged block for block
- [ ] the fields accept values on a past session
- [ ] best jump, best sprint and VMA are computed; no stored field for any of them
- [ ] the Référence card shows only recorded values, no target word
- [ ] a moved session (CR-014) keeps its baseline results bound to it
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm build` pass

## Out of scope

The pace-zone review (Cowork, R-TB-05). Anything in CR-013 v2 or CR-018.

## Deliverable back

`handoffs/APP_REPORT_017.md`, ending with the commit hash. Pull request titled
`CR-017 baseline`. Do not merge, do not tag: the athlete merges, then publishes the tag
`cr-017` on the merge commit. Never a person's name, e-mail, hostname, device name or
personal folder path.
