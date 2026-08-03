// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  createParticipantForCamp,
  sanitizeParticipantInsertError,
} = require('../../../netlify/functions/_lib/campCompatibilityAuth');

export {};

const participantId = '11111111-1111-4111-8111-111111111111';
const linkId = '22222222-2222-4222-8222-222222222222';

function chain(result: Record<string, unknown>) {
  const query: Record<string, jest.Mock> = {};
  ['select', 'eq', 'ilike', 'limit'].forEach((method) => {
    query[method] = jest.fn(() => query);
  });
  query.single = jest.fn().mockResolvedValue(result);
  query.then = jest.fn((resolve) => Promise.resolve(result).then(resolve));
  return query;
}

function creationSupabase(options: { participantError?: Record<string, unknown>; linkError?: boolean } = {}) {
  const participantPayloads: Record<string, unknown>[] = [];
  const linkPayloads: Record<string, unknown>[] = [];
  const deleteQuery = chain({ data: null, error: null });
  let participantCalls = 0;
  const supabase = {
    from: jest.fn((table: string) => {
      if (table === 'participants') {
        participantCalls += 1;
        if (participantCalls === 1) return chain({ data: [], error: null });
        if (participantCalls === 2) {
          const insertQuery = chain(options.participantError
            ? { data: null, error: options.participantError }
            : { data: { id: participantId }, error: null });
          insertQuery.insert = jest.fn((payload) => {
            participantPayloads.push(payload);
            return insertQuery;
          });
          return insertQuery;
        }
        const q = chain({ data: null, error: null });
        q.delete = jest.fn(() => deleteQuery);
        return q;
      }
      if (table === 'student_family_links') {
        const insertQuery = chain(options.linkError
          ? { data: null, error: { code: '23503', message: 'foreign key violation' } }
          : { data: { id: linkId }, error: null });
        insertQuery.insert = jest.fn((payload) => {
          linkPayloads.push(payload);
          return insertQuery;
        });
        return insertQuery;
      }
      throw new Error(`Unexpected table ${table}`);
    }),
  };
  return { supabase, participantPayloads, linkPayloads, deleteQuery };
}

describe('camp participant creation grade contract', () => {
  test.each([
    ['Kindergarten', 'kindergarten'], ['K', 'kindergarten'], ['0', 'kindergarten'],
    ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'],
    ['6', '6'], ['7', '7'], ['8', '8'],
  ])('persists canonical grade_level for %s and omits legacy grade_band', async (input, canonical) => {
    const { supabase, participantPayloads, linkPayloads } = creationSupabase();
    const result = await createParticipantForCamp(supabase, 'CAMP-GRADE-CONTRACT', {
      childFirstName: 'Journey',
      childLastName: 'Learner',
      childNickname: 'Nova',
      gradeLevel: input,
    }, { correlationId: 'grade-contract-correlation' });

    expect(result.participantId).toBe(participantId);
    expect(participantPayloads).toHaveLength(1);
    expect(participantPayloads[0]).toEqual(expect.objectContaining({ grade_level: canonical }));
    expect(participantPayloads[0]).not.toHaveProperty('grade_band');
    expect(linkPayloads).toHaveLength(1);
  });

  test('rejects unsupported grades before any database query', async () => {
    const { supabase } = creationSupabase();
    const result = await createParticipantForCamp(supabase, 'CAMP-GRADE-CONTRACT', {
      childFirstName: 'Journey', childLastName: 'Learner', gradeLevel: '9',
    });
    expect(result).toEqual({ status: 400, code: 'validation_error' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  test('compensates the participant when the family-link insert fails', async () => {
    const { supabase, deleteQuery } = creationSupabase({ linkError: true });
    const result = await createParticipantForCamp(supabase, 'CAMP-GRADE-CONTRACT', {
      childFirstName: 'Journey', childLastName: 'Learner', gradeLevel: '5',
    });
    expect(result.code).toBe('family_link_create_failed');
    expect(deleteQuery.eq).toHaveBeenCalledWith('id', participantId);
  });

  test('sanitizes database constraint metadata without failed-row details', () => {
    expect(sanitizeParticipantInsertError({
      code: '23514',
      message: 'new row for relation "participants" violates check constraint "participants_grade_band_check"',
      details: 'private failed row',
    })).toEqual({
      errorCategory: 'grade_band_constraint_violation',
      metadata: {
        databaseCode: '23514',
        relation: 'participants',
        constraint: 'participants_grade_band_check',
        sanitizedMessage: 'Participant grade storage was incompatible with the production schema.',
      },
    });
  });
});
