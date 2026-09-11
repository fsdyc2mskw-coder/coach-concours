# 00_COCKPIT, Coach Concours

> **Start here.** Single entry point. Every agent and every human reads this, then works in
> exactly one folder. Version 2.9, 10 September 2026 (Thursday, late night).
> Previous versions archived in `90_Archive/` (v2.1 to v2.8).
> **Sanitation rule (v2.9)**: no person's name (the athlete, family, friends, coaches, earlier
> contributors), no e-mail, no personal hostname, device name or personal folder path in
> this file, in any handoff or in the repository. The person training is **the athlete**.
> Anyone else is described by role ("the coach", "an earlier contributor"). The forbidden
> words themselves are never written in a file: they live in a repository secret.
> This file is mirrored in the repo unchanged.

## 1. The project in one picture

```
 7 Sep 2026 ─────────────── 11 Oct ──────────────────── 20 Nov 2026
 Week 1 (in progress)       Trail 12 km / 400 m D+      POLICE TEST, 11 stations
                            maintenance only             limit 6:15 · target 6:11 · baseline 8:30
```

Athlete: **the athlete**. Locale fr-CH, timezone Europe/Zurich.

```
 Mon                          crossfit coach's class, app only records it
 police_technique             fresh skill + memory, HIIT ≤ 10 min LAST before cool-down
 police_strength_transitions  power → HIIT 10-20 min → precision under fatigue, M5
 police_integration           linking stations into chunks, HIIT 10-20 min, M3+M4
 Sat/Sun trail_maintenance    ONE easy run, 7-8 km → 12 km, run only
 + 2 days with no principal session
 Every police session has exactly ONE HIIT block (stamina + explosiveness). Running
 intervals are one form of it. Never a 2nd run, never a 6th day.
```

## 2. Two worlds, one contract

```
 THINKING WORLD              CONTRACT                    CODING WORLD
 Cowork / Claude             structured files            Claude Code (cloud, on the GitHub repo)
 Drive folders 02, 03        rules + cards + handoffs    repo + GitHub Actions + GitHub Pages
 (02/rules, 02/exercise_cards, 04 ↔ repo handoffs/)

 No sport brainstorming in the code environment. No code in Cowork.
 The only door between the two worlds is folder 04, mirrored as handoffs/ in the repo.
```

Which model and effort for which step: `00_AGENT_ROUTING.md`. Defaults: Cowork = TOP,
Claude Code = the tier in the change-request header, lookups = FAST. ChatGPT chat and
Codex are no longer part of the loop (10 Sep); Claude Code is the coder.

## 3. Where things are

| Place | Holds | Who | Rule |
|---|---|---|---|
| Drive `00_COCKPIT.md` | this file | Claude maintains | updated at every decision; a copy lives in the repo `handoffs/`, Drive wins |
| Drive `00_HOW_I_WORK.md` | the 1-page working method (+ PDF twin) | the athlete | read before every session |
| Drive `00_AGENT_ROUTING.md` | which model / effort tier for which step and change request | the athlete + Claude | decided once; only its model-name table changes |
| Drive `01_Official_police_sources/` | S1 parcours PDF · S2 police programme PDF · S3 demo video link · `00_README_sources.md` | everyone reads, nobody edits | absolute reference for station facts |
| Drive `02_Training_brain/` | `PERSONAL_BASELINE.md`, `TRAINING_ENGINE.md`, `WORKOUT_LIBRARY.md` · `rules/` · `exercise_cards/` · `reconciliation_and_work_order/` | the athlete + Claude | the coder reads, never edits |
| Drive `03_Weekly_plans/` | `WEEK_n_PROPOSED` → `WEEK_n_REVIEW` → `WEEK_n_FINAL` | the athlete + Claude | one FINAL per week, frozen once trained |
| Drive `04_App_handoffs/` ↔ repo `handoffs/` | `CHANGE_REQUEST_nnn` (with a `tier:` line), `APP_REPORT_nnn` | both worlds | the only door; every APP_REPORT ends with the commit hash and tag |
| **GitHub repository** `coach-concours` under the athlete's GitHub account | the code (React/TypeScript/Vite PWA), CI in `.github/workflows/deploy.yml` (validate, no-personal-names, typecheck, test, build, publish) | Claude Code | source of truth for code; **private until CR-006 is done**; one git tag per change request (`cr-003`, `cr-004`, ...) |
| **GitHub Pages** `https://<github-username>.github.io/coach-concours/` | the published app, rebuilt on every push to `main` | GitHub Actions | **not live yet**: Pages needs the repo public (free) or a paid plan; the athlete flips Settings → Pages → Source → GitHub Actions after CR-006 |
| old Codex host | the 9 Sep build, retired | nobody | history only |
| Drive `05_App_code/` | `STATUS_...md`, `snapshots/` (SHA256 files; a zip only at a named milestone) | the coder via the athlete | git holds the versions; no zip per change request (v2.8) |
| Drive `90_Archive/` | superseded versions, transcripts, the earlier external package | nobody | history only |

File format rule (10 Sep): rules, cards, plans and handoffs are **plain `.md` files**,
never Google Docs. Field notes land in Notion (page "Concours police", sub-page "Sport
feedback"): Notion is the inbox, the Drive `WEEK_n_FINAL` is the record.

## 4. The weekly loop

```
 ┌────────────────────────────────────────────────────────────────┐
 ▼                                                                │
 app proposes WEEK_n ──► Cowork review ──► WEEK_n_FINAL ──► athlete trains ─┤
 ▲                        │                  │                │      │
 │                        ▼                  ▼                ▼      │
 │   wrong drill? → edit a CARD          done / partial /            │
 │   wrong logic? → edit a RULE + CHANGE_REQUEST   skipped           │
 │   app bug?     → CHANGE_REQUEST       + effort 1-5 (Notion note → │
 │                        │                  │        FINAL as trained)
 └──── APP_REPORT ◄───────┴──────────────────┴────────────────┴──────┘
```

Until the card library is big enough for the app to generate alone, Claude writes
`WEEK_n_FINAL` by hand with the athlete from the same rules and cards.

## 5. App status (10 Sep late night) and change-request queue

```
 WHAT RUNS TODAY
   code on main = CR-003 + CR-004 merged (PR #1), CI green; APP_REPORT_003 and 004 in Drive 04
   CR-003 data: Thu 10 / Fri 11 / Sat 12 = WEEK_1_FINAL v3, record fields as named
     substitutions: Thu → room_explosive_intervals, Sat → trail_event (CR-001 fixes)
   CR-004 infra: PWA config, deploy workflow, export/import JSON on the Drive tab
   NOT LIVE: no phone URL yet. Pages is blocked until the repo is public (free) or on a
     paid plan; the athlete decides after CR-006. Friday 11 Sep is trained from the Drive file.
   SANITATION (10 Sep late night grep of the repo): 18 files still carry a first name
     (handoffs/, docs/police-v1/, one line in src/infrastructure/coachStorage.ts), and
     4 of 12 commits carry a real name as author. CR-006 fixes both with a fresh repository.
   Flagged by the coder (not decided): zero test files in the repo, CI passes vacuously;
     generic template puts coordination on Tue and explosive on Wed, unlike Week 1 as trained.

 CODER QUEUE (Claude Code), one request per session, in this order:
   CR-006 [MID]  sanitise, fresh single-commit repo, CI guard                infra   ← next
   (athlete)     delete old repo, rename new one, decide visibility, switch Pages on, phone tests
   CR-001 [TOP]  app aligned with the 9 Sept rules engine (+ AGENTS.md rename, + tests question)
   CR-002 [TOP]  one HIIT block in every police session                     engine
   CR-005 [TOP]  (to write) Google Drive sync switched on                   infra

 COWORK, in parallel:
   [TOP] decide the card list · [MID] draft cards 5-10 at a time · [TOP] check vs S1
   [TOP] WEEK_1_REVIEW (13-14 Sep) → WEEK_2_FINAL from card ids + rules
   NEXT (Oct)  app generates WEEK_n_PROPOSED from cards + rules
   LATER       feedback form + adaptation (rules/adaptation.md, parked) · real backend only if needed
```

## 6. Precedence when documents disagree

1. The athlete's explicit current decision.
2. `01_Official_police_sources/` for anything about the test itself (absolute for station facts).
3. `02_Training_brain/rules/` (versioned one-liners).
4. `02_Training_brain/reconciliation_and_work_order/00_SOURCE_DE_VERITE.md` (v2).
5. `02_Training_brain/*.md` prose specs and `exercise_cards/`.
6. The approved `WEEK_n_FINAL` for that week.
7. Anything in `90_Archive/`: history only.

## 7. Decisions log (newest first)

| Date | Decision |
|---|---|
| 10 Sep late night | **Sanitation rule** widened (v2.9): no person's name at all, including family and earlier contributors, no e-mail, hostname, device or personal folder path; roles instead of names. The forbidden words live only in a repository secret, never in a file. CR-006 rewritten accordingly |
| 10 Sep late night | Naming rule first stated (v2.8); "the athlete". CR-006 written: redact, fresh single-commit repo, `no-personal-names` step in CI. Runs before any publish |
| 10 Sep late night | **Host = GitHub Pages** via GitHub Actions (CR-004 deviated from "keep the old host"; accepted). Old host retired. Live URL pending the visibility decision (public and free, or paid plan, or a second public repo holding only the build) |
| 10 Sep late night | **Coder = Claude Code**, not Codex. CR-003 and CR-004 code done and merged (PR #1). Status: code done, publish pending |
| 10 Sep late night | **Snapshot rule**: no zip per change request. One git tag per CR, commit hash and tag at the end of every APP_REPORT, SHA256 file in Drive 05 only when a zip is made, zip only at a named milestone |
| 10 Sep night | Correction of the reality check: the old hosted page was the Codex app (static `dist/`), showing the 9 Sep data. Repo created by the athlete, seeded from the verified zip + `handoffs/`. Only 100 of ~170 files arrived (GitHub upload cap); the coder reconstructed `vite.config.ts`, `tsconfig*.json`, `.gitignore` and fixed `pnpm-workspace.yaml` in CR-004 |
| 10 Sep night | ChatGPT chat dropped from the loop. Accounts (GitHub, hosting) are the athlete's, never an agent's |
| 10 Sep late | **Agent routing** decided once in `00_AGENT_ROUTING.md`: three tiers (TOP sets truth, MID applies a decision, FAST reads); every change request carries a `tier:` line; agents state the tier in their first reply |
| 10 Sep late | Phone access: level A now (data on the phone) = CR-004; Drive sync = CR-005 after CR-001; no backend while there is one athlete |
| 10 Sep late | Saturday 12 Sep = trail run 8 km, ≈150 m D+, easy, run only. Sunday 13 = rest. `WEEK_1_FINAL` v3 completed. CR-003 written and put first |
| 10 Sep late | **Rule**: every police session contains exactly one HIIT block; in a skill session ≤ 10 min, last before cool-down. `weekly_shape.md` v2 (R-WS-16/17/18 new, R-WS-08/09/15 amended). CR-002 written |
| 10 Sep late | **Friday 11 Sep v3**: no box jumps the day after box work; memory block never asks to explain; station-2 drill per the official tennis-ball rule (5 out with ball, 4 back without); AMRAP 10 min = 60 rope skips · ladder ×2 · 10 jump squats, after the fresh racket reference; station-8 colours after the AMRAP |
| 10 Sep | `.md` is the only format for rules, cards, plans, handoffs; Google Doc copies archived |
| 10 Sep | Thursday recorded **as trained** in `WEEK_1_FINAL`; fatigued racket benchmark not recorded; comparison moves to Week 2 |
| 10 Sep | Seven card gaps listed (ids in `WEEK_1_FINAL` v3). Cards are the bottleneck (R-SEL-01) |
| 9 Sep late | Official sources registered (S1, S2, S3). Feedback/adaptation parked. Three card gaps noted from S1 |
| 9 Sep pm | Structure v2: two worlds + contract; rules as one-liners, drills as cards, handoffs through folder 04. CR-001 written |
| 9 Sep pm | One weekend `trail_maintenance` run per week. Running intervals = floating block inside police sessions |
| 9 Sep | Week 1 (7-13 Sep) approved. Tuesday intervals kept as a documented exception |
| 9 Sep | CrossFit fixed on Monday. Eyes-closed precision only on flat stable ground |
| 8 Sep | Equipment audit done. To buy: basketball, coloured markers |

## 8. Open items (tier in brackets)

- [ ] **The athlete (now)**: set the repo private again until CR-006 is done. GitHub account: profile name = username; Settings → Emails → keep e-mail private + block pushes that expose it. Create the repository secret `PERSONAL_NAMES` (see CR-006). Create the new empty private repository.
- [ ] **[MID] Claude Code, session 3**: `CHANGE_REQUEST_006` on the new repository, return `APP_REPORT_006`.
- [ ] **The athlete (after CR-006)**: delete the old repo, rename the new one to `coach-concours`, decide public / paid / second repo, Settings → Pages → Source → GitHub Actions, then the three phone tests of CR-004 (home screen, value survives a restart, airplane mode).
- [ ] **The athlete (Fri 11 Sep)**: train Friday v3 from the Drive file; record in Notion: memory errors, ball fumbles, racket drops ×3, AMRAP rounds, landing quality.
- [ ] **The athlete (Sat 12 Sep)**: trail 8 km / 150 m D+, easy; record distance, D+, time, legs.
- [ ] **[TOP] Claude Code, later**: CR-001 (also `AGENTS.md` from "Trail Coach" to Coach Concours; also the Tue/Wed template mismatch and the missing tests, both flagged in `APP_REPORT_003/004`), then CR-002. **[TOP] Claude**: write CR-005 after CR-001.
- [ ] **[TOP then MID] Claude + the athlete (Cowork)**: decide, then draft, the 7 Week-1 cards, then the S1 gaps, up to ~25.
- [ ] **[MID] Claude**: align `TRAINING_ENGINE.md` prose with R-WS-16/17/18.
- [ ] **[MID] Claude (Cowork)**: sanitise the Drive copies of `WEEK_1_FINAL` v3, CR-003, CR-004, APP_REPORT_003/004 and `00_AGENT_ROUTING.md` the same way, so Drive and repo stay identical.
- [ ] **[TOP] The athlete + Claude (13-14 Sep)**: `WEEK_1_REVIEW.md`, then `WEEK_2_FINAL.md` from card ids and rules only.
- [ ] **The athlete**: watch S3 video, fill the station timestamps in `01_Official_police_sources/00_README_sources.md`.
- [ ] **The athlete**: buy basketball + coloured markers; 5 tennis balls; verify sled and rope-pull proxy; heavier station-4 object.
- [ ] **The athlete**: exact-circuit room access dates; was the 8:30 baseline clean?

## 9. Paste this at the top of any agent session

> Read `00_COCKPIT.md` first, then `00_AGENT_ROUTING.md` (in the repo: `handoffs/`). State
> in your first reply which tier this step is (TOP, MID or FAST) and say if the model you
> run on does not match. Work only where section 3 assigns you. Follow the precedence in
> section 6. Every substitute drill is an approximation. No invented heart-rate targets or
> loads. No session after 20 November 2026. If a sporting question comes up in the code
> environment, write it in an `APP_REPORT`, do not decide it there. Never write a person's
> name, an e-mail, a hostname, a device name or a personal folder path: the person training
> is "the athlete", anyone else is a role. End every `APP_REPORT` with the commit hash and
> the git tag.
