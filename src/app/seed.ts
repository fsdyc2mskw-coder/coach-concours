import { generateTrainingPlan } from '../domain/planEngine';
import type { Activity, AppState, AthleteProfile, TrainingGoal } from '../domain/types';
import { addDays, createId, parseDateKey, todayKey } from '../domain/utils';

export function createEmptyState(): AppState {
  return {
    schemaVersion: 1,
    profile: null,
    goal: null,
    plan: null,
    activities: [],
    sessionFeedback: [],
    appFeedback: [],
    settings: {
      adaptationMode: 'review',
      screenshotByDefault: true,
      requireGoogleAuth: import.meta.env.VITE_REQUIRE_GOOGLE_AUTH === 'true',
      trailRegion: 'lausanne',
      ...(import.meta.env.VITE_GARMIN_BRIDGE_URL
        ? { garminBridgeUrl: import.meta.env.VITE_GARMIN_BRIDGE_URL }
        : {})
    },
    drive: {
      connected: false,
      files: {}
    },
    garmin: {
      mode: import.meta.env.VITE_GARMIN_BRIDGE_URL ? 'bridge-configured' : 'bridge-unconfigured'
    }
  };
}

export function createDemoState(referenceDate = todayKey()): AppState {
  const now = new Date().toISOString();
  const profile: AthleteProfile = {
    id: 'me',
    displayName: 'Max',
    locale: 'fr-CH',
    timezone: 'Europe/Zurich',
    weeklyRunningDistanceKm: 24,
    easyPaceSecPerKm: 390,
    runSessionsPerWeek: 4,
    strengthSessionsPerWeek: 1,
    createdAt: now,
    updatedAt: now
  };
  const goal: TrainingGoal = {
    id: createId('goal'),
    kind: 'race',
    name: 'Trail court objectif',
    targetDate: addDays(referenceDate, 70),
    distanceKm: 20,
    elevationGainM: 1_000,
    createdAt: now,
    updatedAt: now
  };
  const activities = createDemoActivities(referenceDate);
  const plan = generateTrainingPlan({ profile, goal, activities, startDate: referenceDate });
  return {
    ...createEmptyState(),
    profile,
    goal,
    activities,
    plan,
    garmin: {
      mode: 'demo',
      lastSyncAt: now
    }
  };
}

export function createDemoActivities(referenceDate = todayKey()): Activity[] {
  const patterns = [
    { daysAgo: 3, km: 8.4, min: 55, dPlus: 180, bpm: 143, name: 'Endurance vallonnée' },
    { daysAgo: 6, km: 13.2, min: 94, dPlus: 520, bpm: 147, name: 'Sortie trail' },
    { daysAgo: 10, km: 7.1, min: 44, dPlus: 80, bpm: 151, name: 'Tempo progressif' },
    { daysAgo: 13, km: 11.6, min: 82, dPlus: 410, bpm: 145, name: 'Trail facile' },
    { daysAgo: 17, km: 6.8, min: 45, dPlus: 120, bpm: 142, name: 'Endurance' },
    { daysAgo: 20, km: 14.4, min: 105, dPlus: 650, bpm: 149, name: 'Sortie longue' },
    { daysAgo: 24, km: 7.6, min: 48, dPlus: 90, bpm: 146, name: 'Course facile' },
    { daysAgo: 27, km: 10.8, min: 76, dPlus: 350, bpm: 144, name: 'Trail vallonné' }
  ];

  return patterns.map((item) => {
    const dateKey = addDays(referenceDate, -item.daysAgo);
    const date = parseDateKey(dateKey);
    date.setHours(18, 0, 0, 0);
    return {
      id: createId('activity'),
      externalId: `demo-${dateKey}`,
      source: 'demo',
      name: item.name,
      startedAt: date.toISOString(),
      durationSec: item.min * 60,
      distanceM: Math.round(item.km * 1_000),
      averagePaceSecPerKm: Math.round((item.min * 60) / item.km),
      averageHeartRateBpm: item.bpm,
      elevationGainM: item.dPlus,
      importedAt: new Date().toISOString()
    };
  });
}
