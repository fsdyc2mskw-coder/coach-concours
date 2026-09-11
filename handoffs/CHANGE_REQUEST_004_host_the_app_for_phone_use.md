# CHANGE_REQUEST_004 — Keep the app on its existing host, make it phone-ready

Direction: Training brain → App code. Date: 10 September 2026 (v2, rescoped the same night).
Author: the athlete + Claude. Status: **open**. Order: after CR-003, before CR-001. Own session.
Kind: infra · **Tier: MID**

## Read first
`handoffs/00_COCKPIT.md` section 9, `handoffs/00_AGENT_ROUTING.md`, `docs/STATUS.md`, then this file.
State the tier of this request in your first reply and say if the model you run on does not match.

## Why

v1 of this request assumed the app was not hosted. It is: `.openai/hosting.json` publishes
the static `dist/` through Codex app hosting at a personal hostname (retired, see cockpit
section 3, "old Codex host"). So the host stays; what is
missing is a phone-ready, verifiable deployment of the CR-003 build with a manual backup.

## Inputs

| File | What |
|---|---|
| `.openai/hosting.json` | existing hosting config, keep it |
| repo main after CR-003 is merged | the build to publish |

## Expected behaviour after the change

- `dist/` is rebuilt from main after CR-003 and published through the existing hosting;
  the URL above shows Week 1 v3 (Thursday as trained, Friday with the AMRAP, Saturday 8 km).
- The URL opens on the athlete's phone (Safari on iOS and Chrome on Android both acceptable),
  can be added to the home screen and launches standalone from the icon.
- The app works offline once installed (service worker caches the build).
- Feedback and record fields entered on the phone are saved in the phone's browser
  storage and survive closing the browser, restarting the phone and going offline.
- A visible "export data" action (JSON download or copy-to-clipboard) exists so the athlete can
  back up her state until Drive sync is on (CR-005). A matching "import" is optional.
- The report states how a redeploy is triggered (command or Codex action), so every
  future CR ends with a publish.
- Nothing about sessions, rules, weeks or feedback logic changes. No secrets in the repo.
  `VITE_GOOGLE_CLIENT_ID` stays unset.

## Tests that must pass (the athlete runs the last three herself)

- [ ] `pnpm build` passes on main; published `dist/` equals that build
- [ ] Lighthouse PWA check or equivalent: installable, service worker registered
- [ ] the athlete opens the URL on her phone, adds it to the home screen, launches it standalone
- [ ] the athlete records a Friday value (e.g. racket drops R1 = 2), closes the browser, reopens: value is still there
- [ ] the athlete switches the phone to airplane mode, opens the app: it loads and shows Week 1 v3

## Out of scope

Moving to another host (only if Codex hosting proves unusable on the phone; then say so in
the report and stop). Google Drive sync and OAuth (CR-005). Accounts, backend, database.
Visual redesign. Any sporting decision. Analytics or tracking of any kind.

## Deliverable back

`handoffs/APP_REPORT_004.md` with: the URL, how redeploy works, add-to-home-screen steps
for iPhone and Android in three lines each, where the export button is, and the known
limit that data lives on one device until CR-005. the athlete copies the report to Drive
`04_App_handoffs/` and a snapshot zip + SHA256 to `05_App_code/snapshots/`.
