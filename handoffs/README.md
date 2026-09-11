# handoffs/ — mirror of the Google Drive folder `Coach Concours/04_App_handoffs`

Google Drive is the source of truth for the training brain (folders 00 to 04). This folder
holds copies so Codex can read them inside the repo. When a copy and Drive disagree, Drive wins.

Read in this order before touching code:

1. `00_COCKPIT.md` (project entry point, decisions, queue)
2. `00_AGENT_ROUTING.md` (tier of the request: TOP / MID / FAST)
3. the CHANGE_REQUEST you were asked to execute, and only that one
4. its inputs (for CR-003: `WEEK_1_FINAL_2026-09-07_to_13.md` v3)

Then `CODEX_POLICE_V1_START_HERE.md` and `docs/police-v1/` for the code conventions.
`AGENTS.md` still describes the older "Trail Coach" product: its code-quality rules apply,
its product statements do not (see the authority rule in `CODEX_POLICE_V1_START_HERE.md`).

Deliverable of every request: `handoffs/APP_REPORT_nnn.md` in this repo (the athlete copies it to
Drive) + a pull request. Never a sporting decision inside the code environment.
