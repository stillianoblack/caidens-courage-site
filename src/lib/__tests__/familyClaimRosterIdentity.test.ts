import { buildFamilyClaimUrl } from '../familyClaimCode';
import { mergeParticipantRecords } from '../pilotResultsDisplay';
import {
  resolveFamilyPinAccessContext,
  resolveRosterParentConnectionStatus,
} from '../parentGuardianIdentity';
import { PORTAL_CLAIM_PIN_MISMATCH_MESSAGE } from '../portalIdentity';
import { copyTextToClipboard } from '../studentPinService';
import { writeLastPilotProgram } from '../../config/lastPilotProgram';
import type { ActivePilotProgram } from '../../types/pilotProgram';
import type { StudentFamilyLink } from '../studentFamilyLinkService';
import type { StudentParticipantRecord } from '../pilotTrackingService';
import {
  isPlaceholderParentName,
  resolveParentGuardianDisplayName,
  resolveStudentDisplayNameOrFallback,
  ROSTER_STUDENT_NAME_FALLBACK,
} from '../studentDisplayName';

const baseLink = (overrides: Partial<StudentFamilyLink> = {}): StudentFamilyLink =>
  ({
    id: 'link-1',
    student_id: 'child-1',
    family_program_code: 'FAMILY-TEST',
    camp_program_code: 'CAMP-TEST',
    parent_email: null,
    parent_first_name: null,
    parent_last_name: null,
    parent_phone: null,
    parent_claimed: false,
    relationship: 'parent',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }) as StudentFamilyLink;

const participant = (overrides: Partial<StudentParticipantRecord> = {}): StudentParticipantRecord =>
  ({
    id: 'p-1',
    nickname: null,
    first_name: null,
    display_name: null,
    last_name: null,
    role: 'student',
    program_code: 'CAMP-TEST',
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }) as StudentParticipantRecord;

describe('student roster identity', () => {
  test('prefers display_name then nickname then first_name', () => {
    expect(
      resolveStudentDisplayNameOrFallback({
        display_name: 'Samuel T.',
        nickname: 'Sam',
        first_name: 'Samuel',
      }),
    ).toBe('Samuel T.');
    expect(
      resolveStudentDisplayNameOrFallback({
        nickname: 'Sam',
        first_name: 'Samuel',
      }),
    ).toBe('Sam');
    expect(resolveStudentDisplayNameOrFallback({ first_name: 'Samuel' })).toBe('Samuel');
  });

  test('does not fall back to generic Student label', () => {
    expect(resolveStudentDisplayNameOrFallback({})).toBe(ROSTER_STUDENT_NAME_FALLBACK);
    expect(resolveStudentDisplayNameOrFallback({ first_name: 'Samuel' })).not.toBe('Student');
  });

  test('mergeParticipantRecords keeps Supabase names when local cache is empty', () => {
    const merged = mergeParticipantRecords(
      [participant({ id: 'p-1', first_name: 'Samuel', nickname: 'Sam' })],
      [participant({ id: 'p-1', first_name: null, nickname: null })],
    );
    expect(merged[0].first_name).toBe('Samuel');
    expect(merged[0].nickname).toBe('Sam');
  });
});

describe('parent guardian identity', () => {
  test('ignores Pending placeholder last names', () => {
    expect(isPlaceholderParentName('Pending')).toBe(true);
    expect(
      resolveParentGuardianDisplayName({
        parent_first_name: 'Taylor',
        parent_last_name: 'Pending',
        parent_email: 'parent@example.com',
      }),
    ).toBe('Taylor');
  });

  test('shows parent name from claim fields in roster resolution', () => {
    expect(
      resolveParentGuardianDisplayName({
        parent_first_name: 'Jordan',
        parent_last_name: 'Smith',
      }),
    ).toBe('Jordan Smith');
  });

  test('claimed link without email shows connected missing profile', () => {
    const result = resolveRosterParentConnectionStatus(
      baseLink({ parent_claimed: true, parent_email: null }),
    );
    expect(result.status).toBe('connected');
    expect(result.label).toBe('Connected — missing profile');
  });

  test('connected with email only still counts as connected', () => {
    const result = resolveRosterParentConnectionStatus(
      baseLink({
        parent_claimed: true,
        parent_email: 'parent@example.com',
      }),
    );
    expect(result.status).toBe('connected');
    expect(result.label).toBe('Connected');
  });

  test('invited parent with email is not connected', () => {
    const result = resolveRosterParentConnectionStatus(
      baseLink({ parent_email: 'parent@example.com', parent_claimed: false }),
    );
    expect(result.status).toBe('invited');
    expect(result.label).toBe('Invited');
  });

  test('connected parent with email does not show pending', () => {
    const result = resolveRosterParentConnectionStatus(
      baseLink({
        parent_claimed: true,
        parent_email: 'parent@example.com',
        parent_first_name: 'Jordan',
        parent_last_name: 'Smith',
      }),
    );
    expect(result.status).toBe('connected');
    expect(result.label).toBe('Connected');
  });
});

describe('family claim portal deep link', () => {
  test('claim url opens portal with parent claim mode', () => {
    expect(buildFamilyClaimUrl('CLAIM-ABCDE-12345', 'https://example.com')).toBe(
      'https://example.com/portal?code=CLAIM-ABCDE-12345&audience=parents&claim=1',
    );
  });

  test('claim pin mismatch message is explicit', () => {
    expect(PORTAL_CLAIM_PIN_MISMATCH_MESSAGE).toMatch(/claim code does not match/i);
  });
});

describe('family pin access on mobile settings', () => {
  const mockProgram = (): ActivePilotProgram =>
    ({
      id: 'prog-1',
      programCode: 'FAMILY-RIVER',
      programName: 'River Family',
      familyAccessCode: 'FAMILY-RIVER-2026',
      facilitatorAccessCode: 'FACIL-RIVER',
      groupName: 'River Camp',
      adminEmail: 'facilitator@camp.org',
    }) as ActivePilotProgram;

  beforeEach(() => {
    window.localStorage.clear();
  });

  test('linked invited parent can reveal and copy PIN', () => {
    writeLastPilotProgram(mockProgram(), 'family', 'v.maddox2015@gmail.com', 'FAMILY-RIVER-2026');

    const access = resolveFamilyPinAccessContext({
      programCode: 'FAMILY-RIVER',
      participantId: 'child-caiden',
      parentLink: baseLink({
        student_id: 'child-caiden',
        parent_email: 'v.maddox2015@gmail.com',
        parent_claimed: false,
      }),
    });

    expect(access.parentEmail).toBe('v.maddox2015@gmail.com');
    expect(access.parentConnected).toBe(true);
  });

  test('copyTextToClipboard uses execCommand fallback', () => {
    document.execCommand = jest.fn(() => true);
    expect(copyTextToClipboard('4319')).toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });
});
