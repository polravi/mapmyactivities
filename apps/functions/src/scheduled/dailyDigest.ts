import { scheduler } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

export const dailyDigest = scheduler.onSchedule(
  { schedule: 'every day 00:00', timeZone: 'UTC' },
  async () => {
    const db = admin.firestore();
    const now = new Date();

    // Expire old goals
    const expiredGoals = await db
      .collectionGroup('goals')
      .where('status', '==', 'active')
      .where('periodEnd', '<', now.toISOString())
      .get();

    const batch = db.batch();

    for (const doc of expiredGoals.docs) {
      batch.update(doc.ref, {
        status: 'expired',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
  },
);
