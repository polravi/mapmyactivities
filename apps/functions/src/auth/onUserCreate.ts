import { auth } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { generateId } from '@mma/utils';

export const onUserCreate = auth.user().onCreate(async (user) => {
  const db = admin.firestore();
  const now = new Date().toISOString();

  const userDoc = {
    id: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? user.email?.split('@')[0] ?? 'User',
    photoURL: user.photoURL ?? null,
    authProvider: getAuthProvider(user),
    preferences: {
      defaultView: 'today',
      theme: 'system',
      notificationsEnabled: true,
      voiceAutoStop: true,
      voiceAutoStopDelay: 3,
    },
    subscription: {
      tier: 'free',
      expiresAt: null,
      provider: null,
    },
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('users').doc(user.uid).set(userDoc);

  // Create welcome task in Q2
  const welcomeTask = {
    id: generateId(),
    userId: user.uid,
    title: 'Welcome to MapMyActivities! Tap to learn more',
    description:
      'This is your first task. Try creating new tasks, organizing them in the Eisenhower Matrix, and setting goals to track your progress.',
    status: 'todo',
    eisenhowerQuadrant: 2,
    aiSuggestedQuadrant: null,
    aiConfidence: null,
    goalType: null,
    goalId: null,
    dueDate: null,
    recurrence: null,
    voiceSource: false,
    voiceTranscript: null,
    priority: 'medium',
    tags: ['getting-started'],
    sortOrder: 0,
    _deleted: false,
    createdAt: now,
    updatedAt: now,
  };

  await db
    .collection('users')
    .doc(user.uid)
    .collection('tasks')
    .doc(welcomeTask.id)
    .set(welcomeTask);
});

function getAuthProvider(
  user: admin.auth.UserRecord,
): 'email' | 'google' | 'apple' {
  const providerData = user.providerData;
  if (providerData.some((p) => p.providerId === 'google.com')) return 'google';
  if (providerData.some((p) => p.providerId === 'apple.com')) return 'apple';
  return 'email';
}
