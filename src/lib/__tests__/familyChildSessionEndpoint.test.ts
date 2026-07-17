const mockFrom = jest.fn();

jest.mock('../../../netlify/functions/_lib/crmAuth', () => ({
  correlationId: () => 'child-session-correlation',
  getServerSupabase: () => ({ from: mockFrom }),
  json: (statusCode: number, body: Record<string, unknown>) => ({
    statusCode,
    headers: { 'X-Correlation-Id': 'child-session-correlation' },
    body: JSON.stringify({ ...body, correlationId: 'child-session-correlation' }),
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const endpoint = require('../../../netlify/functions/family-child-session');

const program = {
  id: '9c247ffd-5b8f-4bf5-8ea9-c9958e017089',
  program_code: 'CMP-ABC123',
  program_type: 'independent_family',
  family_access_code: 'FAM-ABC123',
};
const participantId = '11111111-1111-4111-8111-111111111111';
const sessionId = '22222222-2222-4222-8222-222222222222';

function query(result: Record<string, unknown>) {
  const value: Record<string, jest.Mock> = {};
  ['select', 'eq', 'neq', 'in', 'order', 'not', 'limit'].forEach((method) => {
    value[method] = jest.fn(() => value);
  });
  value.maybeSingle = jest.fn().mockResolvedValue(result);
  value.single = jest.fn().mockResolvedValue(result);
  value.then = jest.fn((resolve) => Promise.resolve(result).then(resolve));
  return value;
}

function event(body: Record<string, unknown>, headers = true) {
  return {
    httpMethod: 'POST',
    headers: headers
      ? {
          'x-family-program-code': program.program_code,
          'x-family-access-code': program.family_access_code,
        }
      : {},
    body: JSON.stringify(body),
  };
}

describe('family child session endpoint', () => {
  beforeEach(() => jest.clearAllMocks());

  test('rejects anonymous launch before participant access is evaluated', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'pilot_programs') return query({ data: null, error: null });
      throw new Error(`Unexpected table ${table}`);
    });
    const response = await endpoint.handler(event({ participantId }, false));
    expect(response.statusCode).toBe(401);
  });

  test('continues when only the optional CRM audit table is unavailable', async () => {
    const insert = jest.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST205', message: "Could not find the table 'public.admin_audit_events' in the schema cache" },
    });
    const available = await endpoint._test.recordLaunchAudit(
      { from: () => ({ insert }) },
      'child-session-correlation',
      participantId,
      false,
    );
    expect(available).toBe(true);
    expect(insert).toHaveBeenCalledTimes(1);
  });

  test('rejects a participant from another family', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'pilot_programs') return query({ data: program, error: null });
      if (table === 'participants') {
        return query({
          data: { id: participantId, role: 'student', program_code: 'CMP-OTHER' },
          error: null,
        });
      }
      throw new Error(`Unexpected table ${table}`);
    });
    const response = await endpoint.handler(event({ participantId }));
    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body).code).toBe('participant_access_denied');
  });

  test('reuses the exact active family child session without inserting another', async () => {
    const existing = {
      id: sessionId,
      child_id: participantId,
      participant_id: participantId,
      organization_id: program.id,
      launched_by_user_id: null,
      session_source: 'family_home',
      device_mode: 'home_device',
      status: 'active',
      started_at: '2026-07-15T00:00:00.000Z',
      last_activity_at: '2026-07-15T00:00:00.000Z',
      ended_at: null,
      ended_reason: null,
      device_label: null,
      resume_payload: null,
      created_at: '2026-07-15T00:00:00.000Z',
      updated_at: '2026-07-15T00:00:00.000Z',
    };
    const sessionInsert = jest.fn();
    mockFrom.mockImplementation((table: string) => {
      if (table === 'pilot_programs') return query({ data: program, error: null });
      if (table === 'participants') {
        return query({
          data: {
            id: participantId,
            role: 'student',
            program_code: program.program_code,
            first_name: 'Trace',
            nickname: 'Ace',
            student_pin_enabled: true,
            student_pin_hash: 'redacted',
            student_pin_fingerprint: 'redacted',
          },
          error: null,
        });
      }
      if (table === 'kid_play_sessions') {
        const q = query({ data: [existing], error: null });
        q.update = jest.fn(() => query({ data: { ...existing, resume_payload: { participant_display_name: 'Ace' } }, error: null }));
        q.insert = sessionInsert;
        return q;
      }
      if (table === 'admin_audit_events') {
        const q = query({ data: null, error: null });
        q.insert = jest.fn(() => query({ data: null, error: null }));
        return q;
      }
      throw new Error(`Unexpected table ${table}`);
    });

    const response = await endpoint.handler(event({ participantId }));
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(body.reused).toBe(true);
    expect(body.session.id).toBe(sessionId);
    expect(body.session.resume_payload).toEqual(
      expect.objectContaining({
        participant_display_name: 'Ace',
        participant_first_name: 'Trace',
      }),
    );
    expect(body.session).not.toHaveProperty('student_pin_hash');
    expect(sessionInsert).not.toHaveBeenCalled();
  });

  test('saves grade through the validated child session without rewriting grade band', async () => {
    const existing = {
      id: sessionId,
      child_id: participantId,
      participant_id: participantId,
      organization_id: program.id,
      session_source: 'family_home',
      status: 'active',
    };
    const participantQuery = query({
      data: { id: participantId, role: 'student', program_code: program.program_code },
      error: null,
    });
    const updateGrade = jest.fn(() => query({
      data: { id: participantId, grade_level: '3' },
      error: null,
    }));
    participantQuery.update = updateGrade;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'pilot_programs') return query({ data: program, error: null });
      if (table === 'kid_play_sessions') return query({ data: existing, error: null });
      if (table === 'participants') return participantQuery;
      throw new Error(`Unexpected table ${table}`);
    });

    const response = await endpoint.handler({
      ...event({ action: 'grade', gradeLevel: '3' }),
      httpMethod: 'PATCH',
      rawQuery: `sessionId=${sessionId}`,
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).gradeLevel).toBe('3');
    expect(updateGrade).toHaveBeenCalledWith({ grade_level: '3' });
  });

  test('persists a completed baseline once and marks the exact child session complete', async () => {
    const existing = {
      id: sessionId,
      child_id: participantId,
      participant_id: participantId,
      organization_id: program.id,
      session_source: 'family_home',
      status: 'active',
      resume_payload: { route: '/weekly-adventures' },
    };
    const participant = {
      id: participantId,
      role: 'student',
      program_code: program.program_code,
      grade_level: '3',
    };
    const assessmentInsert = jest.fn(() => query({ data: null, error: null }));
    const sessionUpdate = jest.fn((patch) =>
      query({ data: { ...existing, ...patch }, error: null }),
    );

    mockFrom.mockImplementation((table: string) => {
      if (table === 'pilot_programs') return query({ data: program, error: null });
      if (table === 'participants') return query({ data: participant, error: null });
      if (table === 'assessment_results_v2') {
        const q = query({ data: [], error: null });
        q.insert = assessmentInsert;
        return q;
      }
      if (table === 'kid_play_sessions') {
        const q = query({ data: existing, error: null });
        q.update = sessionUpdate;
        return q;
      }
      throw new Error(`Unexpected table ${table}`);
    });

    const response = await endpoint.handler({
      ...event({
        action: 'baseline',
        record: {
          completedModules: ['feelings', 'reading', 'focus-moves'],
          feelingsScore: 8,
          readingScore: 4,
          focusMovesScore: 4,
          completedAt: '2026-07-15T15:25:00.000Z',
        },
      }),
      httpMethod: 'PATCH',
      rawQuery: `sessionId=${sessionId}`,
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).baselineComplete).toBe(true);
    expect(assessmentInsert).toHaveBeenCalledTimes(1);
    expect(sessionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        resume_payload: expect.objectContaining({ participant_baseline_complete: true }),
      }),
    );
  });
});

export {};
