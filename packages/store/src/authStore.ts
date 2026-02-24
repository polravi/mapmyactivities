import { create } from 'zustand';
import type { User } from '@mma/types';

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';
  error: string | null;

  setUser: (user: User, token: string) => void;
  clearUser: () => void;
  setLoading: () => void;
  setError: (error: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  status: 'idle',
  error: null,

  setUser: (user, token) =>
    set({
      user,
      token,
      status: 'authenticated',
      error: null,
    }),

  clearUser: () =>
    set({
      user: null,
      token: null,
      status: 'unauthenticated',
      error: null,
    }),

  setLoading: () =>
    set({
      status: 'loading',
      error: null,
    }),

  setError: (error) =>
    set({
      status: 'error',
      error,
    }),
}));
