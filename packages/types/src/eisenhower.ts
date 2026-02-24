import { z } from 'zod';

export const EisenhowerQuadrantSchema = z.number().int().min(1).max(4);

export const QuadrantInfoSchema = z.object({
  quadrant: EisenhowerQuadrantSchema,
  label: z.string(),
  action: z.string(),
  color: z.string(),
});

export const AISuggestionSchema = z.object({
  quadrant: EisenhowerQuadrantSchema,
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

export const AISuggestionRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export const QUADRANT_INFO: Record<number, { label: string; action: string; color: string }> = {
  1: { label: 'Urgent & Important', action: 'Do First', color: '#ef4444' },
  2: { label: 'Not Urgent & Important', action: 'Schedule', color: '#3b82f6' },
  3: { label: 'Urgent & Not Important', action: 'Delegate', color: '#eab308' },
  4: { label: 'Not Urgent & Not Important', action: 'Eliminate', color: '#9ca3af' },
};

export type EisenhowerQuadrant = z.infer<typeof EisenhowerQuadrantSchema>;
export type QuadrantInfo = z.infer<typeof QuadrantInfoSchema>;
export type AISuggestion = z.infer<typeof AISuggestionSchema>;
export type AISuggestionRequest = z.infer<typeof AISuggestionRequestSchema>;
