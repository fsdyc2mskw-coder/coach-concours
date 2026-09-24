# CHANGE_REQUEST_013 v2: the season table, week 4 content, and the answers to APP_REPORT_013

Direction: **Training brain → App code.** Written in Cowork. Read by the coder (the athlete's Claude Code session).
Date: 23 September 2026 (afternoon edition) · Author: the athlete + Claude · Status: open · **Tier: TOP**
Version 2 of CR-013. v1 (22 Sep) is merged (PR #7, tag `cr-013`) and archived in Drive
`90_Archive/`. This v2 replaces the morning draft of v2 (never implemented, archived).
Own session, one request per session. Branch: `cr-013-v2-season-table`. Kind: engine data + small UI.
**Should be merged before Monday 28 September**, the start of week 4. Comes after CR-017 (urgent).

## Read first

`CLAUDE.md`, `handoffs/00_COCKPIT.md` section 9, `handoffs/00_AGENT_ROUTING.md`,
`handoffs/APP_REPORT_013.md` (your own questions Q1-Q8), then only the files listed under
"Inputs". State the tier in your first reply and say if the model you run on does not match.

## Why

CR-013 built the two session shapes but, correctly, invented nothing for weeks 4 to 11, so
every week repeats week 3. On 23 September the athlete fixed the whole season in one table and
built week 4 with Claude. This request puts the table and the week 4 content into the app and
answers the eight questions of APP_REPORT_013. **Design goal: data, not new machinery.**

## Inputs

| File (Drive `02_Training_brain/` or `03_Weekly_plans/`, copy into `handoffs/`) | version |
|---|---|
| `rules/season_plan.md` | v2, THE TABLE |
| `rules/weekly_shape.md` | v6 |
| `rules/memory_modules.md` | v2 |
| `03_Weekly_plans/WEEK_4_PLAN_2026-09-28.md` | the week 4 content, block for block |
| `exercise_cards/00_INDEX.md` + `S00_broad_jumps.md` + `S01_hill_sprints.md` + `S09_balance_ladder.md` + `S10_block_switch_fresh.md` v2 | 23 Sep |

Precedence: the week 4 plan file wins for week 4; `season_plan.md` wins on any number for a
week; `weekly_shape.md` v6 wins on a session's structure; the two locked week 3 files win for
week 3, which must not change.

## A. One constant: `SEASON_PLAN`

In `src/coach/sessionShapes.ts`, replace `SKILL_FOCUS_BY_WEEK`, `WEEK3_CARDIO_MIN`,
`CARDIO_MIN_FROM_WEEK_4` and `cardioDurationForWeek` with a typed transcription of the table:

```ts
export type FocusStation = 1 | 8 | 10 | 11 | 'W8_WORST' | 'LIGHT';
export type ChainKind = 'locked' | 'chain_A' | 'chain_B' | 'ghost' | 'ghost_walk';
export type TailSkill = 'racket' | 'balance' | 'none';

export interface SeasonWeek {
  week: number;              // 3..11
  load: 1 | 2 | 3 | 4 | 5;   // the week bar
  focus: FocusStation;
  cardioMin: number;         // R-WS-32
  powerJumps: 0 | 3 | 5;     // R-WS-41, S00_broad_jumps
  memory: 'LOCKED' | 'M1' | 'M2' | 'M3' | 'M4';
  chain: ChainKind;
  ghostStations?: [number, number];
  tails: TailSkill;
  runKm: [number, number] | 'RACE' | null;
  hillSprints: 0 | 6 | 8 | 10;
  baseline: boolean;         // only week 3 (CR-017)
  buildWeek: boolean;        // R-SP-04
}
```

```
 wk load focus  cardio power memory chain        tails    run        hill base  build
 3  3    8      10     0     LOCKED locked       racket   [8,9]      0    YES   no
 4  4    11     12     3     M1     chain_A      balance  [10,11]    0    no    yes
 5  2    10     10     3     M2     chain_B      balance  RACE       0    no    no
 6  2    8      12     3     M2     chain_B      balance  [7,7]      0    no    yes
 7  4    1      13     5     M3     ghost [1,6]  racket   [7,8]      6    no    yes
 8  5    10     15     5     M3     ghost [6,11] racket   [7,8]      8    no    yes
 9  5    W8     15     5     M4     ghost [1,11] racket   [7,8]      10   no    yes
 10 3    W8     12     5     M4     ghost [1,11] racket   [7,7]      6    no    no
 11 1    LIGHT  6      0     M4     ghost_walk   none     null       0    no    no
```

## B. Content as data, written once and reused (R-SP-05)

```
 SKILL_BLOCKS[station]   station 8  = week 3's locked skill block, moved here unchanged
                         station 11 = the week 4 racket block (from the week 4 plan file)
                         1, 10: arrive later as data-only versions of this request
 CHAIN_BLOCKS[kind]      locked = week 3 · chain_A = the week 4 chain (plan file)
                         chain_B, ghost: placeholders until written
 TAILS[skill]            racket = week 3 tails · balance = S09_balance_ladder
                         (reference = its min 2 and min 4 · tail A = its min 3, 30 s,
                         switch leg each round · tail B = its 4 minutes, 20 s between)
 CARDIO_BY_WEEK[week]    3 = locked · 4 = the two week 4 blocks (plan file)
                         a week with no entry reuses the previous entry, removes any atom
                         of the focus station, and flags "atomes à remplacer"
```

## C. What the generator does

```
 skill block   station = focus → SKILL_BLOCKS; no entry or 'W8_WORST' → placeholder (D)
 cardio        durationMin = cardioMin; atoms from CARDIO_BY_WEEK (above)
 power slot    warm-up text gains "puis N sauts en longueur, réception tenue, retour
               en marchant" (N = powerJumps). No score.
 memory        modules = [memory] in both police sessions from week 4. The skill
               session's memory block gains a scored drill: measure 'recall_errors',
               label "Erreurs de rappel sur 33" (R-MM-04). CR-018 will replace this
               with the memory game.
 chain, tails  from CHAIN_BLOCKS and TAILS; placeholders where marked
 weekend run   trail_maintenance shows runKm; hillSprints > 0 adds a last block
               "Côtes : N sprints de 8 à 10 s, retour en marchant" (reps done only)
 week 11       no chain session. The skill session moves to WEDNESDAY 18 Nov and becomes
               the taper session: memory M4 · placeholder "Passage fantôme au pas" 15 min
               · cardio 6 · no tails. Nothing on Thursday 19 Nov.
 load          the week bar reads `load`
```

## D. Placeholders (R-SP-03)

`placeholderBlock(kind, label)`: the right `kind`, no drills, no score boxes, the label in the
title, the line "À construire dans Cowork". Never copies content from another week. Counts as
the block for the validators (R-SP-06).

## E. Answers to APP_REPORT_013 (sporting decisions, made in Cowork)

```
 Q1 fresh only     WITHDRAWN. Every atom may be used in a cardio block (R-WS-29 v6).
                   Keep the check that excludes the week's skill station; delete the
                   freshOnly check and the freshOnly field (or leave it false everywhere).
                   Add S00_broad_jumps (role 'P'), S01_hill_sprints (role 'C'),
                   S09_balance_ladder (role 'A', station 9) to exerciseCards.ts.
 Q2 cardio doses   the cardioMin column. R-WS-33: build weeks never decrease.
 Q3 skill load     the skill session becomes 'moderate' (was 'low').
 Q4 memory         one memory block per police session, at the start. Drop count-of-four.
 Q5 rotation       the focus column + SKILL_BLOCKS + placeholders.
 Q6 intervals      a police cardio block is never running intervals. CR-014's C4 flag can go.
 Q7 scope          "one cardio block" binds the police sessions only.
 Q8 round time     keep as implemented.
```

## F. Text fixes

The trail race is **Sunday** 11 October: fix "samedi 11 oct." in
`src/data/runIntervalsProgression.ts` and anywhere else.

## Tests that must pass

- [ ] `SEASON_PLAN` reproduces the table above cell for cell
- [ ] week 3 fixtures still reproduce the two locked sessions block for block
- [ ] week 4 reproduces `WEEK_4_PLAN_2026-09-28.md` block for block (a new fixture)
- [ ] both police cardio blocks of each week last `cardioMin`; build weeks never decrease
- [ ] the skill block station equals `focus` in weeks 4-8; weeks 9-10 show a placeholder
- [ ] no cardio atom belongs to the week's focus station; W7 shows "atomes à remplacer"
- [ ] a skipping atom may appear in a cardio block (no freshOnly exclusion left)
- [ ] tails never use the focus station; weeks 4-6 use S09_balance_ladder
- [ ] every placeholder has no score box and no week 3 text
- [ ] the power slot appears in both police warm-ups exactly when powerJumps > 0
- [ ] the skill memory block carries a `recall_errors` drill from week 4
- [ ] the skill session load is 'moderate'
- [ ] week 11: taper session Wed 18 Nov; nothing Thu 19 Nov; no chain session; test Fri 20 unchanged
- [ ] weekend runs of W7-W10 carry the hill sprint block with the right count; W5 is the race, Sunday
- [ ] no text says the race is on a Saturday; nothing predicts an official time
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm build` pass

## Out of scope

The baseline fields (CR-017). The memory game (CR-018). Drive sync. CR-014's day-move layer.
Adaptation rules. Any sporting decision: write the question in the APP_REPORT. Never invent a
drill, a dose or a substitute atom.

## Deliverable back

`handoffs/APP_REPORT_013_v2.md`, ending with the commit hash. Pull request titled
`CR-013 v2 season table`. Do not merge, do not tag: the athlete merges, then publishes the tag
`cr-013-v2` on the merge commit. Never a person's name, e-mail, hostname, device name or
personal folder path.
