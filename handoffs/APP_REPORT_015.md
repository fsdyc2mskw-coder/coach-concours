# APP_REPORT_015 — PWA update banner and house rules

Change request: `handoffs/CHANGE_REQUEST_015_pwa_update_and_house_rules.md` v3 (18 September
2026, revised 24 September). Tier declared in the CR header: **MID** (Sonnet). Run on Claude
Sonnet 5, effort medium — the MID row of `00_AGENT_ROUTING.md`. No mismatch to flag.
Branch `cr-015-pwa-update`, cut with no upstream (`git switch --no-track -c cr-015-pwa-update
origin/main`) from `origin/main` at `f04b844` (CR-013 v2). Nothing merged, nothing tagged,
nothing pushed to `main`.

The repository had no copy of the change request or of the current routing/cockpit files; the
athlete attached the three files directly (Drive `04_App_handoffs/CHANGE_REQUEST_015_pwa_
update_and_house_rules.md` and `06_Ways_of_working/00_AGENT_ROUTING.md` v4, and the Drive-root
`00_COCKPIT.md` v2.29), and this session saved them into `handoffs/` before touching code.

## 1. Section A — the update banner

- `vite.config.ts`: `registerType` changed from `'autoUpdate'` to `'prompt'`. The new service
  worker now registers without activating itself; nothing swaps the running code under the
  athlete.
- `src/CoachConcoursApp.tsx`: `useRegisterSW()` (from `virtual:pwa-register/react`) is called
  once, at the top of `CoachConcoursApp`. Its `needRefresh` flag gates a new `UpdateBanner`
  component, rendered inside `<main className="shell">` above the existing screens, so it shows
  on every tab and every drill-down screen without needing its own route.
- The banner is one line, "Nouvelle version disponible", and one button, "Recharger", styled
  with the same dark-card and accent-button tokens `.notice` already uses (CR-010). Tapping it
  calls `updateServiceWorker(true)` and nothing else; no sound, no automatic reload, no other UI.
- The check for a new build runs on the browser's own schedule for a `'prompt'`-registered
  worker: on page load and whenever the tab returns to the foreground (the standard
  `visibilitychange`-triggered check `vite-plugin-pwa` wires in automatically). No extra polling
  was added.
- Data is untouched: `IndexedDB`, `localStorage` and the Drive sync code are not read or written
  by this change. A pending Retour draft lives in React state (CR-010) and is unaffected by the
  banner appearing — confirmed by a test that types into the Note field, then triggers the
  banner, then reads the field back unchanged.

### The one dependency the build needed and did not have

`virtual:pwa-register/react` imports `workbox-window` at build time (the periodic-check and
messaging client), and it was not installed: `pnpm run build` failed with `Rollup failed to
resolve import "workbox-window"`. `workbox-window` is `vite-plugin-pwa`'s own peer dependency
(already required by the plugin, just never pulled in because nothing had imported the `react`
entry point before). This session had no `pnpm`/`npm`/`corepack` binary on `PATH` — only a bare
Node runtime — so it downloaded the standalone `pnpm` v9.15.9 executable (matching the version
`.github/workflows` pins) from the pnpm GitHub release, ran `pnpm add -D -w workbox-window@^7.3.0`
with it, and verified `pnpm install --frozen-lockfile` against the resulting lockfile in a
scratch copy before touching the real checkout further. `package.json` and `pnpm-lock.yaml` both
carry the new entry; nothing else in either file changed.

### Tests

`src/__tests__/cr015.test.ts` — 7 tests: `registerType` is `'prompt'` and not `'autoUpdate'`;
the banner is absent until a new build is waiting; it appears with its one button when
`needRefresh` flips; the button calls `updateServiceWorker(true)` and nothing calls it before
the tap; a typed Retour draft survives the banner appearing; and the two "no automatic tag" house
rule checks (section 3 below).

`vitest.config.ts` deliberately keeps the test runner off the real PWA plugin pipeline (its own
pre-existing comment), so `virtual:pwa-register/react` does not exist inside a test run.
`src/testing/mockPwaRegister.ts` is a small stand-in exporting the same `useRegisterSW` shape,
aliased in for tests only; it starts `needRefresh` false and exposes a test-only
`__triggerNeedRefresh()` so the suite can simulate "a new build is waiting" without a real
service worker. The app's own source imports the real `virtual:pwa-register/react` unchanged;
only the test config redirects it.

**Not verified in this session: the manual, on-device check** ("deploy, open the installed app,
see the banner without quitting, tap Recharger, see the new build"). The preview server could
not start here — the sandbox refuses it access to the project's own parent directory
(`EPERM: process.cwd failed`), the same limit CR-013 v2 hit. This needs the athlete's phone
after the merge and deploy, exactly as the CR's test list asks.

## 2. Section B — house rules, same pull request

- `CLAUDE.md`: the "Tier" section no longer mentions an issue label; the tier comes only from
  the CR's own `Tier:` line (the label mechanism never existed in this repo's actual workflow).
  "How to work" now states branch names are `cr-nnn-short-title`, cut with no upstream
  (`git switch --no-track -c cr-nnn-short-title origin/main`), and replaces the old "the tag is
  created automatically when the pull request is merged" sentence — no automation has ever done
  this — with: the coder never tags, never merges and never pushes to `main`; the athlete merges
  on GitHub; after she confirms the merge, the Cowork chat publishes the tag (`cr-nnn` or
  `cr-nnn-v2`) on the merge commit, through GitHub Releases in her own browser.
- `handoffs/00_AGENT_ROUTING.md` replaced with the Drive v4 the athlete attached (gate 3 moved
  to the Cowork chat, in the athlete's own logged-in Chrome, after she confirms the merge;
  sections 3 and 3b rewritten; only section 4's model-name table is expected to change later).
- `handoffs/00_COCKPIT.md` replaced with the Drive v2.29 the athlete attached.
- `handoffs/CHANGE_REQUEST_015_pwa_update_and_house_rules.md` added, as section B's own last line
  asks.
- Neither file names a GitHub username or any other sanitised item; both were grepped for the
  sanitation patterns before being written (no matches), matching what `sanitation.test.ts`
  already checks for the rest of the repository.

### Tests

The same `cr015.test.ts` greps `CLAUDE.md` and `handoffs/00_AGENT_ROUTING.md` for any text
saying a tag is created automatically (none), and confirms `CLAUDE.md` states the coder never
tags and never pushes to `main`.

## 3. Not touched

Recipes, rules, the generator, every other screen, the Drive sync layer, the CR-014 move layer —
as section C requires. `handoffs/00_HOW_I_WORK.md` and its PDF twin are Cowork-side documents,
outside `handoffs/`, and were not asked for by this CR.

## 4. Files touched

| File | What |
|---|---|
| `vite.config.ts` | `registerType: 'prompt'` |
| `src/CoachConcoursApp.tsx` | `useRegisterSW`, `UpdateBanner`, rendered at the shell root |
| `src/coach.css` | `.updateBanner` styles |
| `src/vite-env.d.ts` | type reference for `virtual:pwa-register/react` |
| `vitest.config.ts` | alias to the test-only PWA-register stub |
| `src/testing/mockPwaRegister.ts` | new — the test stub |
| `src/__tests__/cr015.test.ts` | new, 7 tests |
| `package.json`, `pnpm-lock.yaml` | `workbox-window` added as a dev dependency |
| `CLAUDE.md` | tier line, branch/tag house rules |
| `handoffs/00_AGENT_ROUTING.md`, `handoffs/00_COCKPIT.md` | replaced with the Drive versions |
| `handoffs/CHANGE_REQUEST_015_pwa_update_and_house_rules.md` | new, this change request |

## 5. Verification

```
 pnpm typecheck            (tsc -b)      clean
 pnpm test                 (vitest run)  15 files, 213 tests passed (206 before, 7 new)
 pnpm build                (vite build)  built, PWA precache 10 entries, registerType 'prompt'
 pnpm install --frozen-lockfile          verified in a scratch copy against the updated lockfile
 validate:schemas                        OK on all three schemas
 grep "automatically" CLAUDE.md handoffs/00_AGENT_ROUTING.md
   both lines now say a tag is NOT created automatically
```

## 6. Delivery

Branch `cr-015-pwa-update` is local only; publishing it and opening the pull request are next.
Pull request title: `CR-015 PWA update banner and house rules`. Not merged, not tagged, never
pushed to `main`. Once merged and deployed, the manual on-device check from section 1 is the
one thing this session could not do itself.

Commit: `081b8ab3e7019e5430898bdee1247840bf5a7cd4`
