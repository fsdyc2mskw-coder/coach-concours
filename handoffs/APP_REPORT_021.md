# APP_REPORT_021: Drive sync through the athlete's script, no Google sign-in in the app

Tier: TOP, Opus (the session model matches the tier). Branch `cr-021-drive-script-sync`, cut with no
upstream from origin/main `eb65779`.

## What changed
```
 apps-script/Code.gs        new. doPost (ping | sync | backup), setup(), the CR-005 revision rule as the
                            pure function chooseWinner, handleRequest with injected services (tested
                            in vitest), exported under the `typeof module` guard. Wrong or missing key
                            returns { ok: false, error: 'bad_key' } before any read or write. sync runs
                            under LockService.getScriptLock(); higher revision wins, a tie keeps the
                            incoming (phone) copy; never a merge, never a delete. backup writes
                            coach-concours-<stamp>.json in Sauvegardes. Nothing logged except the
                            one setup line.
 apps-script/appsscript.json oauthScopes exactly ["https://www.googleapis.com/auth/drive.file"];
                            webapp executeAs USER_DEPLOYING, access ANYONE_ANONYMOUS; advanced Drive
                            service v3 enabled (see Substitutions).
 apps-script/README.md      the athlete's five steps.
 src/infrastructure/coachDrive.ts   rewritten: POST text/plain;charset=utf-8, redirect follow, 30 s
                            timeout. Errors: "Code refusé" (bad key), "Script injoignable, les
                            données restent sur le téléphone" (network, timeout, non-JSON answer).
 src/infrastructure/scriptLink.ts   new. The connection code on the device (IndexedDB key
                            script-link-v1, localStorage fallback), outside CoachState.
 src/infrastructure/coachStorage.ts readDeviceValue / writeDeviceValue added beside the state
                            envelope; loadCoachState, saveCoachState and the envelope are untouched.
 src/CoachConcoursApp.tsx   sync on open (if a code is stored), 4 s after each save, on `online`.
                            Drive tab: "Code de connexion" + "Enregistrer" (ping, then first sync);
                            linked: "Lié au script", last sync, pending count, "Synchroniser
                            maintenant", "Créer une sauvegarde horodatée", "Oublier ce code".
                            Manual JSON export / import unchanged.
 src/coach/types.ts         DriveState gains transport?: 'script'. schemaVersion stays 2.
 removed                    src/infrastructure/googleIdentity.ts, googleDrive.ts (nothing else used
                            them); VITE_GOOGLE_CLIENT_ID in deploy.yml and vite-env.d.ts (also the
                            unused VITE_REQUIRE_GOOGLE_AUTH type); the masked e-mail line.
 CLAUDE.md                  the "secrets" line no longer names VITE_GOOGLE_CLIENT_ID and adds: no web
                            app URL, id or key of the sync script in any file.
```

Status rule: a network failure leaves the status `pending` (dot "À synchroniser") with the local data
intact, pushed on `online` or at the next open. A refused code sets `error`.

One small guard added inside the sync: if the athlete edits while a sync is in flight, the answer of that
sync no longer overwrites the newer local copy; the newer copy stays, marked pending, and goes out on the
next sync. The old code had the same race; the script round trip (about 1 to 3 s) makes it more likely.

## Substitutions
- **Advanced Drive service instead of DriveApp.** DriveApp is documented and reported to need the whole
  Drive or read-only Drive for some calls (a `getFileById` under `drive.file` alone was reported to fail).
  The script therefore calls the Drive REST API through the advanced Drive service (v3), which uses the
  script's own token with exactly `drive.file`. No `script.external_request` scope is needed (no UrlFetchApp).
- **setup() and the /dev URL.** From the editor, `ScriptApp.getService().getUrl()` can return the test
  deployment URL (`/dev`), which a phone cannot call anonymously. setup() then logs
  `URL_WEB_APP#<key>` and asks the athlete to put the Web app URL (ending `/exec`) in front. Still one line.
- **Key**: two `Utilities.getUuid()` joined, hyphens removed (64 characters, easy to copy).
- **A stored file that does not parse** is never overwritten: the script answers an error and the phone
  keeps its copy.
- **Old Drive file**: not read, not moved, not deleted. The first link sends the phone's full state.
- `persistence.test.ts` part B (the CR-005 rule against the mocked Google Drive client) moved to
  `cr021.test.ts`, now against the rule in Code.gs.

## Tests added
`src/__tests__/cr021.test.ts` (21 tests). The app tests mock `fetch` with the real `handleRequest` from
Code.gs on an in-memory store.
- revision rule: remote higher → remote, local higher → local, tie → local; stored copy ahead is never rewritten
- wrong, missing or empty key → bad_key, zero reads, zero writes, for ping, sync and backup
- appsscript.json scopes exactly drive.file; webapp settings; setup line only for an /exec URL; one log call
- link saved, simulated reload (fresh storage module, app mounted again on the same storage) → linked, syncs with no action
- wrong code → "Code refusé", nothing written, nothing stored; pasted text that is not a code → no call
- second device with a lower revision takes the script copy
- the code is absent from the sync payload, the backup payload and the stored state (what the JSON export writes)
- "Oublier ce code" removes the code only; local data and the Drive file stay
- network failure → pending, data intact; `online` → synced
- a pre-CR-021 state (wasConnected, accountEmail) loads and links
- no file under `src/` references accounts.google.com or googleapis.com/drive; deploy.yml has no client id;
  apps-script/ holds no deployment URL, long id, key or e-mail

Not covered by an automatic test: the 4 s debounce after a save (the path is the unchanged
`mutate` → `scheduleAutoSync`).

## Verification
`pnpm typecheck` (tsc -b) passes; `pnpm test`: 21 files, 362 tests passed; `pnpm build` passes;
validate:schemas passes. The built bundle contains no accounts.google.com, openidconnect or Drive REST URL.
The Drive tab was checked in a 375 px browser preview (unlinked state). No live Apps Script was run: the
coder has no Google account.

## Only the athlete can check (after merge and deploy)
1. The Allow screen at step 2 of `apps-script/README.md`: it must speak only of the Drive files this app
   creates. If it asks for all of Drive, stop: the scope is not widened without her decision.
2. First "Enregistrer": the folder `Coach Concours app (script)` with `Données` (holding
   `coach-concours-state-v2.json`) and `Sauvegardes` appears in her Drive. If the sync answers
   "Erreur du script (script_error)", Google refused the call under drive.file alone: report it, do not widen.
3. Reload test: quit the app fully and reopen it (the PWA can serve the old code until then), or tap
   "Recharger" on the next deploy. The app opens linked, the dot turns "Drive à jour", nothing is asked.
4. The repository secret `VITE_GOOGLE_CLIENT_ID` and the old OAuth client are no longer used; deleting
   them is her choice.

## Questions / not done
- No sporting question.
- Untracked files in the repository root (`NOTE_no_terminal_git_workarounds.md`, `*.tsbuildinfo`) left alone.
- The cockpit is not touched from this session.

Commit: see the last line.
Code commit: 409fa2b
Commit hash: 409fa2b
