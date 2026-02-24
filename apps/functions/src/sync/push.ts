import { onCall } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { SyncPushRequestSchema } from '@mma/types';
import { requireAuth } from '../middleware/validateAuth';
import { getProgressedStatus } from '@mma/utils';
import type { TaskStatus } from '@mma/types';

export const syncPush = onCall(async (request) => {
  const userId = requireAuth(request);
  const input = SyncPushRequestSchema.parse(request.data);

  const db = admin.firestore();
  const batch = db.batch();

  // Process tasks
  await processChanges(
    db,
    batch,
    `users/${userId}/tasks`,
    input.changes.tasks,
    mergeTaskFields,
  );

  // Process goals
  await processChanges(
    db,
    batch,
    `users/${userId}/goals`,
    input.changes.goals,
    mergeGoalFields,
  );

  await batch.commit();
});

type FieldMerger = (
  serverData: Record<string, unknown>,
  clientData: Record<string, unknown>,
) => Record<string, unknown>;

async function processChanges(
  db: admin.firestore.Firestore,
  batch: admin.firestore.WriteBatch,
  collectionPath: string,
  changes: {
    created: Record<string, unknown>[];
    updated: Record<string, unknown>[];
    deleted: string[];
  },
  merger: FieldMerger,
) {
  // Handle created
  for (const item of changes.created) {
    const id = item.id as string;
    const ref = db.collection(collectionPath).doc(id);
    batch.set(ref, {
      ...item,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // Handle updated (with field-level merge)
  for (const item of changes.updated) {
    const id = item.id as string;
    const ref = db.collection(collectionPath).doc(id);
    const serverDoc = await ref.get();

    if (serverDoc.exists) {
      const merged = merger(serverDoc.data()!, item);
      batch.update(ref, {
        ...merged,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      batch.set(ref, {
        ...item,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  // Handle deleted (soft delete)
  for (const id of changes.deleted) {
    const ref = db.collection(collectionPath).doc(id);
    batch.update(ref, {
      _deleted: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

function mergeTaskFields(
  server: Record<string, unknown>,
  client: Record<string, unknown>,
): Record<string, unknown> {
  const merged = { ...client };

  // Eisenhower quadrant: client always wins (user intent)
  if (client.eisenhowerQuadrant !== undefined) {
    merged.eisenhowerQuadrant = client.eisenhowerQuadrant;
  }

  // Status: no regression
  if (server.status && client.status) {
    merged.status = getProgressedStatus(
      server.status as TaskStatus,
      client.status as TaskStatus,
    );
  }

  // For other fields: LWW based on updatedAt
  const serverUpdated = server.updatedAt as admin.firestore.Timestamp | undefined;
  const clientUpdated = client.updatedAt as string | undefined;

  if (serverUpdated && clientUpdated) {
    const serverTime = serverUpdated.toMillis?.() ?? 0;
    const clientTime = new Date(clientUpdated).getTime();

    // Field-level merge: keep server value for fields not in client update
    for (const key of Object.keys(server)) {
      if (
        !(key in client) &&
        key !== 'eisenhowerQuadrant' &&
        key !== 'status' &&
        key !== 'updatedAt'
      ) {
        merged[key] = server[key];
      }
    }
  }

  return merged;
}

function mergeGoalFields(
  server: Record<string, unknown>,
  client: Record<string, unknown>,
): Record<string, unknown> {
  return { ...server, ...client };
}
