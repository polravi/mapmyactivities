import { z } from 'zod';

export const UserPreferencesSchema = z.object({
  defaultView: z.enum(['today', 'matrix', 'goals']).default('today'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  notificationsEnabled: z.boolean().default(true),
  voiceAutoStop: z.boolean().default(true),
  voiceAutoStopDelay: z.number().min(1).max(10).default(3),
});

export const SubscriptionSchema = z.object({
  tier: z.enum(['free', 'pro']).default('free'),
  expiresAt: z.string().datetime().nullable().default(null),
  provider: z.enum(['stripe', 'revenuecat']).nullable().default(null),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  photoURL: z.string().url().nullable().default(null),
  authProvider: z.enum(['email', 'google', 'apple']),
  preferences: UserPreferencesSchema.default({}),
  subscription: SubscriptionSchema.default({}),
  onboardingCompleted: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateUserInputSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  authProvider: z.enum(['email', 'google', 'apple']),
  photoURL: z.string().url().nullable().optional(),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
