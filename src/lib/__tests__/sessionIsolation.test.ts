import type { ActivePilotProgram } from '../../types/pilotProgram';
import {
  PARENT_CLAIM_EMAIL_KEY,
  SCOPED_PARENT_CLAIM_KEY,
  readParentClaimContext,
  writeParentClaimContext,
} from '../../config/parentClaimContext';
import { writeActivePilotProgram } from '../../config/activePilotProgram';
import { writeActiveAccessCode } from '../../config/portalContext';
import {
  SCOPED_ACTIVE_CHILD_KEY,
  readScopedActiveChildRecord,
} from '../portalSessionIsolation';
import { clearStalePortalIdentityState } from '../portalIdentityReset';
import { setActiveChild, readActiveChildState } from '../activeChildContext';
import {
  detectReturnSessionParentEmailMatch,
  detectReturnSessionFacilitatorEmailMatch,
} from '../kidPlayReturnSessionVerify';
import {
  switchRememberedProgram,
  writeRememberedProgramAccess,
} from '../rememberedProgramAccess';
import {
  writeRememberedDeviceSession,
  REMEMBERED_DEVICE_SESSION_KEY,
} from '../rememberedDeviceSession';
import {
  evaluateFacilitatorStudentContinuity,
  type FacilitatorStudentContinuityRecord,
} from '../facilitatorSessionContinuity';
import {
  readStudentPinSession,
  writeStudentPinSession,
} from '../studentPinSession';

const mockProgram = (overrides: Partial<ActivePilotProgram> = {}): ActivePilotProgram =>
  ({
    id: 'prog-a',
    programCode: 'FAMILY-A',
    programName: 'Family A',
    familyAccessCode: 'CODE-A',
    facilitatorAccessCode: 'FAC-A',
    groupName: 'Family A',
    adminEmail: 'facilitator-a@camp.org',
    ...overrides,
  }) as ActivePilotProgram;

describe('session isolation', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  describe('A. Parent A and Child A', () => {
    test('scoped parent claim only applies to matching program', () => {
      writeActivePilotProgram(mockProgram({ programCode: 'FAMILY-A' }));
      writeActiveAccessCode('CODE-A');
      writeParentClaimContext({
        email: 'parentA@email.com',
        confirmed: true,
        programCode: 'FAMILY-A',
        accessCode: 'CODE-A',
      });

      expect(readParentClaimContext()?.email).toBe('parentA@email.com');

      writeActivePilotProgram(mockProgram({ programCode: 'FAMILY-B', familyAccessCode: 'CODE-B' }));
      writeActiveAccessCode('CODE-B');

      expect(readParentClaimContext()).toBeNull();
      expect(window.localStorage.getItem(SCOPED_PARENT_CLAIM_KEY)).toContain('FAMILY-A');
    });

    test('legacy unscoped parent email is rejected and cleared', () => {
      writeActivePilotProgram(mockProgram());
      writeActiveAccessCode('CODE-A');
      window.localStorage.setItem(PARENT_CLAIM_EMAIL_KEY, 'parentA@email.com');
      window.localStorage.setItem('parentClaimConfirmed', 'true');

      expect(readParentClaimContext()).toBeNull();
      expect(window.localStorage.getItem(PARENT_CLAIM_EMAIL_KEY)).toBeNull();
    });
  });

  describe('B. Student B in different family/program', () => {
    test('student PIN session does not hydrate mismatched program parent claim', () => {
      writeActivePilotProgram(mockProgram({ programCode: 'FAMILY-A' }));
      writeActiveAccessCode('CODE-A');
      writeParentClaimContext({
        email: 'parentA@email.com',
        confirmed: true,
        programCode: 'FAMILY-A',
        accessCode: 'CODE-A',
      });

      writeStudentPinSession({
        participantId: 'student-b',
        programCode: 'FAMILY-B',
        displayName: 'Student B',
        verifiedAt: new Date().toISOString(),
      });

      writeActivePilotProgram(mockProgram({ programCode: 'FAMILY-B', familyAccessCode: 'CODE-B' }));
      writeActiveAccessCode('CODE-B');

      expect(readParentClaimContext()).toBeNull();
      expect(readStudentPinSession()?.participantId).toBe('student-b');
      expect(readStudentPinSession()?.programCode).toBe('FAMILY-B');
    });
  });

  describe('C. Switch program', () => {
    test('switchRememberedProgram clears parent email and active child', () => {
      writeRememberedProgramAccess('CODE-A', mockProgram({ programCode: 'FAMILY-A' }));
      writeActivePilotProgram(mockProgram({ programCode: 'FAMILY-A' }));
      writeActiveAccessCode('CODE-A');
      writeParentClaimContext({
        email: 'parentA@email.com',
        confirmed: true,
        programCode: 'FAMILY-A',
        accessCode: 'CODE-A',
      });
      setActiveChild({
        participantId: 'child-a',
        displayName: 'Child A',
      });

      switchRememberedProgram(true);

      expect(readParentClaimContext()).toBeNull();
      expect(readActiveChildState()).toBeNull();
      expect(window.localStorage.getItem(SCOPED_PARENT_CLAIM_KEY)).toBeNull();
      expect(window.localStorage.getItem(SCOPED_ACTIVE_CHILD_KEY)).toBeNull();
    });
  });

  describe('D. Facilitator flow', () => {
    test('facilitator continuity blocks restore when program mismatches', () => {
      writeActivePilotProgram(mockProgram({ programCode: 'CAMP-B' }));

      const record: FacilitatorStudentContinuityRecord = {
        lastStudentId: 'student-b',
        lastStudentPinHash: 'hash-b',
        lastSessionTimestamp: new Date().toISOString(),
        programCode: 'CAMP-A',
      };

      expect(
        evaluateFacilitatorStudentContinuity({
          participantId: 'student-b',
          pinFingerprint: 'hash-b',
          record,
        }).permitted,
      ).toBe(false);
    });

    test('return session parent email requires matching program on device session', () => {
      writeActivePilotProgram(mockProgram({ programCode: 'FAMILY-B', familyAccessCode: 'CODE-B' }));
      writeActiveAccessCode('CODE-B');
      writeRememberedProgramAccess('CODE-B', mockProgram({ programCode: 'FAMILY-B' }));

      writeRememberedDeviceSession({
        access_code: 'CODE-A',
        program_id: 'prog-a',
        program_code: 'FAMILY-A',
        user_type: 'parent',
        parent_id: 'parentA@email.com',
        program: mockProgram({ programCode: 'FAMILY-A' }),
      });

      expect(detectReturnSessionParentEmailMatch('parentA@email.com')).toBe(false);
      expect(window.localStorage.getItem(REMEMBERED_DEVICE_SESSION_KEY)).toBeTruthy();
    });

    test('facilitator return session email requires matching program on device session', () => {
      writeActivePilotProgram(
        mockProgram({ programCode: 'CAMP-B', adminEmail: 'fac-b@camp.org' }),
      );
      writeActiveAccessCode('FAC-B');
      writeRememberedProgramAccess('FAC-B', mockProgram({ programCode: 'CAMP-B', adminEmail: 'fac-b@camp.org' }));

      writeRememberedDeviceSession({
        access_code: 'FAC-A',
        program_id: 'prog-a',
        program_code: 'CAMP-A',
        user_type: 'facilitator',
        facilitator_id: 'fac-a@camp.org',
        program: mockProgram({ programCode: 'CAMP-A', adminEmail: 'fac-a@camp.org' }),
      });

      expect(detectReturnSessionFacilitatorEmailMatch('fac-a@camp.org')).toBe(false);
    });
  });

  describe('E. Incognito/new session', () => {
    test('empty storage restores nothing', () => {
      expect(readParentClaimContext()).toBeNull();
      expect(readActiveChildState()).toBeNull();
      expect(readStudentPinSession()).toBeNull();
      expect(readScopedActiveChildRecord()).toBeNull();
      expect(detectReturnSessionParentEmailMatch('parentA@email.com')).toBe(false);
    });
  });

  describe('clearStalePortalIdentityState', () => {
    test('clears all identity keys', () => {
      writeActivePilotProgram(mockProgram());
      writeParentClaimContext({
        email: 'parentA@email.com',
        confirmed: true,
        programCode: 'FAMILY-A',
      });
      setActiveChild({ participantId: 'child-a', displayName: 'Child A' });
      writeStudentPinSession({
        participantId: 'child-a',
        programCode: 'FAMILY-A',
        displayName: 'Child A',
        verifiedAt: new Date().toISOString(),
      });

      clearStalePortalIdentityState('test');

      expect(readParentClaimContext()).toBeNull();
      expect(readActiveChildState()).toBeNull();
      expect(readStudentPinSession()).toBeNull();
    });
  });
});
