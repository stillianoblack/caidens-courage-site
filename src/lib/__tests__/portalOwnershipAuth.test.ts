const createQuery = (data: unknown[] = [], error: unknown = null) => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data, error }).then(resolve),
});
export {};

describe('portal Auth ownership boundary', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.PORTAL_AUTH_OWNERSHIP_ENABLED = 'true';
  });

  it('authorizes only explicit active ownership for the authenticated Auth id', async () => {
    const membership = { id: 'm-1', program_id: 'p-1', portal_role: 'family_guardian', compatibility_mode: true, valid_until: null };
    const access = { membership_id: 'm-1', participant_id: 'child-1', access_scope: 'guardian', valid_until: null };
    const supabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'auth-1' } }, error: null }) },
      from: jest.fn((table: string) => createQuery(table === 'portal_program_memberships' ? [membership] : [access])),
    };
    const { requirePortalOwnership } = require('../../../netlify/functions/_lib/portalOwnershipAuth');
    const result = await requirePortalOwnership(
      { headers: { authorization: 'Bearer test-token' } },
      { supabase },
    );
    expect(result.context.user.id).toBe('auth-1');
    expect(result.context.memberships).toEqual([membership]);
    expect(supabase.from).toHaveBeenCalledWith('portal_program_memberships');
    expect(supabase.from).toHaveBeenCalledWith('portal_participant_access');
  });

  it('denies authenticated users without an explicit ownership row', async () => {
    const supabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'auth-2' } }, error: null }) },
      from: jest.fn(() => createQuery([])),
    };
    const { requirePortalOwnership } = require('../../../netlify/functions/_lib/portalOwnershipAuth');
    const result = await requirePortalOwnership(
      { headers: { authorization: 'Bearer test-token' } },
      { supabase },
    );
    expect(result.response.statusCode).toBe(403);
  });

  it('is unavailable when the server feature flag is off', async () => {
    process.env.PORTAL_AUTH_OWNERSHIP_ENABLED = 'false';
    const { requirePortalOwnership } = require('../../../netlify/functions/_lib/portalOwnershipAuth');
    const result = await requirePortalOwnership({ headers: {} });
    expect(result.response.statusCode).toBe(404);
  });
});
