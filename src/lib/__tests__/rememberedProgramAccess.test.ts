import type { ActivePilotProgram } from '../../types/pilotProgram';
import {
  REMEMBERED_PROGRAM_ACCESS_KEY,
  REMEMBERED_PROGRAM_ACCESS_TTL_MS,
  clearRememberedProgramAccess,
  hasRememberedProgramAccess,
  readRememberedProgramAccessCode,
  readRememberedProgramAccessRecord,
  resolveRememberedProgramContext,
  switchRememberedProgram,
  writeRememberedProgramAccess,
} from '../rememberedProgramAccess';
import {
  REMEMBERED_DEVICE_SESSION_KEY,
  readRememberedDeviceSession,
  writeRememberedDeviceSession,
} from '../rememberedDeviceSession';
import {
  resolveKidPlayReturnSessionDestination,
  classifyKidPlayReturnCredential,
  familyReturnSessionPath,
  facilitatorReturnSessionPath,
  studentReturnSessionPath,
} from '../kidPlayReturnSessionRoute';
import {
  classifyPortalCredential,
  resolvePortalUnlockDestination,
  shouldHidePortalAccessCodeField,
  resolvePortalSubmitAccessCode,
} from '../portalUnlockRoute';

const mockProgram = (overrides: Partial<ActivePilotProgram> = {}): ActivePilotProgram =>
  ({
    id: 'prog-1',
    programCode: 'CAMP-2026',
    programName: 'Test Camp',
    familyAccessCode: 'FAMILY-CODE',
    facilitatorAccessCode: 'FACIL-CODE',
    groupName: 'Group A',
    adminEmail: 'facilitator@camp.org',
    ...overrides,
  }) as ActivePilotProgram;

describe('rememberedProgramAccess', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('first login requires access code when nothing is remembered', () => {
    expect(hasRememberedProgramAccess()).toBe(false);
    expect(readRememberedProgramAccessCode()).toBe('');
    expect(shouldHidePortalAccessCodeField(hasRememberedProgramAccess())).toBe(false);
  });

  test('return session hides access code after program access is saved', () => {
    writeRememberedProgramAccess('FAMILY-CODE', mockProgram());
    expect(hasRememberedProgramAccess()).toBe(true);
    expect(readRememberedProgramAccessCode()).toBe('FAMILY-CODE');
    expect(shouldHidePortalAccessCodeField(hasRememberedProgramAccess())).toBe(true);
    expect(resolvePortalSubmitAccessCode({ enteredAccessCode: '', rememberedAccessCode: 'FAMILY-CODE' })).toBe(
      'FAMILY-CODE',
    );
  });

  test('switch program clears remembered access code', () => {
    writeRememberedProgramAccess('FAMILY-CODE', mockProgram());
    writeRememberedDeviceSession({
      access_code: 'FAMILY-CODE',
      program_id: 'prog-1',
      program_code: 'CAMP-2026',
      user_type: 'parent',
      program: mockProgram(),
    });

    switchRememberedProgram(true);

    expect(window.localStorage.getItem(REMEMBERED_PROGRAM_ACCESS_KEY)).toBeNull();
    expect(window.localStorage.getItem(REMEMBERED_DEVICE_SESSION_KEY)).toBeNull();
    expect(hasRememberedProgramAccess()).toBe(false);
  });

  test('remembered program access expires after ttl', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    writeRememberedProgramAccess('FAMILY-CODE', mockProgram());
    const record = readRememberedProgramAccessRecord();
    expect(record?.access_code).toBe('FAMILY-CODE');

    jest.spyOn(Date, 'now').mockReturnValue(now + REMEMBERED_PROGRAM_ACCESS_TTL_MS + 1);
    expect(readRememberedProgramAccessRecord()).toBeNull();
    jest.restoreAllMocks();
  });

  test('resolveRememberedProgramContext prefers dedicated program access record', () => {
    writeRememberedProgramAccess('PRIMARY-CODE', mockProgram({ programCode: 'PRIMARY' }));
    writeRememberedDeviceSession({
      access_code: 'SECONDARY-CODE',
      program_id: 'prog-2',
      program_code: 'SECONDARY',
      user_type: 'parent',
      program: mockProgram({ programCode: 'SECONDARY' }),
    });

    expect(resolveRememberedProgramContext()?.accessCode).toBe('PRIMARY-CODE');
    expect(resolveRememberedProgramContext()?.source).toBe('program_access');
  });

  test('clearRememberedProgramAccess leaves device session intact', () => {
    writeRememberedProgramAccess('FAMILY-CODE', mockProgram());
    writeRememberedDeviceSession({
      access_code: 'FAMILY-CODE',
      program_id: 'prog-1',
      program_code: 'CAMP-2026',
      user_type: 'parent',
      program: mockProgram(),
    });

    clearRememberedProgramAccess();

    expect(window.localStorage.getItem(REMEMBERED_PROGRAM_ACCESS_KEY)).toBeNull();
    expect(readRememberedDeviceSession()?.access_code).toBe('FAMILY-CODE');
    expect(hasRememberedProgramAccess()).toBe(true);
  });
});

describe('portalUnlockRoute', () => {
  test('student PIN routes to Kid Shell for family programs', () => {
    expect(classifyPortalCredential('1234')).toBe('student_pin');
    expect(
      resolvePortalUnlockDestination({
        accessCode: 'FAMILY-CODE',
        parentEmail: '1234',
        programRole: 'family',
      }),
    ).toBe('kid_shell');
  });

  test('parent email routes to Family Portal', () => {
    expect(classifyPortalCredential('parent@camp.org')).toBe('parent_email');
    expect(
      resolvePortalUnlockDestination({
        accessCode: 'FAMILY-CODE',
        parentEmail: 'parent@camp.org',
        programRole: 'family',
      }),
    ).toBe('family_portal');
  });

  test('facilitator access code routes to Facilitator Portal', () => {
    expect(
      resolvePortalUnlockDestination({
        accessCode: 'FACIL-CODE',
        parentEmail: '',
        programRole: 'facilitator',
      }),
    ).toBe('facilitator_portal');
  });
});

describe('kidPlayReturnSessionRoute', () => {
  test('student PIN routes to Kid Shell', () => {
    expect(classifyKidPlayReturnCredential('5678')).toBe('student_pin');
    expect(
      resolveKidPlayReturnSessionDestination({
        emailOrPin: '5678',
        parentEmailMatches: false,
        facilitatorEmailMatches: false,
      }),
    ).toBe('kid_shell');
  });

  test('parent email routes to Family Portal', () => {
    expect(
      resolveKidPlayReturnSessionDestination({
        emailOrPin: 'parent@camp.org',
        parentEmailMatches: true,
        facilitatorEmailMatches: false,
      }),
    ).toBe('family_portal');
  });

  test('facilitator email routes to Facilitator Portal', () => {
    expect(
      resolveKidPlayReturnSessionDestination({
        emailOrPin: 'facilitator@camp.org',
        parentEmailMatches: false,
        facilitatorEmailMatches: true,
      }),
    ).toBe('facilitator_portal');
  });

  test('dual-role email shows role picker when no preferred role', () => {
    expect(
      resolveKidPlayReturnSessionDestination({
        emailOrPin: 'admin@camp.org',
        parentEmailMatches: true,
        facilitatorEmailMatches: true,
      }),
    ).toBe('role_picker');
  });

  test('preferred role resolves dual-role email', () => {
    expect(
      resolveKidPlayReturnSessionDestination({
        emailOrPin: 'admin@camp.org',
        parentEmailMatches: true,
        facilitatorEmailMatches: true,
        preferredRole: 'parent',
      }),
    ).toBe('family_portal');
    expect(
      resolveKidPlayReturnSessionDestination({
        emailOrPin: 'admin@camp.org',
        parentEmailMatches: true,
        facilitatorEmailMatches: true,
        preferredRole: 'facilitator',
      }),
    ).toBe('facilitator_portal');
  });

  test('return session paths land on expected destinations', () => {
    expect(familyReturnSessionPath()).toMatch(/^\/(family-hub|portal\/family)$/);
    expect(facilitatorReturnSessionPath()).toBe('/program-dashboard/roster');
    expect(studentReturnSessionPath('session-123')).toBe('/play/session/session-123/weekly-adventures');
  });
});
