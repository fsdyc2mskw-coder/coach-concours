# 00_COCKPIT, Coach Concours

> **Start here.** Single entry point. Every agent and every human reads this, then works in
> exactly one folder. Version 2.13, 13 September 2026 (Sunday, late night).
> Previous versions archived in `90_Archive/` (v2.1 to v2.12).
> **Sanitation rule (v2.9)**: no person's name (the athlete, family, friends, coaches, earlier
> contributors), no e-mail, no personal hostname, device name or personal folder path in
> this file, in any handoff or in the repository. The person training is **the athlete**.
> Anyone else is described by role ("the coach", "an earlier contributor"). The forbidden
> words themselves are never written in a file: they live in a repository secret.
> This file is mirrored in the repo unchanged.
> **Prompt rule (v2.10)**: every prompt Claude writes for an agent (Claude Code or any other)
> starts with this sentence: "All project files live in the Google Drive folder Coach Concours:
> read `00_COCKPIT.md` at the root first, then the change request in `04_App_handoffs/`.
> If you cannot reach Drive, say so and ask for a paste; guess nothing." Then the inputs
> the athlete pastes in the session (never stored in a file), then the task.

## 1. The project in one picture

```
7 Sep 2026 ─────────────── 11 Oct ──────────────────── 20 Nov 2026
Week 1 done · Week 2 starts Trail 12 km / 400 m D+ POLICE TEST, 11 stations
14 Sep maintenance only limit 6:15 · target 6:11 · baseline 8:30
```

Athlete: **the athlete**. Locale fr-CH, timezone Europe/Zurich.

```
Mon crossfit coach's class, app only records it
 police_technique fresh skill + memory, HIIT ≤ 10 min LAST before cool-down
 police_strength_transitions power → HIIT 10-20 min → precision under fatigue, M5
 police_integration linking stations into chunks, HIIT 10-20 min, M3+M4
Sat/Sun trail_maintenance ONE easy run, 7-8 km → 12 km, run only
 + 2 days with no principal session
Every police session has exactly ONE HIIT block (stamina + explosiveness). Running
intervals are one form of it. Never a 2nd run, never a 6th day.
```

## 2. Two worlds, one contract

```
THINKING WORLD CONTRACT CODING WORLD
Cowork / Claude structured files Claude Code (cloud, on the GitHub repo)
Drive folders 02, 03 rules + cards + handoffs repo + GitHub Actions + GitHub Pages
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
| Drive `03_Weekly_plans/` | `WEEK_n_PROPOSED` → `WEEK_n_REVIEW` → `WEEK_n_FINAL` · `WEEK_n_NOTES.md` (the athlete's words + Garmin summary) · the Sunday JSON export until Drive sync is actually connected | the athlete + Claude | one FINAL per week, frozen once trained |
| Drive `04_App_handoffs/` ↔ repo `handoffs/` | `CHANGE_REQUEST_nnn` (with a `tier:` line), `APP_REPORT_nnn` | both worlds | the only door; every APP_REPORT ends with the commit hash and tag |
| **GitHub repository** `coach-concours` under the athlete's GitHub account | the code (React/TypeScript/Vite PWA), CI in `.github/workflows/deploy.yml` (no-personal-names, validate, typecheck, test, build, publish) | Claude Code | source of truth for code; sanitised since CR-006 (tag `cr-006`); one git tag per change request |
| **GitHub Pages** `https://<github-username>.github.io/coach-concours/` | the published app, rebuilt on every push to `main` | GitHub Actions | **live**, rebuilt clean by CR-008's push (run #7, 51 s, build+deploy both green) |
| Drive `05_App_code/` | `STATUS_...md`, `snapshots/` (SHA256 files; a zip only at a named milestone), `state/` (created 13 Sep; organisational only — the app cannot write into it, see decisions log) | the coder via the athlete | git holds the versions; no zip per change request (v2.8) |
| Drive `90_Archive/` | superseded versions, transcripts, the earlier external package | nobody | history only |

File format rule (10 Sep): rules, cards, plans, notes and handoffs are **plain `.md` files**,
never Google Docs. **Feedback rule (13 Sep, replaces the Notion inbox)**: numbers go in the
app (Level 1 form, same evening); words go in `03_Weekly_plans/WEEK_n_NOTES.md`; Garmin data
is pasted in the same notes file. Notion is dropped. The `WEEK_n_FINAL` is the record.

## 4. The weekly loop

```
┌────────────────────────────────────────────────────────────────┐
▼ │
app proposes WEEK_n ──► Cowork review ──► WEEK_n_FINAL ──► athlete trains ─┤
▲ │ │ │ │
│ ▼ ▼ ▼ │
│ wrong drill? → edit a CARD done / partial / app form (numbers)
│ wrong logic? → edit a RULE + CHANGE_REQUEST skipped + WEEK_n_NOTES (words)
│ app bug? → CHANGE_REQUEST │ → Sunday: WEEK_n_REVIEW
└──── APP_REPORT ◄──────────────────────────────────┴──────────────────┘
```

Until the card library is big enough for the app to generate alone, Claude writes
`WEEK_n_FINAL` by hand with the athlete from the same rules and cards.

## 5. App status (13 Sep, late night) and change-request queue

```
WHAT RUNS TODAY (pushed to origin/main and verified live, 13 Sep late night)
code on main = CR-003 + CR-004 + CR-005 + CR-006 + CR-007 + CR-008, all pushed
CR-005: Drive sync runs on app open, after every save and on reconnect; conflict rule
 "higher revision wins, tie keeps local"; account email masked; CI injects
 VITE_GOOGLE_CLIENT_ID at build time. OAuth client id created and the repository
 secret set (CR-005 close-out commit). Still open: run the five manual Drive-sync
 tests from APP_REPORT_005.md on a real device — nobody has done this yet.
CR-008: first real test suite landed. 5 files, 23 tests (week1, stations, calendar,
 persistence, sanitation), CI Test step is real now, no longer vacuous. Verified from
 a cold checkout (fresh node_modules, pnpm install --frozen-lockfile): test/typecheck/
 build all pass. Pushed via GitHub Desktop; GitHub Actions run #7 succeeded (51 s).
 One sanitation issue found in dead/unreachable legacy code (src/app/seed.ts, a
 first-name-shaped literal in the unused AppState path) — flagged, left unfixed
 (out of scope for CR-008), spawned as its own follow-up task for the athlete.
Week 1 in the app: Thu/Fri/Sat = WEEK_1_FINAL v3 · Mon ok · Tue/Wed corrected by CR-007
Weeks 2-11 in the app: old template (Fri standalone intervals, Sat circuit, no trail run) → CR-001
storage: IndexedDB coach-concours-db + localStorage copy, one copy per device; tested:
 save → close → reopen keeps status, effort, km, D+, min, note.
sanitation: repo clean since CR-006, except the one CR-008 finding above (dead code, not fixed)

CODER QUEUE (Claude Code), one request per session, in this order:
CR-009 [MID] infra navy + sand theme, four-slot block grammar, day header flow strip ← next
CR-001 [TOP] engine app aligned with the 9 Sep rules (v2), Week 2 data if WEEK_2_FINAL exists
CR-002 [TOP] engine one HIIT block per police session (v2), dose from recorded capacity
later [TOP] Level 2 feedback fields per card + adaptation rules (after ~25 cards)

COWORK, in parallel:
[TOP] WEEK_1_REVIEW from WEEK_1_NOTES (Friday notes + Saturday Garmin) → WEEK_2_FINAL
[TOP] card template v2 (faire / règle / noter / détails) before CR-009 · decide the card list
[MID] draft cards 5-10 at a time · [TOP] check vs S1
[TOP] rules/adaptation.md v2: HIIT realism check, technique phase then baseline phase,
 station baselines (from the 11 Sep temp notes)
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
| 13 Sep late night | **CR-008 done** (tag `cr-008`, final commit `3e3baeb`, after two follow-up commits on top of `aac5a73`): first real test suite — `vitest.config.ts` + 5 files under `src/__tests__/` (week1, stations, calendar, persistence, sanitation), 23 tests, no app behaviour changed. **Two self-correction fixups landed on top of the first commit**: (1) `@types/node` was missing from `package.json`/`pnpm-lock.yaml` even though `sanitation.test.ts` needs it to typecheck — an earlier "clean" local verification was contaminated by a stray leftover install and passed by accident; caught by a true cold-checkout test (`rm -rf node_modules && pnpm install --frozen-lockfile`) and fixed for real; (2) `APP_REPORT_008.md` corrected to stop repeating that wrong claim. Pushed to `origin/main` via GitHub Desktop (this session had no git credentials); GitHub Actions run #7 succeeded, 51 s, build+deploy both green, live on Pages. One sanitation finding in dead code (`src/app/seed.ts`), left unfixed per CR-008's scope, flagged for a separate follow-up. Full detail, including two documented discrepancies between the CR's prose and the actual code (the CR-005 conflict logic lives in `coachDrive.ts`, not `driveSync.ts` as the CR assumed; the repo has two parallel state shapes, one of them legacy/dead) in `APP_REPORT_008.md`. |
| 13 Sep late night | **CR-005 confirmed live**: OAuth client id created, `VITE_GOOGLE_CLIENT_ID` repository secret set (close-out commit `49e7d9b`). Manual on-device Drive-sync tests from `APP_REPORT_005.md` still not run — remains open. |
| 13 Sep late night | **CR-005 done** (tag `cr-005`, commit `e2f7559`): Drive sync wired into `CoachConcoursApp` end to end — automatic on app open (silent reconnect), after every save (debounced) and on reconnect; conflict rule implemented literally ("higher revision wins, tie keeps local", replacing code that threw on conflict); Drive tab masks the account email and shows a pending-changes count; CI now injects `VITE_GOOGLE_CLIENT_ID` from a repository secret at build time (previously unset, so Drive sync was dead in every deployed build regardless of the app). **Deviation flagged, not hidden**: the synced file lives in a folder the app creates itself via the `drive.file` scope (`Coach Concours/Données application/coach-concours-state-v2.json`), not in the athlete's own `05_App_code/state/` — `drive.file` only ever grants access to files the app itself created, so it structurally cannot see a folder created by hand in Drive. Full detail in `APP_REPORT_005.md`. Drive folder `05_App_code/state/` created anyway, for the athlete's own organisation. |
| 13 Sep | **Queue reordered**: CR-007 → CR-005 → CR-008 → CR-009 → CR-001 → CR-002. Drive sync moves to second place: the athlete wants her feedback in Drive, not on one phone |
| 13 Sep | **Feedback rule**: numbers in the app (Level 1), words in `WEEK_n_NOTES.md`, Garmin pasted there. **Notion dropped.** The two `temp/` Google Docs become `WEEK_1_NOTES.md`; the "future CR" text goes to `rules/adaptation.md` v2, not to a change request |
| 13 Sep | **Readability**: every block gets four slots (faire, règle, noter, détails) and every day a flow strip; card template v2 carries the same fields. Theme navy + sand, light only. CR-009 |
| 13 Sep | **Tests before engine**: CR-008 adds the first real tests; CR-001 and CR-002 land on it |
| 13 Sep | Week 1 Tue/Wed in the app corrected to the FINAL (Tue intervals as trained, Wed rest): CR-007. "Coordination & équilibre" is reused in Week 2 Tuesday as police_technique with a ≤ 10 min HIIT block |
| 13 Sep | App confirmed **live** on GitHub Pages; persistence verified in a browser (save, close, reopen). CR-006 done (tag `cr-006`) |
| 13 Sep | CR-001, CR-002 and the CR template rewritten as v2: sanitised, coder = Claude Code, no zip, tests on the harness. v1 archived |
| 10 Sep late night | **Prompt rule** (v2.10): every agent prompt opens by stating that all files live in the Google Drive folder Coach Concours and which ones to read there; session inputs are pasted, never stored |
| 10 Sep late night | **Sanitation rule** widened (v2.9): no person's name at all, no e-mail, hostname, device or personal folder path; roles instead of names. The forbidden words live only in a repository secret |
| 10 Sep late night | Naming rule first stated (v2.8); "the athlete". CR-006 written |
| 10 Sep late night | **Host = GitHub Pages** via GitHub Actions. Old host retired |
| 10 Sep late night | **Coder = Claude Code**, not Codex. CR-003 and CR-004 code done and merged (PR #1) |
| 10 Sep late night | **Snapshot rule**: no zip per change request. One git tag per CR, commit hash and tag at the end of every APP_REPORT, zip only at a named milestone |
| 10 Sep night | Repo created by the athlete, seeded from the verified zip + `handoffs/`; the coder reconstructed the missing config files in CR-004 |
| 10 Sep night | ChatGPT chat dropped from the loop. Accounts (GitHub, hosting) are the athlete's, never an agent's |
| 10 Sep late | **Agent routing** decided once in `00_AGENT_ROUTING.md`: three tiers; every change request carries a `tier:` line |
| 10 Sep late | Phone access: level A now (data on the phone) = CR-004; Drive sync = CR-005; no backend while there is one athlete |
| 10 Sep late | Saturday 12 Sep = trail run 8 km, ≈150 m D+, easy, run only. Sunday 13 = rest. `WEEK_1_FINAL` v3 completed |
| 10 Sep late | **Rule**: every police session contains exactly one HIIT block; in a skill session ≤ 10 min, last before cool-down. `weekly_shape.md` v2 (R-WS-16/17/18 new, R-WS-08/09/15 amended). CR-002 written |
| 10 Sep late | **Friday 11 Sep v3**: no box jumps the day after box work; memory block never asks to explain; station-2 drill per the official tennis-ball rule; AMRAP 10 min after the fresh racket reference; station-8 colours after the AMRAP |
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

- [ ] **The athlete**: run the five manual Drive-sync tests listed in `APP_REPORT_005.md`
  (two devices, offline save, conflict, disconnect, no secret leaked) — the OAuth client id
  and secret exist now, this is the only thing left to confirm Drive sync for real.
- [ ] **[MID] Claude (Cowork or Claude Code)**: `src/app/seed.ts` carries a first-name-shaped
  literal in its dead/unreachable legacy `AppState` demo path (flagged in `APP_REPORT_008.md`,
  out of scope for CR-008 itself — a data/content change, not a test). Delete the dead file or
  replace the literal with a neutral placeholder.
- [ ] **The athlete (Sunday)**: fill the Level 1 form for Tue, Thu, Fri, Sat of Week 1 in the app; Export JSON to `03_Weekly_plans/`; paste the Saturday Garmin data (km, time, pace, D+, avg HR, splits) into `WEEK_1_NOTES.md`.
- [ ] **[MID] Claude (Cowork)**: convert the two `temp/` Google Docs into `03_Weekly_plans/WEEK_1_NOTES.md`, archive the Docs.
- [ ] **[TOP] The athlete + Claude (Cowork)**: `WEEK_1_REVIEW.md`, then `WEEK_2_FINAL.md` (Tuesday = Coordination & équilibre + short HIIT; one trail run; card ids and rules only).
- [ ] **[TOP] Claude (Cowork)**: card template v2 with the four slots; `rules/adaptation.md` v2 from the 11 Sep notes.
- [ ] **[TOP then MID] Claude + the athlete (Cowork)**: decide, then draft, the 7 Week-1 cards, then the S1 gaps, up to ~25.
- [ ] **[MID] Claude**: align `TRAINING_ENGINE.md` prose with R-WS-16/17/18.
- [ ] **[MID] Claude (Cowork)**: sanitise the Drive copies of `WEEK_1_FINAL` v3, CR-003, CR-004, APP_REPORT_003/004, `00_AGENT_ROUTING.md`, `weekly_shape.md`, `adaptation.md` (they still carry a first name).
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
