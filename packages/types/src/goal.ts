import { z } from 'zod';
import { GoalTypeSchema } from './task';

export const GoalStatusSchema = z.enum(['active', 'completed', 'expired']);

export const GoalSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  title: z.string().min(1).max(500),
  timeframe: GoalTypeSchema,
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  targetCount: z.number().int().min(1),
  completedCount: z.number().int().min(0).default(0),
  status: GoalStatusSchema.default('active'),
  _deleted: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateGoalInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  timeframe: GoalTypeSchema,
  targetCount: z.number().int().min(1, 'Target must be at least 1'),
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
});

export const UpdateGoalInputSchema = CreateGoalInputSchema.partial().extend({
  status: GoalStatusSchema.optional(),
});

export type GoalStatus = z.infer<typeof GoalStatusSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type CreateGoalInput = z.infer<typeof CreateGoalInputSchema>;
export type UpdateGoalInput = z.infer<typeof UpdateGoalInputSchema>;
