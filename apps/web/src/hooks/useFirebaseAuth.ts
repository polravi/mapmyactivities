'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firestore } from '@/lib/firestore';
import { useAuthStore } from '@mma/store';
import type { User } from '@mma/types';

export function useFirebaseAuth() {
  const { setUser, clearUser, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading();

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        clearUser();
        return;
      }

      try {
        const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User, await firebaseUser.getIdToken());
        } else {
          // Doc not yet created by onUserCreate trigger — build minimal user
          const now = new Date().toISOString();
          const fallbackUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            displayName: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'User',
            photoURL: firebaseUser.photoURL ?? null,
            authProvider: 'email',
            preferences: {
              defaultView: 'today',
              theme: 'system',
              notificationsEnabled: true,
              voiceAutoStop: true,
              voiceAutoStopDelay: 3,
            },
            subscription: { tier: 'free', expiresAt: null, provider: null },
            onboardingCompleted: false,
            createdAt: now,
            updatedAt: now,
          };
          setUser(fallbackUser, await firebaseUser.getIdToken());
        }
      } catch {
        clearUser();
      }
    });

    return () => unsubscribe();
  }, [setUser, clearUser, setLoading]);
}
