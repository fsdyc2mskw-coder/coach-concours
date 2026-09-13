# CHANGE_REQUEST_005 — Google Drive sync of the app state

Direction: Training brain → App code. Date: 13 September 2026. Author: the athlete + Claude.
Status: **open**. Order: **second**, right after CR-007 (the athlete wants her feedback in Drive, not on one phone). Own session.
Kind: infra · **Tier: TOP** (touches the persistence contract and OAuth)

## Read first
`handoffs/00_COCKPIT.md` section 9, `handoffs/00_AGENT_ROUTING.md`, `handoffs/APP_REPORT_004.md`, then this file.
State the tier of this request in your first reply and say if the model you run on does not match.

## Why

Today the state (weeks + results) lives only in the browser storage of one device
(IndexedDB `coach-concours-db`, localStorage copy). Clearing site data or changing phone
loses everything; the laptop and the phone hold separate copies; the Sunday review depends
on a manual JSON export. The Drive tab already announces this sync as "CR-005". One athlete,
one file in her own Drive, no backend.

## Inputs

| File | What |
|---|---|
| the state schema v2 (`schemaVersion`, `revision`, `updatedAt`, `weeks`, `results`, `memoryReveals`, `drive`, `migration`) | what is synced, unchanged |
| the existing export / import JSON (CR-004) | same format as the synced file |
| Drive folder `Coach Concours/05_App_code/state/` (the athlete creates it) | where the file lives |

## Expected behaviour after the change

- "Connecter et synchroniser" on the Drive tab starts Google OAuth (drive.file scope only,
  the app sees only files it created). The client id comes from `VITE_GOOGLE_CLIENT_ID`
  set as a repository secret and injected at build time; never committed.
- One file `coach-concours-state.json` in the folder above, same content as the export.
- Sync rule, simple and explicit:
  - on app open and after every save: if online, read the remote file; the copy with the
    higher `revision` wins; a tie keeps local; `revision` increments on every local save.
  - offline: local save as today, a "en attente" marker on the Drive tab, push at next open.
  - never merge field by field; never delete the remote file.
- The Drive tab shows: connected account (first letters only, never the full address),
  last sync time, pending changes count, a "Synchroniser maintenant" button, and
  "Déconnecter" (which keeps local data).
- Export and import JSON stay available.
- No analytics, no other scope, no other file.

## Tests that must pass

- [ ] save on device A, open on device B → B shows A's result (manual test by the athlete, two browsers)
- [ ] offline save, reconnect → remote file updated, `revision` +1
- [ ] remote newer than local → local replaced, results preserved
- [ ] disconnect → local data intact, remote file untouched
- [ ] repository contains no client secret; CI `no-personal-names` still green
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm build` pass (the test harness arrives with CR-008; a manual test list is acceptable here)

## Out of scope

Any backend or database. Any other Google scope (no reading of the training folders).
Multi-athlete. Real-time sync. Any sporting decision.

## Deliverable back

`handoffs/APP_REPORT_005.md`: how the client id is configured (the athlete's clicks in Google
Cloud console in five lines), the sync rule as implemented, known limits, commit hash and tag `cr-005`.
