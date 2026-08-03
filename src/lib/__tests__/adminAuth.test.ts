const {
  authenticateCredentials,
  issueAdminToken,
  requireAdmin,
  verifyAdminToken,
} = require('../../../netlify/functions/_lib/adminAuth');
export {};

describe('minimal server admin authorization', () => {
  const originalEnv = process.env;
  const runtimeEnv = {
    CONTEXT: 'production',
    PRODUCTION_SUPABASE_PROJECT_REF: 'bnopaocdqkknjzmmkaen',
    SUPABASE_URL: 'https://bnopaocdqkknjzmmkaen.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role',
  };
  const runtimeHeaders = {
    'x-cc-deploy-context': 'production',
    'x-cc-supabase-project': 'bnopaocdqkknjzmmkaen',
  };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ADMIN_EMAIL: 'admin@example.com',
      ADMIN_PASSCODE: 'server-only-passcode',
      ...runtimeEnv,
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('validates configured credentials without exposing them to the client build', () => {
    expect(authenticateCredentials('ADMIN@example.com', 'server-only-passcode').valid).toBe(true);
    expect(authenticateCredentials('admin@example.com', 'wrong').valid).toBe(false);
  });

  it('issues an expiring signed token without embedding the admin identity', () => {
    const token = issueAdminToken('server-only-passcode', 1000);
    expect(token).not.toContain('admin@example.com');
    expect(verifyAdminToken(token, 'server-only-passcode', 2000)).toBe(true);
    expect(verifyAdminToken(`${token}x`, 'server-only-passcode', 2000)).toBe(false);
    expect(verifyAdminToken(token, 'server-only-passcode', 1000 + 9 * 60 * 60 * 1000)).toBe(false);
  });

  it('rejects an anonymous request with 401', async () => {
    const result = await requireAdmin({ headers: runtimeHeaders }, {}, process.env);
    expect(result.response.statusCode).toBe(401);
  });

  it('accepts a valid session and supplies the server-only database client', async () => {
    const token = issueAdminToken('server-only-passcode');
    const client = {};
    const result = await requireAdmin(
      { headers: { ...runtimeHeaders, cookie: `cc_admin_session=${encodeURIComponent(token)}` } },
      client,
      process.env,
    );
    expect(result.response).toBeUndefined();
    expect(result.context.supabase).toBe(client);
  });
});
