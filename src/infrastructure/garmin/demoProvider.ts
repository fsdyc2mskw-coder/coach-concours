import { createDemoActivities } from '../../app/seed';
import type { ActivityProvider, ActivitySyncResult } from './provider';

export class DemoGarminProvider implements ActivityProvider {
  public readonly id = 'demo' as const;
  public readonly displayName = 'Garmin démo';

  public isConfigured(): boolean {
    return true;
  }

  public async sync(): Promise<ActivitySyncResult> {
    return {
      activities: createDemoActivities(),
      syncedAt: new Date().toISOString()
    };
  }
}
