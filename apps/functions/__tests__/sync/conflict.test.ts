import { describe, it, expect } from 'vitest';
import { getProgressedStatus } from '@mma/utils';
import type { TaskStatus } from '@mma/types';

describe('Conflict Resolution', () => {
  describe('Status no-regression', () => {
    it('keeps "done" when client sends "in_progress"', () => {
      expect(getProgressedStatus('done', 'in_progress')).toBe('done');
    });

    it('keeps "done" when client sends "todo"', () => {
      expect(getProgressedStatus('done', 'todo')).toBe('done');
    });

    it('allows progression from "todo" to "done"', () => {
      expect(getProgressedStatus('todo', 'done')).toBe('done');
    });

    it('allows progression from "in_progress" to "done"', () => {
      expect(getProgressedStatus('in_progress', 'done')).toBe('done');
    });

    it('keeps same status', () => {
      const statuses: TaskStatus[] = ['todo', 'in_progress', 'done', 'discarded'];
      for (const s of statuses) {
        expect(getProgressedStatus(s, s)).toBe(s);
      }
    });
  });
});
