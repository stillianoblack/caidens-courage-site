import {
  DEFAULT_FACILITATOR_CONTINUITY_WINDOW_MS,
  evaluateFacilitatorStudentContinuity,
  facilitatorContinuityWindowMs,
  readFacilitatorStudentContinuity,
  resolveFacilitatorReturnPinProgramCode,
  writeFacilitatorStudentContinuity,
  continuityDecisionMessage,
  clearFacilitatorStudentContinuity,
  type FacilitatorStudentContinuityRecord,
} from '../facilitatorSessionContinuity';

const baseRecord = (overrides: Partial<FacilitatorStudentContinuityRecord> = {}): FacilitatorStudentContinuityRecord => ({
  lastStudentId: 'student-a',
  lastStudentPinHash: 'fp-a',
  lastSessionTimestamp: new Date('2026-06-20T12:00:00.000Z').toISOString(),
  programCode: 'CAMP-2026',
  displayName: 'Alex',
  ...overrides,
});

describe('facilitatorSessionContinuity', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    delete process.env.REACT_APP_FACILITATOR_STUDENT_CONTINUITY_MINUTES;
  });

  test('Scenario A: same student within window permits direct restore', () => {
    const nowMs = Date.parse('2026-06-20T12:15:00.000Z');
    const record = baseRecord();

    expect(
      evaluateFacilitatorStudentContinuity({
        participantId: 'student-a',
        pinFingerprint: 'fp-a',
        nowMs,
        record,
      }),
    ).toEqual({ permitted: true, scenario: 'direct_restore' });
  });

  test('Scenario B: different student requires facilitator verification', () => {
    const nowMs = Date.parse('2026-06-20T12:10:00.000Z');
    const record = baseRecord();

    const decision = evaluateFacilitatorStudentContinuity({
      participantId: 'student-b',
      pinFingerprint: 'fp-b',
      nowMs,
      record,
    });

    expect(decision).toEqual({ permitted: false, reason: 'student_switch' });
    expect(continuityDecisionMessage(decision)).toMatch(/another student/i);
  });

  test('Scenario C: idle beyond timeout window requires facilitator verification', () => {
    const endedAt = Date.parse('2026-06-20T12:00:00.000Z');
    const nowMs = endedAt + DEFAULT_FACILITATOR_CONTINUITY_WINDOW_MS + 1;
    const record = baseRecord({ lastSessionTimestamp: new Date(endedAt).toISOString() });

    const decision = evaluateFacilitatorStudentContinuity({
      participantId: 'student-a',
      pinFingerprint: 'fp-a',
      nowMs,
      record,
    });

    expect(decision).toEqual({ permitted: false, reason: 'expired' });
    expect(continuityDecisionMessage(decision)).toMatch(/longer than allowed/i);
  });

  test('pin mismatch after rotation requires facilitator verification', () => {
    const nowMs = Date.parse('2026-06-20T12:05:00.000Z');
    const record = baseRecord({ lastStudentPinHash: 'fp-old' });

    const decision = evaluateFacilitatorStudentContinuity({
      participantId: 'student-a',
      pinFingerprint: 'fp-new',
      nowMs,
      record,
    });

    expect(decision).toEqual({ permitted: false, reason: 'pin_mismatch' });
  });

  test('allows restore when stored pin hash is missing but student id matches', () => {
    const nowMs = Date.parse('2026-06-20T12:05:00.000Z');
    const record = baseRecord({ lastStudentPinHash: null });

    expect(
      evaluateFacilitatorStudentContinuity({
        participantId: 'student-a',
        pinFingerprint: 'fp-any',
        nowMs,
        record,
      }),
    ).toEqual({ permitted: true, scenario: 'direct_restore' });
  });

  test('persists and reads continuity record from session storage', () => {
    writeFacilitatorStudentContinuity(
      baseRecord({
        campProgramCode: 'CAMP-GDI-2026',
        familyProgramCode: 'FAMILY-STILLS-2026',
        activeAccessCode: 'FAC-GDI-2026',
        resumePayload: { module: 'weekly-adventures', week: 2 },
      }),
    );
    expect(readFacilitatorStudentContinuity()).toMatchObject({
      lastStudentId: 'student-a',
      lastStudentPinHash: 'fp-a',
      programCode: 'CAMP-2026',
      campProgramCode: 'CAMP-GDI-2026',
      familyProgramCode: 'FAMILY-STILLS-2026',
      activeAccessCode: 'FAC-GDI-2026',
      resumePayload: { module: 'weekly-adventures', week: 2 },
    });
  });

  test('facilitator-launched return PIN uses stored camp program before stale active context', () => {
    const record = baseRecord({
      programCode: 'CAMP-GDI-2026',
      campProgramCode: 'CAMP-GDI-2026',
      familyProgramCode: 'FAMILY-STILLS-2026',
      activeAccessCode: 'FAC-GDI-2026',
    });

    expect(
      resolveFacilitatorReturnPinProgramCode({
        record,
        activeProgramCode: 'FAMILY-STILLS-2026',
      }),
    ).toBe('CAMP-GDI-2026');
  });

  test('clearFacilitatorStudentContinuity removes stored record', () => {
    writeFacilitatorStudentContinuity(baseRecord());
    clearFacilitatorStudentContinuity();
    expect(readFacilitatorStudentContinuity()).toBeNull();
  });

  test('facilitatorContinuityWindowMs respects env override', () => {
    process.env.REACT_APP_FACILITATOR_STUDENT_CONTINUITY_MINUTES = '45';
    expect(facilitatorContinuityWindowMs()).toBe(45 * 60 * 1000);
  });
});
