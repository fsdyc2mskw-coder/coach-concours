# CHANGE_REQUEST_006 — Sanitise the repository, fresh single-commit history, CI guard

Direction: Training brain → App code. Date: 10 September 2026 (night), v4.
Author: the athlete + Claude. Status: **open**. Order: before any publish, before CR-001.
Own session. Kind: infra · **Tier: MID**

## Read first
`handoffs/00_COCKPIT.md` section 9, `handoffs/00_AGENT_ROUTING.md`, then this file.
State the tier of this request in your first reply and say if the model you run on does not match.

## Why

The repository will become public so that GitHub Pages can publish the app for free.
Files and commit authors currently carry personal names. The cockpit v2.9 sanitation rule:
no person's name, e-mail, hostname, device name or personal folder path in the repository;
the person training is "the athlete", anyone else is a role. The forbidden words are never
written in a file, this one included: the athlete pastes them in the session and stores
them in a repository secret. The history is one day old and worth nothing: it is replaced
by one fresh commit in a new, empty repository that the athlete creates in the browser.
The athlete has no git client on her computer: every git operation here is the coder's.

## Inputs the athlete pastes in the session (never into a file)

- `PERSONAL_NAMES`: an extended regex of forbidden words, case-insensitive, whole words
  (first names, surname, old hostname, device name, e-mail local parts).
- The GitHub username and the `@users.noreply.github.com` address for the commit author.
- The URL of the new empty private repository.
- The cockpit v2.9 text from Drive (it replaces `handoffs/00_COCKPIT.md`, Drive wins).

## Steps

1. **Inventory first, report the count.** Using the pasted regex `R`:
   `git grep -i -w -c -E "$R" -- . ':!pnpm-lock.yaml' ':!package-lock.json'` (per file)
   and `git log -p --all | grep -i -w -c -E "$R"` (history), plus
   `git log --all --format='%an <%ae>' | sort | uniq -c`. Report the three results before
   changing anything. Expected on 10 Sep: about 18 files, about 49 hits, 4 of 12 commits
   with a real author name.
2. **Redact the working tree**, every file under `handoffs/`, `docs/`, `src/`, `public/`,
   and the root `.md` files: the athlete's names → "the athlete"; any other person →
   a role ("the coach", "an earlier contributor"); hostnames, e-mails, device names and
   personal folder paths → removed. `src/infrastructure/coachStorage.ts` hard-codes a
   first name in the `athleteName` default (around line 34): it becomes an empty string
   or a neutral default, and the UI must still render. Keep the sporting content
   byte-for-byte otherwise: no change to dates, ids, block names, durations, rules.
   Replace `handoffs/00_COCKPIT.md` with the pasted v2.9 text. Add this change request to
   `handoffs/`.
3. **Guard in CI.** In `.github/workflows/deploy.yml`, before the build, a step named
   `no-personal-names` that fails the workflow if
   `git grep -i -w -E "${{ secrets.PERSONAL_NAMES }}" -- . ':!pnpm-lock.yaml' ':!package-lock.json'`
   finds anything. The regex is read from the repository secret, never written in the
   workflow. If the secret is empty the step must fail with the message "PERSONAL_NAMES
   secret missing", so the guard can never be silently off.
4. **Commit identity.** `git config user.name` = the GitHub username,
   `git config user.email` = the noreply address. Nothing else, ever.
5. **One fresh commit, pushed to the new empty repository.** Do not rewrite the old
   repository (no filter-branch, filter-repo or force-push). Instead: remove `.git`,
   `git init -b main`, one commit `Seed, sanitised, 2026-09-11`, tag `cr-006`, add the new
   repository as `origin`, push `main` and the tag. If the push is refused for lack of
   rights, stop and say exactly what is missing; do not try another route.
6. **Verify on the new remote**: one commit, author = username + noreply address, the
   workflow green including `no-personal-names`, step 1 grep = 0 on the new tree.

## Tests that must pass

- [ ] step 1 counts reported; after step 2 the working-tree count is 0 (lock files excluded)
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm build` still pass; the app renders with the neutral athlete name
- [ ] the `no-personal-names` CI step exists, reads the secret, fails when the secret is empty, and is green on the new repository
- [ ] the new repository has exactly one commit and the tag `cr-006`
- [ ] `git log --format='%an <%ae>'` shows only the username and the noreply address
- [ ] this change request and `APP_REPORT_006` themselves contain no forbidden word

## Out of scope

Publishing (the Pages switch is the athlete's click, after her visibility decision).
Deleting the old repository and renaming the new one (the athlete's clicks). Removing the
training content itself: the sessions, dates and the 20 November test stay. Any sporting
decision.

## Deliverable back

`handoffs/APP_REPORT_006.md` in the new repository with: the three step-1 results before
and the grep count after, the list of redacted files (paths only), the commit hash and the
tag, and the standing rule: **no person's name, e-mail, hostname, device name or personal
folder path in the repository; the athlete is "the athlete", anyone else is a role**.
The athlete copies the report to Drive `04_App_handoffs/`.
