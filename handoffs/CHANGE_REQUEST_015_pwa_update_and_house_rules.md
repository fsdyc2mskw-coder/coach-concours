# CHANGE_REQUEST_015: the app notices a new deployed version, and the house rules stop lying

Version 3 (24 September 2026): section B now carries the new gate 3 (the tag is published by the
Cowork chat in the athlete's Chrome after her merge, routing v4) and asks for routing v4 and the
latest cockpit. v2 and v1 archived. The PWA part (section A) is unchanged.

Direction: Training brain → App code. Date: 18 September 2026, revised 24 September. Author: the
athlete + Claude. Status: **open**. Order: after CR-017 and CR-013 v2. Own session, the athlete's
Claude Code on the repository. Kind: infra (service worker, one banner, two text files) ·
**Tier: MID** (Sonnet). Depends on: CR-014 merged (main at e6eab41 or newer).

## Read first
`CLAUDE.md`, `handoffs/00_COCKPIT.md` section 9, then this file. State the tier in your first
reply and say if the model you run on does not match. Branch name: `cr-015-pwa-update`, cut with
no upstream: `git switch --no-track -c cr-015-pwa-update origin/main`.

## Why

After every deploy the installed PWA keeps serving the previous build until the app is fully
quit and relaunched. On 15 September this made CR-010 look undeployed; on 18 September it made
CR-014 look absent. The athlete should never have to guess whether a change landed.

`CLAUDE.md` also describes a design that never existed: it says the tag `cr-nnn` is created
automatically on merge. No automation has ever created a tag. Since 24 September the tag is
published by the Cowork chat, in the athlete's own logged-in Chrome, after she has merged.

## Expected behaviour after the change

### A. Update flow

- The service worker registration uses the Vite PWA plugin already in the project (or the
  equivalent already in `vite.config.ts`) with `registerType: 'prompt'`.
- When a new build is waiting, the app shows one banner at the bottom of the screen:
  "Nouvelle version disponible" and one button "Recharger". Tapping it activates the new
  worker and reloads. No other UI, no sound, no automatic reload while a form is open.
- The check for a new build runs on app open and when the app returns to the foreground.
- Data is untouched: IndexedDB, localStorage and the Drive sync are not read or written by
  this change. A pending Retour draft survives the reload (it already lives in state).
- The banner uses the CR-010 tokens (dark card, accent button).

### B. House rules, same pull request

- `CLAUDE.md` at the root: replace the sentence that says the tag is created automatically
  with: "The coder never tags, never merges and never pushes to main. The athlete merges the
  pull request on GitHub. After she confirms the merge, the Cowork chat publishes the tag
  `cr-nnn` (or `cr-nnn-v2` for a version) on the merge commit, through the GitHub Releases
  page in her own browser. Nothing creates a tag automatically."
  Add: "Branch names are `cr-nnn-short-title`, never the bare `cr-nnn`, cut with no upstream
  (`git switch --no-track -c cr-nnn-short-title origin/main`)." Remove any mention of issue
  labels setting the tier; the tier comes from the `Tier:` line of the change request.
- `handoffs/00_AGENT_ROUTING.md`: replace with the current Drive version
  (`06_Ways_of_working/00_AGENT_ROUTING.md`, v4 of 24 Sep).
- `handoffs/00_COCKPIT.md`: replace with the current Drive cockpit (the latest version in the
  Drive root, v2.28 or newer).
- For both files: the athlete pastes the Drive text into the session. Never copy a file from
  `90_Archive/`. Never write a GitHub username into either file.
- Also add this file as `handoffs/CHANGE_REQUEST_015_pwa_update_and_house_rules.md`.

### C. Not touched

Recipes, rules, generator, screens, Drive sync, the CR-014 move layer.

## Tests that must pass

- [ ] existing suites green
- [ ] `pnpm build` produces a service worker with `registerType: 'prompt'`; a unit test or a
  documented manual test shows the banner appears when `needRefresh` is true and that
  "Recharger" calls `updateServiceWorker(true)`
- [ ] manual, in the report: deploy, open the installed app, see the banner without quitting,
  tap Recharger, see the new build
- [ ] `grep -n "automatically" CLAUDE.md handoffs/00_AGENT_ROUTING.md` returns nothing that says a tag is created automatically
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm build` pass

## Out of scope

Push notifications, background sync, offline changes to data, any new screen.

## Deliverable back

`handoffs/APP_REPORT_015.md` ending with the commit hash. Pull request titled
`CR-015 PWA update banner and house rules`. Never push to main, do not merge, do not tag: the
athlete merges, then the Cowork chat publishes the tag `cr-015` on the merge commit.
