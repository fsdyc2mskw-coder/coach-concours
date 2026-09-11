import type { CoachState } from '../coach/types';
import { GoogleDriveClient } from './googleDrive';
import { parseCoachState, stateForDrive } from './coachStorage';

const STATE_FILE = 'coach-concours-state-v2.json';

export interface DriveSyncResult {
  state: CoachState;
  fileId: string;
  rootFolderId: string;
  backupsFolderId: string;
}

export async function syncCoachState(accessToken: string, local: CoachState, accountEmail: string): Promise<DriveSyncResult> {
  const client = new GoogleDriveClient(accessToken);
  const root = await client.ensureFolder('Coach Concours');
  const data = await client.ensureFolder('Données application', root.id);
  const backups = await client.ensureFolder('Sauvegardes', root.id);
  const remoteFile = local.drive.fileId
    ? await client.getFile(local.drive.fileId).catch(() => null)
    : await client.findFile(STATE_FILE, data.id);

  let state = local;
  if (remoteFile) {
    const remote = parseCoachState(JSON.parse(await client.readTextFile(remoteFile.id)) as unknown);
    if (remote.revision > local.revision && Object.keys(local.results).length === 0) state = remote;
    else if (remote.revision > local.revision) throw new Error('Une version plus récente existe sur Drive. Les saisies locales sont conservées : utilise l’autre appareil pour synchroniser, puis recharge ici.');
  }

  const syncedAt = new Date().toISOString();
  const next: CoachState = {
    ...state,
    updatedAt: syncedAt,
    drive: {
      status: 'synced', fileId: remoteFile?.id ?? state.drive.fileId, rootFolderId: root.id,
      backupsFolderId: backups.id, accountEmail, lastSyncAt: syncedAt
    }
  };
  const payload = JSON.stringify(stateForDrive(next), null, 2);
  const saved = await client.upsertTextFile({ name: STATE_FILE, content: payload, mimeType: 'application/json', parentId: data.id, fileId: remoteFile?.id });
  next.drive.fileId = saved.id;
  return { state: next, fileId: saved.id, rootFolderId: root.id, backupsFolderId: backups.id };
}

export async function createDriveBackup(accessToken: string, state: CoachState): Promise<void> {
  if (!state.drive.rootFolderId) throw new Error('Connecte Google Drive avant de créer une sauvegarde.');
  const client = new GoogleDriveClient(accessToken);
  const folder = state.drive.backupsFolderId
    ? await client.getFile(state.drive.backupsFolderId)
    : await client.ensureFolder('Sauvegardes', state.drive.rootFolderId);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  await client.upsertTextFile({ name: `coach-concours-${stamp}.json`, content: JSON.stringify(stateForDrive(state), null, 2), mimeType: 'application/json', parentId: folder.id });
}
