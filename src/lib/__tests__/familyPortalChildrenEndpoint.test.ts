const mockRpc = jest.fn();
const mockFrom = jest.fn();

jest.mock('../../../netlify/functions/_lib/crmAuth', () => ({
  correlationId: () => 'family-test-correlation',
  getServerSupabase: () => ({ from: mockFrom, rpc: mockRpc }),
  json: (statusCode: number, body: Record<string, unknown>) => ({
    statusCode,
    body: JSON.stringify({ ...body, correlationId: 'family-test-correlation' }),
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { handler } = require('../../../netlify/functions/family-portal-children');

const program = {
  id: '9c247ffd-5b8f-4bf5-8ea9-c9958e017089',
  program_code: 'CMP-ABC123',
  program_name: 'Trace Family',
  program_type: 'independent_family',
  family_access_code: 'FAM-ABC123',
  admin_email: 'parent@example.com',
  admin_first_name: 'Parent',
  group_name: 'Trace Family',
};

function chain(result: Record<string, unknown>) {
  const value: Record<string, jest.Mock> = {};
  ['select', 'eq', 'neq', 'in', 'order'].forEach((method) => {
    value[method] = jest.fn(() => value);
  });
  value.maybeSingle = jest.fn().mockResolvedValue(result);
  value.then = jest.fn((resolve) => Promise.resolve(result).then(resolve));
  return value;
}

describe('family compatibility children endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockImplementation((table: string) => {
      if (table === 'pilot_programs') return chain({ data: program, error: null });
      if (table === 'participants') return chain({ data: [{ id: '11111111-1111-4111-8111-111111111111', role: 'student', program_code: program.program_code }], error: null });
      if (table === 'student_family_links') return chain({ data: [{ id: 'link-1', student_id: '11111111-1111-4111-8111-111111111111' }], error: null });
      throw new Error(`Unexpected table: ${table}`);
    });
  });

  test('reads the canonical signup participant through a validated family session', async () => {
    const response = await handler({
      httpMethod: 'GET',
      headers: {
        'x-family-program-code': program.program_code,
        'x-family-access-code': program.family_access_code,
      },
    });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(body.participants).toHaveLength(1);
    expect(body.links).toHaveLength(1);
    expect(body.sessionType).toBe('legacy_access_code');
  });

  test('creates one participant/link through the service-only RPC', async () => {
    mockRpc.mockResolvedValue({
      data: {
        participant: { id: '22222222-2222-4222-8222-222222222222', first_name: 'Trace' },
        family_link: { id: '33333333-3333-4333-8333-333333333333' },
        reused: false,
      },
      error: null,
    });
    const response = await handler({
      httpMethod: 'POST',
      headers: {
        'x-family-program-code': program.program_code,
        'x-family-access-code': program.family_access_code,
        'x-idempotency-key': 'family-child-request-1234',
      },
      body: JSON.stringify({ firstName: 'Trace', ageGrade: '2nd' }),
    });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(body.participant.id).toBe('22222222-2222-4222-8222-222222222222');
    expect(mockRpc).toHaveBeenCalledWith('create_independent_family_child', expect.objectContaining({
      program_code_input: program.program_code,
      first_name_input: 'Trace',
      grade_level_input: '2',
      idempotency_key_input: 'family-child-request-1234',
    }));
  });

  test('does not expose children when the family session is absent', async () => {
    const response = await handler({ httpMethod: 'GET', headers: {} });
    expect(response.statusCode).toBe(401);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  test('updates grade only for a participant in the validated family', async () => {
    const participantChain = chain({
      data: { id: '11111111-1111-4111-8111-111111111111', role: 'student', program_code: program.program_code },
      error: null,
    });
    const updatedChain = chain({
      data: { id: '11111111-1111-4111-8111-111111111111', grade_level: '3', grade_band: '3-5', allow_stretch_level: false },
      error: null,
    });
    const updateMock = jest.fn(() => updatedChain);
    mockFrom.mockImplementation((table: string) => {
      if (table === 'pilot_programs') return chain({ data: program, error: null });
      if (table === 'participants') {
        const selected = participantChain;
        selected.update = updateMock;
        return selected;
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const response = await handler({
      httpMethod: 'PATCH',
      headers: {
        'x-family-program-code': program.program_code,
        'x-family-access-code': program.family_access_code,
      },
      body: JSON.stringify({
        participantId: '11111111-1111-4111-8111-111111111111',
        gradeLevel: '3rd',
        allowStretchLevel: false,
      }),
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).participant.grade_level).toBe('3');
    expect(updateMock).toHaveBeenCalledWith({
      grade_level: '3',
      allow_stretch_level: false,
    });
  });
});

export {};
