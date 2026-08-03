import { clearInsecureFacilitatorCredentialStorage } from '../facilitatorCredentialStorage';

describe('facilitator credential storage cleanup', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test('removes legacy raw facilitator credentials and sanitizes active metadata', () => {
    localStorage.setItem('activePortalRole', 'facilitator');
    localStorage.setItem('activeAccessCode', 'FAC-SECRET');
    localStorage.setItem('lastPilotProgram:facilitator', JSON.stringify({ last_access_code: 'FAC-SECRET' }));
    localStorage.setItem('cc-remembered-device-session', JSON.stringify({
      user_type: 'facilitator', access_code: 'FAC-SECRET', program_code: 'CAMP-1',
    }));
    localStorage.setItem('cc-remembered-program-access', JSON.stringify({
      access_code: 'FAC-SECRET', program: { facilitatorAccessCode: 'FAC-SECRET' },
    }));
    localStorage.setItem('activePilotProgram', JSON.stringify({
      programCode: 'CAMP-1', programName: 'Camp', adminEmail: 'private@example.com',
      familyAccessCode: 'FAM-SECRET', facilitatorAccessCode: 'FAC-SECRET',
    }));
    sessionStorage.setItem('cc-facilitator-student-continuity', JSON.stringify({
      lastStudentId: 'student', programCode: 'CAMP-1', activeAccessCode: 'FAC-SECRET',
    }));

    clearInsecureFacilitatorCredentialStorage();

    expect(localStorage.getItem('activeAccessCode')).toBeNull();
    expect(localStorage.getItem('lastPilotProgram:facilitator')).toBeNull();
    expect(localStorage.getItem('cc-remembered-device-session')).toBeNull();
    expect(localStorage.getItem('cc-remembered-program-access')).toBeNull();
    expect(localStorage.getItem('activePilotProgram')).not.toContain('SECRET');
    expect(localStorage.getItem('activePilotProgram')).not.toContain('private@example.com');
    expect(sessionStorage.getItem('cc-facilitator-student-continuity')).not.toContain('FAC-SECRET');
  });

  test('does not remove an unrelated family remembered session', () => {
    localStorage.setItem('activePortalRole', 'family');
    localStorage.setItem('activeAccessCode', 'FAM-1');
    localStorage.setItem('cc-remembered-device-session', JSON.stringify({
      user_type: 'parent', access_code: 'FAM-1', program_code: 'FAMILY-1',
    }));
    clearInsecureFacilitatorCredentialStorage();
    expect(localStorage.getItem('activeAccessCode')).toBe('FAM-1');
    expect(localStorage.getItem('cc-remembered-device-session')).toContain('FAM-1');
  });
});
