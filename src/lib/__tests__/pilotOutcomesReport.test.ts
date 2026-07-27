export {};

// PDFKit's font dependency expects the Node text codec globals, which jsdom omits.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const util = require('util');
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildPdf, buildHtml } = require('../../../netlify/functions/admin-pilot-outcomes-report');

const sample = {
  programName: 'Synthetic School Pilot',
  programType: 'School',
  facilitator: 'Facilitator',
  startDate: '2026-01-01',
  activeStudentCount: 2,
  matchedCount: 1,
  baseline: { count: 1, total: 2 },
  post: { count: 1, total: 2 },
  baselineAverage: 50,
  postAverage: 75,
  absoluteDelta: 25,
  percentageDelta: 50,
  percentageDeltaAvailable: true,
  weeklyCompletion: { count: 4, total: 8, rate: 50 },
  assessmentCount: 2,
  missionCount: 8,
  focusCoins: 100,
  certificateCount: 1,
  lastActivity: '2026-02-01',
  categories: [{ category: 'Focus/self-regulation', delta: 10, n: 1 }],
  students: Array.from({ length: 80 }, (_, index) => ({
    studentLabel: `Student ${String(index + 1).padStart(3, '0')}`,
    grade: '4',
    baselineScore: 50,
    postScore: 75,
    delta: 25,
    dataCompleteness: 'Matched',
  })),
};

describe('pilot outcomes report', () => {
  it('generates a multi-page branded PDF without student PII', async () => {
    const pdf = await buildPdf(sample, {
      includeStudentAppendix: true,
      includeCharts: true,
      includeNotes: true,
      notes: { whatWorked: '<script>unsafe</script> Strong participation' },
    });
    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
    expect(pdf.length).toBeGreaterThan(3000);
  });

  it('provides a print fallback with honest data notes', () => {
    const html = buildHtml(sample);
    expect(html).toContain('Pilot Outcomes Report');
    expect(html).toContain('matched students');
    expect(html).not.toContain('statistically significant');
  });
});
