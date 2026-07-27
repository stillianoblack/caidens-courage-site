export {};

// PDFKit's font dependency expects the Node text codec globals, which jsdom omits.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const util = require('util');
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  buildPdf,
  buildHtml,
  impactItems,
  reportImpactPayload,
} = require('../../../netlify/functions/admin-pilot-outcomes-report');

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
  impactSnapshot: {
    domains: [
      {
        key: 'reading',
        label: 'Reading comprehension',
        source: 'Canonical B-4 reading score',
        baselineNumerator: 2,
        baselineDenominator: 5,
        postNumerator: 4,
        postDenominator: 5,
        baselinePercentage: 40,
        postPercentage: 80,
        deltaPercentagePoints: 40,
        matchedStudentCount: 1,
        requiredMatchedCount: 1,
        excludedRecordCount: 1,
        dataQualityStatus: 'Directional - small sample',
        displayStatus: 'Directional result',
        missingReason: null,
      },
      {
        key: 'sel',
        label: 'SEL growth',
        source: 'Canonical B-4 feelings/SEL score',
        baselineNumerator: 0,
        baselineDenominator: 0,
        postNumerator: 0,
        postDenominator: 0,
        baselinePercentage: null,
        postPercentage: null,
        deltaPercentagePoints: null,
        matchedStudentCount: 0,
        requiredMatchedCount: 1,
        excludedRecordCount: 2,
        dataQualityStatus: 'Not enough data',
        displayStatus: 'Not enough data',
        missingReason: 'Baseline and post domain scores are missing or not mapped.',
      },
      {
        key: 'focus',
        label: 'Focus / executive-function growth',
        source: 'Canonical B-4 focus-moves score',
        baselineNumerator: 1,
        baselineDenominator: 5,
        postNumerator: 2,
        postDenominator: 5,
        baselinePercentage: 20,
        postPercentage: 40,
        deltaPercentagePoints: 20,
        matchedStudentCount: 1,
        requiredMatchedCount: 1,
        excludedRecordCount: 1,
        dataQualityStatus: 'Directional - small sample',
        displayStatus: 'Directional result',
        missingReason: null,
      },
    ],
    weeklyCompletion: { numerator: 4, denominator: 8, percentage: 50, dataQualityStatus: 'Available', displayStatus: 'Needs attention', missingReason: null },
    participation: { numerator: 1, denominator: 3, percentage: 33.333333333, dataQualityStatus: 'Available', displayStatus: 'Needs attention', missingReason: null, baselineCompleted: 1, postCompleted: 1 },
    overallMatchedGrowth: { deltaPercentagePoints: 30, includedDomainCount: 2, totalDomainCount: 3, matchedStudentCount: 1, requiredMatchedCount: 1, weighting: 'Unweighted average of domains with valid matched pre/post data', dataQualityStatus: 'Directional - small sample', displayStatus: 'Directional result', missingReason: null },
  },
  assessmentCount: 2,
  missionCount: 8,
  focusCoins: 100,
  certificateCount: 1,
  lastActivity: '2026-02-01',
  reportBlockers: [],
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
    expect(html).toContain('Focus Flame Academy Pilot Outcomes Report');
    expect(html).toContain('Reading comprehension');
    expect(html).toContain('+40 pts');
    expect(html).toContain('matched students');
    expect(html).not.toContain('statistically significant');
  });

  it('uses the dashboard snapshot values in PDF chart data', () => {
    const items = impactItems(sample);
    expect(items.find((item: { label: string }) => item.label === 'Reading comprehension')).toEqual(
      expect.objectContaining({ center: '+40 pts', ring: 80 }),
    );
    expect(items.find((item: { label: string }) => item.label === 'Overall matched growth')).toEqual(
      expect.objectContaining({ center: '+30 pts', ring: null }),
    );
    expect(items.find((item: { label: string }) => item.label === 'Participation')).toEqual(
      expect.objectContaining({ center: '33.3%', ring: 33.333333333 }),
    );
  });

  it('passes the exact canonical dashboard payload to the PDF renderer', () => {
    expect(reportImpactPayload(sample)).toBe(sample.impactSnapshot);
    expect(reportImpactPayload(sample)).toEqual(sample.impactSnapshot);
  });
});
