import { resolveExistingStudentParticipant } from '../pilotTrackingService';
import { supabase } from '../supabaseClient';

jest.mock('../supabaseClient', () => ({
  isSupabaseConfigured: () => true,
  supabase: {
    from: jest.fn(),
  },
}));

type SupabaseResult = { data: unknown[] | null; error: null | { message: string } };
type QueryBuilderMock = {
  select: jest.Mock<QueryBuilderMock>;
  eq: jest.Mock<QueryBuilderMock>;
  ilike: jest.Mock<QueryBuilderMock>;
  in: jest.Mock<QueryBuilderMock>;
  is: jest.Mock<QueryBuilderMock>;
  or: jest.Mock<QueryBuilderMock>;
  order: jest.Mock<QueryBuilderMock>;
  limit: jest.Mock<QueryBuilderMock>;
  then: (resolve: (value: SupabaseResult) => void) => Promise<void>;
};

function queryResult(result: SupabaseResult) {
  const builder = {} as QueryBuilderMock;
  Object.assign(builder, {
    select: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    ilike: jest.fn(() => builder),
    in: jest.fn(() => builder),
    is: jest.fn(() => builder),
    or: jest.fn(() => builder),
    order: jest.fn(() => builder),
    limit: jest.fn(() => builder),
    then: (resolve: (value: SupabaseResult) => void) => Promise.resolve(result).then(resolve),
  });
  return builder;
}

const mockedFrom = supabase!.from as jest.Mock;

describe('participant duplicate guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('resolves an existing participant through a parent family link before creating another child', async () => {
    mockedFrom.mockImplementation((table: string) => {
      if (table === 'student_family_links') {
        return queryResult({
          data: [{ student_id: '1416658d-dc22-4fa3-a48d-c415d12d2a69' }],
          error: null,
        });
      }
      if (table === 'participants') {
        return queryResult({
          data: [
            {
              id: '1416658d-dc22-4fa3-a48d-c415d12d2a69',
              nickname: 'London 5th Grade',
              first_name: 'London',
              last_name: null,
              created_at: '2026-01-01T00:00:00.000Z',
            },
          ],
          error: null,
        });
      }
      return queryResult({ data: [], error: null });
    });

    await expect(
      resolveExistingStudentParticipant({
        programCode: 'CAMP-GDI-2026',
        firstName: 'London',
        nickname: 'London Player',
        parentEmail: 'parent@example.com',
      }),
    ).resolves.toMatchObject({
      participantId: '1416658d-dc22-4fa3-a48d-c415d12d2a69',
      reason: 'family_link',
    });
  });

  test('logs duplicate candidates and returns the oldest identity match', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockedFrom.mockImplementation((table: string) => {
      if (table === 'participants') {
        return queryResult({
          data: [
            {
              id: 'oldest-child',
              nickname: 'London 5th Grade',
              first_name: 'London',
              last_name: null,
              created_at: '2026-01-01T00:00:00.000Z',
            },
            {
              id: 'duplicate-child',
              nickname: 'London Player',
              first_name: 'London',
              last_name: null,
              created_at: '2026-02-01T00:00:00.000Z',
            },
          ],
          error: null,
        });
      }
      return queryResult({ data: [], error: null });
    });

    await expect(
      resolveExistingStudentParticipant({
        programCode: 'CAMP-GDI-2026',
        firstName: 'London',
        nickname: 'London Player',
      }),
    ).resolves.toEqual({
      participantId: 'oldest-child',
      reason: 'student_identity',
      duplicateCandidateIds: ['duplicate-child'],
    });

    expect(errorSpy).toHaveBeenCalledWith(
      '[DUPLICATE_STUDENT_PARTICIPANT_DETECTED]',
      expect.objectContaining({
        program_code: 'CAMP-GDI-2026',
        participant_ids: ['oldest-child', 'duplicate-child'],
      }),
    );
    errorSpy.mockRestore();
  });
});
