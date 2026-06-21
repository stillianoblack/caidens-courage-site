import type { ActivePilotProgram } from '../../types/pilotProgram';
import { writeActivePilotProgram } from '../../config/activePilotProgram';
import { writeActiveAccessCode } from '../../config/portalContext';
import {
  writeParentClaimContext,
} from '../../config/parentClaimContext';
import {
  detectReturnSessionFacilitatorEmailMatch,
  detectReturnSessionParentEmailMatch,
} from '../kidPlayReturnSessionVerify';
import {
  canSkipReturnAccessCode,
  shouldHideReturnSessionAccessCode,
  verifyKidPlayReturnAccessCodeLocal,
} from '../kidPlayReturnUnlock';
import {
  endKidPlayFamilyShellSession,
} from '../kidPlaySessionEnd';
import {
  familyReturnSessionPath,
  facilitatorReturnSessionPath,
  resolveKidPlayReturnSessionDestination,
} from '../kidPlayReturnSessionRoute';
import {
  resolveOngoingFamilyAccessCode,
  resolvePortalUnlockDestination,
} from '../portalUnlockRoute';
import {
  PORTAL_EMAIL_NOT_CONNECTED_MESSAGE,
} from '../portalIdentity';
import {
  readRememberedProgramAccessCode,
  readRememberedProgramForContext,
  switchRememberedProgram,
  writeRememberedProgramAccess,
} from '../rememberedProgramAccess';
import { writeRememberedDeviceSession } from '../rememberedDeviceSession';
import { writeStudentPinSession } from '../studentPinSession';
import type { KidPlaySessionRow } from '../kidPlaySessionTypes';
import { isKidPlayFamilySoftLocked, setKidPlayFamilySoftLocked } from '../kidPlayFamilySoftLock';

const mockProgram = (overrides: Partial<ActivePilotProgram> = {}): ActivePilotProgram =>
  ({
    id: 'prog-1',
    programCode: 'CAMP-2026',
    programName: 'Test Camp',
    familyAccessCode: 'FAMILY-ACCESS-2026',
    facilitatorAccessCode: 'FACIL-2026',
    groupName: 'Group A',
    adminEmail: 'facilitator@camp.org',
    ...overrides,
  }) as ActivePilotProgram;

const familySession = (): Pick<KidPlaySessionRow, 'id' | 'session_source' | 'device_mode'> => ({
  id: 'session-abc',
  session_source: 'family_home',
  device_mode: 'child_owned_device',
});

jest.mock('../kidPlaySessionService', () => ({
  updateKidPlaySessionActivity: jest.fn().mockResolvedValue(undefined),
  endKidPlaySession: jest.fn().mockResolvedValue(undefined),
  writeLocalKidPlaySessionId: jest.fn(),
}));

jest.mock('../parentPushNotify', () => ({
  triggerParentPush: jest.fn(),
}));

describe('portal session flow', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('Family Access Code + student PIN routes to Kid Shell', () => {
    writeRememberedProgramAccess('FAMILY-ACCESS-2026', mockProgram());

    expect(
      resolvePortalUnlockDestination({
        accessCode: 'FAMILY-ACCESS-2026',
        parentEmail: '4321',
        programRole: 'family',
      }),
    ).toBe('kid_shell');

    expect(verifyKidPlayReturnAccessCodeLocal('FAMILY-ACCESS-2026')).toBe(true);
    expect(
      resolveKidPlayReturnSessionDestination({
        emailOrPin: '4321',
        parentEmailMatches: false,
        facilitatorEmailMatches: false,
      }),
    ).toBe('kid_shell');
    expect(canSkipReturnAccessCode()).toBe(true);
    expect(shouldHideReturnSessionAccessCode()).toBe(true);
  });

  test('Family Claim Code + student PIN supports claim flow without replacing family access code', () => {
    const claimCode = 'CLAIM-STUDENT-1';
    const campProgram = mockProgram({ programCode: 'CAMP-2026' });

    expect(
      resolvePortalUnlockDestination({
        accessCode: claimCode,
        parentEmail: '5678',
        programRole: 'family',
      }),
    ).toBe('kid_shell');

    writeRememberedProgramAccess(claimCode, campProgram);
    expect(verifyKidPlayReturnAccessCodeLocal(claimCode)).toBe(true);

    const familyProgram = mockProgram({
      programCode: 'FAMILY-USER-1',
      familyAccessCode: 'FAMILY-ACCESS-2026',
    });
    expect(resolveOngoingFamilyAccessCode(familyProgram, claimCode)).toBe('FAMILY-ACCESS-2026');
    expect(resolveOngoingFamilyAccessCode(familyProgram, claimCode)).not.toBe(claimCode);
  });

  test('Return To Session stays inside Kid Shell after exit (no play-pause redirect)', async () => {
    const navigate = jest.fn();

    await endKidPlayFamilyShellSession(navigate, {
      sessionId: familySession().id,
      reason: 'user_exit',
      childDisplayName: 'Alex',
      childId: 'child-1',
      stayInShell: true,
      resumePayload: { route: '/play/session/session-abc/weekly-adventures', module: 'weekly-adventures' },
    });

    expect(navigate).not.toHaveBeenCalled();
    expect(isKidPlayFamilySoftLocked()).toBe(true);

    await endKidPlayFamilyShellSession(navigate, {
      sessionId: 'session-abc',
      stayInShell: false,
    });
    expect(navigate).toHaveBeenCalled();
  });

  test('parent email routes to Family Portal overview path', () => {
    writeActivePilotProgram(mockProgram({ programCode: 'FAMILY-USER-1' }));
    writeActiveAccessCode('FAMILY-ACCESS-2026');
    writeParentClaimContext({
      email: 'parent@camp.org',
      confirmed: true,
      programCode: 'FAMILY-USER-1',
      accessCode: 'FAMILY-ACCESS-2026',
    });

    expect(detectReturnSessionParentEmailMatch('parent@camp.org')).toBe(true);
    expect(
      resolveKidPlayReturnSessionDestination({
        emailOrPin: 'parent@camp.org',
        parentEmailMatches: true,
        facilitatorEmailMatches: false,
      }),
    ).toBe('family_portal');
    expect(familyReturnSessionPath()).toMatch(/^\/(family-hub|portal\/family)$/);
  });

  test('facilitator email routes to Facilitator Roster', () => {
    writeActivePilotProgram(mockProgram());
    writeActiveAccessCode('FACIL-2026');

    expect(detectReturnSessionFacilitatorEmailMatch('facilitator@camp.org')).toBe(true);
    expect(
      resolveKidPlayReturnSessionDestination({
        emailOrPin: 'facilitator@camp.org',
        parentEmailMatches: false,
        facilitatorEmailMatches: true,
      }),
    ).toBe('facilitator_portal');
    expect(facilitatorReturnSessionPath()).toBe('/program-dashboard/roster');
  });

  test('wrong email cannot enter remembered program', () => {
    writeRememberedProgramAccess('FAMILY-ACCESS-2026', mockProgram({ programCode: 'FAMILY-USER-1' }));
    writeRememberedDeviceSession({
      access_code: 'FAMILY-ACCESS-2026',
      program_id: 'prog-1',
      program_code: 'FAMILY-USER-1',
      user_type: 'parent',
      parent_id: 'parent@camp.org',
      program: mockProgram({ programCode: 'FAMILY-USER-1' }),
    });
    writeActivePilotProgram(mockProgram({ programCode: 'FAMILY-USER-1' }));
    writeActiveAccessCode('FAMILY-ACCESS-2026');

    expect(detectReturnSessionParentEmailMatch('stranger@example.com')).toBe(false);
    expect(
      resolveKidPlayReturnSessionDestination({
        emailOrPin: 'stranger@example.com',
        parentEmailMatches: false,
        facilitatorEmailMatches: false,
      }),
    ).toBe('invalid');
    expect(PORTAL_EMAIL_NOT_CONNECTED_MESSAGE).toBe(
      'That email is not connected to this program.',
    );
  });

  test('return session hides access code when active portal program is set', () => {
    writeActivePilotProgram(mockProgram({ programCode: 'FAMILY-USER-1' }));
    writeActiveAccessCode('FAMILY-ACCESS-2026');

    expect(shouldHideReturnSessionAccessCode()).toBe(true);
    expect(canSkipReturnAccessCode()).toBe(true);
    expect(shouldHideReturnSessionAccessCode({ inShellSessionId: 'session-abc' })).toBe(true);
  });

  test('remembered access code does not cross-pollinate programs', () => {
    writeRememberedProgramAccess('FAMILY-ACCESS-A', mockProgram({ programCode: 'FAMILY-A', familyAccessCode: 'FAMILY-ACCESS-A' }));
    expect(readRememberedProgramAccessCode()).toBe('FAMILY-ACCESS-A');
    expect(readRememberedProgramForContext()?.programCode).toBe('FAMILY-A');

    switchRememberedProgram(false);
    writeRememberedProgramAccess('FAMILY-ACCESS-B', mockProgram({ programCode: 'FAMILY-B', familyAccessCode: 'FAMILY-ACCESS-B' }));

    expect(readRememberedProgramAccessCode()).toBe('FAMILY-ACCESS-B');
    expect(readRememberedProgramForContext()?.programCode).toBe('FAMILY-B');
    expect(readRememberedProgramAccessCode()).not.toBe('FAMILY-ACCESS-A');

    writeActivePilotProgram(mockProgram({ programCode: 'FAMILY-B', familyAccessCode: 'FAMILY-ACCESS-B' }));
    writeActiveAccessCode('FAMILY-ACCESS-B');
    writeStudentPinSession({
      participantId: 'child-b',
      programCode: 'CAMP-B',
      displayName: 'Child B',
      verifiedAt: new Date().toISOString(),
    });

    setKidPlayFamilySoftLocked(true);
    expect(verifyKidPlayReturnAccessCodeLocal('FAMILY-ACCESS-A')).toBe(false);
    expect(verifyKidPlayReturnAccessCodeLocal('FAMILY-ACCESS-B')).toBe(true);
  });
});
