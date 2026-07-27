const fs = require('fs');
const path = require('path');
const { buildPdf } = require('../netlify/functions/admin-pilot-outcomes-report');

const sample = {
  programName: 'Focus Flame Academy Synthetic Pilot',
  programType: 'Teacher / Classroom',
  facilitator: 'Sample Facilitator',
  startDate: '2026-07-01',
  activeStudentCount: 12,
  matchedCount: 9,
  baseline: { count: 11, total: 12 },
  post: { count: 9, total: 12 },
  baselineAverage: 62.4,
  postAverage: 74.8,
  absoluteDelta: 12.4,
  percentageDelta: 19.9,
  percentageDeltaAvailable: true,
  weeklyCompletion: { count: 39, total: 48, rate: 81.3 },
  assessmentCount: 20,
  missionCount: 86,
  focusCoins: 1420,
  certificateCount: 7,
  lastActivity: '2026-07-25T17:30:00Z',
  categories: [
    { category: 'Focus/self-regulation', delta: 10.2, n: 9 },
    { category: 'Courage/confidence', delta: 8.7, n: 9 },
    { category: 'Reading comprehension', delta: 6.1, n: 7 },
  ],
  students: Array.from({ length: 12 }, (_, index) => ({
    studentLabel: `Student ${String(index + 1).padStart(3, '0')}`,
    grade: index < 6 ? '4' : '5',
    baselineScore: index === 11 ? null : 58 + index,
    postScore: index >= 9 ? null : 70 + index,
    delta: index < 9 ? 12 : null,
    dataCompleteness: index < 9 ? 'Matched' : index < 11 ? 'Baseline only' : 'Not enough data',
  })),
};

async function main() {
  const outputDir = path.join(__dirname, '..', 'output', 'pdf');
  fs.mkdirSync(outputDir, { recursive: true });
  const output = path.join(outputDir, 'focus-flame-academy-pilot-outcomes-synthetic-sample.pdf');
  const pdf = await buildPdf(sample, {
    reportingStart: '2026-07-01',
    reportingEnd: '2026-07-25',
    includeStudentAppendix: true,
    includeNotes: true,
    includeCharts: true,
    notes: {
      whatWorked: 'Students consistently engaged with the weekly Focus Flame routine.',
      studentResponse: 'The cohort responded positively to short, repeatable activities.',
      challenges: 'Three post-assessments remain incomplete.',
      recommendedNextSteps: 'Complete remaining post assessments before final reporting.',
      approvedQuote: 'Synthetic sample - no real testimonial included.',
    },
  });
  fs.writeFileSync(output, pdf);
  process.stdout.write(output);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
