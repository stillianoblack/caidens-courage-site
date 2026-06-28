import { writeParentClaimContext } from '../../config/parentClaimContext';
import { writeActivePilotProgram } from '../../config/activePilotProgram';
import { hydrateExistingFamilyChildren } from '../hydrateExistingFamilyChildren';
import {
  fetchParticipantsByIds,
  fetchStudentFamilyLinksByFamilyProgram,
} from '../studentFamilyLinkService';
import { fetchStudentParticipantsFromSupabase } from '../pilotTrackingService';

jest.mock('../studentFamilyLinkService', () => {
  const actual = jest.requireActual('../studentFamilyLinkService');
  return {
    ...actual,
    fetchParticipantsByIds: jest.fn(),
    fetchStudentFamilyLinksByFamilyProgram: jest.fn(),
  };
});

jest.mock('../pilotTrackingService', () => {
  const actual = jest.requireActual('../pilotTrackingService');
  return {
    ...actual,
    fetchStudentParticipantsFromSupabase: jest.fn(),
  };
});

const mockedLinks = fetchStudentFamilyLinksByFamilyProgram as jest.MockedFunction<
  typeof fetchStudentFamilyLinksByFamilyProgram
>;
const mockedParticipantsByIds = fetchParticipantsByIds as jest.MockedFunction<
  typeof fetchParticipantsByIds
>;
const mockedProgramParticipants = fetchStudentParticipantsFromSupabase as jest.MockedFunction<
  typeof fetchStudentParticipantsFromSupabase
>;

const participant = (overrides: Record<string, unknown>) => ({
  id: 'child-1',
  nickname: 'London 5th Grade',
  first_name: 'London',
  role: 'student',
  program_code: 'CAMP-GDI-2026',
  created_at: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('family children hydration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
    writeActivePilotProgram({
      programCode: 'FAMILY-GDI-LONDON-Q4M2',
      programName: 'GDI Family',
      familyAccessCode: 'FAMILY-GDI-LONDON-Q4M2',
      groupName: 'GDI Family',
      programType: 'Independent Family',
    } as never);
    writeParentClaimContext({
      email: 'parent@example.com',
      confirmed: true,
      programCode: 'FAMILY-GDI-LONDON-Q4M2',
    });
    mockedLinks.mockResolvedValue({ links: [], error: undefined });
    mockedProgramParticipants.mockResolvedValue({ participants: [], error: undefined });
    mockedParticipantsByIds.mockResolvedValue({ participants: [], error: undefined });
  });

  test('parent with duplicate same-name records only sees one child', async () => {
    mockedLinks.mockResolvedValue({
      links: [
        {
          id: 'link-1',
          student_id: 'child-1',
          family_program_code: 'FAMILY-GDI-LONDON-Q4M2',
          camp_program_code: 'CAMP-BLUERIBBONAB-2026',
          parent_email: 'parent@example.com',
          parent_first_name: null,
          parent_last_name: null,
          parent_phone: null,
          relationship: 'parent',
          parent_claimed: true,
          claimed_at: '2026-01-01T00:00:00.000Z',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ],
      error: undefined,
    });
    mockedProgramParticipants.mockResolvedValue({
      participants: [participant({ id: 'child-2', nickname: 'London Player' })] as never,
    });
    mockedParticipantsByIds.mockResolvedValue({
      participants: [participant({ id: 'child-1', nickname: 'London 5th Grade' })] as never,
    });

    const result = await hydrateExistingFamilyChildren('FAMILY-GDI-LONDON-Q4M2');

    expect(result.visibleChildren).toHaveLength(1);
    expect(result.visibleChildren[0].displayName).toContain('London');
  });

  test('parent login cannot access unrelated family/program child links', async () => {
    mockedLinks.mockResolvedValue({
      links: [
        {
          id: 'link-1',
          student_id: 'child-1',
          family_program_code: 'FAMILY-GDI-LONDON-Q4M2',
          camp_program_code: 'CAMP-GDI-2026',
          parent_email: 'other@example.com',
          parent_first_name: null,
          parent_last_name: null,
          parent_phone: null,
          relationship: 'parent',
          parent_claimed: true,
          claimed_at: '2026-01-01T00:00:00.000Z',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ],
      error: undefined,
    });
    mockedProgramParticipants.mockResolvedValue({ participants: [] });
    mockedParticipantsByIds.mockResolvedValue({ participants: [] });

    const result = await hydrateExistingFamilyChildren('FAMILY-GDI-LONDON-Q4M2');

    expect(result.visibleChildren).toHaveLength(0);
    expect(result.allowedStudentIds).toEqual([]);
  });
});
