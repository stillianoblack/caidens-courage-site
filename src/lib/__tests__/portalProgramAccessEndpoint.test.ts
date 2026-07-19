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

const facilitatorProgram = {
  ...program,
  id: '7641db5f-07c2-4e9f-a638-30dfb2fb00f0',
  program_name: 'Trace Camp',
  program_code: 'CAMP-TRACE-2026',
  program_type: 'camp',
  admin_email: 'facilitator@example.com',
  family_access_code: null,
  facilitator_access_code: 'FAC-TRACE-2026',
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

function request(body: Record<string, unknown>) {
  return handler({
    httpMethod: 'POST',
    headers: {},
    body: JSON.stringify(body),
  });
}

function mockCodeLookup(input: {
  directData?: unknown[];
  aliasData?: Record<string, unknown> | null;
  aliasError?: Record<string, unknown> | null;
  aliasProgramData?: Record<string, unknown> | null;
  aliasProgramError?: Record<string, unknown> | null;
}) {
  let programCallCount = 0;
  mockFrom.mockImplementation((table: string) => {
    if (table === 'pilot_programs') {
      programCallCount += 1;
      if (programCallCount === 1) {
        return chain({ data: input.directData ?? [], error: null });
      }
      return chain({
        data: input.aliasProgramData ?? null,
        error: input.aliasProgramError ?? null,
      });
    }
    if (table === 'program_code_aliases') {
      return chain({ data: input.aliasData ?? null, error: input.aliasError ?? null });
    }
    throw new Error(`Unexpected table: ${table}`);
  });
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
    const response = await request({
      accessCode: program.family_access_code,
      intent: 'parent',
      credential: program.admin_email,
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
    const response = await request({
      accessCode: program.family_access_code,
      intent: 'parent',
      credential: 'wrong@example.com',
    });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(403);
    expect(body.code).toBe('credential_not_connected');
    expect(body).not.toHaveProperty('program');
  });

  test('does not exchange a public program code for the private family access code', async () => {
    const response = await request({ accessCode: program.program_code, intent: 'parent' });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(body.program.familyAccessCode).toBe('');
  });

  test('validates a facilitator through the direct facilitator access code', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'pilot_programs') return chain({ data: [facilitatorProgram], error: null });
      if (table === 'program_code_aliases') return chain({ data: null, error: null });
      throw new Error(`Unexpected table: ${table}`);
    });

    const response = await request({
      accessCode: facilitatorProgram.facilitator_access_code,
      intent: 'facilitator',
      credential: facilitatorProgram.admin_email,
    });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(body.role).toBe('facilitator');
    expect(body.program.facilitatorAccessCode).toBe(facilitatorProgram.facilitator_access_code);
  });

  test('resolves an existing alias through its active target program', async () => {
    mockCodeLookup({
      aliasData: { program_code: program.program_code, alias_type: 'family' },
      aliasProgramData: program,
    });

    const response = await request({ accessCode: 'FAMILY-ALIAS', intent: 'parent' });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(body.role).toBe('family');
    expect(body.program.programCode).toBe(program.program_code);
    expect(body.program.familyAccessCode).toBe('');
  });

  test('returns a safe 404 when an alias is absent', async () => {
    mockCodeLookup({ aliasData: null });

    const response = await request({ accessCode: 'UNKNOWN-CODE', intent: 'parent' });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(404);
    expect(body).toMatchObject({
      success: false,
      code: 'program_not_found',
      lookupStatus: 'alias_not_found',
      correlationId: 'portal-program-test',
    });
    expect(body).not.toHaveProperty('program');
  });

  test('skips the optional alias lookup when the alias object is absent', async () => {
    mockCodeLookup({
      aliasError: {
        code: 'PGRST205',
        message: "Could not find the table 'public.program_code_aliases' in the schema cache",
      },
    });

    const response = await request({ accessCode: 'UNKNOWN-CODE', intent: 'parent' });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(404);
    expect(body).toMatchObject({
      code: 'program_not_found',
      lookupStatus: 'alias_object_unavailable',
      correlationId: 'portal-program-test',
    });
  });

  test('skips an optional alias lookup that is permission denied', async () => {
    mockCodeLookup({
      aliasError: { code: '42501', message: 'permission denied for table program_code_aliases' },
    });

    const response = await request({ accessCode: 'UNKNOWN-CODE', intent: 'parent' });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(404);
    expect(body).toMatchObject({
      code: 'program_not_found',
      lookupStatus: 'alias_permission_denied',
      correlationId: 'portal-program-test',
    });
  });

  test('uses 503 only when the optional alias query reports database unavailability', async () => {
    mockCodeLookup({ aliasError: { code: 'PGRST000', message: 'database unavailable' } });

    const response = await request({ accessCode: 'UNKNOWN-CODE', intent: 'parent' });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(503);
    expect(body).toMatchObject({
      code: 'alias_lookup_unavailable',
      correlationId: 'portal-program-test',
    });
    expect(body).not.toHaveProperty('program');
  });

  test('rejects malformed access codes before querying Supabase', async () => {
    const response = await request({ accessCode: 'bad,filter', intent: 'parent' });
    expect(response.statusCode).toBe(400);
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

export {};
