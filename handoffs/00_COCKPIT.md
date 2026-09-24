# 00_COCKPIT, Coach Concours

> **Start here.** Single entry point, and **the only file in the root of the Drive folder**.
> Every agent and every human reads this, then works in exactly one folder. Version 2.29,
> 24 September 2026 (Thursday, afternoon). Previous versions archived in `90_Archive/`.
> **App up to date (v2.28)**: CR-017 (the baseline) and CR-013 v2 (the season table, week 4
> content) are both live on `main` since 24 Sep. Every delivered CR carries its tag; `cr-017`
> sits on `c9cc5db`, the one recorded exception (no merge commit, direct push).
> Only `main` is left on GitHub: the nine merged branches were deleted on 24 Sep.
> **App report answers (v2.29)**: the 12 questions of APP_REPORT_013_v2 and _017 are decided
> (`04/DECISIONS_APP_REPORTS_013v2_017_2026-09-24.md`, precedence 1 until folded into the rules
> at the week 5 build). Headlines: W9-W10 focus = racket (tails = balance); cardio written fresh
> each week; M4 = 6 min everywhere; Tuesday 4-min reps at about 90 % of VMA from W5; chain B
> built before Mon 5 Oct with no fallback; racket scored per set; no re-test line anywhere.
> **Gate 3 (v2.27)**: the tag is published by the **Cowork chat in the athlete's own
> logged-in Chrome**, after she confirms the merge (`06/00_AGENT_ROUTING.md` v4, section 3b).
> The merge stays hers. The chat never merges, never tags before the merge, never tags any
> commit other than the merge commit, and never uses the browser to push code or edit files.
> **One baseline, this week (v2.26)**: broad jump + 20 m sprint Wed 23 Sep, 6-min run Sun 27
> Sep; no re-test ever; feedback is read against it in Cowork. **Every atom may be used in
> cardio** except the week's skill station. **Week 4 planned** (`03/WEEK_4_PLAN_2026-09-28.md`).
> **Season fixed (v2.25)**: on 23 September the athlete rewrote the objective and fixed the
> season in ONE table, `rules/season_plan.md`: one row per week with skill focus, cardio
> minutes, power slot, memory module, chain type, tail skill, weekend run and baseline week.
> The app reads it as one constant (CR-013 v2, live).
> **The objective (v2.25)**: the circuit can never be recreated, so the plan trains and
> measures its parts: memory, skills, engine (explosiveness, repeat efforts, 6-min power),
> strength (Monday CrossFit only), fear and balance (on hold). The 6:15 stays the official
> rule, never tracked, never predicted.
> **No exact room, ever (v2.23)**: never a full mock test, never a predicted time (R-PC-04).
> **Root rule (v2.21)**: the root holds `00_COCKPIT.md` and numbered folders, nothing else.
> **Numbering rule (v2.18)**: only the Cowork chat gives a `CR-nnn` number, from the queue in
> section 5. A change after a delivered CR becomes the next version of the same number; its
> tag is `cr-nnn-v2`, `cr-nnn-v3`.
> **Sanitation rule (v2.9)**: no person's name, no e-mail, no personal hostname, device name,
> GitHub username or personal folder path in this file, in any handoff or in the repository.
> The person training is **the athlete**. This file is mirrored in the repo unchanged.
> **Coder rule (v2.20, gate 3 changed in v2.27, branch guard added in v2.28)**: a change
> request is implemented in the athlete's own Claude Code session, with the model of the CR
> tier, once she has said "implement CR-nnn" (gate 1). The coder cuts its branch
> `cr-nnn-short-title` **with no upstream**, opens a pull request, never merges, never tags,
> **never pushes to main**. The athlete merges on GitHub (gate 2) and tells the chat
> "merged CR-nnn"; the chat then publishes the tag on the merge commit in her Chrome and
> deletes the merged branch (gate 3). One request per session. Full text:
> `00_AGENT_ROUTING.md` v4.
> **Single-writer rule (v2.14)**: only the Cowork chat writes `00_COCKPIT.md` in Drive.
> **Two brains (v2.19)**: this cockpit holds the app and change-request state. The exercise
> library is built in the Cowork project ledger `claude/exercise-library-workflow.md`; what
> coders need from it is mirrored into Drive as the rules, the card index and the week plans.

## 0. Map of everything (one line per place)

```
 Coach Concours/                        root 1OPJLw74Z7jItJkH2HNtyZg6xwEnC0aPw
 ├ 00_COCKPIT.md                        THIS FILE, the only file in the root
 │
 ├ 01_Official_police_sources/          1WS0TOuvqp9SN_bB6GtakJmHRkhFzTeLY
 │   01_PARCOURS_11_stations_official PDF (S1, absolute for station facts)
 │   02_POLICE_TRAINING_PROPOSAL PDF (S2) · 00_README_sources.md (S3 demo video link)
 │
 ├ 02_Training_brain/                   19X9XMGilQHKZN0NOwI6ZBUiotdqu3AHE
 │   PERSONAL_BASELINE.md v2            objective, weaknesses, equipment (23 Sep)
 │   rules/                             1yQes5IkFa74EWvNU23wUuPi_KwtlCC3U
 │     00_how_rules_work v3 · season_plan v2 (THE TABLE) · phase_calendar v4
 │     weekly_shape v6 · test_battery v2 (the baseline) · memory_modules v2
 │     run_intervals_progression v3 · selection v2 · adaptation v2
 │   exercise_cards/                    1b1qwVtsLsSDZcwdW0ELKbgPuIsm7ls81
 │     _TEMPLATE_exercise_card v2 · 00_INDEX (23 Sep) · one file per card
 │     (S00 x6, S01 x4, S03 x2, S08 x3, S09 x1, S10 x1 usable + 1 unconfirmed, S11 x3)
 │     GC_ghost_circuit_PLACEHOLDER (not a card)
 │
 ├ 03_Weekly_plans/                     1hXYrehXTYK2SNpyU-CUgdi0TNgNY0RoU
 │   WEEK_1_FINAL · WEEK_1_NOTES · WEEK_2_NOTES · _TEMPLATE_WEEK_n_REVIEW
 │   WEEK_3_SKILL_SESSION_2026-09-22 · WEEK_3_CHAIN_SESSION_2026-09-22 (locked)
 │   WEEK_3_BASELINE_WEEK_2026-09-23 (the reshaped week) · WEEK_4_PLAN_2026-09-28
 │
 ├ 04_App_handoffs/ ↔ repo handoffs/    1ahFam1QNdgEvwt0SEFib4l0BuJ3K2DTR
 │   CHANGE_REQUEST_001 … 017 (013 at v2, 014 at v3, 015 at v3, 017 at v2)
 │   APP_REPORT_003 … 014 · APP_REPORT_013_v2 · APP_REPORT_017 · MOCKUP_CR010 · MOCKUP_CR014
 │   DECISIONS_APP_REPORTS_013v2_017_2026-09-24 (the 12 answers)
 │   _TEMPLATE_CHANGE_REQUEST v5 · _TEMPLATE_APP_REPORT v2
 │
 ├ 06_Ways_of_working/                  1tl4xQZdJ1-hc_PQzT8xcMksWuRKbhqAo
 │   00_HOW_I_WORK v3 + its 1-page PDF twin v3 · 00_AGENT_ROUTING v4
 │   00_POSTMORTEM_2026-09-14_worker_blocked · NOTE_no_terminal_git_workarounds
 │
 └ 90_Archive/                          16DyTYPocb4p6rOBcG47mka1SCQCoMWIJ
     every superseded version; names start with ARCHIVE_ (or _superseded_)

 OUTSIDE THIS FOLDER
 My Drive/"Coach Concours" (created by the app)   live synced state; never edit, never copy
 Claude project docs (Cowork only)                claude/exercise-library-workflow.md (ledger)
                                                  claude/coach-concours-status.md (mirror)
                                                  claude/agent-routing.md
 Cowork skills                                    concours-flow · concours-workout
 GitHub repository coach-concours + Pages         code, CLAUDE.md, CI, the published app
 The athlete's Chrome (Claude in Chrome)          gate 3 only: releases and branch deletion
```

## 1. The project in one picture

```
 7 Sep 2026 ───────────── Sun 11 Oct ─────────────────── Fri 20 Nov 2026
 W1-W2 done · W3 locked   Trail 12 km / 400 m D+           POLICE TEST, 11 stations
                                                           official limit 6:15
```

```
 wk  dates          phase       focus      load   cardio  special
 3   21-27 Sep      COMBINE     hoops      ■■■□□  10      locked · BASELINE (Wed 23, Sun 27)
 4   28 Sep-4 Oct   COMBINE     racket     ■■■■□  12      chain A · balance tails
 5   5-11 Oct       TRAIL       skipping   ■■□□□  10      race Sun 11 · chain B
 6   12-18 Oct      RESET       hoops      ■■□□□  12      chain B · scores side by side
 7   19-25 Oct      INTEGRATE   slalom     ■■■■□  13      ghost 1-6 · hill sprints
 8   26 Oct-1 Nov   INTEGRATE   skipping   ■■■■■  15      ghost 6-11
 9   2-8 Nov        PEAK        racket     ■■■■■  15      hardest week · ghost 1-11 · balance tails
 10  9-15 Nov       PEAK        racket     ■■■□□  12      sharpen · balance tails
 11  16-20 Nov      TAPER       light      ■□□□□  6       test Friday
```

Full table: `02_Training_brain/rules/season_plan.md` v2 (W9-W10 racket from the 24 Sep answers,
folded into v3 at the week 5 build). Travel of 19 Oct-2 Nov is tentative.

```
 Mon       crossfit        coach's class, the only strength work; app only records it
 Tue       run_intervals   flat, speed
 Thu       SKILL SESSION   warm-up + broad jumps · memory · skill block · cardio · cool-down
 Fri       CHAIN SESSION   warm-up + broad jumps · fresh reference · memory · chain block
                           (tail A each round) · cardio · tail B · cool-down
 Sat       weekend run     toward 12 km before the race; 7-8 km + hill sprints after
 + 2 days without a principal session. She may move any session to any day of its week.
```

## 2. Two worlds, one contract

```
 THINKING WORLD                CONTRACT                   CODING WORLD
 Cowork / Claude chat          structured files           the athlete's Claude Code session
 Drive folders 02, 03          rules + cards + handoffs   (model of the CR tier)
                               (04 ↔ repo handoffs/)      → GitHub PR → Pages

 No sport brainstorming in the coder. No code written by the chat itself.
 Gate 1 = "implement CR-nnn".  Gate 2 = the athlete merges on GitHub.
 Gate 3 = she says "merged CR-nnn"; the chat publishes the tag on the merge commit in her
          Chrome, reports tag + hash in one line, deletes the merged branch.
```

## 3. Where things are

| Place | Holds | Who | Rule |
|---|---|---|---|
| Drive root | `00_COCKPIT.md` only | Claude maintains | a copy lives in the repo `handoffs/`, Drive wins |
| Drive `06_Ways_of_working/` | how-I-work, routing, post-mortem, git note | the athlete + Claude | read before any coder |
| Project doc `claude/exercise-library-workflow.md` (the ledger) | the library task, the training logic in prose, drafts, parked ideas | the athlete + Claude | Cowork only; mirrored into Drive |
| Drive `01_Official_police_sources/` | the official sources | nobody edits | absolute for station facts |
| Drive `02_Training_brain/` | baseline v2 · `rules/` (9 files) · `exercise_cards/` | the athlete + Claude | the coder reads, never edits |
| Drive `03_Weekly_plans/` | PLAN, FINAL, NOTES, REVIEW per week · the two locked week 3 sessions | the athlete + Claude | one FINAL per week |
| Drive `04_App_handoffs/` ↔ repo `handoffs/` | change requests, app reports, mockups, templates | both worlds | the only door; every APP_REPORT ends with the commit hash |
| **GitHub repository** `coach-concours` | the code (React/TypeScript/Vite PWA) | the athlete's Claude Code session, via pull requests | one tag per CR, published by the chat after the merge; branches `cr-nnn-short-title`, cut with no upstream |
| **GitHub Pages** | the published app | GitHub Actions | the PWA serves cached code until fully quit and reopened (CR-015) |
| **The athlete's Chrome** | her logged-in GitHub | the Cowork chat, gate 3 only | release on the merge commit + delete the merged branch; never push, merge or edit |
| Drive `90_Archive/` | superseded versions | nobody | history only |

File format rule: rules, cards, plans, notes and handoffs are plain `.md` files. Feedback rule:
numbers in the app, words in `03_Weekly_plans/WEEK_n_NOTES.md`. Card rule: a drill never enters
a session unless it exists as a real card; a placeholder is shown as a named gap.

## 4. The weekly loop

```
 season_plan row ──► Cowork builds the week's missing content ──► data drop to the app
        ▲                     (skill block of a new station,            (CR-013 v3, v4…,
        │                      chain, tails)                             small, MID)
        │                                                                     │
  Sunday review ◄── WEEK_n_NOTES (words) ◄── app form (numbers) ◄── athlete trains
```

A station's skill-block content is written once and reused every time it is the focus
(R-SP-05). Done and live: hoops (W3), racket and chain A (W4). Left: skipping and chain B
(W5 build, before Mon 5 Oct), slalom (W7 build), and the ghost circuit, designed together first.

## 5. App status (read live 24 Sep 11:40) and change-request queue

```
 WHAT RUNS TODAY
 main = f04b844 (PR #9). Week 4 content, the season table and the baseline are live.
 Merged through a pull request: CR-003 … 009, 001, 002, 010, 011, 013 (PR #7),
   014 v2 (PR #6), 014 v3 (PR #8, e6eab41), 013 v2 (PR #9, f04b844, 24 Sep)
 CR-017 reached main by DIRECT PUSH, twice, from outside the coder session (ca7f815,
   revert 2b2e95e, then 6ef0643 … c9cc5db). No pull request, no merge commit. Content
   verified: 163 tests green, and the athlete checked it on her phone.

 TAGS ON GITHUB (all label None, 24 Sep)
 cr-001 30f81d1 · cr-002 a5bf32a · cr-005 … cr-009 · cr-010 3f2d302 · cr-011 fdbe451
 cr-013 edab39b · cr-013-v2 f04b844 · cr-014 5a8093e · cr-014-v3 e6eab41
 cr-017   c9cc5db, the last CR-017 commit (no merge commit exists; the athlete's choice,
          24 Sep, the one recorded exception to the merge-commit rule)
 cr-013   sits on edab39b, the PR #7 branch head, not on its merge commit 90cb0e4
          (published before the gate 3 rule; left as it is unless the athlete says otherwise)

 BRANCHES ON GITHUB: main only (nine merged branches deleted 24 Sep, each checked as
   already contained in main)

 PUSH TO MAIN, a recurring accident (CR-011, CR-014 v3, CR-017)
 Something outside the coder session pushed the coder's local commits straight to main.
 CR-013 v2 did not suffer it: its branch was cut with no upstream set. That is now the
 standing guard (section 9). If it happens again, the athlete looks for a git hook, a file
 watcher or an agent with push rights on her machine.

 APP REPORTS 013_v2 AND 017: ANSWERED 24 Sep, one question at a time
 (04/DECISIONS_APP_REPORTS_013v2_017_2026-09-24.md). No app change: baseline minutes, Sun 27
 text (run 8-9 km), W3 load, balance 1 box per minute. Into CR-013 v3 and the rules at the
 W5 build: 90 % VMA rule from W5 · M4 6 min everywhere · racket per set · W9-W10 racket,
 balance tails · fresh cardio per week · ghost stays a placeholder · delete "Re-test 1 km".
 Taper details at the W10 build.

 CODER QUEUE (the athlete's Claude Code session, one request per session and branch)
 CR-015 v3 [MID] NEXT, IN PROGRESS 24 Sep: PWA "Recharger" banner + CLAUDE.md house rules
               with the new gate 3 + routing v4 and this cockpit into handoffs/. Branch
               cr-015-pwa-update, no upstream. The repo had no copy of the CR: the athlete
               gives the coder the three files (CR-015, routing v4, cockpit) as attachments
 CR-013 v3 [TOP] data only, to write in Cowork: week 5 content (skipping skill block,
               chain B, W5 cardio) + the 24 Sep answers. Before Mon 5 Oct
 CR-016 [MID]  paste into the Retour note field
 CR-018 [TOP]  the memory game (drag the order + one-station quiz), to write in Cowork
               once the athlete has finished choosing the questions
 CR-012 [TOP]  drills reference card ids (deferred until about 25 cards)
 later  [TOP]  Level 2 adaptation (adaptation.md v2)

 COWORK, in parallel
 [TOP] week 4: PLANNED 23 Sep (03/WEEK_4_PLAN_2026-09-28.md), live in the app; lock on her word
 [TOP] CR-018 question bank: stations 3 and 4a still to decide
 [TOP] week 5 build: skipping skill block, chain B (no fallback), W5 cardio; fold the 24 Sep
       answers into season_plan v3, weekly_shape v7, run_intervals v4, memory_modules
 [TOP] ghost circuit design, before W7 (or W9 if the travel is confirmed)
 [TOP] WEEK_2_REVIEW; read the baseline numbers after Sun 27 Sep
```

## 6. Precedence when documents disagree

1. The athlete's explicit current decision.
2. `01_Official_police_sources/` for anything about the test itself.
3. `02_Training_brain/rules/`: `season_plan.md` for any week's numbers, `weekly_shape.md` for
   a session's structure.
4. `02_Training_brain/PERSONAL_BASELINE.md` and `exercise_cards/`.
5. The approved `WEEK_n_FINAL` or `WEEK_n_PLAN`, and the two locked week 3 sessions (which win for week 3).
6. Anything in `90_Archive/`: history only.

## 7. Decisions log (newest first)

| Date | Decision |
|---|---|
| 24 Sep 16:00 | **App report questions answered, cr-017 tagged** [TOP]. The athlete answered the 12 questions of APP_REPORT_013_v2 and _017 one by one (`04/DECISIONS_APP_REPORTS_013v2_017_2026-09-24.md`): W9-W10 focus = racket, tails = balance ladder (picked now, not the W8 worst score); cardio written fresh each week build, the week 4 set as safety net only; M4 = 6 min everywhere (chain memory slot 6 min in W9-W11); Tuesday 4-min reps at about 90 % of VMA from W5; chain B built before Mon 5 Oct, no fallback; ghost stays an empty placeholder; racket scored per set, balance 1 box per minute; taper kept, short and crisp; "Re-test 1 km" deleted. `cr-017` published on `c9cc5db` (label None). CR-015 v3 refreshed (branch command with no upstream, the coder saves the CR into handoffs/) |
| 24 Sep 11:40 | **Tags published, branches cleaned, app up to date** [MID]. The chat published in the athlete's Chrome, label None, each checked on its release page: cr-001 30f81d1, cr-002 a5bf32a, cr-010 3f2d302, cr-014 5a8093e, cr-014-v3 e6eab41 (cr-013-v2 f04b844 already existed). The nine merged branches were deleted; only `main` remains. CR-013 v2 merged (PR #9, f04b844). CR-017 is live by direct push, so it has no merge commit and no tag yet. Guard added: the coder cuts its branch with no upstream (section 9). APP_REPORT_013_v2 and APP_REPORT_017 copied to Drive 04. `00_HOW_I_WORK` PDF twin regenerated at v3 |
| 24 Sep | **Gate 3 moves to the chat** [TOP]. The tag is published by the Cowork chat in the athlete's own logged-in Chrome, after she confirms the merge: read the merge SHA, open the Releases page with `target=<merge-sha>&tag=cr-nnn` (`cr-nnn-v2` for a version), check the Target shows the short merge hash and not main, the tag and the title "CR-nnn <title>", label None not "Latest", publish, confirm, report tag and hash in one line, delete the merged branch. Never before the merge, never on another commit, never the browser to push, merge or edit. Written into `00_AGENT_ROUTING.md` v4, `00_HOW_I_WORK.md` v3, `_TEMPLATE_CHANGE_REQUEST` v5, CR-015 v3 (CLAUDE.md sentence), this cockpit, and a new version of the `concours-flow` skill |
| 23 Sep 15:30 | **Baseline this week, all atoms in cardio, week 4 planned, CR-017 made urgent** [TOP]. The whole baseline goes into the week of 21-27 Sep (jump + sprint Wed 23, 6-min run Sun 27) and is never repeated (`test_battery.md` v2, `run_intervals_progression.md` v3). Every atom may be used in a cardio block except the week's skill station (`weekly_shape.md` v6, `S10_block_switch_fresh` v2). `S09_balance_ladder` locked. Chain A in W4, chain B in W5-W6 (W5-W6 tails = balance ladder, reversible). Week 4 planned (`WEEK_4_PLAN_2026-09-28.md`), into CR-013 v2. Memory game (CR-018) designed. CR-014 v3 merged (PR #8, e6eab41). CR-017 v2 is the urgent request, baseline blocks attached by session id |
| 23 Sep afternoon | **Season fixed, objective rewritten, every file brought in line** [TOP]. One season table (`rules/season_plan.md`); broad jumps in every police warm-up; hill sprints after the race; ghost circuit placeholder; no open gym. Rules rewritten, baseline v2, template and adaptation sanitised, CR-013 v2 written. The race is on Sunday 11 October. `S10_single_foot_after_legs` has a full card file (17 Sep) but stays unusable until the athlete confirms it |
| 22 Sep 21:00 | **Training logic settled, rules v4, CR-013** [TOP]. Skill is a mode; two session shapes; cardio block with no target; two tails against a same-day fresh reference; memory at the start only; M5 out. Card rule: a drill never enters a session unless it exists as a real card |
| 22 Sep 10:10 | **No exact room, ever; phase calendar v2** [TOP]. R-PC-04 and R-PC-05 |
| 22 Sep 09:55 | **Coherence pass across all live files** [TOP] |
| 22 Sep 09:40 | **Drive audit, one file in the root** [TOP] |
| 18 Sep 09:45 | **CR-014 merged (PR #6, 5a8093e); tagging and branch rules fixed** [TOP] |
| 17 Sep 13:00 | **Exercise library built together, one station per session** [TOP] |
| 15 Sep | **Tuesday = fixed running-interval session, rules v3, CR-011** [TOP]; numbering rule |
| 14 Sep | Mockup approved (CR-010 v2); CR-009 done; single-writer rule; post-mortem |
| 13 Sep | CR-005, 007, 008 done; Drive sync works; feedback rule; coder = the athlete's session |
| 10 Sep | Sanitation rule; host = GitHub Pages; coder = Claude Code; one tag per CR; agent routing |
| 9 Sep | Structure v2: two worlds + contract. Week 1 approved. CrossFit fixed on Monday |
| 8 Sep | Equipment audit |

## 8. Open items (tier in brackets)

- [ ] **The athlete**: finish CR-015 (Sonnet session, the three files attached), merge, then say "merged CR-015"; then CR-016.
- [ ] **The athlete**: write the baseline numbers in the app (Retour of the two week 3 sessions); the 6-min run on Sun 27.
- [ ] **The athlete**: quiz stations 3 (wall bars) and 4a (the forbidden grip): keep or kill? Then Cowork writes CR-018.
- [ ] **The athlete**: fine-tune and "lock week 4" (`03/WEEK_4_PLAN_2026-09-28.md`).
- [ ] **[TOP] The athlete + Claude (Cowork)**: build week 5 (skipping, chain B, W5 cardio) and fold the 24 Sep answers into the rules and CR-013 v3, before Mon 5 Oct.
- [ ] **The athlete**: Thu 1 Oct, write racket set 1 and set 2 apart in `WEEK_4_NOTES.md` (the app shows totals until CR-013 v3).
- [ ] **[TOP] The athlete + Claude (Cowork)**: ghost circuit design, before 19 Oct.
- [ ] **The athlete**: confirm or cancel the travel of 19 Oct-2 Nov when known.
- [ ] **The athlete (2 min)**: update the Cowork skill `concours-workout` (still round 1 only).
- [ ] **[TOP] Cowork**: `WEEK_2_REVIEW.md`; confirm or drop `S10_single_foot_after_legs` with the athlete (week 5).
- [ ] **[MID] Cowork**: sanitise the Drive copies of `WEEK_1_FINAL` v3, CR-003, CR-004, APP_REPORT_003/004.
- [ ] **The athlete**: any current pain or constraint? (never answered)
- [ ] **The athlete**: hoop spacing from the S3 video before the hoop chain passes seven.

## 9. Paste this at the top of any agent session

> Read `00_COCKPIT.md` first, then `06_Ways_of_working/00_AGENT_ROUTING.md` (in the repo:
> `handoffs/`). State in your first reply which tier this step is (TOP, MID or FAST) and say
> if the model you run on does not match. Work only where section 3 assigns you. Follow the
> precedence in section 6. Every week's numbers come from `rules/season_plan.md`; never invent
> one. Every substitute drill is an approximation. There is no exact circuit room at any date:
> never generate a full mock test and never predict an official time. The cardio block never
> carries a target. A drill never enters a session unless it exists as a real card; a
> placeholder stays a named gap. No invented heart-rate targets or loads. No session after
> 20 November 2026. If a sporting question comes up in the code environment, write it in an
> `APP_REPORT`, do not decide it there. Never invent a new `CR-nnn` number. Never write a
> person's name, an e-mail, a hostname, a device name, a GitHub username or a personal folder
> path. Branch `cr-nnn-short-title`, never the bare `cr-nnn`, cut with **no upstream**
> (`git switch --no-track -c cr-nnn-short-title origin/main`), and **never push to main**. End
> every `APP_REPORT` with the commit hash. Never merge and never tag: the athlete merges, then
> the Cowork chat publishes the tag on the merge commit. Never leave a file in the root of the
> Drive folder other than this cockpit.