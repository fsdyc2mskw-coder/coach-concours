# APP_REPORT_004 — Host the app for phone use

Direction: App code → Training brain. Date: 10 September 2026. Answers `CHANGE_REQUEST_004`.
Status: **code done and merged to `main` (PR #1); the live URL is blocked on one decision
from the athlete — see "Open question" below.** Everything that does not depend on that decision
is finished and verified.

## Host chosen: GitHub Pages, and why

GitHub Pages, deployed via a GitHub Actions workflow (`.github/workflows/deploy.yml`) that
builds and publishes on every push to `main`. Chosen over Cloudflare Pages / Netlify /
Vercel because it needs no third-party account at all — only the GitHub account that
already holds the code. Cloudflare/Netlify/Vercel would each need their own signup and a
"connect this repo" step through their own dashboard; GitHub Pages just needs one setting
flipped in this repo's own Settings tab (see below).

## Open question — I could not settle this myself

**GitHub Pages is not available on a private repository on the free plan.** The Pages
settings page currently shows: *"Upgrade or make this repository public to enable Pages."*
This is exactly the kind of decision the cockpit rules say I shouldn't make in the code
environment — it trades off privacy against cost, not a technical call. Two ways forward:

1. **Make the repo public again.** Free, no other change needed — the workflow will start
   deploying on the next push once Settings → Pages → Source is set to "GitHub Actions."
   The repo does contain the athlete's real name and training/police-application details in the
   handoff docs, so weigh that before flipping it back.
2. **Upgrade to a paid GitHub plan** (GitHub Pro or higher) that includes Pages for private
   repos, and keep the repo private.

Once either is done: go to **Settings → Pages → Build and deployment → Source → GitHub
Actions**, then push anything to `main` (or re-run the workflow from the Actions tab) to
trigger the first deploy. I could not do this step myself — it is a billing/visibility
setting on your account, not something the repo's code or a token can change.

**I have not been able to verify the URL serves over HTTPS, that the service worker
registers, or run a Lighthouse PWA check, because the site has never actually been
published** — none of that can be tested until the step above happens. Everything else
this change asked for is built and passed CI; only the actual publish is pending.

## How redeploy works (once Pages is switched on)

Every push to `main` triggers `.github/workflows/deploy.yml`: install dependencies (pnpm),
validate schemas, typecheck, test, build the production PWA (`vite build`), then publish
`dist/` to GitHub Pages via `actions/deploy-pages`. No manual step after that point — push
to `main`, wait roughly a minute, the live site updates itself.

## Add to home screen

**iPhone (Safari):**
1. Open the Pages URL in Safari.
2. Tap the Share icon (square with an arrow) in the toolbar.
3. Tap "Add to Home Screen," then "Add."

**Android (Chrome):**
1. Open the Pages URL in Chrome.
2. Tap the ⋮ menu in the top right.
3. Tap "Add to Home screen" (or accept the install banner if Chrome shows one automatically), then "Install."

## Offline support

`vite-plugin-pwa` is configured in `vite.config.ts` with `registerType: 'autoUpdate'` and a
manifest matching the icons/theme already in `public/`. Once installed, the service worker
precaches the app shell (including the bundled Swiss-trails dataset) so it loads and
functions with the phone in airplane mode. This matches what was already baked into the
previously-committed `dist/` build (same `base: './'`, same manifest) — the config files
that produced it (`vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`) were missing from
the repo entirely and had to be reconstructed from that build's output; see "What was
actually broken" below.

## Export / Import

On the **Drive** tab (bottom navigation, cloud icon) there is now a **"Sauvegarde
manuelle"** card, separate from the Google Drive connect/sync card, with:
- **"Exporter les données (JSON)"** — downloads the full local state as a timestamped JSON
  file, no Google account needed.
- **"Importer un export JSON"** — file picker that reads a previously exported file back in,
  validated against the same schema the app already uses to read Drive state
  (`parseCoachState`), and replaces local storage with it.

Both work with `VITE_GOOGLE_CLIENT_ID` unset, as required — no secrets in the repo, no
analytics, no tracking added anywhere.

## Known limit

Data lives on whichever single device recorded it (IndexedDB + localStorage fallback) until
Google Drive sync (`CR-005`) is switched on. The manual export above is the only way to move
data between devices or back it up until then.

## What was actually broken (worth knowing for future change requests)

Two upload gaps were found and fixed in this session, unrelated to sporting content:

1. `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json` and `.gitignore` did not exist in
   the repo at all (not a partial upload — genuinely absent). Reconstructed them to match
   the settings already baked into the previously-committed `dist/` build.
2. `pnpm-workspace.yaml` held a placeholder value (`esbuild: set this to true or false`)
   instead of valid pnpm syntax, and separately lacked the `packages:` field pnpm now
   requires once the file exists at all. Both fixed; `pnpm install` failed with
   `packages field missing or empty` before the fix, confirmed by the first CI run.
3. No test files exist anywhere in the repo, despite `CHANGELOG.md`/`docs/` describing dozens
   of them. Added `--passWithNoTests` to the `test` script so CI does not fail on this
   pre-existing gap, rather than fabricating tests. This should be raised separately — it
   means nothing in the app is actually covered by automated tests right now.
4. `pnpm run check`'s `validate:repository` step still requires `CODEX_START_HERE.md` and
   `PLANS.md` (old pre-police-pivot filenames); the CI workflow runs `validate:schemas`,
   `typecheck`, `test` and `build` directly instead of `check`, to avoid failing on a stale
   content check unrelated to this infra change.
5. `dist/` was previously committed directly to git (built by hand, no CI). Removed from
   tracking and gitignored now that CI builds it fresh on every push.

None of these touched sessions, rules, weeks, or feedback logic.
