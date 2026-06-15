/**
 * Replay attempt tracking audit.
 *
 * Usage: npm run audit:replay-attempts
 */

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import {
  filterInitialAttemptRows,
  isReplayAttemptType,
  resolveMissionAttemptType,
} from '../src/lib/missionAttemptType';
import { buildQuestionAttemptRows } from '../src/lib/questionAttemptService';
import type { QuestionAttemptRecord } from '../src/types/questionInteraction';
import type { GameAssessmentConfig } from '../src/types/gameAssessment';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'replay-attempts-audit.json');
const PDF_PATH = path.join(REPORTS_DIR, 'replay-attempts-audit.pdf');

type AuditReport = {
  generatedAt: string;
  checks: Array<{ name: string; pass: boolean; detail: string }>;
  summary: { checksPassed: number; checksFailed: number };
  sampleReplayRows: ReturnType<typeof buildQuestionAttemptRows>;
};

const sampleConfig: GameAssessmentConfig = {
  id: 'sample-mission',
  decorVariant: 'caiden',
  landing: { title: 'Sample', subtitle: '', startLabel: 'Start' },
  complete: { title: 'Done', message: 'Done', buttonLabel: 'Back' },
  questions: [
    {
      id: 'q1',
      type: 'multiple_choice',
      prompt: 'Sample?',
      choices: [{ id: 'a', label: 'A' }],
      correctId: 'a',
    },
  ],
};

const sampleAttempt: QuestionAttemptRecord = {
  questionId: 'q1',
  first_selected_answer: 'a',
  final_selected_answer: 'a',
  is_correct_first_try: true,
  is_correct_final: true,
  attempts_count: 1,
  hints_used_count: 0,
  completed_at: new Date().toISOString(),
};

function runAudit(): AuditReport {
  const initialType = resolveMissionAttemptType({
    participantId: '00000000-0000-4000-8000-000000000001',
    moduleId: 'new-module',
    previouslyCompleted: false,
  });
  const replayType = resolveMissionAttemptType({
    participantId: '00000000-0000-4000-8000-000000000001',
    moduleId: 'done-module',
    previouslyCompleted: true,
  });

  const replayRows = buildQuestionAttemptRows({
    config: sampleConfig,
    attempts: { q1: sampleAttempt },
    context: {
      participant_id: '00000000-0000-4000-8000-000000000001',
      program_code: 'CAMP-BLUERIBBONAB-2026',
      mission_id: 'sample-mission',
      attempt_type: 'replay',
    },
  });

  const mixedRows = [
    { attempt_type: 'initial', is_replay: false },
    { attempt_type: 'replay', is_replay: true },
  ];

  const gameFlowSource = fs.readFileSync(
    path.join(process.cwd(), 'src/components/game-assessment/GameAssessmentFlow.tsx'),
    'utf8',
  );
  const courageSource = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/completeMissionWithSupabase.ts'),
    'utf8',
  );

  const checks = [
    {
      name: 'Initial attempt type default',
      pass: initialType === 'initial',
      detail: `resolveMissionAttemptType => ${initialType}`,
    },
    {
      name: 'Replay attempt type when previously completed',
      pass: replayType === 'replay',
      detail: `resolveMissionAttemptType => ${replayType}`,
    },
    {
      name: 'Replay rows flagged',
      pass: replayRows.every((row) => row.attempt_type === 'replay' && row.is_replay === true),
      detail: 'buildQuestionAttemptRows sets attempt_type + is_replay',
    },
    {
      name: 'Initial-only filter',
      pass: filterInitialAttemptRows(mixedRows).length === 1,
      detail: 'filterInitialAttemptRows excludes replay rows',
    },
    {
      name: 'Replay helper',
      pass: isReplayAttemptType('replay') && !isReplayAttemptType('initial'),
      detail: 'isReplayAttemptType distinguishes replay',
    },
    {
      name: 'Game flow passes attempt type',
      pass:
        gameFlowSource.includes('resolveMissionAttemptType') &&
        gameFlowSource.includes('attemptType:'),
      detail: 'GameAssessmentFlow wires attemptType into completion save',
    },
    {
      name: 'Reward dedup on replay',
      pass: courageSource.includes('alreadyCompleted: true'),
      detail: 'completeMissionWithSupabase skips duplicate rewards when already completed',
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    checks,
    summary: {
      checksPassed: checks.filter((check) => check.pass).length,
      checksFailed: checks.filter((check) => !check.pass).length,
    },
    sampleReplayRows: replayRows,
  };
}

function generatePdf(report: AuditReport): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: 'LETTER' });
    const stream = fs.createWriteStream(PDF_PATH);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(20).text('Replay Attempts Audit');
    doc.font('Helvetica').fontSize(10).text(`Generated ${new Date(report.generatedAt).toLocaleString()}`);
    doc.moveDown();
    doc.text(`Checks passed: ${report.summary.checksPassed} / ${report.checks.length}`);

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

  console.log('\n=== Replay Attempts Audit ===\n');
  console.log(`Checks: ${report.summary.checksPassed}/${report.checks.length} passing`);
  console.log(`\nWrote ${JSON_PATH}`);
  console.log(`Wrote ${PDF_PATH}`);

  if (report.summary.checksFailed > 0) {
    process.exitCode = 1;
  }
}

void main();
