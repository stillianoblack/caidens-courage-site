const {
  authenticateCredentials,
  issueAdminToken,
  requireAdmin,
  verifyAdminToken,
} = require('../../../netlify/functions/_lib/adminAuth');
export {};

describe('minimal server admin authorization', () => {
  const originalEnv = process.env;
  const [adminEmailKey, adminPasscodeKey] = ['EMAIL', 'PASSCODE'].map((suffix) =>
    ['ADMIN', suffix].join('_'),
  );

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      [adminEmailKey]: 'admin@example.com',
      [adminPasscodeKey]: 'server-only-passcode',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('validates configured credentials without exposing them to the client build', () => {
    expect(authenticateCredentials('ADMIN@example.com', 'server-only-passcode').valid).toBe(true);
    expect(authenticateCredentials('admin@example.com', 'wrong').valid).toBe(false);
  });

  it('issues an expiring signed token and rejects tampering', () => {
    const token = issueAdminToken('admin@example.com', 'server-only-passcode', 1000);
    const credentials = { email: 'admin@example.com', passcode: 'server-only-passcode' };
    expect(verifyAdminToken(token, credentials, 2000)).toBe(true);
    expect(verifyAdminToken(`${token}x`, credentials, 2000)).toBe(false);
    expect(verifyAdminToken(token, credentials, 1000 + 9 * 60 * 60 * 1000)).toBe(false);
  });

  it('rejects an anonymous request with 401', async () => {
    const result = await requireAdmin({ headers: {} }, {});
    expect(result.response.statusCode).toBe(401);
  });

  it('accepts a valid session and supplies the server-only database client', async () => {
    const token = issueAdminToken('admin@example.com', 'server-only-passcode');
    const client = {};
    const result = await requireAdmin(
      { headers: { authorization: `Bearer ${token}` } },
      client,
    );
    expect(result.response).toBeUndefined();
    expect(result.context.supabase).toBe(client);
  });
});
