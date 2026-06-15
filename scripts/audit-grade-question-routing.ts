/**
 * Grade question routing verification audit.
 *
 * Usage: npm run verify:grade-routing
 */

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { resolveBaseGradeBand } from '../src/lib/getGradeBand';
import {
  auditMissionRouting,
  buildRecommendedFixes,
  GRADE_SCENARIOS,
  summarizeAuditRows,
  type CharacterId,
  type GradeRoutingAuditReport,
  type MissionRoutingAuditRow,
} from '../src/lib/gradeQuestionRoutingAudit';
import type { GradeContentPool } from '../src/lib/gradeBandQuestionSelection';
import type { ReasoningDepthQuestion } from '../src/lib/reasoningDepthFilter';
import type { AdaptiveQuestionSelectionContext } from '../src/lib/adaptiveQuestionSelection';
import type { GameAssessmentConfig } from '../src/types/gameAssessment';
import type { StudentGradeBand } from '../src/types/gradeBandContentMetadata';
import { STAGING_CONTENT_ENABLED } from '../src/config/stagingContent';

import '../src/data/caiden/index';
import '../src/data/miranda/index';
import '../src/data/zeke/index';
import '../src/data/charlie/index';
import '../src/data/b4/index';

import {
  CAIDEN_ADAPTIVE_QUEST_REGISTRY,
  buildCaidenAdaptiveConfig,
} from '../src/data/caiden/caidenAdaptiveBuilder';
import {
  MIRANDA_ADAPTIVE_QUEST_REGISTRY,
  buildMirandaAdaptiveConfig,
} from '../src/data/miranda/mirandaAdaptiveBuilder';
import {
  ZEKE_ADAPTIVE_MISSION_REGISTRY,
  buildZekeAdaptiveConfig,
} from '../src/data/zeke/zekeAdaptiveBuilder';
import {
  CHARLIE_ADAPTIVE_MISSION_REGISTRY,
  buildCharlieAdaptiveConfig,
} from '../src/data/charlie/charlieAdaptiveBuilder';
import {
  B4_ADAPTIVE_MISSION_REGISTRY,
  buildB4AdaptiveConfig,
} from '../src/data/b4/b4AdaptiveBuilder';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'grade-question-routing-audit.json');
const MD_PATH = path.join(REPORTS_DIR, 'grade-question-routing-audit.md');
const PDF_PATH = path.join(REPORTS_DIR, 'grade-question-routing-audit.pdf');

type MissionEntry = {
  character: CharacterId;
  missionId: string;
  gradeContent: GradeContentPool<ReasoningDepthQuestion>;
  buildConfig: (
    baseBand: StudentGradeBand,
    context: Omit<AdaptiveQuestionSelectionContext, 'missionId' | 'gradeBand'>,
  ) => GameAssessmentConfig;
};

function collectMissions(): MissionEntry[] {
  const missions: MissionEntry[] = [];

  for (const [missionId, quest] of Object.entries(CAIDEN_ADAPTIVE_QUEST_REGISTRY)) {
    missions.push({
      character: 'caiden',
      missionId,
      gradeContent: quest.gradeContent,
      buildConfig: (baseBand, context) => buildCaidenAdaptiveConfig(quest, baseBand, context),
    });
  }

  for (const [missionId, file] of Object.entries(MIRANDA_ADAPTIVE_QUEST_REGISTRY)) {
    missions.push({
      character: 'miranda',
      missionId,
      gradeContent: file.gradeContent,
      buildConfig: (baseBand, context) => buildMirandaAdaptiveConfig(file, baseBand, context),
    });
  }

  for (const [missionId, mission] of Object.entries(ZEKE_ADAPTIVE_MISSION_REGISTRY)) {
    missions.push({
      character: 'zeke',
      missionId,
      gradeContent: mission.gradeContent,
      buildConfig: (baseBand, context) => buildZekeAdaptiveConfig(mission, baseBand, context),
    });
  }

  for (const [missionId, mission] of Object.entries(CHARLIE_ADAPTIVE_MISSION_REGISTRY)) {
    missions.push({
      character: 'charlie',
      missionId,
      gradeContent: mission.gradeContent,
      buildConfig: (baseBand, context) => buildCharlieAdaptiveConfig(mission, baseBand, context),
    });
  }

  for (const [missionId, mission] of Object.entries(B4_ADAPTIVE_MISSION_REGISTRY)) {
    missions.push({
      character: 'b4',
      missionId,
      gradeContent: mission.gradeContent,
      buildConfig: (baseBand, context) => buildB4AdaptiveConfig(mission, baseBand, context),
    });
  }

  return missions;
}

function runAudit(): GradeRoutingAuditReport {
  const missions = collectMissions();
  const rows: MissionRoutingAuditRow[] = [];

  for (const mission of missions) {
    for (const scenario of GRADE_SCENARIOS) {
      const baseBand = resolveBaseGradeBand({
        gradeLevel: scenario.gradeLevel,
        gradeBand: scenario.gradeBand,
      });

      const config = mission.buildConfig(baseBand, {
        gradeLevel: scenario.gradeLevel,
        gradeBand: scenario.gradeBand,
        allowStretch: scenario.allowStretch,
        participantId: 'audit-participant',
      });

      rows.push(
        auditMissionRouting({
          character: mission.character,
          missionId: mission.missionId,
          gradeContent: mission.gradeContent,
          scenario,
          config,
        }),
      );
    }
  }

  const summary = summarizeAuditRows(rows);
  const recommendedFixes = buildRecommendedFixes({ ...summary, rows, recommendedFixes: [] });

  return {
    ...summary,
    rows,
    recommendedFixes,
  };
}

function formatRowLine(row: MissionRoutingAuditRow): string {
  const questionSummary = row.questions
    .map(
      (question) =>
        `${question.questionId} [${question.sourceBand}/${question.difficultyTier}/${question.contentVersion ?? 'n/a'}]`,
    )
    .join(', ');

  return [
    `| ${row.character} | ${row.missionId} | ${row.scenarioLabel} |`,
    ` ${row.gradeLevel ?? '—'} | ${row.gradeBand ?? '—'} | ${row.allowStretchLevel} |`,
    ` ${row.resolvedBaseBand} | ${row.resolvedContentBand} | ${row.usedStretch} |`,
    ` ${row.pass ? 'PASS' : '**FAIL**'} |`,
    ` ${questionSummary} |`,
  ].join('');
}

function generateMarkdown(report: GradeRoutingAuditReport): string {
  const lines: string[] = [
    '# Grade Question Routing Audit',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Executive Summary',
    '',
    `- Total checks: **${report.summary.totalChecks}**`,
    `- Passed: **${report.summary.passed}**`,
    `- Failed: **${report.summary.failed}**`,
    `- Warnings: **${report.summary.warnings}**`,
    `- Staging overrides: **${report.stagingEnabled ? 'ENABLED' : 'disabled'}**`,
    report.productionStagingRisk
      ? '- **WARNING:** Staging content active in production mode'
      : '- Production mode: staging overrides off (expected)',
    '',
    '## Pass/Fail by Character',
    '',
    '| Character | Passed | Failed |',
    '| --- | ---: | ---: |',
  ];

  const characters: CharacterId[] = ['caiden', 'miranda', 'zeke', 'charlie', 'b4'];
  for (const character of characters) {
    const stats = report.summary.byCharacter[character] ?? { passed: 0, failed: 0 };
    lines.push(`| ${character} | ${stats.passed} | ${stats.failed} |`);
  }

  lines.push('', '## Pass/Fail by Grade Scenario', '', '| Scenario | Passed | Failed |', '| --- | ---: | ---: |');
  for (const scenario of GRADE_SCENARIOS) {
    const stats = report.summary.byScenario[scenario.id] ?? { passed: 0, failed: 0 };
    lines.push(`| ${scenario.label} | ${stats.passed} | ${stats.failed} |`);
  }

  lines.push('', '## Wrong-Band Questions', '');
  if (report.wrongBandQuestions.length === 0) {
    lines.push('_None detected._');
  } else {
    for (const item of report.wrongBandQuestions) {
      lines.push(`- **${item.character}** / ${item.missionId} / ${item.scenarioId}: ${item.detail}`);
    }
  }

  lines.push('', '## Grade 4 Questions Too Easy', '');
  if (report.tooEasyGrade4.length === 0) {
    lines.push('_None detected._');
  } else {
    for (const item of report.tooEasyGrade4) {
      lines.push(`- **${item.character}** / ${item.missionId} / ${item.questionId}: ${item.reason}`);
    }
  }

  lines.push('', '## Invalid Stretch Questions', '');
  if (report.invalidStretchQuestions.length === 0) {
    lines.push('_None detected._');
  } else {
    for (const item of report.invalidStretchQuestions) {
      lines.push(`- **${item.character}** / ${item.missionId} / ${item.questionId}: ${item.reason}`);
    }
  }

  lines.push('', '## Missing Grade Fallback Warnings', '');
  if (report.missingGradeWarnings.length === 0) {
    lines.push('_None detected._');
  } else {
    for (const item of report.missingGradeWarnings) {
      lines.push(`- **${item.character}** / ${item.missionId} / ${item.scenarioId}`);
    }
  }

  lines.push('', '## Top 20 Risky Routing Examples', '');
  if (report.riskyExamples.length === 0) {
    lines.push('_No failures._');
  } else {
    for (const row of report.riskyExamples) {
      lines.push(
        `### ${row.character} — ${row.missionId} — ${row.scenarioLabel}`,
        '',
        `- Base band: ${row.resolvedBaseBand} → content: ${row.resolvedContentBand}`,
        `- Stretch: ${row.usedStretch}`,
        `- Failures: ${row.failures.join('; ') || 'none'}`,
        `- Questions: ${row.questionIds.join(', ')}`,
        '',
      );
    }
  }

  lines.push('## Recommended Fixes', '');
  for (const fix of report.recommendedFixes) {
    lines.push(`- ${fix}`);
  }

  lines.push('', '## Full Results (sample failures)', '');
  const failedRows = report.rows.filter((row) => !row.pass).slice(0, 50);
  if (failedRows.length === 0) {
    lines.push('_All checks passed._');
  } else {
    for (const row of failedRows) {
      lines.push(formatRowLine(row));
      if (row.failures.length > 0) {
        lines.push(`  - Failures: ${row.failures.join('; ')}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

const MARGIN = 48;
const PAGE_WIDTH = 612;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function ensureSpace(doc: PDFKit.PDFDocument, height: number): void {
  if (doc.y + height > doc.page.height - MARGIN) {
    doc.addPage();
  }
}

function sectionTitle(doc: PDFKit.PDFDocument, text: string): void {
  ensureSpace(doc, 30);
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#1a365d').text(text, MARGIN, doc.y, {
    width: CONTENT_WIDTH,
  });
  doc.moveDown(0.3);
}

function bodyText(doc: PDFKit.PDFDocument, text: string, options?: { bold?: boolean }): void {
  doc
    .font(options?.bold ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(10)
    .fillColor('#1a202c')
    .text(text, MARGIN, doc.y, { width: CONTENT_WIDTH, lineGap: 2 });
}

function generatePdf(report: GradeRoutingAuditReport): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: 'LETTER' });
    const stream = fs.createWriteStream(PDF_PATH);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(22).fillColor('#1a365d').text("Caiden's Courage", MARGIN, 72);
    doc.fontSize(18).text('Grade Question Routing Audit', MARGIN, doc.y + 6);
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#4a5568')
      .text(`Generated ${new Date(report.generatedAt).toLocaleString()}`, MARGIN, doc.y + 10);

    doc.addPage();
    sectionTitle(doc, 'Executive Summary');
    bodyText(doc, `Total checks: ${report.summary.totalChecks}`);
    bodyText(doc, `Passed: ${report.summary.passed}`);
    bodyText(doc, `Failed: ${report.summary.failed}`);
    bodyText(doc, `Warnings: ${report.summary.warnings}`);
    bodyText(
      doc,
      `Staging: ${report.stagingEnabled ? 'ENABLED (review only)' : 'disabled (production-safe)'}`,
      { bold: report.stagingEnabled },
    );

    sectionTitle(doc, 'Pass/Fail by Character');
    for (const character of ['caiden', 'miranda', 'zeke', 'charlie', 'b4'] as CharacterId[]) {
      const stats = report.summary.byCharacter[character] ?? { passed: 0, failed: 0 };
      bodyText(doc, `${character}: ${stats.passed} passed, ${stats.failed} failed`);
    }

    sectionTitle(doc, 'Pass/Fail by Grade Scenario');
    for (const scenario of GRADE_SCENARIOS) {
      const stats = report.summary.byScenario[scenario.id] ?? { passed: 0, failed: 0 };
      bodyText(doc, `${scenario.label}: ${stats.passed} passed, ${stats.failed} failed`);
    }

    sectionTitle(doc, 'Wrong-Band Questions');
    if (report.wrongBandQuestions.length === 0) {
      bodyText(doc, 'None detected.');
    } else {
      report.wrongBandQuestions.slice(0, 30).forEach((item) => {
        bodyText(doc, `${item.character} / ${item.missionId}: ${item.detail}`);
      });
    }

    sectionTitle(doc, 'Grade 4 Too Easy');
    if (report.tooEasyGrade4.length === 0) {
      bodyText(doc, 'None detected.');
    } else {
      report.tooEasyGrade4.slice(0, 20).forEach((item) => {
        bodyText(doc, `${item.character} / ${item.missionId} / ${item.questionId}`);
      });
    }

    sectionTitle(doc, 'Invalid Stretch');
    if (report.invalidStretchQuestions.length === 0) {
      bodyText(doc, 'None detected.');
    } else {
      report.invalidStretchQuestions.slice(0, 20).forEach((item) => {
        bodyText(doc, `${item.character} / ${item.missionId} / ${item.questionId}: ${item.reason}`);
      });
    }

    sectionTitle(doc, 'Top Risky Examples');
    if (report.riskyExamples.length === 0) {
      bodyText(doc, 'No failures.');
    } else {
      report.riskyExamples.slice(0, 15).forEach((row, index) => {
        bodyText(doc, `${index + 1}. ${row.character} / ${row.missionId} / ${row.scenarioLabel}`, {
          bold: true,
        });
        bodyText(doc, row.failures.join('; '));
        doc.moveDown(0.3);
      });
    }

    sectionTitle(doc, 'Recommended Fixes');
    report.recommendedFixes.forEach((fix) => bodyText(doc, `• ${fix}`));

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

function printConsoleSummary(report: GradeRoutingAuditReport): void {
  console.log('\n=== Grade Question Routing Audit ===\n');
  console.log(`Staging overrides: ${STAGING_CONTENT_ENABLED ? 'ENABLED' : 'disabled'}`);
  console.log(`Checks: ${report.summary.totalChecks} | Passed: ${report.summary.passed} | Failed: ${report.summary.failed}`);
  console.log('');

  const sampleRows = report.rows.slice(0, 5);
  for (const row of sampleRows) {
    console.log(
      [
        row.pass ? 'PASS' : 'FAIL',
        row.character,
        row.missionId,
        row.scenarioId,
        `base=${row.resolvedBaseBand}`,
        `content=${row.resolvedContentBand}`,
        `stretch=${row.usedStretch}`,
        `questions=${row.questionIds.join(',')}`,
      ].join(' | '),
    );
  }

  if (report.summary.failed > 0) {
    console.log('\nFailures (first 10):');
    report.rows
      .filter((row) => !row.pass)
      .slice(0, 10)
      .forEach((row) => {
        console.log(`  ${row.character}/${row.missionId}/${row.scenarioId}: ${row.failures.join('; ')}`);
      });
  }
}

async function main(): Promise<void> {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const report = runAudit();
  fs.writeFileSync(JSON_PATH, JSON.stringify(report, null, 2));
  fs.writeFileSync(MD_PATH, generateMarkdown(report));
  await generatePdf(report);

  printConsoleSummary(report);

  console.log(`\nWrote ${JSON_PATH}`);
  console.log(`Wrote ${MD_PATH}`);
  console.log(`Wrote ${PDF_PATH}`);

  if (report.summary.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
