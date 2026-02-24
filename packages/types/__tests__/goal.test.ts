import { describe, it, expect } from 'vitest';
import { CreateGoalInputSchema, GoalStatusSchema } from '../src/goal';

describe('Goal Schemas', () => {
  describe('CreateGoalInputSchema', () => {
    it('validates a weekly goal', () => {
      const input = {
        title: 'Exercise 5 times',
        timeframe: 'weekly',
        targetCount: 5,
      };
      const result = CreateGoalInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects empty title', () => {
      const input = { title: '', timeframe: 'weekly', targetCount: 5 };
      const result = CreateGoalInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects zero target count', () => {
      const input = { title: 'Goal', timeframe: 'daily', targetCount: 0 };
      const result = CreateGoalInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('accepts all timeframes', () => {
      for (const tf of ['daily', 'weekly', 'monthly', 'yearly']) {
        const result = CreateGoalInputSchema.safeParse({
          title: 'Test',
          timeframe: tf,
          targetCount: 1,
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('GoalStatusSchema', () => {
    it('accepts valid statuses', () => {
      expect(GoalStatusSchema.safeParse('active').success).toBe(true);
      expect(GoalStatusSchema.safeParse('completed').success).toBe(true);
      expect(GoalStatusSchema.safeParse('expired').success).toBe(true);
    });
  });
});
