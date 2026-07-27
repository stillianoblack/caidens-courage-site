const { handler } = require('../../../netlify/functions/admin-session');
export {};

describe('minimal admin session endpoint', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ADMIN_EMAIL: 'admin@example.com',
      ADMIN_PASSCODE: 'server-only-passcode',
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'server-role',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns 403 for incorrect credentials', async () => {
    const response = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ email: 'admin@example.com', passcode: 'wrong' }),
    });
    expect(response.statusCode).toBe(403);
    expect(response.body).not.toContain('server-only-passcode');
  });

  it('returns a signed session for correct credentials', async () => {
    const response = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ email: 'admin@example.com', passcode: 'server-only-passcode' }),
    });
    const payload = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(payload.authenticated).toBe(true);
    expect(typeof payload.token).toBe('string');
    expect(response.body).not.toContain('server-only-passcode');
  });
});
