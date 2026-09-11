import type { Activity } from '../../domain/types';

export interface ActivitySyncResult {
  activities: Activity[];
  syncedAt: string;
}

export interface ActivityProvider {
  readonly id: 'demo' | 'garmin-bridge';
  readonly displayName: string;
  isConfigured(): boolean;
  sync(since?: string): Promise<ActivitySyncResult>;
}
