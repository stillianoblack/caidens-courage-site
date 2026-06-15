/**
 * First-attempt tracking field audit.
 *
 * Usage: npm run audit:first-attempt-tracking
 */

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { buildQuestionAttemptRows, type QuestionAttemptInsertRow } from '../src/lib/questionAttemptService';
import type { QuestionAttemptRecord } from '../src/types/questionInteraction';
import type { GameAssessmentConfig } from '../src/types/gameAssessment';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'first-attempt-tracking-audit.json');
const PDF_PATH = path.join(REPORTS_DIR, 'first-attempt-tracking-audit.pdf');

const REQUIRED_FIELDS = [
  'participant_id',
  'week_number',
  'mission_id',
  'character',
  'question_id',
  'selected_answer',
  'first_selected_answer',
  'is_correct_first_try',
  'is_correct_final',
  'used_hint',
  'attempt_type',
  'content_version',
  'completed_at',
] as const;

const AUDIT_FIELD_ALIASES: Record<string, keyof QuestionAttemptInsertRow> = {
  first_attempt_correct: 'is_correct_first_try',
  final_correct: 'is_correct_final',
  hint_used: 'used_hint',
  created_at: 'completed_at',
};

type AuditReport = {
  generatedAt: string;
  requiredFields: readonly string[];
  sampleRow: QuestionAttemptInsertRow;
  fieldChecks: Array<{ field: string; pass: boolean; mappedTo?: string; value?: unknown }>;
  migrationChecks: Array<{ name: string; pass: boolean; detail: string }>;
  summary: { fieldChecksPassed: number; fieldChecksFailed: number; migrationChecksPassed: number };
};

const sampleConfig: GameAssessmentConfig = {
  id: 'audit-mission',
  decorVariant: 'b4',
  landing: { title: 'Audit', subtitle: '', startLabel: 'Start' },
  complete: { title: 'Done', message: 'Done', buttonLabel: 'Back' },
  questions: [
    {
      id: 'audit-q1',
      type: 'multiple_choice',
      prompt: 'Audit question?',
      choices: [{ id: 'yes', label: 'Yes' }],
      correctId: 'yes',
      diagnosticMeta: { contentVersion: 'v3-audit' },
    },
  ],
};

const sampleAttempt: QuestionAttemptRecord = {
  questionId: 'audit-q1',
  first_selected_answer: 'yes',
  final_selected_answer: 'yes',
  is_correct_first_try: true,
  is_correct_final: true,
  attempts_count: 1,
  hints_used_count: 0,
  completed_at: '2026-06-14T12:00:00.000Z',
};

function runAudit(): AuditReport {
  const rows = buildQuestionAttemptRows({
    config: sampleConfig,
    attempts: { 'audit-q1': sampleAttempt },
    context: {
      participant_id: '00000000-0000-4000-8000-000000000099',
      program_code: 'CAMP-BLUERIBBONAB-2026',
      week_number: 1,
      mission_id: 'b4-week-1',
      character: 'b4',
      attempt_type: 'initial',
    },
  });

  const sampleRow = rows[0];
  const fieldChecks = REQUIRED_FIELDS.map((field) => {
    const mappedKey = AUDIT_FIELD_ALIASES[field] ?? (field as keyof QuestionAttemptInsertRow);
    const value = sampleRow?.[mappedKey as keyof QuestionAttemptInsertRow];
    const pass = value !== undefined && value !== null && value !== '';
    return { field, pass, mappedTo: mappedKey !== field ? String(mappedKey) : undefined, value };
  });

  const migrationSql = fs.readFileSync(
    path.join(process.cwd(), 'supabase/question_attempts_full_migration.sql'),
    'utf8',
  );
  const hookSource = fs.readFileSync(path.join(process.cwd(), 'src/hooks/useQuestionInteraction.ts'), 'utf8');

  const migrationChecks = [
    {
      name: 'attempt_type column migration',
      pass: migrationSql.includes('attempt_type'),
      detail: 'SQL migration adds attempt_type',
    },
    {
      name: 'is_replay column migration',
      pass: migrationSql.includes('is_replay'),
      detail: 'SQL migration adds is_replay',
    },
    {
      name: 'First-try hook tracks immutable first answer',
      pass:
        hookSource.includes('first_selected_answer') && hookSource.includes('is_correct_first_try'),
      detail: 'useQuestionInteraction preserves first-try state',
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    requiredFields: REQUIRED_FIELDS,
    sampleRow,
    fieldChecks,
    migrationChecks,
    summary: {
      fieldChecksPassed: fieldChecks.filter((check) => check.pass).length,
      fieldChecksFailed: fieldChecks.filter((check) => !check.pass).length,
      migrationChecksPassed: migrationChecks.filter((check) => check.pass).length,
    },
  };
}

function generatePdf(report: AuditReport): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: 'LETTER' });
    const stream = fs.createWriteStream(PDF_PATH);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(20).text('First Attempt Tracking Audit');
    doc.font('Helvetica').fontSize(10).text(`Generated ${new Date(report.generatedAt).toLocaleString()}`);
    doc.moveDown();
    doc.text(
      `Field checks: ${report.summary.fieldChecksPassed}/${report.fieldChecks.length} passing`,
    );

    doc.moveDown().font('Helvetica-Bold').text('Required fields');
    doc.font('Helvetica');
    report.fieldChecks.forEach((check) => {
      const mapped = check.mappedTo ? ` (mapped to ${check.mappedTo})` : '';
      doc.text(`${check.pass ? 'PASS' : 'FAIL'} — ${check.field}${mapped}`);
    });

    doc.moveDown().font('Helvetica-Bold').text('Migration / hook checks');
    doc.font('Helvetica');
    report.migrationChecks.forEach((check) => {
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

  console.log('\n=== First Attempt Tracking Audit ===\n');
  console.log(
    `Field checks: ${report.summary.fieldChecksPassed}/${report.fieldChecks.length} passing`,
  );
  console.log(`\nWrote ${JSON_PATH}`);
  console.log(`Wrote ${PDF_PATH}`);

  if (
    report.summary.fieldChecksFailed > 0 ||
    report.migrationChecks.some((check) => !check.pass)
  ) {
    process.exitCode = 1;
  }
}

void main();
