import { create } from 'zustand';

type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

interface SyncState {
  status: SyncStatus;
  lastSyncedAt: number | null;
  pendingChanges: number;
  error: string | null;

  setSyncing: () => void;
  setSynced: (timestamp: number) => void;
  setSyncError: (error: string) => void;
  setOffline: () => void;
  setPendingChanges: (count: number) => void;
  incrementPending: () => void;
  resetPending: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: 'idle',
  lastSyncedAt: null,
  pendingChanges: 0,
  error: null,

  setSyncing: () => set({ status: 'syncing', error: null }),
  setSynced: (timestamp) =>
    set({ status: 'idle', lastSyncedAt: timestamp, error: null }),
  setSyncError: (error) => set({ status: 'error', error }),
  setOffline: () => set({ status: 'offline' }),
  setPendingChanges: (count) => set({ pendingChanges: count }),
  incrementPending: () =>
    set((state) => ({ pendingChanges: state.pendingChanges + 1 })),
  resetPending: () => set({ pendingChanges: 0 }),
}));
