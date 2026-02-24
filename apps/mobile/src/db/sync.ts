import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from './index';
import { ApiClient, SyncApi } from '@mma/api-client';

const syncApi = new SyncApi(new ApiClient());

export async function syncDatabase(): Promise<void> {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      const response = await syncApi.pull({
        lastPulledAt: lastPulledAt ?? null,
        schemaVersion: 1,
      });

      return {
        changes: {
          tasks: response.changes.tasks,
          goals: response.changes.goals,
        },
        timestamp: response.timestamp,
      };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      await syncApi.push({
        changes: {
          tasks: {
            created: changes.tasks?.created ?? [],
            updated: changes.tasks?.updated ?? [],
            deleted: changes.tasks?.deleted ?? [],
          },
          goals: {
            created: changes.goals?.created ?? [],
            updated: changes.goals?.updated ?? [],
            deleted: changes.goals?.deleted ?? [],
          },
        },
        lastPulledAt: lastPulledAt ?? 0,
      });
    },
    migrationsEnabledAtVersion: 1,
  });
}
