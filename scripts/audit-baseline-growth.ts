/**
 * Week 1 baseline / Week 2+ growth reporting audit.
 *
 * Usage: npm run audit:baseline-growth
 */

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { BASELINE_WEEK, GROWTH_START_WEEK } from '../src/config/pilotBaselineWeeks';
import { computeBaselineGrowthReport } from '../src/lib/baselineGrowthMetrics';
import type { QuestionAttemptMetricRow } from '../src/lib/questionAttemptMetrics';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'baseline-growth-audit.json');
const PDF_PATH = path.join(REPORTS_DIR, 'baseline-growth-audit.pdf');

type AuditReport = {
  generatedAt: string;
  constants: {
    baselineWeek: number;
    growthStartWeek: number;
  };
  sampleReport: ReturnType<typeof computeBaselineGrowthReport>;
  checks: Array<{ name: string; pass: boolean; detail: string }>;
  summary: { checksPassed: number; checksFailed: number };
};

function sampleRows(): QuestionAttemptMetricRow[] {
  const base = {
    participant_id: 'sample-participant',
    program_code: 'CAMP-BLUERIBBONAB-2026',
    mission_id: 'caiden-week-1',
    question_id: 'q1',
    is_correct_first_try: true,
    is_correct_final: true,
    used_hint: false,
    attempt_count: 1,
    attempt_type: 'initial' as const,
    is_replay: false,
    completed_at: new Date().toISOString(),
  };

  return [
    { ...base, week_number: 1, character: 'caiden', question_id: 'w1-q1' },
    { ...base, week_number: 1, character: 'caiden', question_id: 'w1-q2', is_correct_first_try: false },
    { ...base, week_number: 2, character: 'caiden', question_id: 'w2-q1' },
    { ...base, week_number: 2, character: 'caiden', question_id: 'w2-q2' },
    { ...base, week_number: 2, character: 'caiden', question_id: 'w2-q3', is_correct_first_try: true },
    {
      ...base,
      week_number: 2,
      character: 'caiden',
      question_id: 'w2-replay',
      attempt_type: 'replay',
      is_replay: true,
    },
  ];
}

function runAudit(): AuditReport {
  const rows = sampleRows();
  const report = computeBaselineGrowthReport(rows);
  const reportWithReplay = computeBaselineGrowthReport(rows, { includeReplay: true });

  const checks = [
    {
      name: 'Baseline week constant',
      pass: BASELINE_WEEK === 1,
      detail: `BASELINE_WEEK=${BASELINE_WEEK}`,
    },
    {
      name: 'Growth start week constant',
      pass: GROWTH_START_WEEK === 2,
      detail: `GROWTH_START_WEEK=${GROWTH_START_WEEK}`,
    },
    {
      name: 'Baseline uses week 1 only',
      pass: report.baseline.questions_attempted === 2,
      detail: `baseline questions=${report.baseline.questions_attempted}`,
    },
    {
      name: 'Current uses week 2+ only',
      pass: report.current.questions_attempted === 3,
      detail: `current questions=${report.current.questions_attempted} (replay excluded)`,
    },
    {
      name: 'Replay excluded by default',
      pass: reportWithReplay.current.questions_attempted === report.current.questions_attempted + 1,
      detail: 'includeReplay adds replay rows to current slice',
    },
    {
      name: 'Growth delta computed',
      pass: typeof report.growthDelta.first_attempt_accuracy === 'number',
      detail: `growth_delta.first_attempt_accuracy=${report.growthDelta.first_attempt_accuracy}`,
    },
    {
      name: 'Character slices present',
      pass: report.byCharacter.some((slice) => slice.key === 'caiden'),
      detail: `byCharacter keys=${report.byCharacter.map((slice) => slice.key).join(', ')}`,
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    constants: {
      baselineWeek: BASELINE_WEEK,
      growthStartWeek: GROWTH_START_WEEK,
    },
    sampleReport: report,
    checks,
    summary: {
      checksPassed: checks.filter((check) => check.pass).length,
      checksFailed: checks.filter((check) => !check.pass).length,
    },
  };
}

function generatePdf(report: AuditReport): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: 'LETTER' });
    const stream = fs.createWriteStream(PDF_PATH);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(20).text('Baseline Growth Audit');
    doc.font('Helvetica').fontSize(10).text(`Generated ${new Date(report.generatedAt).toLocaleString()}`);
    doc.moveDown();
    doc.text(`Baseline week: ${report.constants.baselineWeek}`);
    doc.text(`Growth start week: ${report.constants.growthStartWeek}`);
    doc.text(`Checks passed: ${report.summary.checksPassed} / ${report.checks.length}`);

    doc.moveDown().font('Helvetica-Bold').text('Sample growth delta');
    doc.font('Helvetica');
    doc.text(`Baseline first-try accuracy: ${report.sampleReport.baseline.first_attempt_accuracy}`);
    doc.text(`Current first-try accuracy: ${report.sampleReport.current.first_attempt_accuracy}`);
    doc.text(`Delta: ${report.sampleReport.growthDelta.first_attempt_accuracy}`);

    doc.moveDown().font('Helvetica-Bold').text('Checks');
    doc.font('Helvetica');
    report.checks.forEach((check) => {
      doc.text(`${check.pass ? 'PASS' : 'FAIL'} — ${check.name}: ${check.detail}`);
    });

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

async function main(): Promise<void> {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const report = runAudit();
  fs.writeFileSync(JSON_PATH, JSON.stringify(report, null, 2));
  await generatePdf(report);

  console.log('\n=== Baseline Growth Audit ===\n');
  console.log(`Checks: ${report.summary.checksPassed}/${report.checks.length} passing`);
  console.log(`\nWrote ${JSON_PATH}`);
  console.log(`Wrote ${PDF_PATH}`);

  if (report.summary.checksFailed > 0) {
    process.exitCode = 1;
  }
}

void main();
