# CHANGE_REQUEST_009 — Navy and sand theme, one grammar for every block

Direction: Training brain → App code. Date: 13 September 2026 (v2 the same evening: section D added). Author: the athlete + Claude.
Status: **open**. Order: after CR-008, before CR-001. Own session. Independent of the engine.
Kind: infra (visual + data shape) · **Tier: MID**

## Read first
`handoffs/00_COCKPIT.md` section 9, `handoffs/00_AGENT_ROUTING.md`, then the inputs below.
State the tier of this request in your first reply and say if the model you run on does not match.

## Why

Every block is one paragraph mixing five things: goal, dose, official rule, rest, what to
record. On a phone during a session the athlete needs the dose and the rule in one glance.
Rigor stays: nothing is removed, everything gets a fixed slot. Colours: the athlete wants a
calmer, minimal look in navy and sand.

## Inputs

| File | Ids | What |
|---|---|---|
| `handoffs/WEEK_1_FINAL_2026-09-07_to_13.md` v3 | Thu, Fri, Sat | source text to split into the four slots |
| `02_Training_brain/exercise_cards/_TEMPLATE_exercise_card.md` v2 (Cowork updates it first) | fields `faire`, `regle`, `noter`, `details` | the same four slots in the card template |

## Expected behaviour after the change

### A. Block grammar (data shape + renderer)

Every block in a session recipe has these fields, rendered in this order:

```
 n · <title> · <station tag> <min> [S1] when an official rule applies
 ───────────────────────────────────────────────────────────
 FAIRE dose as numbers: sets × time, reps, pace, rest
 RÈGLE the official rule in one line (only when there is one)
 NOTER what to record after the block
 ▸ détails set-up, approximation label, why, safety (collapsed by default)
```

- `faire` is mandatory. `regle`, `noter`, `details` are optional; an empty slot is not rendered.
- The sentence "Ces exercices développent les qualités du circuit. Ils restent des approximations…"
  appears once per session (in the session details), not once per block.
- The one-line session intent (e.g. "Confiance au poste 2, mémoire du circuit…") moves into the
  session details.
- Existing Week 1 block text is split into the four slots without changing a word of the
  sport content; the coder maps: dose sentence → `faire`, "Règle officielle (S1)…" → `regle`,
  "Record / Noter…" → `noter`, the rest → `details`. Any sentence the coder cannot place
  goes to `details` and is listed in the report.

### B. Day header

```
 VEN 11 · Technique police · 40 min
 échauffement 5 → mémoire 4 → poste 2 · 8 → raquette 5 → AMRAP 10 → poste 8 · 5 → calme 2
 matériel: échelle · 5 balles · boîte · raquette · repères
 ▸ 7 blocs
```

- The flow strip is generated from the block titles and durations (short labels: the first
  two words of the title, or a `short` field when present).
- Equipment is rendered as one line of chips.
- The "Proposée" chip is replaced by a small status dot (proposed · done · partial · skipped).

### C. Theme, tokens only

```
 --navy #14213D text, header logo, week banner, active tab, save button
 --ink #2C3E5A secondary text
 --sand #F3EDE3 page background
 --dune #E6DBC7 card border, progress track, chips
 --white #FFFFFF cards
 --gold #C8A96A the only accent: done state, progress fill
```

- Header: logo and "Copie locale" on one line; the hero ("La qualité avant la vitesse" and
  the sentence below) is removed.
- Week banner: thin, navy text on sand, no dark block.
- Cards: white, 1 px dune border, no shadow, one font family, two weights.
- Tabs: navy on white, icon + word.
- `theme-color` meta and the PWA manifest colours updated to navy and sand.
- Light theme only; no dark mode.

### D. Feedback form layout (bug seen on the phone, 13 Sep)

On a phone width the label of a field wraps up beside the previous field's box, so
"Dénivelé D+" appears next to the Distance box and "Durée (min)" next to the D+ box. The
athlete typed her D+ into Distance because of it.

```
 today (phone)                        after
 Distance (km)                        Distance
 [ 172 ]                              Dénivelé D+  [ ______ km ]
 [ 51  ]                              Durée (min)
 [     ]                                           [ ______ m ]
                                       Durée
                                                    [ ______ min ]
```

- Every label on its own line above its box; boxes full width; never two fields on one row.
- The unit is shown inside the box as a suffix or placeholder (km, m, min, m for interval
  distances), not only in the label.
- "facultatif" becomes a lighter placeholder inside the box, not a separate line.
- Same rule for the Friday record fields (memory errors, ball fumbles, racket drops R1/R2/R3,
  AMRAP rounds) and the Tuesday interval distances.

## Tests that must pass

- [ ] at 375 px width, every feedback label sits directly above its own box (screenshot in the report)
- [ ] every block in Week 1 renders a `faire` line; no block text is lost (word count of the
  four slots per block ≥ word count of the old paragraph minus the once-per-session sentence)
- [ ] `week1.test` from CR-008 still passes (content equality on the new fields)
- [ ] the flow strip of Friday 11 reads: 5 → 4 → 8 → 5 → 10 → 5 → 2 (minutes)
- [ ] Lighthouse accessibility: text contrast ≥ 4.5:1 for navy on sand and ink on white
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm build` pass; deployed page shows the theme

## Out of scope

Generator, rules, Weeks 2-11 content, feedback form fields, Drive sync, dark mode, any new
component beyond the four slots and the flow strip. Any sporting decision: an ambiguous
sentence goes to `details` and to the report, never to a guess.

## Deliverable back

`handoffs/APP_REPORT_009.md`: the recipe schema after the change, the mapping table of the
Week 1 blocks (old paragraph → four slots), two screenshots (week view, one session open),
commit hash and tag `cr-009`.
