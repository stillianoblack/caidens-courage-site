import { buildPortalProgramDiagnostic } from '../portalDiagnostics';
import { fetchStudentFamilyLinksByCampProgram } from '../studentFamilyLinkService';
import { fetchStudentParticipantsFromSupabase } from '../pilotTrackingService';

jest.mock('../studentFamilyLinkService', () => ({
  fetchStudentFamilyLinksByCampProgram: jest.fn(),
}));

jest.mock('../pilotTrackingService', () => ({
  fetchStudentParticipantsFromSupabase: jest.fn(),
}));

const mockedLinks = fetchStudentFamilyLinksByCampProgram as jest.MockedFunction<
  typeof fetchStudentFamilyLinksByCampProgram
>;
const mockedParticipants = fetchStudentParticipantsFromSupabase as jest.MockedFunction<
  typeof fetchStudentParticipantsFromSupabase
>;

describe('portal diagnostics', () => {
  test('facilitator roster count matches active student participants', async () => {
    mockedParticipants.mockResolvedValue({
      participants: [
        {
          id: 'child-1',
          nickname: 'London 5th Grade',
          first_name: 'London',
          role: 'student',
          program_code: 'CAMP-GDI-2026',
          created_at: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'child-2',
          nickname: 'London Player',
          first_name: 'London',
          role: 'student',
          program_code: 'CAMP-GDI-2026',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ] as never,
    });
    mockedLinks.mockResolvedValue({
      links: [
        {
          id: 'link-1',
          student_id: 'child-1',
          family_program_code: 'FAMILY-GDI-LONDON-Q4M2',
          camp_program_code: 'CAMP-GDI-2026',
        },
      ] as never,
      error: undefined,
    });

    const diagnostic = await buildPortalProgramDiagnostic({
      id: 'program-1',
      programCode: 'CAMP-GDI-2026',
      programName: 'GDI Camp',
      familyAccessCode: 'FAMILY-GDI-LONDON-Q4M2',
    });

    expect(diagnostic?.participantCount).toBe(2);
    expect(diagnostic?.linkedFamilyCount).toBe(1);
    expect(diagnostic?.duplicateNameCandidates).toHaveLength(1);
  });
});
