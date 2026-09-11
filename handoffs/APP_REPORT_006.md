# APP_REPORT_006 — Sanitise the repository, fresh single-commit history, CI guard

Direction: App code → Training brain. Date: 11 September 2026. Coder: Claude Code, tier MID
(matched: Claude Sonnet 5, effort medium, per `00_AGENT_ROUTING.md` section 4).
Change request: `CHANGE_REQUEST_006_sanitise_repo_fresh_history_ci_guard.md`. Status: **done**.

## Step 1 — inventory, before any change (old repository)

- Per-file working-tree hits: 21 files, about 76 hits total (cockpit's earlier estimate was
  about 18 files / 49 hits; the actual regex used had more terms, so more hits, expected).
- History hits: 87 matching lines across `git log -p --all`.
- Commit authors: 8 commits total (not 12 as the cockpit estimated). 4 with the confirmed
  clean identity and an Apple private-relay address, 4 with a real name and a
  hostname-based local address.

## Step 2 — redaction

Every file below was edited: names replaced by "the athlete" or a role, hostnames, one
personal local folder path and one personal e-mail-bearing device path removed, sporting
content (dates, ids, block names, durations, rules) left byte-for-byte unchanged.

- CODEX_POLICE_V1_PROMPT.md
- CODEX_POLICE_V1_START_HERE.md
- CODEX_START_HERE_2026-09-10.md
- HANDOFF_README_upload.md
- docs/POLICE_TEST.md
- docs/police-v1/ACCEPTANCE_CRITERIA.md
- docs/police-v1/OFFICIAL_CIRCUIT.md
- docs/police-v1/PERSONAL_BASELINE.md
- docs/police-v1/PRODUCT_SPEC.md
- docs/police-v1/SOURCE_REGISTER.md
- docs/police-v1/UPDATE_2026-09-07.md
- docs/police-v1/UX_SPEC.md
- docs/police-v1/examples/personal-config.json
- handoffs/00_COCKPIT.md (replaced wholesale with the pasted v2.9 text)
- handoffs/APP_REPORT_003.md
- handoffs/APP_REPORT_004.md
- handoffs/CHANGE_REQUEST_003_week1_data_patch_for_real_test.md
- handoffs/CHANGE_REQUEST_004_host_the_app_for_phone_use.md
- handoffs/README.md
- handoffs/WEEK_1_FINAL_2026-09-07_to_13.md
- src/infrastructure/coachStorage.ts (the hard-coded first name default replaced with a
  neutral placeholder; the app still renders with it)

`handoffs/CHANGE_REQUEST_006_sanitise_repo_fresh_history_ci_guard.md` was added to the
repository, itself free of any forbidden word.

Working-tree grep count after redaction: **0**.

## Step 3 — CI guard

`.github/workflows/deploy.yml` now runs a step named `no-personal-names` immediately after
checkout, before any dependency install or build step. It reads the regex from the
repository secret `PERSONAL_NAMES` via an environment variable (never interpolated
directly into the workflow text), fails with "PERSONAL_NAMES secret missing" if the secret
is empty, and otherwise fails the run if `git grep` finds anything.

## Steps 4-5 — commit identity and fresh history

Local git metadata was removed and reinitialised. `user.name` and `user.email` were set to
the confirmed clean identity before the one commit was made. History was not rewritten;
the old repository was left untouched throughout.

## Step 6 — verified on the new remote

- Repository: `coach-concours-clean`, under the athlete's GitHub account.
- Exactly one commit, zero parents, 139 files.
- Commit author: the confirmed clean username and its noreply address only.
- Tag `cr-006` present, pointing at that same commit.
- GitHub Actions run for this commit: `Checkout`, `no-personal-names`, `Set up pnpm`,
  `Set up Node`, `Install dependencies`, `Validate schemas`, `Type check`, `Test`, `Build`
  all green. `Configure Pages` and the `deploy` job fail, as expected: GitHub Pages is not
  yet switched on for this repository. That switch is explicitly out of this change
  request's scope (the athlete's decision, see cockpit section 8).
- Working-tree grep with the same regex: 0 hits, confirmed directly on the pushed tree.

## Commit hash and tag

- Commit: `9a0628bf3081c1d45ed480f99d09e6dd44a28a56`
- Tag: `cr-006`

## Standing rule

No person's name, e-mail, hostname, device name or personal folder path in the
repository. The person training is "the athlete"; anyone else is a role.

## Not decided here (sporting or visibility questions)

None arose during this request; it was infra and text only.

## Next clicks (the athlete)

1. Delete the old repository (`coach-concours`), once satisfied this one is correct.
2. Rename this repository from `coach-concours-clean` to `coach-concours`.
3. Decide visibility (public and free, or a paid plan for private Pages) and set
   Settings → Pages → Source → "GitHub Actions" accordingly.
4. Re-run the failed workflow once Pages is configured, then run the three phone tests
   from CR-004 (home screen, value survives a restart, airplane mode).
