# CHANGE_REQUEST_018: the memory game (PLAN · ORDRE · QUI MANQUE · RÈGLES)

<!-- template v5, 24 September 2026 -->

Direction: **Training brain → App code.** Written in Cowork. Read by the coder (the athlete's Claude Code session).
Date: 2 October 2026 · Author: the athlete + Claude · Status: open
Order: after CR-015 v3 is merged. Never at the same time as another open branch that touches the
session generator (CR-013 v3). Should be live before **Thursday 8 October** (first card of week 5).
Own session. Branch: `cr-018-memory-game`, cut with no upstream:
`git switch --no-track -c cr-018-memory-game origin/main`
Kind: engine + UI + persistence (a new measure) · **Tier: TOP** (Opus, effort high)

## Read first

`CLAUDE.md`, `handoffs/00_COCKPIT.md` section 9, `handoffs/00_AGENT_ROUTING.md`, then only the files
under "Inputs". State the tier in your first reply and say if the model you run on does not match.
**The mockup wins on any disagreement about how a screen looks or behaves.**

## Why

The athlete must arrive on 20 November knowing the 11 stations cold: where each one stands in the
room, their order, and the few rules that make a station fail. Reading lists did not work for her.
She designed, with Claude, four short games on the phone, played at the start of each police
session, one game per session. Each game gives a score, and the scores replace the weekly recall
check out of 33.

## Inputs (copy into `handoffs/` from Drive)

| File | Version | What it gives |
|---|---|---|
| `02_Training_brain/rules/memory_modules.md` | v3 (2 Oct) | the cycle, the scores, the video reminder, M4 (R-MM-01 … 07) |
| `02_Training_brain/rules/floor_plan.md` | v1 (2 Oct) | the canonical room plan |
| `04_App_handoffs/MOCKUP_CR018_assets.md` | 2 Oct | pictograms, plan positions, tray order, the 3 rounds, the 10 pictures (SVG) |
| `MOCKUP_CR018` (PDF export of the mockup canvas, attached by the athlete) | 2 Oct | the 5 screens as drawn |

Precedence: `memory_modules.md` v3 wins over the memory column of `season_plan.md` v2 and over the
4-6 min length of R-WS-12 (`weekly_shape.md` v6) until those files are updated.

## A. Screens (phone, 390 px wide, the app's dark single-accent design)

```
 0 MÉMOIRE (home of the game)   reached from the app's navigation and from a session's memory
                                block. Shows: PLAN, ORDRE, QUI MANQUE, RÈGLES as four cards.
                                Do NOT build "SUITE" or "DÉROULER" (shown greyed in the mockup).
 1 PLAN        room plan with the door + a small athlete figure bottom left; 11 dotted boxes
               (62 × 62) at the floor-plan positions; 11 tiles (pictogram + label) in a tray
               under the room, 2 rows, tray order from the assets file.
               Drag a tile: it follows the finger; dropped within ~42 px of a box centre it snaps
               into that box (a tile already there goes back to the tray); dropped elsewhere it
               goes back to the tray. A placed tile can be dragged again.
               Footer: "n / 11 posés" · [Recommencer] · [Vérifier]. Vérifier colours each filled
               box and its tile green (right station) or red (wrong one); score = right boxes / 11.
 2 ORDRE       11 numbered dashed lines (1 to 11, 40 px high) and a tray of 11 tiles (pictogram +
               label, 3 columns). Drag a tile onto a line; a tile already there goes back to the
               tray. A quick tap (moved < 6 px) puts the tile on the next free line.
               Footer: "n / 11 placés" · [Vider] · [Vérifier]. Green / red per line; score / 11.
 3 QUI MANQUE  3 rounds. The 11 stations in a 2-column list, in order, with one gap shown as "?";
               the question "Quel poste manque à la place N ?"; 4 choices. After a choice: the right
               one green, a wrong pick red, the gap revealed, "Juste." or "Pas tout à fait : c'est X.",
               the explanation line, then [Manche suivante]. Score = right answers / 3.
 4 RÈGLES      10 pictures, one at a time, progress dots on top, the station label above the
               picture, two big buttons "✓ Correct" / "✗ Faux". After the answer: frame green/red,
               "Juste." / "C'était correct." / "C'était faux.", the explanation, [Image suivante].
               End screen: score / 10 and [Rejouer].
```

No timer, no clock, no sound, no streak, no animation beyond the drag itself. Touch and mouse
both work (pointer events, `touch-action: none` on the game area). Every game starts fresh: no
saved progress inside a game.

## B. Which card in which session (R-MM-03, one constant)

```ts
export type MemoryCard = 'plan' | 'order' | 'missing' | 'rules';
export const MEMORY_CYCLE: Record<number, { skill: MemoryCard; chain: MemoryCard | null;
  video: boolean; m4: boolean }> = {
  5:  { skill: 'plan',    chain: 'order', video: true,  m4: false },
  6:  { skill: 'missing', chain: 'rules', video: false, m4: false },
  7:  { skill: 'plan',    chain: 'order', video: true,  m4: false },
  8:  { skill: 'missing', chain: 'rules', video: false, m4: false },
  9:  { skill: 'plan',    chain: 'order', video: true,  m4: true  },
  10: { skill: 'missing', chain: 'rules', video: false, m4: true  },
  11: { skill: 'plan',    chain: null,    video: true,  m4: true  }, // the taper session, Wed 18 Nov
};
```

Weeks 3 and 4 are unchanged: their memory blocks and the week 4 `recall_errors` drill stay as live.

## C. The memory block of a police session, from week 5

```
 title        "Mémoire · <card label>"
 content      one line naming the card + a button [Jouer] that opens that game
 video        when MEMORY_CYCLE[w].video and this is the week's FIRST police session (whichever
              shape comes first after any day move): one extra line
              "Regarde la vidéo officielle en entier (3 min 49)". Reminder only, nothing recorded.
 M4           when MEMORY_CYCLE[w].m4: a second line after the card,
              "Visualisation yeux fermés · 6 min · tout le parcours, sans aide". Not scored.
 duration     4 min, or 10 min with M4 (never above 12, R-MM-01)
 measure      'memory_card' (replaces 'recall_errors' from week 5): { card, score, max }
              max: plan 11 · order 11 · missing 3 · rules 10
```

When the athlete finishes the game opened from a session, the score is written into that session's
Retour draft as the `memory_card` value (she can still edit it before validating, like every other
number). Playing a game from the MÉMOIRE home records nothing (R-MM-07).

## D. Persistence

The new measure travels in the existing session feedback and Drive sync, like the other numbers.
Old data stays readable: `recall_errors` of weeks 3-4 is kept as it is; no migration rewrites it.
If the state schema needs a version bump, do it the way earlier requests did and describe it in the
APP_REPORT.

## Tests that must pass

- [ ] `MEMORY_CYCLE` reproduces the table above cell for cell
- [ ] weeks 5-10: the skill and the chain session each carry exactly one memory block with the
      right card; week 11: the taper session carries PLAN; weeks 3-4 unchanged
- [ ] the video line appears in the first police session of weeks 5, 7, 9, 11 only, also after a day move
- [ ] the M4 line appears in weeks 9-11 only; the block duration is 4 or 10 min, never above 12
- [ ] PLAN: snapping, displacement of an occupied box, back to the tray, check colours and score,
      against the floor-plan positions of the assets file
- [ ] ORDRE: drag onto a line, tap to the next free line, check colours and score
- [ ] QUI MANQUE: the 3 rounds, choices and explanations exactly as in the assets file; score / 3
- [ ] RÈGLES: the 10 pictures in order, answers and explanations exactly as in the assets file; score / 10
- [ ] a game opened from a session writes `memory_card` into that session's draft; a game opened
      from the home records nothing
- [ ] no game text explains the circuit (R-MM-02); nothing predicts a time; no timer anywhere
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm build` pass; the deployed page checked on a phone width

## Out of scope

SUITE and DÉROULER. The ghost circuit. Any change to weeks 3-4, to the cardio, skill, chain or tail
blocks, to `SEASON_PLAN` other than reading it. Any new question, picture or round: the content is
exactly the assets file. Any sporting decision: write the question in the APP_REPORT, do not guess.

## Deliverable back

`handoffs/APP_REPORT_018.md` in the repo (copied to Drive `04_App_handoffs/` by Cowork), ending
with the commit hash. Pull request titled `CR-018 memory game`. Never push to main, do not merge,
do not tag: the athlete merges on GitHub, then the Cowork chat publishes the tag `cr-018` on the
merge commit (routing v4, section 3b). Never a person's name, e-mail, hostname, device name or
personal folder path.
