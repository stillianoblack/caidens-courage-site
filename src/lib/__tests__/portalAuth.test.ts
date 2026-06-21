import type { ActivePilotProgram } from '../../types/pilotProgram';
import {
  LAST_PILOT_PROGRAM_FACILITATOR_KEY,
  writeLastPilotProgram,
} from '../../config/lastPilotProgram';
import { writeActivePilotProgram } from '../../config/activePilotProgram';
import { writeActiveAccessCode } from '../../config/portalContext';
import {
  isDevAuthBypassEnabled,
  isLegacyDemoUnlockAllowed,
  PORTAL_EMAIL_NOT_REGISTERED_MESSAGE,
} from '../portalAuthConfig';
import { verifyFacilitatorProgramEmail } from '../portalFacilitatorAuth';
import {
  classifyPortalCredential,
  resolvePortalUnlockDestination,
} from '../portalUnlockRoute';
import {
  switchRememberedProgram,
  writeRememberedProgramAccess,
} from '../rememberedProgramAccess';
import {
  SCOPED_PARENT_CLAIM_KEY,
  writeParentClaimContext,
} from '../../config/parentClaimContext';
import { BLUE_RIBBON_UNLOCK_KEY } from '../../config/blueRibbonPortalAccess';
import { PORTAL_SESSION_KEY } from '../../config/portalAccess';

const blueRibbonProgram = (): ActivePilotProgram =>
  ({
    id: 'blue-ribbon',
    programCode: 'CAMP-BLUERIBBON-2026',
    programName: 'Blue Ribbon Results Academy',
    familyAccessCode: 'CAMP-BLUERIBBON-2026-FAMILY',
    facilitatorAccessCode: 'CAMP-BLUERIBBON-2026-FACIL',
    groupName: 'Blue Ribbon Results Academy',
    adminEmail: 'facilitator@blueribbon.org',
  }) as ActivePilotProgram;

describe('portal auth', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  describe('A. Unknown email + Blue Ribbon program code', () => {
    test('blocks personal email not registered on program', () => {
      const program = blueRibbonProgram();
      const result = verifyFacilitatorProgramEmail(
        program,
        'personal@gmail.com',
        program.facilitatorAccessCode!,
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toBe(PORTAL_EMAIL_NOT_REGISTERED_MESSAGE);
      }
    });
  });

  describe('B. Personal email not in Blue Ribbon facilitators', () => {
    test('blocks v.maddox2015@gmail.com on Blue Ribbon facilitator code', () => {
      const program = blueRibbonProgram();
      const result = verifyFacilitatorProgramEmail(
        program,
        'v.maddox2015@gmail.com',
        program.facilitatorAccessCode!,
      );
      expect(result.success).toBe(false);
    });
  });

  describe('C. Valid Blue Ribbon facilitator email', () => {
    test('allows registered admin email for scoped program', () => {
      const program = blueRibbonProgram();
      const result = verifyFacilitatorProgramEmail(
        program,
        'facilitator@blueribbon.org',
        program.facilitatorAccessCode!,
      );
      expect(result.success).toBe(true);
    });

    test('facilitator access code routes to facilitator portal when role is facilitator', () => {
      expect(
        resolvePortalUnlockDestination({
          accessCode: 'CAMP-BLUERIBBON-2026-FACIL',
          parentEmail: 'facilitator@blueribbon.org',
          programRole: 'facilitator',
        }),
      ).toBe('facilitator_portal');
    });
  });

  describe('D. Valid parent email', () => {
    test('parent email routes to family portal only', () => {
      expect(classifyPortalCredential('parent@camp.org')).toBe('parent_email');
      expect(
        resolvePortalUnlockDestination({
          accessCode: 'CAMP-BLUERIBBON-2026-FAMILY',
          parentEmail: 'parent@camp.org',
          programRole: 'family',
        }),
      ).toBe('family_portal');
    });
  });

  describe('E. Student PIN', () => {
    test('student PIN routes to Kid Shell only', () => {
      expect(classifyPortalCredential('1234')).toBe('student_pin');
      expect(
        resolvePortalUnlockDestination({
          accessCode: 'CAMP-BLUERIBBON-2026-FAMILY',
          parentEmail: '1234',
          programRole: 'family',
        }),
      ).toBe('kid_shell');
    });
  });

  describe('F. Switch Program clears old sessions', () => {
    test('switchRememberedProgram clears facilitator and parent identity keys', () => {
      const program = blueRibbonProgram();
      writeRememberedProgramAccess(program.facilitatorAccessCode!, program);
      writeActivePilotProgram(program);
      writeActiveAccessCode(program.facilitatorAccessCode!);
      writeLastPilotProgram(program, 'facilitator', program.adminEmail, program.facilitatorAccessCode!);
      writeParentClaimContext({
        email: 'v.maddox2015@gmail.com',
        confirmed: true,
        programCode: program.programCode,
      });
      window.sessionStorage.setItem(BLUE_RIBBON_UNLOCK_KEY, '1');
      window.sessionStorage.setItem(PORTAL_SESSION_KEY, 'pilot');

      switchRememberedProgram(true);

      expect(window.localStorage.getItem(LAST_PILOT_PROGRAM_FACILITATOR_KEY)).toBeNull();
      expect(window.localStorage.getItem(SCOPED_PARENT_CLAIM_KEY)).toBeNull();
      expect(window.sessionStorage.getItem(BLUE_RIBBON_UNLOCK_KEY)).toBeNull();
      expect(window.sessionStorage.getItem(PORTAL_SESSION_KEY)).toBeNull();
    });
  });

  describe('G. Localhost behaves like production unless DEV_AUTH_BYPASS', () => {
    test('legacy demo unlock is disabled by default', () => {
      expect(isDevAuthBypassEnabled()).toBe(false);
      expect(isLegacyDemoUnlockAllowed()).toBe(false);
    });
  });
});
