import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { buildClaudeContextJson, buildClaudeContextMarkdown } from '../domain/exports';
import {
  generateTrainingPlan,
  markWorkoutCompleted,
  markWorkoutSkipped,
  moveWorkout as moveWorkoutInPlan
} from '../domain/planEngine';
import { previewPlanUpdate } from '../domain/planUpdates';
import type {
  Activity,
  AppFeedback,
  AppSettings,
  AppState,
  AthleteProfile,
  DriveSyncState,
  GarminSyncState,
  PlanUpdatePreview,
  SessionFeedback,
  TrainingGoal
} from '../domain/types';
import { createId, downloadTextFile, parseDateKey, todayKey } from '../domain/utils';
import { readPlanUpdateFromDrive, resetPlanUpdateFile, syncAppStateToDrive } from '../infrastructure/driveSync';
import { GoogleDriveClient } from '../infrastructure/googleDrive';
import {
  requestGoogleSession,
  revokeGoogleSession,
  type GoogleSession
} from '../infrastructure/googleIdentity';
import { clearAppState, loadAppState, saveAppState } from '../infrastructure/storage';
import { createDemoState, createEmptyState } from './seed';
import { migrateStoredState } from './migrations';

export interface OnboardingInput {
  displayName: string;
  goalKind: 'race' | 'progression';
  goalName: string;
  targetDate?: string;
  distanceKm?: number;
  elevationGainM?: number;
  weeklyRunningDistanceKm?: number;
  easyPaceSecPerKm?: number;
}

export interface CompleteWorkoutInput {
  workoutId: string;
  actualDistanceKm: number;
  actualDurationMin: number;
  actualElevationGainM: number;
  averageHeartRateBpm?: number;
  effort: 1 | 2 | 3 | 4 | 5;
  comment: string;
}

export interface ManualActivityInput {
  name: string;
  date: string;
  distanceKm: number;
  durationMin: number;
  elevationGainM: number;
  averageHeartRateBpm?: number;
}

interface AppContextValue {
  state: AppState;
  ready: boolean;
  loadError: string | null;
  googleSession: GoogleSession | null;
  driveBusy: boolean;
  initializeProfile(input: OnboardingInput): void;
  loadDemo(): void;
  regeneratePlan(): void;
  moveWorkout(workoutId: string, newDate: string): void;
  completeWorkout(input: CompleteWorkoutInput): Promise<void>;
  skipWorkout(workoutId: string): void;
  addManualActivity(input: ManualActivityInput): void;
  importActivities(
    activities: Activity[],
    syncedAt?: string,
    mode?: GarminSyncState['mode']
  ): void;
  recordGarminSyncError(message: string): void;
  addAppFeedback(feedback: AppFeedback): Promise<void>;
  updateSettings(patch: Partial<AppSettings>): void;
  connectGoogle(): Promise<void>;
  disconnectGoogle(): Promise<void>;
  syncDrive(): Promise<void>;
  previewUpdateText(text: string): PlanUpdatePreview;
  readUpdateFromDrive(): Promise<string>;
  applyUpdate(preview: PlanUpdatePreview): Promise<void>;
  resetDriveUpdateFile(): Promise<void>;
  exportClaudeFiles(): void;
  recordTechnicalError(message: string): void;
  resetEverything(): Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => createEmptyState());
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [googleSession, setGoogleSession] = useState<GoogleSession | null>(null);
  const [driveBusy, setDriveBusy] = useState(false);
  const stateRef = useRef(state);
  const readyRef = useRef(false);
  const persistenceAllowedRef = useRef(false);
  const sessionRef = useRef<GoogleSession | null>(null);
  const driveSyncQueueRef = useRef<Promise<void>>(Promise.resolve());

  const commit = useCallback((next: AppState) => {
    stateRef.current = next;
    setState(next);
    if (readyRef.current && persistenceAllowedRef.current) {
      void saveAppState(next).catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void loadAppState().then((stored) => {
      if (!active) {
        return;
      }
      const configuredGoogleRequirement = import.meta.env.VITE_REQUIRE_GOOGLE_AUTH;
      const configuredGarminBridge = import.meta.env.VITE_GARMIN_BRIDGE_URL;
      const initial = stored?.schemaVersion === 1
        ? migrateStoredState({
            ...stored,
            settings: {
              ...stored.settings,
              trailRegion: stored.settings.trailRegion ?? 'lausanne',
              ...(configuredGoogleRequirement !== undefined
                ? { requireGoogleAuth: configuredGoogleRequirement === 'true' }
                : {}),
              ...(configuredGarminBridge ? { garminBridgeUrl: configuredGarminBridge } : {})
            },
            drive: { ...stored.drive, connected: false, account: stored.drive.account },
            garmin: {
              ...stored.garmin,
              mode: configuredGarminBridge ? 'bridge-configured' as const : stored.garmin.mode
            }
          })
        : createEmptyState();
      stateRef.current = initial;
      setState(initial);
      persistenceAllowedRef.current = true;
      readyRef.current = true;
      setReady(true);
    }).catch((cause: unknown) => {
      if (!active) return;
      const message = `Chargement local impossible : ${cause instanceof Error ? cause.message : String(cause)}`;
      const initial = {
        ...createEmptyState(),
        lastTechnicalError: message
      };
      stateRef.current = initial;
      setState(initial);
      setLoadError(message);
      persistenceAllowedRef.current = false;
      readyRef.current = true;
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready || !persistenceAllowedRef.current) {
      return;
    }
    const flush = () => void saveAppState(stateRef.current).catch(() => undefined);
    const flushWhenHidden = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', flushWhenHidden);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', flushWhenHidden);
    };
  }, [ready]);

  const initializeProfile = useCallback(
    (input: OnboardingInput) => {
      assertOnboardingInput(input);
      const now = new Date().toISOString();
      const profile: AthleteProfile = {
        id: 'me',
        displayName: input.displayName.trim() || 'Max',
        locale: 'fr-CH',
        timezone: 'Europe/Zurich',
        weeklyRunningDistanceKm: input.weeklyRunningDistanceKm ?? 20,
        easyPaceSecPerKm: input.easyPaceSecPerKm ?? 390,
        runSessionsPerWeek: 4,
        strengthSessionsPerWeek: 1,
        createdAt: now,
        updatedAt: now
      };
      const goal: TrainingGoal = {
        id: createId('goal'),
        kind: input.goalKind,
        name: input.goalName.trim() || (input.goalKind === 'race' ? 'Trail objectif' : 'Progression trail'),
        createdAt: now,
        updatedAt: now,
        ...(input.goalKind === 'race' && input.targetDate ? { targetDate: input.targetDate } : {}),
        ...(input.goalKind === 'race' && input.distanceKm ? { distanceKm: input.distanceKm } : {}),
        ...(input.goalKind === 'race' && typeof input.elevationGainM === 'number'
          ? { elevationGainM: input.elevationGainM }
          : {})
      };
      const current = stateRef.current;
      const plan = generateTrainingPlan({
        profile,
        goal,
        activities: current.activities,
        startDate: todayKey()
      });
      const next = { ...current, profile, goal, plan };
      commit(next);
      void attemptAutomaticDriveSync(next);
    },
    [commit]
  );

  const loadDemo = useCallback(() => {
    commit(createDemoState());
  }, [commit]);

  const regeneratePlan = useCallback(() => {
    const current = stateRef.current;
    if (!current.profile || !current.goal) {
      return;
    }
    const plan = generateTrainingPlan({
      profile: current.profile,
      goal: current.goal,
      activities: current.activities,
      startDate: todayKey()
    });
    const next = { ...current, plan };
    commit(next);
    void attemptAutomaticDriveSync(next);
  }, [commit]);

  const moveWorkout = useCallback(
    (workoutId: string, newDate: string) => {
      const current = stateRef.current;
      if (!current.plan) {
        return;
      }
      if (newDate < todayKey()) {
        throw new Error('Une séance ne peut pas être déplacée vers une date passée.');
      }
      const next = { ...current, plan: moveWorkoutInPlan(current.plan, workoutId, newDate) };
      commit(next);
      void attemptAutomaticDriveSync(next);
    },
    [commit]
  );

  const completeWorkout = useCallback(
    async (input: CompleteWorkoutInput) => {
      const current = stateRef.current;
      if (!current.plan) {
        throw new Error('Aucun plan actif.');
      }
      const workout = current.plan.workouts.find((item) => item.id === input.workoutId);
      if (!workout) {
        throw new Error('Séance introuvable.');
      }
      assertRecordedActivityValues({
        date: workout.date,
        distanceKm: input.actualDistanceKm,
        durationMin: input.actualDurationMin,
        elevationGainM: input.actualElevationGainM,
        averageHeartRateBpm: input.averageHeartRateBpm
      });
      const now = new Date().toISOString();
      const activityId = createId('activity');
      const distanceM = Math.max(0, Math.round(input.actualDistanceKm * 1_000));
      const durationSec = Math.max(60, Math.round(input.actualDurationMin * 60));
      const activity: Activity = {
        id: activityId,
        source: 'manual',
        name: workout.title,
        startedAt: localDateToIso(workout.date),
        durationSec,
        distanceM,
        averagePaceSecPerKm: distanceM > 0 ? Math.round(durationSec / (distanceM / 1_000)) : 0,
        ...(input.averageHeartRateBpm
          ? { averageHeartRateBpm: Math.round(input.averageHeartRateBpm) }
          : {}),
        elevationGainM: Math.max(0, Math.round(input.actualElevationGainM)),
        importedAt: now
      };
      const feedback: SessionFeedback = {
        id: createId('session-feedback'),
        workoutId: workout.id,
        activityId,
        effort: input.effort,
        comment: input.comment.trim(),
        createdAt: now,
        syncStatus: 'pending'
      };
      const plan = markWorkoutCompleted(current.plan, workout.id, activityId);
      const next = {
        ...current,
        plan,
        activities: [activity, ...current.activities],
        sessionFeedback: [feedback, ...current.sessionFeedback]
      };
      commit(next);
      await attemptAutomaticDriveSync(next);
    },
    [commit]
  );

  const skipWorkout = useCallback(
    (workoutId: string) => {
      const current = stateRef.current;
      if (!current.plan) {
        return;
      }
      const next = {
        ...current,
        plan: markWorkoutSkipped(current.plan, workoutId)
      };
      commit(next);
      void attemptAutomaticDriveSync(next);
    },
    [commit]
  );

  const addManualActivity = useCallback(
    (input: ManualActivityInput) => {
      assertRecordedActivityValues(input);
      const current = stateRef.current;
      const durationSec = Math.max(60, Math.round(input.durationMin * 60));
      const distanceM = Math.max(0, Math.round(input.distanceKm * 1_000));
      const activity: Activity = {
        id: createId('activity'),
        source: 'manual',
        name: input.name.trim() || 'Course',
        startedAt: localDateToIso(input.date),
        durationSec,
        distanceM,
        averagePaceSecPerKm: distanceM > 0 ? Math.round(durationSec / (distanceM / 1_000)) : 0,
        ...(input.averageHeartRateBpm
          ? { averageHeartRateBpm: Math.round(input.averageHeartRateBpm) }
          : {}),
        elevationGainM: Math.max(0, Math.round(input.elevationGainM)),
        importedAt: new Date().toISOString()
      };
      const next = { ...current, activities: [activity, ...current.activities] };
      commit(next);
      void attemptAutomaticDriveSync(next);
    },
    [commit]
  );

  const importActivities = useCallback(
    (activities: Activity[], syncedAt?: string, mode?: GarminSyncState['mode']) => {
      const current = stateRef.current;
      const known = new Set(
        current.activities.map((activity) => activity.externalId || `${activity.startedAt}-${activity.distanceM}`)
      );
      const additions = activities.filter(
        (activity) => !known.has(activity.externalId || `${activity.startedAt}-${activity.distanceM}`)
      );
      const next = {
        ...current,
        activities: [...additions, ...current.activities].sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
        garmin: {
          ...current.garmin,
          ...(mode ? { mode } : {}),
          ...(syncedAt ? { lastSyncAt: syncedAt } : {}),
          lastSyncError: undefined
        }
      };
      commit(next);
      void attemptAutomaticDriveSync(next);
    },
    [commit]
  );

  const recordGarminSyncError = useCallback(
    (message: string) => {
      const current = stateRef.current;
      commit({
        ...current,
        garmin: { ...current.garmin, lastSyncError: message }
      });
    },
    [commit]
  );

  const addAppFeedback = useCallback(
    async (feedback: AppFeedback) => {
      const current = stateRef.current;
      const next = { ...current, appFeedback: [feedback, ...current.appFeedback] };
      commit(next);
      await attemptAutomaticDriveSync(next);
    },
    [commit]
  );

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      const current = stateRef.current;
      commit({ ...current, settings: { ...current.settings, ...patch } });
    },
    [commit]
  );

  const connectGoogle = useCallback(async () => {
    const clientId = stateRef.current.settings.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    setDriveBusy(true);
    try {
      const session = await requestGoogleSession(clientId);
      sessionRef.current = session;
      setGoogleSession(session);
      const current = stateRef.current;
      const drive: DriveSyncState = {
        ...current.drive,
        connected: true,
        account: session.account,
        lastSyncError: undefined
      };
      const next = { ...current, drive };
      commit(next);
      await enqueueDriveSync(next, session);
    } catch (error) {
      const message = errorMessage(error);
      const current = stateRef.current;
      commit({
        ...current,
        drive: { ...current.drive, connected: false, lastSyncError: message }
      });
      throw error;
    } finally {
      setDriveBusy(false);
    }
  }, [commit]);

  const disconnectGoogle = useCallback(async () => {
    const session = sessionRef.current;
    if (session) {
      await revokeGoogleSession(session);
    }
    sessionRef.current = null;
    setGoogleSession(null);
    const current = stateRef.current;
    commit({ ...current, drive: { ...current.drive, connected: false } });
  }, [commit]);

  const syncDrive = useCallback(async () => {
    const session = requireActiveSession();
    setDriveBusy(true);
    try {
      await enqueueDriveSync(stateRef.current, session);
    } finally {
      setDriveBusy(false);
    }
  }, []);

  const previewUpdateText = useCallback((text: string): PlanUpdatePreview => {
    const current = stateRef.current;
    if (!current.plan) {
      throw new Error('Aucun plan actif.');
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      throw new Error("Le contenu d'adaptation n'est pas un JSON valide.");
    }
    return previewPlanUpdate(current.plan, parsed);
  }, []);

  const readUpdateFromDrive = useCallback(async () => {
    const session = requireActiveSession();
    const client = new GoogleDriveClient(session.accessToken);
    return readPlanUpdateFromDrive(client, stateRef.current.drive.files);
  }, []);

  const applyUpdate = useCallback(
    async (preview: PlanUpdatePreview) => {
      const current = stateRef.current;
      if (!current.plan) {
        throw new Error('Aucun plan actif.');
      }
      if (preview.update.operations.length === 0) {
        throw new Error('Aucune modification n’est proposée dans cette adaptation.');
      }
      // Revalidate against the current plan immediately before applying. The
      // user may have moved, completed or skipped a workout after opening the
      // preview, which must make the external proposal stale rather than
      // overwrite the newer local state.
      const currentPreview = previewPlanUpdate(current.plan, preview.update);
      const next = { ...current, plan: currentPreview.resultingPlan };
      commit(next);
      await attemptAutomaticDriveSync(next);
    },
    [commit]
  );

  const resetDriveUpdateFile = useCallback(async () => {
    const session = requireActiveSession();
    const client = new GoogleDriveClient(session.accessToken);
    await resetPlanUpdateFile(client, stateRef.current);
  }, []);

  const exportClaudeFiles = useCallback(() => {
    const current = stateRef.current;
    downloadTextFile('trail-coach-context.json', buildClaudeContextJson(current), 'application/json');
    downloadTextFile('trail-coach-context.md', buildClaudeContextMarkdown(current), 'text/markdown');
  }, []);

  const recordTechnicalError = useCallback(
    (message: string) => {
      const current = stateRef.current;
      commit({ ...current, lastTechnicalError: message });
    },
    [commit]
  );

  const resetEverything = useCallback(async () => {
    await clearAppState();
    sessionRef.current = null;
    setGoogleSession(null);
    commit(createEmptyState());
  }, [commit]);

  async function performDriveSync(snapshot: AppState, session: GoogleSession): Promise<void> {
    if (session.expiresAt <= Date.now() + 15_000) {
      const message = 'La session Google a expiré. Reconnecter Google Drive.';
      sessionRef.current = null;
      setGoogleSession(null);
      const current = stateRef.current;
      commit({
        ...current,
        drive: { ...current.drive, connected: false, lastSyncError: message }
      });
      throw new Error(message);
    }
    const client = new GoogleDriveClient(session.accessToken);
    try {
      const result = await syncAppStateToDrive(client, snapshot);
      const current = stateRef.current;
      const syncedAppFeedback = new Set(result.syncedAppFeedbackIds);
      const syncedSessionFeedback = new Set(result.syncedSessionFeedbackIds);
      commit({
        ...current,
        appFeedback: current.appFeedback.map((feedback) =>
          syncedAppFeedback.has(feedback.id) ? { ...feedback, syncStatus: 'synced' as const } : feedback
        ),
        sessionFeedback: current.sessionFeedback.map((feedback) =>
          syncedSessionFeedback.has(feedback.id)
            ? { ...feedback, syncStatus: 'synced' as const }
            : feedback
        ),
        drive: {
          ...current.drive,
          connected: true,
          account: session.account,
          files: result.files,
          lastSyncAt: result.syncedAt,
          lastSyncError: undefined
        }
      });
    } catch (error) {
      const current = stateRef.current;
      commit({
        ...current,
        drive: { ...current.drive, lastSyncError: errorMessage(error) }
      });
      throw error;
    }
  }

  async function attemptAutomaticDriveSync(snapshot: AppState): Promise<void> {
    const session = sessionRef.current;
    if (!session || session.expiresAt <= Date.now() + 15_000) {
      return;
    }
    setDriveBusy(true);
    try {
      await enqueueDriveSync(snapshot, session);
    } catch {
      // The item remains pending and can be synchronized manually after reconnecting.
    } finally {
      setDriveBusy(false);
    }
  }

  function requireActiveSession(): GoogleSession {
    const session = sessionRef.current;
    if (!session || session.expiresAt <= Date.now() + 15_000) {
      const message = 'Google Drive n’est pas connecté ou la session a expiré.';
      sessionRef.current = null;
      setGoogleSession(null);
      const current = stateRef.current;
      commit({
        ...current,
        drive: { ...current.drive, connected: false, lastSyncError: message }
      });
      throw new Error(message);
    }
    return session;
  }

  function enqueueDriveSync(snapshot: AppState, session: GoogleSession): Promise<void> {
    const previous = driveSyncQueueRef.current.catch(() => undefined);
    const task = previous.then(() => performDriveSync(snapshot, session));
    driveSyncQueueRef.current = task.catch(() => undefined);
    return task;
  }

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      ready,
      loadError,
      googleSession,
      driveBusy,
      initializeProfile,
      loadDemo,
      regeneratePlan,
      moveWorkout,
      completeWorkout,
      skipWorkout,
      addManualActivity,
      importActivities,
      recordGarminSyncError,
      addAppFeedback,
      updateSettings,
      connectGoogle,
      disconnectGoogle,
      syncDrive,
      previewUpdateText,
      readUpdateFromDrive,
      applyUpdate,
      resetDriveUpdateFile,
      exportClaudeFiles,
      recordTechnicalError,
      resetEverything
    }),
    [
      state,
      ready,
      loadError,
      googleSession,
      driveBusy,
      initializeProfile,
      loadDemo,
      regeneratePlan,
      moveWorkout,
      completeWorkout,
      skipWorkout,
      addManualActivity,
      importActivities,
      recordGarminSyncError,
      addAppFeedback,
      updateSettings,
      connectGoogle,
      disconnectGoogle,
      syncDrive,
      previewUpdateText,
      readUpdateFromDrive,
      applyUpdate,
      resetDriveUpdateFile,
      exportClaudeFiles,
      recordTechnicalError,
      resetEverything
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp doit être utilisé dans AppProvider.');
  }
  return context;
}

function localDateToIso(dateKey: string): string {
  const date = parseDateKey(dateKey);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function assertRecordedActivityValues(input: {
  date: string;
  distanceKm: number;
  durationMin: number;
  elevationGainM: number;
  averageHeartRateBpm?: number;
}): void {
  const heartRate = input.averageHeartRateBpm;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.date) ||
    input.date > todayKey() ||
    !Number.isFinite(input.distanceKm) ||
    input.distanceKm < 0 ||
    !Number.isFinite(input.durationMin) ||
    input.durationMin <= 0 ||
    !Number.isFinite(input.elevationGainM) ||
    input.elevationGainM < 0 ||
    (heartRate !== undefined &&
      (!Number.isFinite(heartRate) || heartRate < 50 || heartRate > 230))
  ) {
    throw new Error('Les données réelles de l’activité ne sont pas valides.');
  }
}

function assertOnboardingInput(input: OnboardingInput): void {
  const weeklyDistance = input.weeklyRunningDistanceKm ?? 20;
  const easyPace = input.easyPaceSecPerKm ?? 390;
  if (
    !Number.isFinite(weeklyDistance) ||
    weeklyDistance < 5 ||
    weeklyDistance > 100 ||
    !Number.isFinite(easyPace) ||
    easyPace < 180 ||
    easyPace > 900
  ) {
    throw new Error('Le volume ou l’allure de référence n’est pas valide.');
  }
  if (input.goalKind !== 'race') {
    return;
  }
  const targetDate = input.targetDate ?? '';
  const distance = input.distanceKm;
  const elevation = input.elevationGainM;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(targetDate) ||
    targetDate < todayKey() ||
    distance === undefined ||
    !Number.isFinite(distance) ||
    distance < 5 ||
    distance > 30 ||
    elevation === undefined ||
    !Number.isFinite(elevation) ||
    elevation < 0 ||
    elevation > 5_000
  ) {
    throw new Error('Les paramètres de la course objectif ne sont pas valides.');
  }
}
