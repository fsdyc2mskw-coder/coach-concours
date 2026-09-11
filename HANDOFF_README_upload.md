# How to put this package into GitHub (the athlete, once, ≈10 min)

Repo: https://github.com/fsdyc2mskw-coder/coach-concours (private, empty)

Option A, GitHub Desktop (recommended, handles all 170 files in one go)
1. Install GitHub Desktop, sign in with your GitHub account.
2. File → Clone repository → pick `coach-concours` → choose a folder on your Mac.
3. Unzip this package and copy EVERYTHING inside it (including hidden `.env.example` and
   `.openai/`) into that cloned folder.
4. In GitHub Desktop: summary "Seed from Coach_Concours_V2_2026-09-09 + handoffs", Commit
   to main, then Push origin.

Option B, browser only (two uploads, GitHub limits one upload to 100 files)
1. On the repo page: Add file → Upload files → drag the folders `src`, `tests`, `docs`,
   `schemas`, `scripts`, `public` → Commit changes.
2. Again: Upload files → drag `dist`, `handoffs`, `.openai` and all the root files
   (`package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `AGENTS.md`, `README.md`, ...) →
   Commit changes. Hidden files: show them in Finder with Cmd+Shift+. before dragging.

Then: ChatGPT → Codex → connect GitHub → choose `coach-concours`. Paste the CR-003 prompt.

What is in the package: the 9 September Codex zip, verified (SHA256
eba4aa992d98419f5a2bf8c7f287f93e3c6187196844b44b09b824bdcb970dac), unchanged, plus
`handoffs/` (cockpit v2.7, agent routing, CR-003, CR-004, WEEK_1_FINAL v3) and
`CODEX_START_HERE_2026-09-10.md`. `node_modules` is not included; Codex installs it.
