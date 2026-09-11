import { z } from 'zod';
import type { Activity } from '../../domain/types';
import { createId } from '../../domain/utils';
import type { ActivityProvider, ActivitySyncResult } from './provider';

const garminBridgeActivitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(250).optional(),
  startedAt: z.string().datetime(),
  durationSec: z.number().finite().positive().max(7 * 24 * 60 * 60),
  distanceM: z.number().finite().min(0).max(1_000_000),
  averagePaceSecPerKm: z.number().finite().min(0).max(10_000).optional(),
  averageHeartRateBpm: z.number().finite().min(30).max(250).optional(),
  elevationGainM: z.number().finite().min(0).max(100_000).optional()
});

type GarminBridgeActivity = z.infer<typeof garminBridgeActivitySchema>;

const garminBridgeResponseSchema = z.object({
  activities: z.array(garminBridgeActivitySchema).max(5_000),
  syncedAt: z.string().datetime().optional()
});

export class OfficialGarminBridgeProvider implements ActivityProvider {
  public readonly id = 'garmin-bridge' as const;
  public readonly displayName = 'Garmin Connect';

  public constructor(private readonly bridgeUrl?: string) {}

  public isConfigured(): boolean {
    return Boolean(this.bridgeUrl);
  }

  public async sync(since?: string): Promise<ActivitySyncResult> {
    if (!this.bridgeUrl) {
      throw new Error(
        'Le pont Garmin officiel n’est pas configuré. Le frontend ne doit jamais contenir de secret Garmin ni utiliser les identifiants Garmin Connect de l’utilisateur.'
      );
    }

    let url: URL;
    try {
      url = new URL('/api/garmin/activities', this.bridgeUrl);
    } catch {
      throw new Error('L’adresse du pont Garmin n’est pas valide.');
    }
    if (since) {
      url.searchParams.set('since', since);
    }

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Synchronisation Garmin impossible (${response.status}).`);
    }

    let rawPayload: unknown;
    try {
      rawPayload = await response.json();
    } catch {
      throw new Error('Le pont Garmin a renvoyé une réponse illisible.');
    }
    const parsed = garminBridgeResponseSchema.safeParse(rawPayload);
    if (!parsed.success) {
      throw new Error('Le pont Garmin a renvoyé des données non conformes au contrat attendu.');
    }

    const importedAt = new Date().toISOString();
    return {
      activities: parsed.data.activities.map((activity) => mapActivity(activity, importedAt)),
      syncedAt: parsed.data.syncedAt ?? importedAt
    };
  }
}

function mapActivity(raw: GarminBridgeActivity, importedAt: string): Activity {
  const distanceKm = raw.distanceM / 1_000;
  const pace = raw.averagePaceSecPerKm ?? (distanceKm > 0 ? raw.durationSec / distanceKm : 0);
  return {
    id: createId('activity'),
    externalId: raw.id,
    source: 'garmin',
    name: raw.name || 'Course Garmin',
    startedAt: raw.startedAt,
    durationSec: Math.round(raw.durationSec),
    distanceM: Math.round(raw.distanceM),
    averagePaceSecPerKm: Math.round(pace),
    ...(raw.averageHeartRateBpm
      ? { averageHeartRateBpm: Math.round(raw.averageHeartRateBpm) }
      : {}),
    elevationGainM: Math.round(raw.elevationGainM ?? 0),
    importedAt
  };
}
