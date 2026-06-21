import type { ActivePilotProgram } from '../../types/pilotProgram';
import { writeActivePilotProgram } from '../../config/activePilotProgram';
import { lookupPortalProgramByAccessCodeDetailed } from '../portalAccessResolve';
import { fetchStudentFamilyLinksByFamilyProgram } from '../studentFamilyLinkService';
import { resolveStudentPinProgramCodeCandidates } from '../studentPinProgramScope';

jest.mock('../portalAccessResolve', () => ({
  lookupPortalProgramByAccessCodeDetailed: jest.fn(),
}));

jest.mock('../studentFamilyLinkService', () => ({
  fetchStudentFamilyLinksByFamilyProgram: jest.fn(),
}));

const mockedLookup = lookupPortalProgramByAccessCodeDetailed as jest.MockedFunction<
  typeof lookupPortalProgramByAccessCodeDetailed
>;
const mockedFetchLinks = fetchStudentFamilyLinksByFamilyProgram as jest.MockedFunction<
  typeof fetchStudentFamilyLinksByFamilyProgram
>;

const independentFamilyProgram = (): ActivePilotProgram =>
  ({
    id: 'family-maddox',
    programCode: 'FAMILY-MADDOX-2026',
    programName: 'Maddox Family',
    programType: 'Independent Family',
    familyAccessCode: 'FAMILY-MADDOX-2026-FAMILY',
    facilitatorAccessCode: 'FAMILY-MADDOX-2026-INTERNAL-NO-FACILITATOR',
    groupName: 'Maddox Family',
    adminEmail: 'v.maddox2015@gmail.com',
  }) as ActivePilotProgram;

describe('resolveStudentPinProgramCodeCandidates', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
    mockedFetchLinks.mockResolvedValue({ links: [] });
  });

  test('independent family access code includes family program code when no camp links exist', async () => {
    mockedLookup.mockResolvedValue({
      status: 'found',
      result: {
        role: 'family',
        program: independentFamilyProgram(),
      },
    });

    const codes = await resolveStudentPinProgramCodeCandidates({
      accessCodeHint: 'FAMILY-MADDOX-2026-FAMILY',
    });

    expect(codes).toContain('FAMILY-MADDOX-2026');
  });

  test('active independent family portal program includes family program code', async () => {
    writeActivePilotProgram(independentFamilyProgram());

    const codes = await resolveStudentPinProgramCodeCandidates();

    expect(codes).toContain('FAMILY-MADDOX-2026');
  });

  test('campProgramCodeHint is honored for student PIN lookup', async () => {
    const codes = await resolveStudentPinProgramCodeCandidates({
      campProgramCodeHint: 'CAMP-2026',
    });

    expect(codes).toEqual(['CAMP-2026']);
  });
});
