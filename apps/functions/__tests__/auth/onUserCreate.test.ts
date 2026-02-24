import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase-admin
const mockSet = vi.fn().mockResolvedValue(undefined);
const mockCollection = vi.fn().mockReturnValue({
  doc: vi.fn().mockReturnValue({
    set: mockSet,
    collection: vi.fn().mockReturnValue({
      doc: vi.fn().mockReturnValue({ set: mockSet }),
    }),
  }),
});

vi.mock('firebase-admin', () => ({
  initializeApp: vi.fn(),
  firestore: vi.fn(() => ({
    collection: mockCollection,
  })),
}));

vi.mock('firebase-functions/v2', () => ({
  auth: {
    user: () => ({
      onCreate: (handler: Function) => handler,
    }),
  },
}));

describe('onUserCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates user document with default preferences', async () => {
    const { onUserCreate } = await import('../../src/auth/onUserCreate');
    const mockUser = {
      uid: 'test-uid-123',
      email: 'user@example.com',
      displayName: 'Test User',
      photoURL: null,
      providerData: [{ providerId: 'password' }],
    };

    await (onUserCreate as unknown as Function)(mockUser);

    expect(mockSet).toHaveBeenCalled();
    const userDoc = mockSet.mock.calls[0][0];
    expect(userDoc.email).toBe('user@example.com');
    expect(userDoc.displayName).toBe('Test User');
    expect(userDoc.preferences.defaultView).toBe('today');
    expect(userDoc.preferences.theme).toBe('system');
    expect(userDoc.subscription.tier).toBe('free');
    expect(userDoc.authProvider).toBe('email');
  });

  it('detects Google auth provider', async () => {
    const { onUserCreate } = await import('../../src/auth/onUserCreate');
    const mockUser = {
      uid: 'google-uid',
      email: 'user@gmail.com',
      displayName: 'Google User',
      photoURL: 'https://photo.url',
      providerData: [{ providerId: 'google.com' }],
    };

    await (onUserCreate as unknown as Function)(mockUser);

    const userDoc = mockSet.mock.calls[0][0];
    expect(userDoc.authProvider).toBe('google');
  });

  it('creates welcome task in Q2', async () => {
    const { onUserCreate } = await import('../../src/auth/onUserCreate');
    const mockUser = {
      uid: 'test-uid',
      email: 'user@example.com',
      displayName: 'User',
      photoURL: null,
      providerData: [{ providerId: 'password' }],
    };

    await (onUserCreate as unknown as Function)(mockUser);

    // Second set call should be the welcome task
    expect(mockSet).toHaveBeenCalledTimes(2);
    const taskDoc = mockSet.mock.calls[1][0];
    expect(taskDoc.eisenhowerQuadrant).toBe(2);
    expect(taskDoc.status).toBe('todo');
    expect(taskDoc.tags).toContain('getting-started');
  });
});
