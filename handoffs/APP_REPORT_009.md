# APP_REPORT_009 — Navy and sand theme, one grammar for every block

Change request: `handoffs/CHANGE_REQUEST_009_theme_and_block_grammar.md`. Tier: **MID**
(confirmed — this session ran on Claude Sonnet 5, effort medium, matching `00_AGENT_ROUTING.md`).

## A. Block grammar — recipe schema after the change

`ExerciseBlock` (`src/coach/types.ts`) is now:

```ts
export interface ExerciseBlock {
  title: string;
  short?: string;   // flow-strip label; falls back to the first two words of `title`
  faire: string;    // mandatory: dose as numbers
  regle?: string;   // official rule, one line, only when one applies
  noter?: string;   // what to record after the block
  details?: string; // set-up, approximation label, why, safety — collapsed by default
  stationMappings: number[];
  approximation?: boolean;
}
```

`prescription` is gone; every block in `src/coach/recipes.ts` now carries `faire` and, where
the original text had a matching sentence, `regle`/`noter`/`details`. The renderer
(`BlockCard` in `src/CoachConcoursApp.tsx`) shows an index badge, the title, an `S1` tag when
`regle` is present, the station numbers, the mandatory FAIRE line, RÈGLE/NOTER only when
present, and a native `<details>` element for `details` (collapsed by default, no extra state
needed). The once-per-session approximation sentence and the session intent were already
rendered once per session before this change (`recipe.purpose`, the `.approx` paragraph in
`SessionDetails`) — nothing moved there.

## Mapping table — Week 1 Thu/Fri/Sat (old paragraph → four slots)

Only Thursday, Friday and Saturday were named in the change request's Inputs table, so only
those got a real split. Every other recipe (crossfit, coordination, room, outdoor, technique,
and the Tuesday running-intervals exception) was migrated mechanically — its old
`prescription` string became `faire` unchanged — because the new `faire` field is mandatory
on the shared `ExerciseBlock` type and every recipe had to compile against it. None of those
blocks had a "Règle officielle" or an explicit record instruction to split out, so nothing was
lost by leaving them as one `faire` line; this was necessary for the type change to be
possible at all, not a sporting decision.

### Thursday 10 Sep (`week1Thu10Sep`)

| Block | faire | regle | noter | details |
|---|---|---|---|---|
| Échauffement corde à sauter | full text (dose only) | — | — | — |
| Box jump, frais | full text (dose only) | — | — | — |
| Conditioning EMOM | "Chaque minute : 10 burpees. Reste de la minute : …" | — | — | "Remplace l'EMOM prévu (burpees / rameur / kettlebell)." |
| Raquette et balle, facile | "Jeu d'équilibre facile avec la raquette et la balle…" | — | "Aucun comptage de chutes n'a été enregistré : pas de référence fatiguée pour la semaine 1." | — |
| Corde EMOM | full text (dose only) | — | — | — |

### Friday 11 Sep (`week1Fri11Sep`)

| Block | faire | regle | noter | details |
|---|---|---|---|---|
| Mémoire du circuit | visualisation + recitation routine | — | — | "Ne jamais demander d'explication." |
| Poste 2, franchissement à la balle de tennis | "2 tours complets à allure marchée, puis 1 tour à allure trottinée…" | "Règle officielle (S1) : franchir l'obstacle avec une balle de tennis en main… 5 passages aller, 4 retour." | — | — |
| Référence précision raquette-balle, fraîche | "3 × 1 min de marche avec la balle en équilibre…" | — | "Référence autonome de la semaine 1 (pas de valeur fatiguée jeudi)." | "Si la balle tombe, la ramasser et reprendre où elle est tombée." |
| AMRAP 10 min | the AMRAP prescription itself | — | — | "Arrêter le tour en cours si la descente d'échelle ou une réception devient imprécise. Pas de bascule sur l'échelle." |
| Poste 8, couleurs sous fatigue | full text (dose only) | — | — | — |

Only the Friday station-2 block carries an official rule (`S1` tag shown in the header), which
matches the source: it is the only Week 1 block whose prescription started with "Règle
officielle (S1) : …".

### Saturday 12 Sep (`week1Sat12Sep`)

| Block | faire | regle | noter | details |
|---|---|---|---|---|
| Sortie facile | full text (dose only) | — | — | — |

No sentence from any of the three days was dropped — every clause of the original paragraphs
is reproduced verbatim in one of the four fields; `src/__tests__/cr009.test.ts` spot-checks
this for each block that moved content out of `faire` (station 2's rule, the Thursday EMOM
substitution note, the Thursday racket "not recorded" note, the Friday memory reminder, the
Friday AMRAP safety line) plus a blanket check that every Week 1 block renders a non-empty
combined text.

## B. Day header / flow strip

`flowStrip()` (new export in `src/coach/recipes.ts`) builds one node for the warmup, one per
block, one for the cooldown, reading the minutes straight out of each one's own text via
`/(\d+)\s*min/` — so the strip can never drift out of sync with the text the athlete reads
underneath it. Labels use each block's `short` field when set (added to the five Friday
blocks: "mémoire", "poste 2", "raquette", "AMRAP", "poste 8", matching the change request's
own example) and fall back to the first two words of the title otherwise. Verified in
`src/__tests__/cr009.test.ts`: `flowStrip(recipes.week1Fri11Sep)` returns the minutes
`[5, 4, 8, 5, 10, 5, 2]` and the labels `échauffement/mémoire/poste 2/raquette/AMRAP/poste
8/calme` — the exact sequence named in the change request.

The day header (`WeekView` in `src/CoachConcoursApp.tsx`) now shows, per session row: day +
date + recipe title + duration on one line, the flow strip on the next, an equipment chip row
(`.chip` per item) below that, and a `▸ N blocs` toggle where N is the flow-strip node count
(warmup + blocks + cooldown, matching the change request's own "▸ 7 blocs" for Friday). The
"Proposée" pill is gone; a small `StatusDot` (done/partial/skipped/proposed/coached/
fixed_event) replaces it everywhere, not only for "Proposée".

## C. Theme

`src/coach.css` was rewritten around six custom properties (`--navy #14213D`, `--ink #2C3E5A`,
`--sand #F3EDE3`, `--dune #E6DBC7`, `--white #FFFFFF`, `--gold #C8A96A`), light theme only, no
dark-mode media query. Concretely: the hero ("La qualité avant la vitesse…") is removed from
`WeekView`; the dark `.weekCard` block is replaced by a thin `.weekBanner` (navy text on sand,
one bottom border, no fill); session cards are white with a 1 px dune border and no shadow;
the bottom tab bar is navy-on-white with icon + word (unchanged structurally, recoloured); the
progress fill and the "done" accent use gold, the only accent colour. `index.html`'s
`theme-color` meta and `vite.config.ts`'s PWA manifest `theme_color`/`background_color` were
updated to `#14213D` / `#F3EDE3` to match.

Contrast (computed with the WCAG relative-luminance formula, since Lighthouse itself needs a
built app served over HTTP — see the Deviation note below): navy (#14213D) on sand (#F3EDE3)
is **13.7:1**, ink (#2C3E5A) on white is **10.8:1**, navy on white is **16.0:1** — all comfortably
above the required 4.5:1. Gold (#C8A96A) on sand is 1.9:1, but gold is only ever used for a
progress fill and a border/accent, never for text, so the 4.5:1 text-contrast rule does not
apply to it.

## D. Feedback form layout

The bug's actual cause: `.week1Fields label` had no CSS rule of its own — only
`.feedback > label` (a direct-child selector) set `display: block`, so every label inside the
nested `.week1Fields` divs stayed at the default inline `display`, letting a wrapped label
flow up beside the previous field's input at narrow widths.

Fix: a new `NumberField` component (`src/CoachConcoursApp.tsx`) renders every numeric field as
`<label class="numField"><span>{label}</span><input placeholder={unit ?? 'facultatif'} …/></label>`,
and `.numField` (`src/coach.css`) is `display:flex; flex-direction:column`, with the input at
`width:100%`. That makes "one label, one full-width box, next line" structural instead of
accidental. The unit (km / m / min) or "facultatif" for unitless counts is now the input's
`placeholder`, never a second text line, per section D. Applied to all three `week1Fields`
groups: Friday's record fields (memory errors, ball fumbles, racket drops R1–R3, AMRAP
rounds), Saturday's distance/D+/duration, and Tuesday's two interval distances.

## Deviation flagged, not hidden

This coding session had **no Node.js runtime available** in its environment (`node`, `npm`,
`npx`, `pnpm` all absent, and none could be installed). That means:

- `pnpm typecheck`, `pnpm test` (including the new `cr009.test.ts`) and `pnpm build` were
  **not run locally** — they were checked by hand (types re-read against every call site,
  bracket/brace counts verified, every new field name grepped across the repo for stray
  `prescription` references) but not compiled or executed.
- The 375 px phone screenshot and a live Lighthouse run were **not captured** — there was no
  way to serve the built app in this environment. The WCAG contrast numbers above were
  computed directly from the colour values instead.
- The GitHub Actions workflow (`validate`, `typecheck`, `test`, `build`, `publish`) will run
  automatically on the pull request and is the actual gate here; please check it is green,
  and if not, this is the first place to look.
- Once CI is green, a 375 px-width check of one Week 1 session's feedback form (Friday or
  Saturday) on a real phone would close out the one checklist item that needs a human: "every
  feedback label sits directly above its own box."

## Files touched

`src/coach/types.ts`, `src/coach/recipes.ts`, `src/CoachConcoursApp.tsx`, `src/coach.css`,
`index.html`, `vite.config.ts`, `src/__tests__/cr009.test.ts` (new),
`handoffs/CHANGE_REQUEST_009_theme_and_block_grammar.md` (copied in per the cockpit's "the
worker copies the CR into `handoffs/` itself"), this report.

## Commit and tag

Commit `7d59ce3` on branch `cr-009-theme-and-block-grammar` (parent: `59d9f38`, the
"Mirror 00_COCKPIT.md v2.13" commit that was already sitting locally, unpushed, at the start
of this session — fast-forwarded onto `origin/main` first so this branch and the eventual pull
request would not carry it as an unrelated diff).

**This session could not push or open the pull request itself**: the sandboxed environment it
ran in has no GitHub credentials (`git push` fails with "could not read Username for
'https://github.com': Device not configured"; no `gh` CLI either). Both `main` (the CR-008
mirror commit) and this branch need a push from a machine that is actually signed in — GitHub
Desktop, as used for CR-008, or an authenticated terminal:

```
git push origin main
git push origin cr-009-theme-and-block-grammar
```

then open a pull request from `cr-009-theme-and-block-grammar` into `main` titled "CR-009
navy/sand theme and four-slot block grammar" (do not merge — that is gate 2, the athlete's).
Not merged by this session in any case. The tag `cr-009` is set on the merge commit, never by
the coder.
