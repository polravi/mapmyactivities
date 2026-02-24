import { z } from 'zod';

export const VoiceStateSchema = z.enum(['idle', 'listening', 'processing', 'confirming', 'error']);

export const ParsedVoiceTaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  goalType: z.enum(['daily', 'weekly', 'monthly', 'yearly']).nullable().optional(),
  tags: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1),
});

export const VoiceParseRequestSchema = z.object({
  transcript: z.string().min(1),
  currentDate: z.string().datetime(),
});

export type VoiceState = z.infer<typeof VoiceStateSchema>;
export type ParsedVoiceTask = z.infer<typeof ParsedVoiceTaskSchema>;
export type VoiceParseRequest = z.infer<typeof VoiceParseRequestSchema>;
