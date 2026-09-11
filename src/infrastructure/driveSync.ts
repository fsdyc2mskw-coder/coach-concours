import { buildClaudeContextJson, buildClaudeContextMarkdown } from '../domain/exports';
import planUpdateJsonSchema from '../../schemas/plan-update.schema.json';
import type {
  Activity,
  AppFeedback,
  AppState,
  DriveFileRegistry,
  PlanUpdate,
  PlannedWorkout,
  SessionFeedback
} from '../domain/types';
import { GoogleDriveClient } from './googleDrive';

const ROOT_FOLDER_NAME = 'Trail Coach';
const CONTEXT_FOLDER_NAME = 'context';
const CLAUDE_FOLDER_NAME = 'claude';
const FEEDBACK_FOLDER_NAME = 'feedback';
const SESSION_FEEDBACK_FOLDER_NAME = 'training-feedback';
const SCREENSHOTS_FOLDER_NAME = 'screenshots';

export interface DriveSyncResult {
  files: DriveFileRegistry;
  syncedAppFeedbackIds: string[];
  syncedSessionFeedbackIds: string[];
  syncedAt: string;
}

export async function syncAppStateToDrive(
  client: GoogleDriveClient,
  state: AppState
): Promise<DriveSyncResult> {
  const files: DriveFileRegistry = { ...state.drive.files };
  const root = files.rootFolderId
    ? await client.getFile(files.rootFolderId).catch(() => null)
    : null;
  const rootFolder = root ?? (await client.ensureFolder(ROOT_FOLDER_NAME));
  files.rootFolderId = rootFolder.id;

  const contextFolder = files.contextFolderId
    ? await client.getFile(files.contextFolderId).catch(() => null)
    : null;
  const ensuredContextFolder =
    contextFolder ?? (await client.ensureFolder(CONTEXT_FOLDER_NAME, rootFolder.id));
  files.contextFolderId = ensuredContextFolder.id;

  const claudeFolder = files.claudeFolderId
    ? await client.getFile(files.claudeFolderId).catch(() => null)
    : null;
  const ensuredClaudeFolder =
    claudeFolder ?? (await client.ensureFolder(CLAUDE_FOLDER_NAME, rootFolder.id));
  files.claudeFolderId = ensuredClaudeFolder.id;

  const feedbackFolder = files.feedbackFolderId
    ? await client.getFile(files.feedbackFolderId).catch(() => null)
    : null;
  const ensuredFeedbackFolder =
    feedbackFolder ?? (await client.ensureFolder(FEEDBACK_FOLDER_NAME, rootFolder.id));
  files.feedbackFolderId = ensuredFeedbackFolder.id;

  const sessionFeedbackFolder = files.sessionFeedbackFolderId
    ? await client.getFile(files.sessionFeedbackFolderId).catch(() => null)
    : null;
  const ensuredSessionFeedbackFolder =
    sessionFeedbackFolder ??
    (await client.ensureFolder(SESSION_FEEDBACK_FOLDER_NAME, rootFolder.id));
  files.sessionFeedbackFolderId = ensuredSessionFeedbackFolder.id;

  const screenshotsFolder = files.screenshotsFolderId
    ? await client.getFile(files.screenshotsFolderId).catch(() => null)
    : null;
  const ensuredScreenshotsFolder =
    screenshotsFolder ?? (await client.ensureFolder(SCREENSHOTS_FOLDER_NAME, rootFolder.id));
  files.screenshotsFolderId = ensuredScreenshotsFolder.id;

  const contextJson = await client.upsertTextFile({
    name: 'latest-context.json',
    content: buildClaudeContextJson(state),
    mimeType: 'application/json',
    parentId: ensuredContextFolder.id,
    ...(files.contextJsonFileId ? { fileId: files.contextJsonFileId } : {})
  });
  files.contextJsonFileId = contextJson.id;

  const contextMarkdown = await client.upsertTextFile({
    name: 'latest-context.md',
    content: buildClaudeContextMarkdown(state),
    mimeType: 'text/markdown',
    parentId: ensuredContextFolder.id,
    ...(files.contextMarkdownFileId ? { fileId: files.contextMarkdownFileId } : {})
  });
  files.contextMarkdownFileId = contextMarkdown.id;

  if (state.plan) {
    const planUpdateSchema = await client.upsertTextFile({
      name: 'plan-update.schema.json',
      content: `${JSON.stringify(planUpdateJsonSchema, null, 2)}\n`,
      mimeType: 'application/json',
      parentId: ensuredClaudeFolder.id,
      ...(files.planUpdateSchemaFileId ? { fileId: files.planUpdateSchemaFileId } : {})
    });
    files.planUpdateSchemaFileId = planUpdateSchema.id;

    const planUpdate = await client.createTextFileIfMissing({
      name: 'plan-update.json',
      content: createNoOpPlanUpdateFile(state),
      mimeType: 'application/json',
      parentId: ensuredClaudeFolder.id
    });
    files.planUpdateFileId = planUpdate.id;
    await refreshTemplatePlanUpdate(client, state, planUpdate.id, ensuredClaudeFolder.id);

    await client.upsertTextFile({
      name: 'README.md',
      content: claudeFolderReadme(state),
      mimeType: 'text/markdown',
      parentId: ensuredClaudeFolder.id
    });
  }

  const pendingAppFeedback = state.appFeedback.filter((feedback) => feedback.syncStatus !== 'synced');
  const syncedAppFeedbackIds: string[] = [];
  for (const feedback of pendingAppFeedback) {
    await uploadAppFeedback(
      client,
      feedback,
      ensuredFeedbackFolder.id,
      ensuredScreenshotsFolder.id
    );
    syncedAppFeedbackIds.push(feedback.id);
  }

  const pendingSessionFeedback = state.sessionFeedback.filter(
    (feedback) => feedback.syncStatus !== 'synced'
  );
  const syncedSessionFeedbackIds: string[] = [];
  for (const feedback of pendingSessionFeedback) {
    await uploadSessionFeedback(client, state, feedback, ensuredSessionFeedbackFolder.id);
    syncedSessionFeedbackIds.push(feedback.id);
  }

  return {
    files,
    syncedAppFeedbackIds,
    syncedSessionFeedbackIds,
    syncedAt: new Date().toISOString()
  };
}

export async function readPlanUpdateFromDrive(
  client: GoogleDriveClient,
  files: DriveFileRegistry
): Promise<string> {
  if (!files.planUpdateFileId) {
    throw new Error("Le fichier d'adaptation Claude n'a pas encore été créé.");
  }
  return client.readTextFile(files.planUpdateFileId);
}

export async function resetPlanUpdateFile(
  client: GoogleDriveClient,
  state: AppState
): Promise<void> {
  if (!state.plan || !state.drive.files.planUpdateFileId || !state.drive.files.claudeFolderId) {
    throw new Error("Le fichier d'adaptation n'est pas initialisé.");
  }
  await client.upsertTextFile({
    name: 'plan-update.json',
    content: createNoOpPlanUpdateFile(state),
    mimeType: 'application/json',
    parentId: state.drive.files.claudeFolderId,
    fileId: state.drive.files.planUpdateFileId
  });
}

function createNoOpPlanUpdateFile(state: AppState): string {
  if (!state.plan) {
    return '{}\n';
  }
  const update: PlanUpdate = {
    schemaVersion: '1.0',
    updateId: `template-${state.plan.id}-v${state.plan.version}`,
    basePlanId: state.plan.id,
    basePlanVersion: state.plan.version,
    generatedAt: new Date().toISOString(),
    summary: 'Aucune adaptation proposée. Remplacer ce contenu avec la réponse structurée de Claude.',
    operations: []
  };
  return `${JSON.stringify(update, null, 2)}\n`;
}

async function refreshTemplatePlanUpdate(
  client: GoogleDriveClient,
  state: AppState,
  fileId: string,
  parentId: string
): Promise<void> {
  let currentText: string;
  try {
    currentText = await client.readTextFile(fileId);
  } catch {
    return;
  }

  let current: unknown;
  try {
    current = JSON.parse(currentText) as unknown;
  } catch {
    return;
  }
  if (!isGeneratedNoOpTemplate(current)) {
    return;
  }

  await client.upsertTextFile({
    name: 'plan-update.json',
    content: createNoOpPlanUpdateFile(state),
    mimeType: 'application/json',
    parentId,
    fileId
  });
}

function isGeneratedNoOpTemplate(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as { updateId?: unknown; operations?: unknown };
  return (
    typeof candidate.updateId === 'string' &&
    candidate.updateId.startsWith('template-') &&
    Array.isArray(candidate.operations) &&
    candidate.operations.length === 0
  );
}

function claudeFolderReadme(state: AppState): string {
  const planLine = state.plan
    ? `Le plan courant est \`${state.plan.id}\`, version \`${state.plan.version}\`.`
    : 'Aucun plan n’est encore généré.';
  return `# Échange Claude ↔ Trail Coach

${planLine}

1. Lire \`../context/latest-context.md\` et, pour les données exactes, \`../context/latest-context.json\`.
2. Lire \`plan-update.schema.json\` dans ce dossier et produire un objet JSON strictement conforme.
3. Remplacer le contenu de \`plan-update.json\` sans renommer ni dupliquer le fichier.
4. Ne modifier que des séances futures.
5. Ne jamais cibler \`goalWorkoutId\` ni ajouter de séance le jour de la course.
6. Garder \`minSecPerKm <= maxSecPerKm\` pour chaque plage d’allure.
7. L’application affiche un aperçu avant application, sauf si le mode automatique sûr est activé.

Si Claude ne peut pas modifier directement ce fichier dans Google Drive, copier le JSON produit dans la zone d’import de l’application. Cette solution de secours conserve exactement le même format.
`;
}

async function uploadAppFeedback(
  client: GoogleDriveClient,
  feedback: AppFeedback,
  feedbackFolderId: string,
  screenshotsFolderId: string
): Promise<void> {
  const baseName = `${feedback.createdAt.slice(0, 10)}_${feedback.id}`;
  let screenshotName: string | null = null;
  if (feedback.screenshotDataUrl) {
    screenshotName = `${baseName}.jpg`;
    await client.uploadDataUrl({
      name: screenshotName,
      dataUrl: feedback.screenshotDataUrl,
      parentId: screenshotsFolderId
    });
  }

  const serializable = {
    ...feedback,
    syncStatus: 'synced' as const,
    screenshotDataUrl: undefined,
    screenshotFile: screenshotName
  };
  await client.upsertTextFile({
    name: `${baseName}.json`,
    content: `${JSON.stringify(serializable, null, 2)}\n`,
    mimeType: 'application/json',
    parentId: feedbackFolderId
  });
  await client.upsertTextFile({
    name: `${baseName}.md`,
    content: appFeedbackMarkdown(feedback, screenshotName),
    mimeType: 'text/markdown',
    parentId: feedbackFolderId
  });
}

async function uploadSessionFeedback(
  client: GoogleDriveClient,
  state: AppState,
  feedback: SessionFeedback,
  parentId: string
): Promise<void> {
  const workout = state.plan?.workouts.find((item) => item.id === feedback.workoutId) ?? null;
  const activity = feedback.activityId
    ? state.activities.find((item) => item.id === feedback.activityId) ?? null
    : null;
  const baseName = `${feedback.createdAt.slice(0, 10)}_${feedback.id}`;
  const serializable = {
    ...feedback,
    syncStatus: 'synced' as const,
    workout,
    activity
  };

  await client.upsertTextFile({
    name: `${baseName}.json`,
    content: `${JSON.stringify(serializable, null, 2)}\n`,
    mimeType: 'application/json',
    parentId
  });
  await client.upsertTextFile({
    name: `${baseName}.md`,
    content: sessionFeedbackMarkdown(feedback, workout, activity),
    mimeType: 'text/markdown',
    parentId
  });
}

function sessionFeedbackMarkdown(
  feedback: SessionFeedback,
  workout: PlannedWorkout | null,
  activity: Activity | null
): string {
  const workoutSection = workout
    ? `- Séance : ${workout.title}\n- Date prévue : ${workout.date}\n- Type : ${workout.type}\n- Prévu : ${workout.plannedDistanceKm} km · ${workout.plannedDurationMin} min · ${workout.plannedElevationGainM} m D+`
    : `- Identifiant de séance : ${feedback.workoutId}`;
  const activitySection = activity
    ? `## Activité réalisée\n\n- Nom : ${activity.name}\n- Départ : ${activity.startedAt}\n- Distance : ${(activity.distanceM / 1_000).toFixed(1)} km\n- Durée : ${Math.round(activity.durationSec / 60)} min\n- Dénivelé positif : ${activity.elevationGainM} m${activity.averageHeartRateBpm ? `\n- Fréquence cardiaque moyenne : ${activity.averageHeartRateBpm} bpm` : ''}`
    : '## Activité réalisée\n\nAucune activité liée.';

  return `# Feedback d’entraînement

- Identifiant : ${feedback.id}
- Enregistré : ${feedback.createdAt}
${workoutSection}
- Effort ressenti : ${feedback.effort}/5

## Commentaire

${feedback.comment || 'Aucun commentaire.'}

${activitySection}
`;
}

function appFeedbackMarkdown(feedback: AppFeedback, screenshotName: string | null): string {
  const technical = feedback.technical;
  return `# Feedback application

- Identifiant : ${feedback.id}
- Date : ${feedback.createdAt}
- Écran : ${technical.route}
- Fonction : ${technical.featureId}
- Version : ${technical.appVersion}
- Appareil logique : ${technical.viewport.width} × ${technical.viewport.height}
- Écran physique : ${technical.screen.width} × ${technical.screen.height}
- Navigateur : ${technical.userAgent}
- En ligne : ${technical.online ? 'oui' : 'non'}
- Capture : ${screenshotName ?? 'aucune'}

## Retour

${feedback.message}

${technical.lastError ? `## Dernière erreur technique\n\n${technical.lastError}\n` : ''}`;
}
