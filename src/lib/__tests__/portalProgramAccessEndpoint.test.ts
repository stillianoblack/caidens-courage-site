const mockFrom = jest.fn();

jest.mock('../../../netlify/functions/_lib/crmAuth', () => ({
  correlationId: () => 'portal-program-test',
  getServerSupabase: () => ({ from: mockFrom }),
  json: (statusCode: number, body: Record<string, unknown>) => ({
    statusCode,
    body: JSON.stringify({ ...body, correlationId: 'portal-program-test' }),
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { handler } = require('../../../netlify/functions/portal-program-access');

const program = {
  id: '9c247ffd-5b8f-4bf5-8ea9-c9958e017089',
  program_name: 'Trace Family',
  program_code: 'FAMILY-ABC123',
  program_type: 'independent_family',
  admin_first_name: 'Parent',
  admin_email: 'parent@example.com',
  estimated_students: 1,
  age_range: 'Mixed Ages',
  group_name: 'Trace Family',
  family_access_code: 'FAM-ABC123',
  facilitator_access_code: null,
  pricing_tier: 'independent_family',
  payment_status: 'waived',
  pilot_status: 'active',
  agreed_at: '2026-07-01T00:00:00.000Z',
  created_at: '2026-07-01T00:00:00.000Z',
};

function chain(result: Record<string, unknown>) {
  const value: Record<string, jest.Mock> = {};
  ['select', 'or', 'eq', 'limit'].forEach((method) => {
    value[method] = jest.fn(() => value);
  });
  value.maybeSingle = jest.fn().mockResolvedValue(result);
  value.then = jest.fn((resolve) => Promise.resolve(result).then(resolve));
  return value;
}

describe('server-mediated portal program access', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockImplementation((table: string) => {
      if (table === 'pilot_programs') return chain({ data: [program], error: null });
      if (table === 'program_code_aliases') return chain({ data: null, error: null });
      throw new Error(`Unexpected table: ${table}`);
    });
  });

  test('returns only mapped session metadata after validating an independent parent', async () => {
    const response = await handler({
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({
        accessCode: program.family_access_code,
        intent: 'parent',
        credential: program.admin_email,
      }),
    });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.role).toBe('family');
    expect(body.program.programCode).toBe(program.program_code);
    expect(body.program.adminEmail).toBe(program.admin_email);
    expect(body.program).not.toHaveProperty('admin_email');
    expect(body.program).not.toHaveProperty('family_access_code');
    expect(body.program).not.toHaveProperty('feature_flags');
  });

  test('does not return program metadata for the wrong parent email', async () => {
    const response = await handler({
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({
        accessCode: program.family_access_code,
        intent: 'parent',
        credential: 'wrong@example.com',
      }),
    });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(403);
    expect(body.code).toBe('credential_not_connected');
    expect(body).not.toHaveProperty('program');
  });

  test('does not exchange a public program code for the private family access code', async () => {
    const response = await handler({
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({ accessCode: program.program_code, intent: 'parent' }),
    });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(body.program.familyAccessCode).toBe('');
  });

  test('rejects malformed access codes before querying Supabase', async () => {
    const response = await handler({
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({ accessCode: 'bad,filter', intent: 'parent' }),
    });
    expect(response.statusCode).toBe(400);
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

export {};
