import { describe, it, expect } from 'vitest';
import { CreateUserInputSchema, UserPreferencesSchema } from '../src/user';

describe('User Schemas', () => {
  describe('CreateUserInputSchema', () => {
    it('validates email user input', () => {
      const input = {
        email: 'user@example.com',
        displayName: 'Test User',
        authProvider: 'email',
      };
      const result = CreateUserInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const input = {
        email: 'not-an-email',
        displayName: 'Test User',
        authProvider: 'email',
      };
      const result = CreateUserInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects empty display name', () => {
      const input = {
        email: 'user@example.com',
        displayName: '',
        authProvider: 'email',
      };
      const result = CreateUserInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('accepts social auth providers', () => {
      expect(
        CreateUserInputSchema.safeParse({
          email: 'user@gmail.com',
          displayName: 'Google User',
          authProvider: 'google',
        }).success,
      ).toBe(true);

      expect(
        CreateUserInputSchema.safeParse({
          email: 'user@icloud.com',
          displayName: 'Apple User',
          authProvider: 'apple',
        }).success,
      ).toBe(true);
    });
  });

  describe('UserPreferencesSchema', () => {
    it('applies defaults for empty object', () => {
      const result = UserPreferencesSchema.parse({});
      expect(result.defaultView).toBe('today');
      expect(result.theme).toBe('system');
      expect(result.notificationsEnabled).toBe(true);
    });
  });
});
