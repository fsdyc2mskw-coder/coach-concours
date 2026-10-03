# APP_REPORT_018: the memory game (PLAN · ORDRE · QUI MANQUE · RÈGLES)

Change request: `handoffs/CHANGE_REQUEST_018_memory_game.md` (2 October 2026), copied from Drive
`04_App_handoffs` with its four inputs: `MOCKUP_CR018_assets.md`, `MOCKUP_CR018.pdf`,
`rules/memory_modules.md` v3 (replaces the v2 mirror) and `rules/floor_plan.md` v1 (new). All five
compared byte for byte with the Drive files; none read from `90_Archive/`.
Tier declared in the CR header: **TOP** (engine, UI and persistence). Run on Claude Opus 5.5 as the
routing asks, at medium effort instead of high: flagged in the first reply.
Branch `cr-018-memory-game`, cut from `origin/main` at `ed9cab0` with no upstream. Nothing merged,
nothing tagged, nothing pushed to `main`.

## Done, and not done

```
 DONE
 A  five screens from the mockup: MÉMOIRE home (new fourth tab) + PLAN, ORDRE, QUI MANQUE, RÈGLES
    pointer events (finger and mouse), touch-action: none on the game area, no timer, no sound,
    no streak, no saved progress inside a game
 B  MEMORY_CYCLE, cell for cell; one card per police session, weeks 5 to 11; weeks 3-4 unchanged
 C  memory block from week 5: "Mémoire · <card>", one line, [Jouer]; video line on the week's
    first police session after any day move; M4 line weeks 9-11; 4 min, 10 with M4
 D  measure memory_card { card, score, max } in the session's drill scores and Drive sync;
    a game from a session writes it into the Retour draft, free play writes nothing
    validator: R-MM-01/03/04/06 v3 from week 5, the v2 checks kept for week 4
    32 new tests, 286 in total, all green; typecheck, build and schemas pass

 NOT DONE
 ·  the deployed page: nothing is deployed before the merge. The production build was served
    locally and checked at 390 × 844 instead (see Verification)
 ·  pull request: see "Delivery" at the end
```

## 1. What changed

### A. The screens (`src/MemoryGame.tsx`, `src/coach.css`)

```
 0 MÉMOIRE     fourth tab of the bar (◈). "Semaine n", "Mémoire du parcours", the card due next on
               top (accent border), the three others under JOUER, "Pas de chrono." at the foot.
               SUITE and DÉROULER are not built.
 1 PLAN        room 640 : 944 with the door and the athlete bottom left, "▲ ENTRÉE · MOI" under
               it; 11 dotted boxes 62 × 62 at the floor-plan centres; tray of 11 tiles, 6 + 5, in
               the assets order. Drop within 42 px of a box centre snaps; a tile already there goes
               back to the tray; a drop elsewhere goes back to the tray; a placed tile drags again.
               Footer "n / 11 posés" · Recommencer · Vérifier. Vérifier colours each filled box and
               its tile green or red and shows "Score : n / 11".
 2 ORDRE       11 dashed lines 40 px high; tray of 11 tiles in 3 columns. Drag onto a line, the
               tile there goes back to the tray; a tap (moved < 6 px) puts a tray tile on the next
               free line. Footer "n / 11 placés" · Vider · Vérifier; green / red per line.
 3 QUI MANQUE  3 rounds; the 11 places in 2 columns with the gap as "?"; "Quel poste manque à la
               place N ?"; the 4 choices of the assets file in their order. After a choice: right
               one green, wrong pick red, gap revealed, "Juste." or "Pas tout à fait : c'est X.",
               the explanation, [Manche suivante]. End: score / 3 and [Rejouer].
 4 RÈGLES      10 pictures in order, progress bars on top, number + label, the assets SVG as it
               is, "✓ Correct" / "✗ Faux". After the answer: frame green / red, "Juste." /
               "C'était correct." / "C'était faux.", the explanation, [Image suivante].
               End: score / 10 and [Rejouer].
```

Every rule of play is a pure function in `src/coach/memoryGame.ts` (`placeTile`, `returnToTray`,
`planBoxCentres`, `snapBox`, `checkPlan`, `scorePlan`, `nextFreeLine`, `checkOrder`, `scoreOrder`,
`scoreMissing`, `scoreRules`, `rulesFeedback`). The screens only turn a pointer into those calls.

The game data (`src/coach/memoryGameAssets.ts`) is generated from `MOCKUP_CR018_assets.md`
(pictograms, box centres, door point, tray order, the 3 rounds, the 10 pictures with their SVGs)
and the first block of `cr018.test.ts` re-reads the assets file and compares every value.

### B. The cycle (`src/coach/memoryCycle.ts`)

`MemoryCard` and `MEMORY_CYCLE` exactly as section B writes them, plus the card maxima
(11 · 11 · 3 · 10), the two extra lines word for word, `memoryBlockMinutes()` (4, or 10 with M4)
and `memoryCardDrill()`. Kept in its own file because `recipes.ts` builds every recipe at load
time and the game module reads the planner, which would close an import loop.

### C. The memory block (`src/coach/sessionShapes.ts`, `src/CoachConcoursApp.tsx`)

```
 weeks 5-10   skill session   memory = MEMORY_CYCLE[w].skill card
              chain session   memory = MEMORY_CYCLE[w].chain card
 week 11      taper session   memory = PLAN + M4
 weeks 3-4    unchanged (live blocks, week 4 recall check out of 33)

 block   title "Mémoire · PLAN — 4 min" (the app's " — n min" suffix carries the length)
         faire "PLAN DU PARCOURS · Replace les 11 postes dans la salle."
         then, when they apply, "Regarde la vidéo officielle en entier (3 min 49)"
         and "Visualisation yeux fermés · 6 min · tout le parcours, sans aide"
         [Jouer] in the Prévu step and on the block screen opens that game
 spec    MemoryBlockSpec.game = { card, m4, video? }; modules = ['M4'] in weeks 9-11, else []
 drill   memory:<card>, measure memory_card, e.g. "PLAN · cases justes sur 11"
```

The video line cannot live in the recipe: one recipe serves the whole week and knows nothing of
day moves. `withMemoryVideo()` lays it on per session at read time, on the first session-shape
session of the moved week, the same way CR-017 lays on the baseline block.

Session lengths change with the block (4 min instead of 6, 10 instead of 6 with M4):

```
 date     session         before  after    date     session         before  after
 Wed 7    skill  PLAN       47     45      Thu 5    skill  PLAN+M4    53     57
 Thu 8    chain  ORDRE      50     50      Fri 6    chain  ORDRE+M4   57     61
 Thu 15   skill  QUI MANQUE 49     47      Thu 12   skill  QUI M.+M4  50     54
 Fri 16   chain  RÈGLES     51     51      Fri 13   chain  RÈGLES+M4  54     58
 Wed 21   skill  PLAN       51     49      Wed 18   taper  PLAN+M4    38     42
 Thu 22   chain  ORDRE      53     53
 Wed 28   skill  QUI MANQUE 53     51
 Thu 29   chain  RÈGLES     55     55
```

### D. Persistence (`src/coach/types.ts`, `src/coach/memoryGame.ts`)

```
 DrillMeasure  + 'memory_card'
 DrillScore    + card?: MemoryCard, max?: number   (value = the score)
 stored as     { drillId: 'memory:plan', measure: 'memory_card', value: 7, card: 'plan', max: 11 }
```

It travels in `SessionResult.drillScores`, so the existing autosave and Drive sync carry it with
no other change. Both new fields are optional: `schemaVersion` stays 2, no migration, and the
`recall_errors` scores of weeks 3-4 are left exactly as stored.

`withMemoryCardScore()` writes a finished game into the session's record: a draft is created when
there is none; an existing record keeps its status and every other number, and its previous game
score is replaced. The Retour tab shows the score in the memory block's box, editable before
validating; a number typed by hand is stored with the same card and max. The MÉMOIRE home passes
no session, so nothing is written (R-MM-07).

`validateV4PoliceSessions()` (planner): from week 5 the memory block must carry the cycle's card
(R-MM-03), a `memory_card` drill (R-MM-04), M4 exactly in weeks 9-11 (R-MM-06) and 4 or 10 min,
never above 12 (R-MM-01). The v2 checks (week module, recall check out of 33) now apply to week 4
only.

## 2. Substitutions (the mockup or the CR left these open)

```
 #  where           what I did                                       why
 1  home header     "SEMAINE n" only; no "· MODULE M2", no           memory_modules.md v3 retires M1-M3
                    "Cette semaine : quand un poste compte..."       as session content
 2  home, RÈGLES    no "M2" chip                                     same reason
 3  home footer     "Pas de chrono." only; not "Une erreur revient   the CR and R-MM say every game
                    plus tôt la fois suivante."                      starts fresh, nothing is kept
 4  home order      the card due next on top (first police session   the mockup shows week 5 with PLAN
                    of today's week with no game score yet, else     on top; this keeps that and
                    the week's skill card, else PLAN)                moves on to ORDRE after PLAN
 5  QUI MANQUE end  score / 3 and [Rejouer], like RÈGLES             the CR draws no end screen
 6  last round      button reads "Voir le score" (QUI MANQUE,        "Manche suivante" / "Image
                    RÈGLES)                                          suivante" would point nowhere
 7  PLAN / ORDRE    after Vérifier the board is locked and the       one score per game; Recommencer /
                    footer reads "Score : n / 11"                    Vider starts a fresh game
 8  from a session  "Score noté dans le retour de séance." under     so the athlete knows it went in
                    the score
 9  ORDRE tap       a tap on a tile already on a line does nothing   the CR defines the tap for the
                                                                     tray only
 10 trays           a placed tile leaves an empty slot in the tray   the other tiles do not jump
                                                                     under the finger
 11 room size       width min(100 %, room height fits the screen);   tray and footer stay on screen;
                    348 px wide on a 390 × 844 phone (mockup 366)    boxes stay 62 × 62
 12 box at a wall   shifted inside: s5 by 9 px (the assets file's    the assets file's own rule
                    example) and s7 by 0.2 px on a 540 px room
 13 icons           tab icon ◈; the four home-card icons drawn to    not in the assets file
                    look like the mockup's
```

## 3. Questions for the athlete and the Cowork chat

```
 Q1  The CR says "live before Thursday 8 October (first card of week 5)". In the app the week 5
     skill session, with PLAN and the video line, is Wednesday 7 October; the engine chain
     (ORDRE) is Thursday 8. memory_modules.md labels the columns "SKILL (Thu) / CHAIN (Fri)",
     but the plan has them Wed / Thu in weeks 5, 7, 8 and Thu / Fri in weeks 6, 9, 10. The card
     follows the session shape, not the weekday. Right? (To play PLAN on Wednesday 7, the merge
     has to happen before then.)
 Q2  WEEK_5_FINAL block 2 (Wed 7 Oct) was "memory M2, 6 min, order + action + done-when out
     loud, recall check out of 33". CR-018 replaces it with the PLAN card, 4 min, so the session
     drops from 47 to 45 min and loses the /33 check. Applied as the CR says; confirm.
 Q3  Weeks 9-11: M4 now comes after the card (4 + 6 = 10 min) instead of being the 6-min block,
     so those police sessions grow by 4 min (engine chain week 9: 57 → 61 min). Intended?
 Q4  The mockup's footer promised "Une erreur revient plus tôt la fois suivante" (spaced
     repetition). Left out because nothing may be kept between games. Wanted later as a version?
 Q5  A game played from a session after the session is validated still replaces the stored game
     score (status untouched). Keep, or freeze a validated record?
 Q6  season_plan.md v2's memory column (M2, M3, M4) and weekly_shape.md v6 R-WS-12 (4-6 min) are
     now overridden by memory_modules.md v3 in the code, as the CR's precedence says; the rule
     files still need their v3 / v7 fold-in.
```

## 4. Files touched

```
 new   src/coach/memoryCycle.ts         cycle, maxima, labels, lines, the memory_card drill
 new   src/coach/memoryGame.ts          rules of play, scoring, video overlay, score recording
 new   src/coach/memoryGameAssets.ts    generated from MOCKUP_CR018_assets.md
 new   src/MemoryGame.tsx               the five screens and the pointer drag
 new   src/__tests__/cr018.test.ts      32 tests
 edit  src/coach/types.ts               memory_card, MemoryBlockSpec.game, DrillScore card/max
 edit  src/coach/sessionShapes.ts       game block from week 5; week 5 memory text removed
 edit  src/coach/planner.ts             R-MM v3 checks from week 5
 edit  src/CoachConcoursApp.tsx         tab, routes, [Jouer], lines, recording, Retour card/max
 edit  src/coach.css                    game styles (existing tokens only)
 edit  src/__tests__/cr013v2.test.ts    recall / module tests now week 4; taper and screen test
 edit  src/__tests__/cr013v3.test.ts    week 5 memory blocks, durations, W9-W10 slot 10 min
 new   handoffs/CHANGE_REQUEST_018_memory_game.md, MOCKUP_CR018_assets.md, MOCKUP_CR018.pdf,
       rules/floor_plan.md               copied from Drive 04
 edit  handoffs/rules/memory_modules.md v2 → v3, copied from Drive 04
```

The 7 updated older tests pinned the week 5-11 memory blocks that this CR replaces; each now says
so in a comment, and week 4 keeps its own checks.

## 5. Verification

```
 tsc -b                         pass
 vitest run                     17 files, 286 tests, all pass (254 before + 32)
 vite build                     pass
 validate-schemas               pass
 production build, served       390 × 844, in-app browser:
 locally                        · MÉMOIRE home renders as the mockup (minus 1-3 above)
                                · PLAN: real drag into Mannequin's box snaps; a drop away from
                                  the boxes returns to the tray; Vérifier: green, red, 1 / 11
                                · ORDRE: two taps fill lines 1 and 2
                                · QUI MANQUE: wrong pick red, answer green, feedback lines
                                · RÈGLES: picture 1 as drawn
                                · week 5 Wed skill session: "Mémoire · PLAN — 4 min", card line,
                                  video line, [Jouer]
```

The in-app preview launcher still cannot start from the project folder (macOS refuses it access);
the build was copied to a temporary folder and served from there for the check. After the merge,
the deployed page needs one look on the phone; the "Nouvelle version disponible" banner (CR-015)
brings the new build in with "Recharger".

## 6. Seen, not fixed (out of scope)

```
 ·  scripts/validate-repository.mjs reports 10 broken relative links to ../VALIDATION_REPORT.md
    in docs/ (already on main; not a CI step)
 ·  in the Prévu tab, "Séance faite" renders as a wide green block: the global .primary rule also
    matches button.act.primary (already on main)
```

## Delivery

The branch is committed locally. `git push` is refused on this machine (no GitHub credentials),
so the athlete publishes `cr-018-memory-game` from GitHub Desktop; the pull request is then
titled `CR-018 memory game`. No merge, no tag: after the athlete merges, the Cowork chat
publishes `cr-018` on the merge commit.

Commit: `cc41d1f`
