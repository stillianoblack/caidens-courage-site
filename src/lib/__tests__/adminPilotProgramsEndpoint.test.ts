const adminAuth = require('../../../netlify/functions/_lib/adminAuth');
export {};

jest.mock('../../../netlify/functions/_lib/adminAuth', () => ({
  json: (statusCode: number, body: unknown, id: string) => ({
    statusCode,
    headers: { 'X-Correlation-Id': id },
    body: JSON.stringify(body),
  }),
  requireAdmin: jest.fn(),
}));

const { handler } = require('../../../netlify/functions/admin-pilot-programs');

describe('admin-pilot-programs endpoint', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when no authenticated session is present', async () => {
    adminAuth.requireAdmin.mockResolvedValue({
      response: { statusCode: 401, body: JSON.stringify({ error: 'Authentication required.' }) },
    });
    const response = await handler({ httpMethod: 'GET' });
    expect(response.statusCode).toBe(401);
  });

  it('returns 403 for an authenticated non-admin', async () => {
    adminAuth.requireAdmin.mockResolvedValue({
      response: { statusCode: 403, body: JSON.stringify({ error: 'Admin access denied.' }) },
    });
    const response = await handler({ httpMethod: 'GET' });
    expect(response.statusCode).toBe(403);
  });

  it('returns only sanitized program metadata for an authorized admin', async () => {
    const order = jest.fn().mockResolvedValue({
      data: [{
        id: 'program-id',
        program_name: 'Pilot One',
        program_type: 'School',
        pilot_status: 'active',
        created_at: '2026-07-01T00:00:00Z',
        program_code: 'MUST-NOT-LEAK',
        admin_email: 'must-not-leak@example.com',
      }],
      error: null,
    });
    const select = jest.fn(() => ({ order }));
    const from = jest.fn(() => ({ select }));
    adminAuth.requireAdmin.mockResolvedValue({
      context: {
        correlationId: 'correlation-123',
        supabase: { from },
      },
    });

    const response = await handler({ httpMethod: 'GET' });
    const payload = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(select).toHaveBeenCalledWith('id,program_name,program_type,pilot_status,created_at');
    expect(payload.programs).toEqual([{
      id: 'program-id',
      displayName: 'Pilot One',
      programType: 'School',
      status: 'active',
      createdAt: '2026-07-01T00:00:00Z',
    }]);
    expect(response.body).not.toContain('MUST-NOT-LEAK');
    expect(response.body).not.toContain('must-not-leak@example.com');
  });
});
