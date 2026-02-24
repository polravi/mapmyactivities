import { describe, it, expect } from 'vitest';
import {
  canTransitionStatus,
  getProgressedStatus,
  filterTasksByQuadrant,
  getUnassignedTasks,
  calculateNewSortOrder,
} from '../src/taskUtils';
import type { Task } from '@mma/types';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  userId: 'u1',
  title: 'Test',
  description: '',
  status: 'todo',
  eisenhowerQuadrant: null,
  aiSuggestedQuadrant: null,
  aiConfidence: null,
  goalType: null,
  goalId: null,
  dueDate: null,
  recurrence: null,
  voiceSource: false,
  voiceTranscript: null,
  priority: 'medium',
  tags: [],
  sortOrder: 0,
  _deleted: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('taskUtils', () => {
  describe('canTransitionStatus', () => {
    it('allows forward transitions', () => {
      expect(canTransitionStatus('todo', 'in_progress')).toBe(true);
      expect(canTransitionStatus('in_progress', 'done')).toBe(true);
    });

    it('prevents regression from done', () => {
      expect(canTransitionStatus('done', 'todo')).toBe(false);
      expect(canTransitionStatus('done', 'in_progress')).toBe(false);
    });

    it('allows restore from discarded to todo', () => {
      expect(canTransitionStatus('discarded', 'todo')).toBe(true);
    });

    it('allows same status', () => {
      expect(canTransitionStatus('todo', 'todo')).toBe(true);
    });
  });

  describe('getProgressedStatus', () => {
    it('keeps more progressed status', () => {
      expect(getProgressedStatus('done', 'in_progress')).toBe('done');
      expect(getProgressedStatus('in_progress', 'done')).toBe('done');
    });
  });

  describe('filterTasksByQuadrant', () => {
    it('filters tasks by quadrant', () => {
      const tasks = [
        makeTask({ id: '1', eisenhowerQuadrant: 1 }),
        makeTask({ id: '2', eisenhowerQuadrant: 2 }),
        makeTask({ id: '3', eisenhowerQuadrant: 1 }),
      ];
      expect(filterTasksByQuadrant(tasks, 1)).toHaveLength(2);
    });

    it('excludes deleted tasks', () => {
      const tasks = [
        makeTask({ id: '1', eisenhowerQuadrant: 1, _deleted: true }),
        makeTask({ id: '2', eisenhowerQuadrant: 1 }),
      ];
      expect(filterTasksByQuadrant(tasks, 1)).toHaveLength(1);
    });
  });

  describe('getUnassignedTasks', () => {
    it('returns tasks without quadrant', () => {
      const tasks = [
        makeTask({ id: '1', eisenhowerQuadrant: null }),
        makeTask({ id: '2', eisenhowerQuadrant: 1 }),
        makeTask({ id: '3', eisenhowerQuadrant: null }),
      ];
      expect(getUnassignedTasks(tasks)).toHaveLength(2);
    });

    it('excludes discarded tasks', () => {
      const tasks = [
        makeTask({ id: '1', eisenhowerQuadrant: null, status: 'discarded' }),
        makeTask({ id: '2', eisenhowerQuadrant: null }),
      ];
      expect(getUnassignedTasks(tasks)).toHaveLength(1);
    });
  });

  describe('calculateNewSortOrder', () => {
    it('returns midpoint for insertion between tasks', () => {
      const tasks = [makeTask({ sortOrder: 1000 }), makeTask({ sortOrder: 2000 })];
      expect(calculateNewSortOrder(tasks, 1)).toBe(1500);
    });

    it('returns value before first task', () => {
      const tasks = [makeTask({ sortOrder: 1000 })];
      expect(calculateNewSortOrder(tasks, 0)).toBe(0);
    });
  });
});
