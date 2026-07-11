// eslint-disable-next-line @typescript-eslint/no-var-requires
const { requireCrmRequest } = require('../../../netlify/functions/_lib/crmAuth');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { handler: bootstrap } = require('../../../netlify/functions/crm-bootstrap-admin');
export {};

describe('CRM Phase 1 endpoint gates', () => {
  const original = process.env;
  beforeEach(() => { process.env = { ...original }; });
  afterAll(() => { process.env = original; });

  test('disabled feature flag returns a scope-safe unavailable response', async () => {
    delete process.env.AUDIENCE_CRM_READ_ENABLED;
    const result = await requireCrmRequest({ headers: {} }, { flag: 'AUDIENCE_CRM_READ_ENABLED', permission: 'crm:read' });
    expect(result.response.statusCode).toBe(404);
  });

  test('enabled feature denies unauthenticated requests', async () => {
    process.env.AUDIENCE_CRM_READ_ENABLED = 'true';
    const supabase = { auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: new Error('invalid') }) } };
    const result = await requireCrmRequest({ headers: {} }, { flag: 'AUDIENCE_CRM_READ_ENABLED', permission: 'crm:read', supabase });
    expect(result.response.statusCode).toBe(401);
  });

  test('authenticated user without a CRM role is denied', async () => {
    process.env.AUDIENCE_CRM_READ_ENABLED = 'true';
    const query = { select: jest.fn(), eq: jest.fn() } as any;
    query.select.mockReturnValue(query);
    query.eq.mockReturnValueOnce(query).mockResolvedValueOnce({ data: [], error: null });
    const supabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'auth-user' } }, error: null }) },
      from: jest.fn().mockReturnValue(query),
    };
    const result = await requireCrmRequest(
      { headers: { authorization: 'Bearer valid-token' } },
      { flag: 'AUDIENCE_CRM_READ_ENABLED', permission: 'crm:read', supabase },
    );
    expect(result.response.statusCode).toBe(403);
  });

  test('bootstrap is disabled by default and rejects non-POST methods', async () => {
    delete process.env.CRM_BOOTSTRAP_ENABLED;
    expect((await bootstrap({ httpMethod: 'POST', headers: {} })).statusCode).toBe(404);
    expect((await bootstrap({ httpMethod: 'GET', headers: {} })).statusCode).toBe(405);
  });
});
