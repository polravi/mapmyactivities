import { create } from 'zustand';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '@mma/types';
import { generateId } from '@mma/utils';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  setTasks: (tasks: Task[]) => void;
  addTask: (input: CreateTaskInput, userId: string) => Task;
  updateTask: (id: string, input: UpdateTaskInput) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  setTaskQuadrant: (id: string, quadrant: number | null) => void;
  reorderTask: (id: string, newSortOrder: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),

  addTask: (input, userId) => {
    const now = new Date().toISOString();
    const task: Task = {
      id: generateId(),
      userId,
      title: input.title,
      description: input.description ?? '',
      status: 'todo',
      eisenhowerQuadrant: input.eisenhowerQuadrant ?? null,
      aiSuggestedQuadrant: null,
      aiConfidence: null,
      goalType: input.goalType ?? null,
      goalId: input.goalId ?? null,
      dueDate: input.dueDate ?? null,
      recurrence: input.recurrence ?? null,
      voiceSource: false,
      voiceTranscript: null,
      priority: input.priority ?? 'medium',
      tags: input.tags ?? [],
      sortOrder: get().tasks.length * 1000,
      _deleted: false,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ tasks: [...state.tasks, task] }));
    return task;
  },

  updateTask: (id, input) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, ...input, updatedAt: new Date().toISOString() }
          : t,
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, _deleted: true, updatedAt: new Date().toISOString() }
          : t,
      ),
    })),

  setTaskStatus: (id, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, status, updatedAt: new Date().toISOString() }
          : t,
      ),
    })),

  setTaskQuadrant: (id, quadrant) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, eisenhowerQuadrant: quadrant, updatedAt: new Date().toISOString() }
          : t,
      ),
    })),

  reorderTask: (id, newSortOrder) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, sortOrder: newSortOrder, updatedAt: new Date().toISOString() }
          : t,
      ),
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
