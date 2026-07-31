// eslint-disable-next-line @typescript-eslint/no-var-requires
const { buildAcademyOutcomes } = require('../../../netlify/functions/_lib/academyOutcomes');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TextEncoder, TextDecoder } = require('util');
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { _test } = require('../../../netlify/functions/admin-academy-report');
export {};

describe('Academy dashboard and export parity', () => {
  test('uses identical canonical cohort counts in HTML and PDF disclosure', () => {
    const participants = Array.from({ length: 31 }, (_, index) => ({
      id: `student-${index}`,
      role: 'student',
      program_code: index < 22 ? 'LEARNING' : 'TEST',
      first_name: index < 22 ? undefined : 'Synthetic Test',
    }));
    const sessions: any[] = [];
    const modules: any[] = [];
    for (let index = 0; index < 7; index += 1) {
      sessions.push(
        { id: `s-${index}-1`, participant_id: `student-${index}`, started_at: '2026-07-01T12:00:00Z' },
        { id: `s-${index}-2`, participant_id: `student-${index}`, started_at: '2026-07-02T12:00:00Z' },
        { id: `s-${index}-3`, participant_id: `student-${index}`, started_at: '2026-07-03T12:00:00Z' },
      );
      modules.push(
        { id: `m-${index}-1`, participant_id: `student-${index}`, module_id: 'one', completed_at: '2026-07-02T13:00:00Z' },
        { id: `m-${index}-2`, participant_id: `student-${index}`, module_id: 'two', completed_at: '2026-07-03T13:00:00Z' },
      );
    }
    for (let index = 7; index < 16; index += 1) {
      sessions.push(
        { id: `s-${index}-1`, participant_id: `student-${index}`, started_at: '2026-07-01T12:00:00Z' },
        { id: `s-${index}-2`, participant_id: `student-${index}`, started_at: '2026-07-02T12:00:00Z' },
      );
    }
    const academy = buildAcademyOutcomes({
      programs: [
        { id: 'p1', program_code: 'LEARNING', program_name: 'Readable Learning Program', program_type: 'camp' },
        { id: 'p2', program_code: 'TEST', program_name: 'Internal Test Program', program_type: 'internal' },
      ],
      participants,
      sessions,
      modules,
      missions: [],
      questions: [],
      assessments: [],
      weeks: [],
      wallets: [],
      rewards: [],
      overrides: [],
    });
    const disclosure = _test.academyPopulationDisclosure(academy);
    const html = _test.academyHtml(academy);

    expect(academy.cohortSummary).toEqual(expect.objectContaining({
      canonicalStudentAccounts: 31,
      establishedParticipants: 7,
      emergingParticipants: 9,
      minimalParticipants: 6,
      testInternalParticipants: 9,
    }));
    expect(disclosure.operational).toContain('31 canonical student accounts');
    expect(disclosure.operational).toContain('Seven students met'.replace('Seven', '7'));
    expect(html).toContain(disclosure.operational);
    expect(html).toContain('This is an Academy-wide report.');
    expect(html).toContain('Program Composition');
    expect(html).toContain('Readable Learning Program');
    expect(html).not.toContain('33 canonical');
    expect(academy.aggregate.activeStudentCount).toBe(7);
    expect(academy.cohortSummary.nonTestLearners).toBe(22);
    expect(academy.cohortSummary.manuallyIncludedStudents).toBe(0);
    expect(academy.cohortSummary.manuallyExcludedStudents).toBe(0);
    expect(_test.formatReportDate('2026-07-30T21:30:27.983Z')).toBe('July 30, 2026');
  });

  test('generates a privacy-safe executive share-out from the same Academy payload', async () => {
    const academy = {
      calculatedAt: '2026-07-30T21:30:27.983Z',
      cohortSummary: {
        canonicalStudentAccounts: 31,
        nonTestLearners: 22,
        establishedParticipants: 7,
        emergingParticipants: 9,
        minimalParticipants: 6,
        testInternalParticipants: 9,
        manuallyIncludedStudents: 0,
        manuallyExcludedStudents: 0,
        earliestActivity: '2026-06-01T00:00:00Z',
        latestActivity: '2026-07-30T21:30:27.983Z',
      },
      aggregate: {
        activeStudentCount: 7,
        baseline: { count: 14 },
        assessmentCount: 16,
        missionCount: 62,
        focusCoins: 1240,
        certificateCount: 2,
        liveLearningSnapshot: {
          cards: [
            { key: 'reading', label: 'Reading', centerValue: '36%' },
            { key: 'sel', label: 'SEL', centerValue: '55%' },
            { key: 'focus', label: 'Focus / executive function', centerValue: '44%' },
            { key: 'overall', label: 'Overall live learning signal', centerValue: '45%' },
          ],
        },
      },
      programSummaries: [{
        programName: 'Blue Ribbon Results Academy',
        enrolledStudents: 17,
        establishedStudents: 6,
        emergingStudents: 8,
        minimalStudents: 3,
      }],
    };
    const pdf = await _test.executiveShareoutPdf(academy);
    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
    expect(pdf.length).toBeGreaterThan(8_000);
    expect(academy.cohortSummary.canonicalStudentAccounts).toBe(31);
    expect(academy.aggregate.activeStudentCount).toBe(7);
    expect(academy.programSummaries[0]).toEqual(expect.objectContaining({
      enrolledStudents: 17,
      establishedStudents: 6,
      emergingStudents: 8,
      minimalStudents: 3,
    }));
  });
});
