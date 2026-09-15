# CHANGE_REQUEST_010 — Screens rebuilt from the approved mockup (v2)

Direction: Training brain → App code. Date: 14 September 2026 (v2, replaces v1 of the same morning).
Author: the athlete + Claude. Status: **open**. Order: after CR-001 and CR-002 unless the athlete
moves it first (screens only, no data change). Own session.
Kind: infra (screens, theme, feedback form) · **Tier: MID**

## Read first
`CLAUDE.md`, `handoffs/00_COCKPIT.md` section 9, `handoffs/00_AGENT_ROUTING.md`, then
**`handoffs/MOCKUP_CR010.html`** (open it in a browser: it is the specification, clickable),
then this file. State the tier in your first reply and say if the model you run on does not match.

## Why

The athlete reviewed the app after CR-009 and rejected the result as visually poor. She then
approved a mockup, screen by screen, on 14 September. This request asks for the app to look
and behave like that mockup. The rule for this request: **when the mockup and this text
disagree, the mockup wins**; when the mockup is silent, this text decides; when both are
silent, ask in the APP_REPORT, do not invent.

## Inputs

| File | What |
|---|---|
| `handoffs/MOCKUP_CR010.html` | the approved mockup: three phone frames (Semaine, Séance, Un bloc), clickable tabs Prévu · Fait · Retour, CSS tokens, fonts |
| the app after CR-009 | `ExerciseBlock` (faire / regle / noter / details), `flowStrip()`, `StatusDot`, `NumberField`, `SessionResult` |
| `02_Training_brain/rules/adaptation.md` Level 1 | the feedback fields; their names and types do not change |

## Expected behaviour after the change

### A. Theme (replaces the navy + sand of CR-009)

Tokens exactly as in the mockup `:root`: `--bg #0A0B0E`, `--card #15171C`, `--card2 #1D2027`,
`--line #262A33`, `--text #F2F3F5`, `--sub #9AA0AC`, `--mute #5E646F`, `--accent #3CE0A1`,
`--accent-ink #0A0B0E`, `--accent-dim rgba(60,224,161,.14)`, intensity colours `--low #3CE0A1`,
`--mid #F5B54A`, `--high #F0655A`. Fonts: Plus Jakarta Sans (display, 700/800) and Manrope
(body), loaded from Google Fonts with system fallbacks. Dark only; `theme-color` and the PWA
manifest colours follow `--bg`.

### B. Week screen (tab Semaine)

- Header block: kicker "Phase · semaine n / 11" in accent, a short title, one line with the
  weeks left to the trail and to the police test. No photo.
- Week switcher on one line (previous · Cette semaine · next), underline on the current one.
- "Séances k / n" + progress track with an accent dot at the current point.
- Day headers uppercase; today's header in `--text`, others in `--sub`.
- One card per session (mockup `.card`): tile with a kind icon (today: accent tile), three
  vertical intensity bars coloured by `load` (low = 1 bar accent, moderate = 2 amber,
  hard = 3 red), title, one line of subtitle (duration `mm:ss` · short hint), "···" at the
  right. A done session shows a check after its title.
- Rest days: one plain line "Repos", no card.
- Floating pill tab bar at the bottom (Semaine · Parcours · Drive) as in the mockup.
- Tapping a card opens the session screen. Nothing expands in place.

### C. Session screen, tab Prévu

- Top: round back button, centred title. Pill segmented control Prévu · Fait · Retour.
- Card "Ton programme": chips (⏱ `mm:ss`, ⚡ intensity word, ▤ n blocs), hairline, then the
  numbered steps (mockup `.steps`): number in accent, title, minutes right-aligned, chevron,
  and **one short `faire` line** (one or two sentences) under the title. When a block has an
  official rule, a pill "RÈGLE S1 · …" under the line. **No "noter" line** (removed 14 Sep).
- No "Conseil du coach" card (removed 14 Sep). The approximation sentence lives in the
  block screen details, once.
- Bottom action bar: two round buttons, "Retour de séance" (opens tab Retour) and
  "Séance faite" (opens tab Retour as well; the status is chosen there).
- Tapping a step opens the block screen (E).

### D. Tab Retour: the feedback form, grouped by block, saved as a draft

- Top line: "Brouillon enregistré · hh:mm · tu peux revenir à tout moment" with an accent
  dot; it updates on every save.
- One group per block that has something to record, in session order, with the block number
  in a small accent square and the block title (mockup `.grp`). Blocks with nothing to
  record (warm-up, cool-down, station 8 for now) have no group.
- Inside a group: the block's fields as full-width `NumberField`s (label above, unit or
  hint as placeholder). Racket drops: three boxes side by side (Tour 1 · 2 · 3). AMRAP:
  rounds as decimal text + a three-way choice for landings (propres · mixtes · sales).
- Last group "Toute la séance": status (Terminée · Partielle · Passée), effort 1-5 as five
  squares, note.
- **Saving**: every field writes to the state on change (debounced, same path as today, so
  Drive sync picks it up). Leaving the tab, closing the app or switching sessions never
  loses a value. A session with draft values but no status shows status `draft` in the
  data and "en cours" on the week card.
- Bottom action bar on this tab: "Plan" (back to Prévu) and "Valider la séance" (sets the
  status if none was chosen, then opens tab Fait). "Retirer cette validation" stays,
  secondary, at the very bottom of the form.
- Field names in `SessionResult` do not change. New fields only if a block in the mockup
  asks for one (hesitations at the obstacle: `obstacleHesitations`, integer, optional).

### E. Block screen (tap a step)

- Round back button, centred block title.
- Card "Résumé": chips (⏱ minutes, kind such as ↻ max de tours or ▤ 3 × 45 s, ⚡ HIIT when
  the block is the HIIT block).
- Card "Circuit" or "Exercice": two or three meta lines in `--sub` with the important words
  in a soft violet (mockup `.circ .meta b`), then one row per exercise or sub-step: a
  64 px tile with a pictogram, name, one line of dose. The official rule as a pill under the
  row it applies to.
- "À enregistrer dans Retour de séance": the block's fields as a read-only list, so the
  athlete knows what to count.
- Bottom bar: "Séance" (back) and "Retour de séance" (opens the form, scrolled to this
  block's group).
- Data: `faire` feeds the dose line; `regle` the rule pill; `details` the meta lines; the
  pictogram is chosen from a small fixed map (rope, ladder, box, ball, racket, cones, run,
  rest) with a neutral default.

### F. Tab Fait

- The saved result as a clean list (mockup `.kv`): status in accent, effort, each recorded
  field with its block name, date saved, "Synchronisé avec Drive · révision n".
- Bottom bar: "Modifier" (opens Retour) and "Voir le plan".

### G. Not touched

Data model beyond the one optional field above, storage, Drive sync, recipes content,
generator and rules, the Parcours and Drive tabs' content (they take the theme only).
No timer, no sounds, no photos, no nutrition, no watch export.

## Tests that must pass

- [ ] existing suites green (`week1`, `stations`, `calendar`, `persistence`, `sanitation`, `cr009`)
- [ ] `screens.test`: week renders one card per session and one "Repos" line per rest day for
  Week 1; session screen renders n numbered steps == blocks; each step shows its `faire`
- [ ] `retour.test`: typing in a field saves without pressing any button; reopening the
  session shows the value; the group list equals the blocks that declare record fields
- [ ] `SessionResult` written from Retour has the same field names as before (plus the
  optional `obstacleHesitations`)
- [ ] 375 px screenshots of the four screens in the report; no horizontal scroll; every
  label above its box
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm build` pass; deployed page checked after a hard reload

## Out of scope

Everything in section G. Any sporting decision: an ambiguity goes to the APP_REPORT with the
simplest reading applied.

## Deliverable back

`handoffs/APP_REPORT_010.md` with the four 375 px screenshots, the component list added and
removed, the mapping "mockup element → component", questions, commit hash. Pull request
titled `CR-010 screens from approved mockup`. The tag `cr-010` is set on the merge commit.
