import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();
const mockSet = vi.fn().mockResolvedValue(undefined);

vi.mock('firebase-admin', () => ({
  initializeApp: vi.fn(),
  firestore: Object.assign(
    vi.fn(() => ({
      collection: vi.fn().mockReturnValue({
        doc: vi.fn().mockReturnValue({
          get: mockGet,
          set: mockSet,
        }),
      }),
    })),
    {
      FieldValue: {
        serverTimestamp: vi.fn().mockReturnValue('SERVER_TIMESTAMP'),
      },
    },
  ),
}));

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows requests under the limit', async () => {
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ subscription: { tier: 'free' } }),
    });
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ count: 5 }),
    });

    const { checkRateLimit } = await import('../../src/middleware/rateLimit');
    await expect(checkRateLimit('user1', 'aiSuggest')).resolves.not.toThrow();
  });

  it('blocks free user at limit', async () => {
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ subscription: { tier: 'free' } }),
    });
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ count: 10 }),
    });

    const { checkRateLimit } = await import('../../src/middleware/rateLimit');
    await expect(checkRateLimit('user1', 'aiSuggest')).rejects.toThrow(
      'Daily AI limit reached',
    );
  });

  it('allows pro user higher limits', async () => {
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ subscription: { tier: 'pro' } }),
    });
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ count: 50 }),
    });

    const { checkRateLimit } = await import('../../src/middleware/rateLimit');
    await expect(checkRateLimit('user1', 'aiSuggest')).resolves.not.toThrow();
  });
});
