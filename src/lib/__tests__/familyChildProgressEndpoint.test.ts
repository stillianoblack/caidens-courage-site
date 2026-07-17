const mockFrom = jest.fn();

jest.mock('../../../netlify/functions/_lib/crmAuth', () => ({
  correlationId: () => 'progress-correlation',
  getServerSupabase: () => ({ from: mockFrom }),
  json: (statusCode: number, body: Record<string, unknown>) => ({
    statusCode,
    body: JSON.stringify({ ...body, correlationId: 'progress-correlation' }),
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { handler } = require('../../../netlify/functions/family-child-progress');

const program = {
  id: '9c247ffd-5b8f-4bf5-8ea9-c9958e017089',
  program_code: 'CMP-ABC123',
  program_type: 'independent_family',
  family_access_code: 'FAM-ABC123',
};
const participantId = '11111111-1111-4111-8111-111111111111';

function chain(result: Record<string, unknown>) {
  const value: Record<string, jest.Mock> = {};
  ['select', 'eq', 'neq', 'in', 'order'].forEach((method) => {
    value[method] = jest.fn(() => value);
  });
  value.insert = jest.fn(() => value);
  value.single = jest.fn().mockResolvedValue(result);
  value.maybeSingle = jest.fn().mockResolvedValue(result);
  value.then = jest.fn((resolve) => Promise.resolve(result).then(resolve));
  return value;
}

describe('family child progress endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockImplementation((table: string) => {
      if (table === 'pilot_programs') return chain({ data: program, error: null });
      if (table === 'participants') {
        return chain({ data: { id: participantId, role: 'student', program_code: program.program_code }, error: null });
      }
      if (table === 'player_progress') {
        return chain({ data: [{ week_id: 'week-3', mission_id: 'focus-recovery', completed_at: '2026-07-16T00:00:00Z' }], error: null });
      }
      if (table === 'player_wallets') return chain({ data: { total_coins: 25 }, error: null });
      if (table === 'player_badges') return chain({ data: [{ badge_name: 'Focus Recovery Badge' }], error: null });
      throw new Error(`Unexpected table: ${table}`);
    });
  });

  test('returns participant-scoped progress summary through a validated family session', async () => {
    const response = await handler({
      httpMethod: 'GET',
      headers: {
        'x-family-program-code': program.program_code,
        'x-family-access-code': program.family_access_code,
      },
      rawQuery: `participantId=${participantId}&weekId=week-3&view=summary`,
    });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(body.rows).toHaveLength(1);
    expect(body.totalCoins).toBe(25);
    expect(body.badges).toEqual(['Focus Recovery Badge']);
  });

  test('rejects a progress summary without a validated family session', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'pilot_programs') return chain({ data: null, error: null });
      throw new Error(`Unexpected table: ${table}`);
    });
    const response = await handler({
      httpMethod: 'GET',
      headers: {},
      rawQuery: `participantId=${participantId}&weekId=week-3&view=summary`,
    });
    expect(response.statusCode).toBe(401);
  });

  test('saves a participant-scoped module completion through the server boundary', async () => {
    let moduleResultCalls = 0;
    const moduleInsert = chain({ data: { id: '22222222-2222-4222-8222-222222222222' }, error: null });
    const attemptInsert = chain({ data: null, error: null });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'pilot_programs') return chain({ data: program, error: null });
      if (table === 'participants') {
        return chain({ data: { id: participantId, role: 'student', program_code: program.program_code, group_name: 'Family' }, error: null });
      }
      if (table === 'module_results') {
        moduleResultCalls += 1;
        return moduleResultCalls === 1 ? chain({ count: 2, error: null }) : moduleInsert;
      }
      if (table === 'question_attempts') return attemptInsert;
      throw new Error(`Unexpected table: ${table}`);
    });
    const response = await handler({
      httpMethod: 'POST',
      headers: {
        'x-family-program-code': program.program_code,
        'x-family-access-code': program.family_access_code,
      },
      body: JSON.stringify({
        participantId,
        module: {
          moduleId: 'focus-recovery', moduleTitle: 'Focus Recovery', character: 'caiden',
          score: 8, maxScore: 8, completedAt: '2026-07-16T00:00:00Z',
        },
        attempts: [{
          weekNumber: 3, missionId: 'focus-recovery', questionId: 'ffc-w3-c1',
          isCorrectFirstTry: true, isCorrectFinal: true, attemptCount: 1,
          usedHint: false, attemptType: 'initial', isReplay: false,
          completedAt: '2026-07-16T00:00:00Z',
        }],
      }),
    });
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(body.recordId).toBe('22222222-2222-4222-8222-222222222222');
    expect(moduleInsert.insert).toHaveBeenCalledWith(expect.objectContaining({
      participant_id: participantId, program_code: program.program_code, attempt_number: 3,
    }));
    expect(attemptInsert.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        participant_id: participantId, program_code: program.program_code,
        question_id: 'ffc-w3-c1', attempts_count: 1,
      }),
    ]);
  });

  test('denies completion for a participant outside the family program', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'pilot_programs') return chain({ data: program, error: null });
      if (table === 'participants') {
        return chain({ data: { id: participantId, role: 'student', program_code: 'OTHER-PROGRAM' }, error: null });
      }
      throw new Error(`Unexpected table: ${table}`);
    });
    const response = await handler({
      httpMethod: 'POST',
      headers: {
        'x-family-program-code': program.program_code,
        'x-family-access-code': program.family_access_code,
      },
      body: JSON.stringify({ participantId, module: {}, attempts: [] }),
    });
    expect(response.statusCode).toBe(403);
  });
});

export {};
