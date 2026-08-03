const {
  createParticipantForCamp,
  normalizeParticipantPinStatus,
  participantDirectoryForCamp,
} = require('../../../netlify/functions/_lib/campCompatibilityAuth');

describe('camp compatibility roster payload', () => {
  test.each([
    [{ student_pin_enabled: true, student_pin_hash: 'stored' }, 'ready'],
    [{ student_pin_enabled: true }, 'missing'],
    [{ student_pin_enabled: false, student_pin_hash: 'stored' }, 'disabled'],
  ])('normalizes PIN readiness without returning PIN material', (row, expected) => {
    expect(normalizeParticipantPinStatus(row)).toBe(expected);
  });

  test('returns only normalized pin_status to the browser', async () => {
    const databaseRow = {
      id: '00000000-0000-4000-8000-000000000001',
      nickname: 'Learner',
      first_name: 'Learner',
      last_name: 'Test',
      role: 'student',
      program_code: 'PROGRAM',
      created_at: '2026-08-03T00:00:00.000Z',
      student_pin_enabled: true,
      student_pin_hash: 'private-hash',
      student_pin_fingerprint: 'private-fingerprint',
      student_pin_reveal_value: '1234',
    };
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              order: async () => ({ data: [databaseRow], error: null }),
            }),
          }),
        }),
      }),
    };

    const result = await participantDirectoryForCamp(supabase, 'PROGRAM');
    expect(result.participants).toHaveLength(1);
    expect(result.participants[0].pin_status).toBe('ready');
    expect(JSON.stringify(result.participants[0])).not.toMatch(
      /student_pin_hash|student_pin_fingerprint|student_pin_reveal_value|private-hash|1234/,
    );
  });

  test('logs report-safe transaction stages without student or credential data', async () => {
    const participantId = '00000000-0000-4000-8000-000000000001';
    const duplicateQuery = {
      eq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    };
    const participantInsert = {
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { id: participantId }, error: null }),
      }),
    };
    const familyInsert = {
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { id: 'link-1' }, error: null }),
      }),
    };
    const supabase = {
      from: jest.fn((table) => {
        if (table === 'participants') {
          return {
            select: jest.fn().mockReturnValue(duplicateQuery),
            insert: jest.fn().mockReturnValue(participantInsert),
          };
        }
        return { insert: jest.fn().mockReturnValue(familyInsert) };
      }),
    };
    const info = jest.spyOn(console, 'info').mockImplementation(() => {});

    const result = await createParticipantForCamp(supabase, 'PROGRAM-SECRET', {
      childFirstName: 'PrivateFirst',
      childLastName: 'PrivateLast',
      gradeLevel: '5',
    }, { correlationId: 'correlation-safe' });

    expect(result.participantId).toBe(participantId);
    const serializedLogs = JSON.stringify(info.mock.calls);
    expect(serializedLogs).toContain('participant_insert_succeeded');
    expect(serializedLogs).toContain('family_link_insert_succeeded');
    expect(serializedLogs).toContain('create_participant_committed');
    expect(serializedLogs).not.toMatch(/PrivateFirst|PrivateLast|PROGRAM-SECRET|studentPin|familyClaimCode/);
    info.mockRestore();
  });
});
