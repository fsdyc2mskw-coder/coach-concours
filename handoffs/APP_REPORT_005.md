# APP_REPORT_005 — Google Drive sync of the app state

Direction: App code → Training brain. Date: 13 September 2026. Coder: Claude Code.
Answers `handoffs/CHANGE_REQUEST_005_google_drive_sync.md`. Tier: TOP (confirmed, matches this session).

## What was already there vs. what changed

Most of the plumbing already existed on `main` but was never switched on: `coachDrive.ts`
(sync + backup), `coachStorage.ts` (IndexedDB/localStorage envelope, `revision` field) and
`googleIdentity.ts` (OAuth via Google Identity Services, `drive.file` scope only) were already
wired into the Drive tab of `CoachConcoursApp.tsx`, but three things kept CR-005 from actually
working:

1. `.github/workflows/deploy.yml` never injected `VITE_GOOGLE_CLIENT_ID` at build time, so
   every deployed build had Drive sync permanently disabled regardless of what the athlete did
   in the app.
2. Sync only ran when the athlete pressed the button. Nothing synced on app open, after a save,
   or when the connection came back — the CR asks for all three.
3. The conflict rule in `coachDrive.ts` threw an error and refused to sync whenever the remote
   revision was ahead of local and local had any results, instead of the CR's literal rule
   ("the copy with the higher revision wins, a tie keeps local").

This report covers closing those three gaps, plus two smaller UI fixes the CR also asked for
(masked email, pending-changes count).

## The athlete's clicks in Google Cloud console (five lines)

1. console.cloud.google.com → create or pick a project → APIs & Services → OAuth consent screen:
   External, add the athlete's own Google account as a test user (or publish it — one user, low risk).
2. APIs & Services → Credentials → Create credentials → OAuth client ID → Application type: Web application.
3. Authorized JavaScript origins: `https://<github-username>.github.io` (the Pages origin; no path).
4. Create → copy the Client ID (not the secret; this app never uses a client secret).
5. GitHub repo → Settings → Secrets and variables → Actions → New repository secret,
   name `VITE_GOOGLE_CLIENT_ID`, value = the client ID from step 4.

Until this is done, the Drive tab shows "Connexion Drive pas encore configurée" and the
connect button stays disabled — the app degrades safely, it does not break.

## Sync rule as implemented

- **On app open**: if the locally stored state was ever connected (`drive.wasConnected`),
  the app silently requests a token (`prompt: ''`, no popup) and syncs immediately if that
  succeeds. If the browser has no live Google session left, it fails silently and the athlete
  reconnects manually from the Drive tab — no interruption on every load.
- **After every save**: `mutate()` schedules a debounced sync (4 s) if a session is active, so
  rapid edits collapse into one Drive write instead of one per keystroke/tap.
- **On reconnection**: a `window` `online` listener triggers a sync if a session is active and
  the local state is marked `pending`.
- **Conflict resolution**: exactly as specified — `remote.revision > local.revision` → adopt
  remote; otherwise (including a tie) → keep local. No field-by-field merge, ever. The state
  file is always overwritten in place (`upsertTextFile` with the known `fileId`); it is never
  deleted.
- **Manual controls unchanged**: "Synchroniser maintenant" / "Connecter et synchroniser",
  "Créer une sauvegarde horodatée" (timestamped copy, independent of the synced file),
  "Déconnecter" (revokes the token, keeps all local data, clears `wasConnected` so the app
  does not try to silently reconnect next time), and the CR-004 manual JSON export/import.
- **Privacy**: the Drive tab now shows the account as `p•••@g•••` (first letters only), never
  the full address, per the CR.
- **Pending count**: shown as `state.revision − drive.lastSyncRevision` (0 once synced).

## Deviations from the CR text (both pre-existing, kept as-is)

- **File name**: `coach-concours-state-v2.json`, not `coach-concours-state.json`. The `-v2`
  suffix tracks the app's own `schemaVersion: 2`; renaming now would only add risk for no
  behavioural gain, since nothing has synced yet.
- **File location**: the app creates its own `Coach Concours / Données application` folder via
  the Drive API (`drive.file` scope), not the athlete's existing project folder
  `Coach Concours/05_App_code/state/`. This is a hard constraint, not a choice: `drive.file`
  only ever grants access to files/folders the app itself created (or that were opened through
  a file picker, which is out of scope here) — it cannot see or write into a folder the athlete
  created by hand in Drive. Flagging this rather than silently building something that looks
  like it matches the CR text but couldn't work.

## Known limits

- Live end-to-end testing (two real browsers, an actual Google account, a real deployed build)
  was not done in this session: no Node/pnpm toolchain was available locally, and no
  `VITE_GOOGLE_CLIENT_ID` exists yet (step above is the athlete's to do). The manual test list
  below is what CR-005 explicitly allows in place of the CR-008 harness.
- Silent reconnect depends on the browser still holding a live Google session; in a private
  window, after clearing cookies, or after the token's consent expires, it will fail quietly
  and require one manual "Connecter et synchroniser" tap.
- No retry/backoff beyond the debounce and the `online` listener: a sync that fails while the
  tab is in the background will only be retried on the next save or reconnect event, not on a
  timer.
- No offline queue beyond the existing `pending` status flag — this matches the CR's spec
  ("offline: local save as today, a marker on the Drive tab, push at next open"), not a gap.

## Manual test list (to run once the client id exists)

- [ ] Save a result on device A while connected → open device B (same account) → B shows A's result.
- [ ] Disconnect A's network, save a result (status shows "en attente") → reconnect → Drive file updates, `revision` +1.
- [ ] Force B's local revision behind A's, open B → B is replaced by A's data without dropping A's results.
- [ ] Disconnect from the Drive tab → local data untouched, remote file untouched.
- [ ] Confirm `git grep` for the repository secret name finds no literal client id or secret committed.

## Files touched

- `.github/workflows/deploy.yml` — inject `VITE_GOOGLE_CLIENT_ID` at build time.
- `src/coach/types.ts` — `DriveState.lastSyncRevision`, `DriveState.wasConnected`.
- `src/infrastructure/coachDrive.ts` — conflict rule fixed to the CR's literal spec.
- `src/infrastructure/googleIdentity.ts` — silent (`prompt: ''`) token request option.
- `src/CoachConcoursApp.tsx` — auto-sync on open/save/reconnect, masked email, pending count,
  persisted error state, `wasConnected` bookkeeping on connect/disconnect.
- `src/coach.css` — `.fieldError` style.
- `handoffs/CHANGE_REQUEST_005_google_drive_sync.md` — copied in from Drive.

## Verification

No Node/pnpm toolchain was available in the local execution environment, so `pnpm typecheck`,
`pnpm test` and `pnpm build` were not run locally; the diff was reviewed by hand against the
existing types and call sites instead. CI will run them on push — this is unpushed, same as
CR-006/CR-007 before it (`main` is ahead of `origin/main`).

## Commit and tag

- Commit: `e2f7559`
- Tag: `cr-005`
