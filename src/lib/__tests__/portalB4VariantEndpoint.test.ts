export {};

describe('portal B-4 variant endpoint', () => {
  const endpoint = require('../../../netlify/functions/portal-b4-variant');

  it('accepts only the approved keys and writes legacy spark as courage', () => {
    expect(endpoint._test.normalizeVariant('spark')).toBe('courage');
    expect(endpoint._test.normalizeVariant('fusion')).toBe('fusion');
    expect(endpoint._test.normalizeVariant('diagnostic-label')).toBeNull();
  });

  it('allows exact participant access and denies another participant', async () => {
    const context = {
      user: { id: 'user-1' },
      participantAccess: [{ participant_id: 'owned-child' }],
      memberships: [],
      supabase: { from: jest.fn(() => ({ select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve) })) },
    };
    await expect(endpoint._test.authorizeParticipant(context, 'owned-child')).resolves.toBe(true);
    await expect(endpoint._test.authorizeParticipant(context, 'another-child')).resolves.toBe(false);
  });
});
