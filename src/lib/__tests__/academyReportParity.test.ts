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
    expect(html).not.toContain('33 canonical');
  });
});
