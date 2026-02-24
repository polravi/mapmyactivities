import { z } from 'zod';

export const SyncPullRequestSchema = z.object({
  lastPulledAt: z.number().nullable(),
  schemaVersion: z.number().int().default(1),
});

export const SyncChangeSchema = z.object({
  id: z.string(),
  [z.string().describe('field')]: z.unknown(),
});

export const SyncPullResponseSchema = z.object({
  changes: z.object({
    tasks: z.object({
      created: z.array(z.record(z.unknown())),
      updated: z.array(z.record(z.unknown())),
      deleted: z.array(z.string()),
    }),
    goals: z.object({
      created: z.array(z.record(z.unknown())),
      updated: z.array(z.record(z.unknown())),
      deleted: z.array(z.string()),
    }),
  }),
  timestamp: z.number(),
});

export const SyncPushRequestSchema = z.object({
  changes: z.object({
    tasks: z.object({
      created: z.array(z.record(z.unknown())),
      updated: z.array(z.record(z.unknown())),
      deleted: z.array(z.string()),
    }),
    goals: z.object({
      created: z.array(z.record(z.unknown())),
      updated: z.array(z.record(z.unknown())),
      deleted: z.array(z.string()),
    }),
  }),
  lastPulledAt: z.number(),
});

export type SyncPullRequest = z.infer<typeof SyncPullRequestSchema>;
export type SyncPullResponse = z.infer<typeof SyncPullResponseSchema>;
export type SyncPushRequest = z.infer<typeof SyncPushRequestSchema>;
