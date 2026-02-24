import { create } from 'zustand';
import type { Goal, CreateGoalInput, GoalType, GoalStatus } from '@mma/types';
import { generateId } from '@mma/utils';
import { getPeriodBounds, toISOString } from '@mma/utils';

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  activeTimeframe: GoalType;

  setGoals: (goals: Goal[]) => void;
  addGoal: (input: CreateGoalInput, userId: string) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  incrementCompleted: (id: string) => void;
  decrementCompleted: (id: string) => void;
  setActiveTimeframe: (timeframe: GoalType) => void;
  getGoalsByTimeframe: (timeframe: GoalType) => Goal[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,
  activeTimeframe: 'daily',

  setGoals: (goals) => set({ goals }),

  addGoal: (input, userId) => {
    const now = new Date();
    const bounds = getPeriodBounds(input.timeframe, now);
    const goal: Goal = {
      id: generateId(),
      userId,
      title: input.title,
      timeframe: input.timeframe,
      periodStart: input.periodStart ?? toISOString(bounds.start),
      periodEnd: input.periodEnd ?? toISOString(bounds.end),
      targetCount: input.targetCount,
      completedCount: 0,
      status: 'active',
      _deleted: false,
      createdAt: toISOString(now),
      updatedAt: toISOString(now),
    };
    set((state) => ({ goals: [...state.goals, goal] }));
    return goal;
  },

  updateGoal: (id, updates) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id
          ? { ...g, ...updates, updatedAt: new Date().toISOString() }
          : g,
      ),
    })),

  deleteGoal: (id) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id
          ? { ...g, _deleted: true, updatedAt: new Date().toISOString() }
          : g,
      ),
    })),

  incrementCompleted: (id) =>
    set((state) => ({
      goals: state.goals.map((g) => {
        if (g.id !== id) return g;
        const newCount = g.completedCount + 1;
        const newStatus: GoalStatus =
          newCount >= g.targetCount ? 'completed' : g.status;
        return {
          ...g,
          completedCount: newCount,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  decrementCompleted: (id) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id
          ? {
              ...g,
              completedCount: Math.max(0, g.completedCount - 1),
              status: 'active' as GoalStatus,
              updatedAt: new Date().toISOString(),
            }
          : g,
      ),
    })),

  setActiveTimeframe: (timeframe) => set({ activeTimeframe: timeframe }),

  getGoalsByTimeframe: (timeframe) =>
    get().goals.filter((g) => g.timeframe === timeframe && !g._deleted),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
