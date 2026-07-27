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

  it('returns a secure HttpOnly session cookie for correct credentials', async () => {
    const response = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ email: 'admin@example.com', passcode: 'server-only-passcode' }),
    });
    const payload = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(payload.authenticated).toBe(true);
    expect(payload.token).toBeUndefined();
    expect(response.headers['Set-Cookie']).toContain('HttpOnly');
    expect(response.headers['Set-Cookie']).toContain('Secure');
    expect(response.headers['Set-Cookie']).toContain('SameSite=Strict');
    expect(response.headers['Set-Cookie']).not.toContain('admin@example.com');
    expect(response.body).not.toContain('server-only-passcode');
  });

  it('clears the server session cookie on sign-out', async () => {
    const response = await handler({ httpMethod: 'DELETE', headers: {} });
    expect(response.statusCode).toBe(200);
    expect(response.headers['Set-Cookie']).toContain('Max-Age=0');
  });
});
