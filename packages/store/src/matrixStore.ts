import { create } from 'zustand';
import type { AISuggestion } from '@mma/types';

interface MatrixState {
  draggedTaskId: string | null;
  aiSuggestion: AISuggestion | null;
  isAiLoading: boolean;
  showDiscardedArchive: boolean;

  setDraggedTask: (taskId: string | null) => void;
  setAiSuggestion: (suggestion: AISuggestion | null) => void;
  setAiLoading: (loading: boolean) => void;
  toggleDiscardedArchive: () => void;
}

export const useMatrixStore = create<MatrixState>((set) => ({
  draggedTaskId: null,
  aiSuggestion: null,
  isAiLoading: false,
  showDiscardedArchive: false,

  setDraggedTask: (taskId) => set({ draggedTaskId: taskId }),
  setAiSuggestion: (suggestion) => set({ aiSuggestion: suggestion }),
  setAiLoading: (loading) => set({ isAiLoading: loading }),
  toggleDiscardedArchive: () =>
    set((state) => ({ showDiscardedArchive: !state.showDiscardedArchive })),
}));
