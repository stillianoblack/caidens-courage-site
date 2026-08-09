const ORIGINAL_ENV = process.env;

export {};

describe('Admin passcode analytics session', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...ORIGINAL_ENV,
      REACT_APP_ADMIN_EMAIL: 'admin@example.test',
      REACT_APP_ADMIN_PASSCODE: 'approved-passcode',
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('issues an HttpOnly session cookie for the approved email and passcode', async () => {
    const { handler } = require('../../../netlify/functions/admin-passcode-session');
    const response = await handler({
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({
        email: 'admin@example.test',
        passcode: 'approved-passcode',
      }),
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['Set-Cookie']).toContain('cc_admin_session=');
    expect(response.headers['Set-Cookie']).toContain('HttpOnly');
    expect(response.headers['Set-Cookie']).toContain('SameSite=Strict');
  });

  it('rejects invalid credentials without issuing a session cookie', async () => {
    const { handler } = require('../../../netlify/functions/admin-passcode-session');
    const response = await handler({
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({
        email: 'admin@example.test',
        passcode: 'wrong-passcode',
      }),
    });

    expect(response.statusCode).toBe(403);
    expect(response.headers['Set-Cookie']).toBeUndefined();
  });
});
