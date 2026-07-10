import { supabase, isSupabaseConfigured } from '../supabaseClient';
import {
  detectReturnSessionParentEmailMatch,
  verifyReturnSessionParentEmailMatch,
} from '../kidPlayReturnSessionVerify';
import { writeStudentPinSession } from '../studentPinSession';

jest.mock('../fetchWithTimeout', () => ({
  withTimeout: <T,>(promise: PromiseLike<T>) => Promise.resolve(promise),
  DASHBOARD_FETCH_TIMEOUT_MS: 5000,
}));

jest.mock('../supabaseClient', () => ({
  isSupabaseConfigured: jest.fn(() => true),
  supabase: {
    from: jest.fn(),
  },
}));

const mockedFrom = supabase!.from as jest.Mock;

function mockStudentLinkLookup(rows: Array<{ parent_email?: string | null }>, guardianEmail = '') {
  mockedFrom.mockImplementation((table: string) => {
    if (table === 'student_family_links') {
      return {
        select: () => ({
          eq: async () => ({ data: rows, error: null }),
        }),
      };
    }
    if (table === 'participants') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { guardian_email: guardianEmail },
                error: null,
              }),
            }),
          }),
        }),
      };
    }
    return {
      select: () => ({
        eq: async () => ({ data: [], error: null }),
      }),
    };
  });
}

describe('verifyReturnSessionParentEmailMatch', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
    (isSupabaseConfigured as jest.Mock).mockReturnValue(true);
  });

  test('linked parent email on active student passes without cached parent session', async () => {
    writeStudentPinSession({
      participantId: 'child-caiden',
      programCode: 'FAMILY-MADDOX-2026',
      displayName: 'Caiden',
      verifiedAt: new Date().toISOString(),
    });
    mockStudentLinkLookup([{ parent_email: 'v.maddox2015@gmail.com' }]);

    await expect(
      verifyReturnSessionParentEmailMatch({
        email: 'v.maddox2015@gmail.com',
        activeStudentId: 'child-caiden',
      }),
    ).resolves.toBe(true);
    expect(detectReturnSessionParentEmailMatch('v.maddox2015@gmail.com')).toBe(false);
  });

  test('wrong parent email is rejected when active student is known', async () => {
    mockStudentLinkLookup([{ parent_email: 'v.maddox2015@gmail.com' }]);

    await expect(
      verifyReturnSessionParentEmailMatch({
        email: 'other.parent@example.com',
        activeStudentId: 'child-caiden',
      }),
    ).resolves.toBe(false);
  });
});
