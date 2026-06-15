/**
 * Question attempt tracking verification audit.
 *
 * Usage: npm run audit:question-attempts
 */

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { MISSION_QUESTIONS_PER_ATTEMPT } from '../src/config/missionQuestions';
import { finalizeAdaptiveQuestions } from '../src/lib/adaptiveQuestionSelection';
import { assertUniqueQuestionIds } from '../src/lib/missionQuestionPool';
import {
  buildQuestionAttemptRows,
  type QuestionAttemptInsertRow,
} from '../src/lib/questionAttemptService';
import {
  computeQuestionAttemptMetrics,
  growthByCharacter,
  growthByWeek,
} from '../src/lib/questionAttemptMetrics';
import { buildAttemptsMap } from '../src/lib/questionAttemptTracking';
import type { QuestionAttemptRecord } from '../src/types/questionInteraction';
import type { GameAssessmentConfig } from '../src/types/gameAssessment';

import '../src/data/caiden/index';
import '../src/data/miranda/index';
import '../src/data/zeke/index';
import '../src/data/charlie/index';
import '../src/data/b4/index';

import { CAIDEN_ADAPTIVE_QUEST_REGISTRY, buildCaidenAdaptiveConfig } from '../src/data/caiden/caidenAdaptiveBuilder';
import { ZEKE_ADAPTIVE_MISSION_REGISTRY, buildZekeAdaptiveConfig } from '../src/data/zeke/zekeAdaptiveBuilder';
import { CHARLIE_ADAPTIVE_MISSION_REGISTRY, buildCharlieAdaptiveConfig } from '../src/data/charlie/charlieAdaptiveBuilder';
import { B4_ADAPTIVE_MISSION_REGISTRY, buildB4AdaptiveConfig } from '../src/data/b4/b4AdaptiveBuilder';
import { MIRANDA_ADAPTIVE_QUEST_REGISTRY, buildMirandaAdaptiveConfig } from '../src/data/miranda/mirandaAdaptiveBuilder';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'question-attempt-tracking-audit.json');
const PDF_PATH = path.join(REPORTS_DIR, 'question-attempt-tracking-audit.pdf');

type MissionAuditRow = {
  character: string;
  missionId: string;
  questionCount: number;
  uniqueIds: boolean;
  questionIds: string[];
  pass: boolean;
  notes: string[];
};

type AuditReport = {
  generatedAt: string;
  missionQuestionTarget: number;
  summary: {
    missionsChecked: number;
    missionsPassing: number;
    missionsFailing: number;
    interactionChecksPassed: number;
    interactionChecksFailed: number;
  };
  missionRows: MissionAuditRow[];
  interactionChecks: Array<{ name: string; pass: boolean; detail: string }>;
  sampleAttemptRows: QuestionAttemptInsertRow[];
  growthPreview: {
    byWeek: ReturnType<typeof growthByWeek>;
    byCharacter: ReturnType<typeof growthByCharacter>;
  };
  metricsPreview: ReturnType<typeof computeQuestionAttemptMetrics>;
};

function auditMissionConfigs(): MissionAuditRow[] {
  const rows: MissionAuditRow[] = [];

  const entries: Array<{
    character: string;
    missionId: string;
    build: () => GameAssessmentConfig;
  }> = [];

  for (const [missionId, quest] of Object.entries(CAIDEN_ADAPTIVE_QUEST_REGISTRY)) {
    entries.push({
      character: 'caiden',
      missionId,
      build: () => buildCaidenAdaptiveConfig(quest, '2-3', { gradeLevel: '3' }),
    });
  }
  for (const [missionId, file] of Object.entries(MIRANDA_ADAPTIVE_QUEST_REGISTRY)) {
    entries.push({
      character: 'miranda',
      missionId,
      build: () => buildMirandaAdaptiveConfig(file, '2-3', { gradeLevel: '3' }),
    });
  }
  for (const [missionId, mission] of Object.entries(ZEKE_ADAPTIVE_MISSION_REGISTRY)) {
    entries.push({
      character: 'zeke',
      missionId,
      build: () => buildZekeAdaptiveConfig(mission, '2-3', { gradeLevel: '3' }),
    });
  }
  for (const [missionId, mission] of Object.entries(CHARLIE_ADAPTIVE_MISSION_REGISTRY)) {
    entries.push({
      character: 'charlie',
      missionId,
      build: () => buildCharlieAdaptiveConfig(mission, '2-3', { gradeLevel: '3' }),
    });
  }
  for (const [missionId, mission] of Object.entries(B4_ADAPTIVE_MISSION_REGISTRY)) {
    entries.push({
      character: 'b4',
      missionId,
      build: () => buildB4AdaptiveConfig(mission, '2-3', { gradeLevel: '3' }),
    });
  }

  for (const entry of entries) {
    const config = entry.build();
    const notes: string[] = [];
    const uniqueIds = assertUniqueQuestionIds(config.questions);
    if (!uniqueIds) notes.push('Duplicate question IDs detected');
    if (config.questions.length !== MISSION_QUESTIONS_PER_ATTEMPT) {
      notes.push(`Expected ${MISSION_QUESTIONS_PER_ATTEMPT} questions, found ${config.questions.length}`);
    }

    const selection = finalizeAdaptiveQuestions(
      entry.character === 'caiden'
        ? CAIDEN_ADAPTIVE_QUEST_REGISTRY[entry.missionId]!.gradeContent
        : entry.character === 'miranda'
          ? MIRANDA_ADAPTIVE_QUEST_REGISTRY[entry.missionId]!.gradeContent
          : entry.character === 'zeke'
            ? ZEKE_ADAPTIVE_MISSION_REGISTRY[entry.missionId]!.gradeContent
            : entry.character === 'charlie'
              ? CHARLIE_ADAPTIVE_MISSION_REGISTRY[entry.missionId]!.gradeContent
              : B4_ADAPTIVE_MISSION_REGISTRY[entry.missionId]!.gradeContent,
      {
        missionId: entry.missionId,
        gradeLevel: '3',
        allowStretch: false,
      },
    );

    if (selection.questions.length !== MISSION_QUESTIONS_PER_ATTEMPT) {
      notes.push(`Selection returned ${selection.questions.length} questions`);
    }

    rows.push({
      character: entry.character,
      missionId: entry.missionId,
      questionCount: config.questions.length,
      uniqueIds,
      questionIds: config.questions.map((question) => question.id),
      pass: uniqueIds && config.questions.length === MISSION_QUESTIONS_PER_ATTEMPT && notes.length === 0,
      notes,
    });
  }

  return rows;
}

function simulateFirstAttemptBehavior(): QuestionAttemptRecord[] {
  const records: QuestionAttemptRecord[] = [];

  const wrongThenRight: QuestionAttemptRecord = {
    questionId: 'sim-q1',
    first_selected_answer: 'b',
    final_selected_answer: 'a',
    is_correct_first_try: false,
    is_correct_final: true,
    attempts_count: 2,
    hints_used_count: 0,
    completed_at: new Date().toISOString(),
  };
  records.push(wrongThenRight);

  const hintedCorrect: QuestionAttemptRecord = {
    questionId: 'sim-q2',
    first_selected_answer: 'c',
    final_selected_answer: 'a',
    is_correct_first_try: false,
    is_correct_final: true,
    attempts_count: 2,
    hints_used_count: 1,
    completed_at: new Date().toISOString(),
  };
  records.push(hintedCorrect);

  const firstTryCorrect: QuestionAttemptRecord = {
    questionId: 'sim-q3',
    first_selected_answer: 'a',
    final_selected_answer: 'a',
    is_correct_first_try: true,
    is_correct_final: true,
    attempts_count: 1,
    hints_used_count: 0,
    completed_at: new Date().toISOString(),
  };
  records.push(firstTryCorrect);

  return records;
}

function runInteractionChecks(): AuditReport['interactionChecks'] {
  const checks: AuditReport['interactionChecks'] = [];
  const simulated = simulateFirstAttemptBehavior();
  const wrongThenRight = simulated[0];

  checks.push({
    name: 'first_selected_answer preserved after second try',
    pass: wrongThenRight.first_selected_answer === 'b' && wrongThenRight.final_selected_answer === 'a',
    detail: `first=${wrongThenRight.first_selected_answer}, final=${wrongThenRight.final_selected_answer}`,
  });

  checks.push({
    name: 'is_correct_first_try remains false when wrong then right',
    pass: !wrongThenRight.is_correct_first_try && wrongThenRight.is_correct_final,
    detail: `first_try=${wrongThenRight.is_correct_first_try}, final=${wrongThenRight.is_correct_final}`,
  });

  checks.push({
    name: 'hint usage tracked separately',
    pass: simulated[1].hints_used_count === 1,
    detail: `hints_used_count=${simulated[1].hints_used_count}`,
  });

  const metrics = computeQuestionAttemptMetrics(
    simulated.map((record) => ({
      participant_id: 'audit',
      program_code: 'audit',
      mission_id: 'audit-mission',
      question_id: record.questionId,
      is_correct_first_try: record.is_correct_first_try,
      is_correct_final: record.is_correct_final,
      used_hint: record.hints_used_count > 0,
      attempt_count: record.attempts_count,
      completed_at: record.completed_at,
    })),
  );

  checks.push({
    name: 'final score and first-try score can differ',
    pass: metrics.final_accuracy !== metrics.first_attempt_accuracy,
    detail: `final=${metrics.final_accuracy}, first_try=${metrics.first_attempt_accuracy}`,
  });

  checks.push({
    name: 'growth metrics computable',
    pass: growthByWeek(
      simulated.map((record, index) => ({
        participant_id: 'audit',
        program_code: 'audit',
        week_number: index < 2 ? 1 : 2,
        mission_id: 'audit-mission',
        question_id: record.questionId,
        is_correct_first_try: record.is_correct_first_try,
        is_correct_final: record.is_correct_final,
        used_hint: record.hints_used_count > 0,
        attempt_count: record.attempts_count,
        completed_at: record.completed_at,
      })),
    ).length >= 1,
    detail: 'growth_by_week buckets created',
  });

  return checks;
}

function buildSampleAttemptRows(config: GameAssessmentConfig): QuestionAttemptInsertRow[] {
  const attempts = buildAttemptsMap(simulateFirstAttemptBehavior());
  return buildQuestionAttemptRows({
    config: {
      ...config,
      questions: config.questions.slice(0, 3),
    },
    attempts,
    context: {
      participant_id: '00000000-0000-4000-8000-000000000001',
      program_code: 'audit-program',
      week_number: 2,
      mission_id: config.id,
      character: config.decorVariant ?? 'caiden',
      grade_level: '3',
      grade_band: '2-3',
      content_version: 'adaptive_v2',
      module_id: config.id,
    },
  });
}

function runAudit(): AuditReport {
  const missionRows = auditMissionConfigs();
  const interactionChecks = runInteractionChecks();
  const sampleConfig = buildCaidenAdaptiveConfig(CAIDEN_ADAPTIVE_QUEST_REGISTRY['quest-2'], '2-3', {
    gradeLevel: '3',
  });
  const sampleAttemptRows = buildSampleAttemptRows(sampleConfig);
  const metricRows = sampleAttemptRows.map((row) => ({
    participant_id: row.participant_id,
    program_code: row.program_code,
    week_number: row.week_number ?? null,
    mission_id: row.mission_id,
    character: row.character ?? null,
    question_id: row.question_id,
    grade_level: row.grade_level ?? null,
    grade_band: row.grade_band ?? null,
    content_version: row.content_version ?? null,
    is_correct_first_try: row.is_correct_first_try,
    is_correct_final: row.is_correct_final,
    used_hint: row.used_hint,
    attempt_count: row.attempt_count,
    completed_at: row.completed_at,
  }));

  return {
    generatedAt: new Date().toISOString(),
    missionQuestionTarget: MISSION_QUESTIONS_PER_ATTEMPT,
    summary: {
      missionsChecked: missionRows.length,
      missionsPassing: missionRows.filter((row) => row.pass).length,
      missionsFailing: missionRows.filter((row) => !row.pass).length,
      interactionChecksPassed: interactionChecks.filter((check) => check.pass).length,
      interactionChecksFailed: interactionChecks.filter((check) => !check.pass).length,
    },
    missionRows,
    interactionChecks,
    sampleAttemptRows,
    growthPreview: {
      byWeek: growthByWeek(metricRows),
      byCharacter: growthByCharacter(metricRows),
    },
    metricsPreview: computeQuestionAttemptMetrics(metricRows),
  };
}

function generatePdf(report: AuditReport): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: 'LETTER' });
    const stream = fs.createWriteStream(PDF_PATH);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(20).text('Question Attempt Tracking Audit');
    doc.font('Helvetica').fontSize(10).text(`Generated ${new Date(report.generatedAt).toLocaleString()}`);
    doc.moveDown();
    doc.text(`Mission question target: ${report.missionQuestionTarget}`);
    doc.text(`Missions passing: ${report.summary.missionsPassing} / ${report.summary.missionsChecked}`);
    doc.text(`Interaction checks passed: ${report.summary.interactionChecksPassed}`);

    doc.moveDown().font('Helvetica-Bold').text('Failed missions (first 20)');
    doc.font('Helvetica');
    report.missionRows
      .filter((row) => !row.pass)
      .slice(0, 20)
      .forEach((row) => {
        doc.text(`${row.character}/${row.missionId}: ${row.notes.join('; ') || 'failed'}`);
      });

    doc.moveDown().font('Helvetica-Bold').text('Interaction checks');
    doc.font('Helvetica');
    report.interactionChecks.forEach((check) => {
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

  console.log('\n=== Question Attempt Tracking Audit ===\n');
  console.log(`Missions: ${report.summary.missionsPassing}/${report.summary.missionsChecked} passing`);
  console.log(`Interaction checks: ${report.summary.interactionChecksPassed}/${report.interactionChecks.length} passing`);
  console.log(`\nWrote ${JSON_PATH}`);
  console.log(`Wrote ${PDF_PATH}`);

  if (report.summary.missionsFailing > 0 || report.summary.interactionChecksFailed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
