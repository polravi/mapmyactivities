import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v2/https';

const LIMITS: Record<string, { free: number; pro: number }> = {
  aiSuggest: { free: 10, pro: 100 },
  voiceParse: { free: 20, pro: 200 },
};

export async function checkRateLimit(
  userId: string,
  action: string,
): Promise<void> {
  const db = admin.firestore();
  const today = new Date().toISOString().split('T')[0];
  const rateLimitRef = db
    .collection('rateLimits')
    .doc(`${userId}_${action}_${today}`);

  const userDoc = await db.collection('users').doc(userId).get();
  const tier = userDoc.data()?.subscription?.tier ?? 'free';
  const limit = LIMITS[action]?.[tier as 'free' | 'pro'] ?? 10;

  const rateLimitDoc = await rateLimitRef.get();
  const currentCount = rateLimitDoc.exists ? (rateLimitDoc.data()?.count ?? 0) : 0;

  if (currentCount >= limit) {
    throw new HttpsError(
      'resource-exhausted',
      tier === 'free'
        ? `Daily AI limit reached. Upgrade to Pro for unlimited.`
        : `Rate limit exceeded. Please try again later.`,
    );
  }

  await rateLimitRef.set(
    { count: currentCount + 1, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true },
  );
}
