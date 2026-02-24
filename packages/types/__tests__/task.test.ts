import { describe, it, expect } from 'vitest';
import { CreateTaskInputSchema, TaskSchema, TaskStatusSchema } from '../src/task';

describe('Task Schemas', () => {
  describe('CreateTaskInputSchema', () => {
    it('validates a basic task input', () => {
      const input = { title: 'Buy groceries' };
      const result = CreateTaskInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects empty title', () => {
      const input = { title: '' };
      const result = CreateTaskInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required');
      }
    });

    it('validates task with all fields', () => {
      const input = {
        title: 'Prepare quarterly report',
        description: 'Include Q1 sales data',
        priority: 'high',
        dueDate: '2026-03-01T00:00:00.000Z',
        goalType: 'monthly',
        tags: ['work', 'reporting'],
      };
      const result = CreateTaskInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects invalid priority', () => {
      const input = { title: 'Test', priority: 'urgent' };
      const result = CreateTaskInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects invalid quadrant number', () => {
      const input = { title: 'Test', eisenhowerQuadrant: 5 };
      const result = CreateTaskInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('TaskStatusSchema', () => {
    it('accepts valid statuses', () => {
      expect(TaskStatusSchema.safeParse('todo').success).toBe(true);
      expect(TaskStatusSchema.safeParse('in_progress').success).toBe(true);
      expect(TaskStatusSchema.safeParse('done').success).toBe(true);
      expect(TaskStatusSchema.safeParse('discarded').success).toBe(true);
    });

    it('rejects invalid status', () => {
      expect(TaskStatusSchema.safeParse('cancelled').success).toBe(false);
    });
  });
});
