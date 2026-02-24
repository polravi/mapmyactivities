import { onCall } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { SyncPullRequestSchema } from '@mma/types';
import { requireAuth } from '../middleware/validateAuth';

export const syncPull = onCall(async (request) => {
  const userId = requireAuth(request);
  const input = SyncPullRequestSchema.parse(request.data);

  const db = admin.firestore();
  const lastPulledAt = input.lastPulledAt
    ? admin.firestore.Timestamp.fromMillis(input.lastPulledAt)
    : null;

  const pullTimestamp = Date.now();

  const taskChanges = await pullCollection(
    db,
    `users/${userId}/tasks`,
    lastPulledAt,
  );

  const goalChanges = await pullCollection(
    db,
    `users/${userId}/goals`,
    lastPulledAt,
  );

  return {
    changes: {
      tasks: taskChanges,
      goals: goalChanges,
    },
    timestamp: pullTimestamp,
  };
});

async function pullCollection(
  db: admin.firestore.Firestore,
  collectionPath: string,
  lastPulledAt: admin.firestore.Timestamp | null,
) {
  const created: Record<string, unknown>[] = [];
  const updated: Record<string, unknown>[] = [];
  const deleted: string[] = [];

  let query: admin.firestore.Query = db.collection(collectionPath);

  if (lastPulledAt) {
    query = query.where('updatedAt', '>', lastPulledAt);
  }

  const snapshot = await query.get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data._deleted) {
      deleted.push(doc.id);
    } else if (!lastPulledAt || (data.createdAt && data.createdAt > lastPulledAt)) {
      created.push({ id: doc.id, ...data });
    } else {
      updated.push({ id: doc.id, ...data });
    }
  }

  return { created, updated, deleted };
}
