import { z } from 'zod';

export const TaskStatusSchema = z.enum(['todo', 'in_progress', 'done', 'discarded']);
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high']);
export const GoalTypeSchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

export const RecurrenceSchema = z.object({
  type: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  interval: z.number().int().min(1).default(1),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  endDate: z.string().datetime().nullable().default(null),
});

export const TaskSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  title: z.string().min(1).max(500),
  description: z.string().max(5000).default(''),
  status: TaskStatusSchema.default('todo'),
  eisenhowerQuadrant: z.number().int().min(1).max(4).nullable().default(null),
  aiSuggestedQuadrant: z.number().int().min(1).max(4).nullable().default(null),
  aiConfidence: z.number().min(0).max(1).nullable().default(null),
  goalType: GoalTypeSchema.nullable().default(null),
  goalId: z.string().uuid().nullable().default(null),
  dueDate: z.string().datetime().nullable().default(null),
  recurrence: RecurrenceSchema.nullable().default(null),
  voiceSource: z.boolean().default(false),
  voiceTranscript: z.string().nullable().default(null),
  priority: TaskPrioritySchema.default('medium'),
  tags: z.array(z.string()).default([]),
  sortOrder: z.number().default(0),
  _deleted: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateTaskInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(5000).optional(),
  priority: TaskPrioritySchema.optional(),
  dueDate: z.string().datetime().nullable().optional(),
  goalType: GoalTypeSchema.nullable().optional(),
  goalId: z.string().uuid().nullable().optional(),
  eisenhowerQuadrant: z.number().int().min(1).max(4).nullable().optional(),
  recurrence: RecurrenceSchema.nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateTaskInputSchema = CreateTaskInputSchema.partial().extend({
  status: TaskStatusSchema.optional(),
  sortOrder: z.number().optional(),
});

export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
export type GoalType = z.infer<typeof GoalTypeSchema>;
export type Recurrence = z.infer<typeof RecurrenceSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>;
