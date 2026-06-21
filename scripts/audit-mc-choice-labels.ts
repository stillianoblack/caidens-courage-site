/**
 * Literacy / multiple-choice label audit.
 *
 * Usage: yarn audit:mc-labels
 */

import fs from 'fs';
import path from 'path';
import type { GameAssessmentConfig, GameChoiceQuestion } from '../src/types/gameAssessment';
import { isChoiceQuestion } from '../src/types/gameAssessment';
import { auditChoiceLabel, type ChoiceLabelIssueCode } from '../src/lib/gameChoiceDisplay';
import { collectAllQuestions, collectProductionQuestions } from './question-audit/collectQuestions';
import type { NormalizedQuestion } from './question-audit/types';
import { MIRANDA_FILE_3_CONFIG } from '../src/data/miranda/file3MissingLetters';
import { MIRANDA_FILE_4_CONFIG } from '../src/data/miranda/file4ContextClueChallenge';
import { MIRANDA_FILE_5_CONFIG } from '../src/data/miranda/file5DetectiveNotebook';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'literacy-mc-audit.json');
const MD_PATH = path.join(REPORTS_DIR, 'literacy-mc-audit.md');

const LITERACY_QUESTION_TYPES = new Set([
  'missing_letter',
  'context_clue',
  'fill_blank',
  'grammar',
]);

const LITERACY_SKILL_KEYWORDS = [
  'spelling',
  'word building',
  'vocabulary',
  'context clue',
  'reading',
  'phonics',
  'literacy',
  'comprehension',
];

/** Missions explicitly requested for verification. */
const PRIORITY_MISSIONS: Record<
  string,
  { title: string; character: string }
> = {
  'the-missing-letters': { title: 'The Missing Letters', character: 'miranda' },
  'zeke-brave-voice': { title: 'Brave Voice', character: 'zeke' },
  'charlie-volcano-trouble': { title: 'Volcano Trouble', character: 'charlie' },
  'quest-4': { title: 'Reset and Return', character: 'caiden' },
  'b4-focus-reset-station': { title: 'Focus Reset Station', character: 'b4' },
};

function resolveMissionTitle(missionId: string, fallback: string): string {
  return PRIORITY_MISSIONS[missionId]?.title ?? fallback;
}

type AuditedChoice = {
  optionId: string;
  label: string;
  displayLabel: string;
  letterIndex: number;
  issues: Array<{ code: ChoiceLabelIssueCode; message: string }>;
};

type AuditedQuestion = {
  character: string;
  missionId: string;
  missionTitle: string;
  questionId: string;
  questionType: string;
  gradeBand: string;
  source: string;
  fileHint: string;
  choices: AuditedChoice[];
  issueCount: number;
};

type LiteracyMcAuditReport = {
  generatedAt: string;
  summary: {
    questionsScanned: number;
    choicesScanned: number;
    questionsWithIssues: number;
    choicesWithIssues: number;
    issuesByCode: Record<ChoiceLabelIssueCode, number>;
    priorityMissionsScanned: string[];
    priorityMissionsWithIssues: string[];
  };
  fixesApplied: string[];
  affectedFiles: string[];
  affectedMissions: Array<{ missionId: string; title: string; issueCount: number }>;
  questionsWithIssues: AuditedQuestion[];
};

function isLiteracyQuestion(question: NormalizedQuestion): boolean {
  const skillBlob = `${question.skillTags.join(' ')} ${question.skillArea} ${question.questionType}`.toLowerCase();
  if (LITERACY_SKILL_KEYWORDS.some((keyword) => skillBlob.includes(keyword))) return true;
  if (question.character === 'miranda') return true;
  return false;
}

function shouldAuditQuestion(question: NormalizedQuestion): boolean {
  if (PRIORITY_MISSIONS[question.missionId]) return true;
  return isLiteracyQuestion(question);
}

function fileHintForQuestion(question: NormalizedQuestion): string {
  const characterDir = question.character === 'uncle-t' || question.character === 'victoria'
    ? 'adult'
    : question.character;
  return `src/data/${characterDir}/`;
}

function auditNormalizedQuestion(question: NormalizedQuestion): AuditedQuestion | null {
  if (!question.choices.length) return null;

  const choices: AuditedChoice[] = question.choices.map((choice, index) => {
    const issues = auditChoiceLabel(choice.id, choice.label, index);
    return {
      optionId: choice.id,
      label: choice.label,
      displayLabel: choice.label,
      letterIndex: index,
      issues,
    };
  });

  const issueCount = choices.reduce((sum, choice) => sum + choice.issues.length, 0);

  return {
    character: question.character,
    missionId: question.missionId,
    missionTitle: question.missionTitle,
    questionId: question.questionId,
    questionType: question.questionType,
    gradeBand: question.gradeBand,
    source: question.source,
    fileHint: fileHintForQuestion(question),
    choices,
    issueCount,
  };
}

function auditConfigQuestion(
  config: GameAssessmentConfig,
  question: GameChoiceQuestion,
  meta: { character: string; missionTitle: string },
): AuditedQuestion | null {
  const choices: AuditedChoice[] = question.options.map((choice, index) => {
    const issues = auditChoiceLabel(choice.id, choice.label, index);
    return {
      optionId: choice.id,
      label: choice.label,
      displayLabel: choice.label,
      letterIndex: index,
      issues,
    };
  });

  const issueCount = choices.reduce((sum, choice) => sum + choice.issues.length, 0);

  return {
    character: meta.character,
    missionId: config.id,
    missionTitle: meta.missionTitle,
    questionId: question.id,
    questionType: question.type,
    gradeBand: 'all',
    source: 'static_config',
    fileHint: 'src/data/miranda/',
    choices,
    issueCount,
  };
}

function collectStaticMirandaConfigs(): AuditedQuestion[] {
  const configs: Array<{ config: GameAssessmentConfig; title: string }> = [
    { config: MIRANDA_FILE_3_CONFIG, title: 'The Missing Letters' },
    { config: MIRANDA_FILE_4_CONFIG, title: 'The Context Clue Challenge' },
    { config: MIRANDA_FILE_5_CONFIG, title: "Miranda's Detective Notebook" },
  ];

  const rows: AuditedQuestion[] = [];
  for (const entry of configs) {
    for (const question of entry.config.questions) {
      if (!isChoiceQuestion(question)) continue;
      const audited = auditConfigQuestion(entry.config, question, {
        character: 'miranda',
        missionTitle: entry.title,
      });
      if (audited) rows.push(audited);
    }
  }
  return rows;
}

function dedupeQuestions(rows: AuditedQuestion[]): AuditedQuestion[] {
  const map = new Map<string, AuditedQuestion>();
  for (const row of rows) {
    const key = `${row.missionId}::${row.questionId}::${row.gradeBand}::${row.source}`;
    const existing = map.get(key);
    if (!existing || row.issueCount > existing.issueCount) {
      map.set(key, row);
    }
  }
  return Array.from(map.values());
}

function buildReport(): LiteracyMcAuditReport {
  const production = collectProductionQuestions().filter(shouldAuditQuestion);
  const allQuestions = collectAllQuestions().filter(shouldAuditQuestion);

  const fromNormalized = [...production, ...allQuestions]
    .map(auditNormalizedQuestion)
    .filter((row): row is AuditedQuestion => row != null);

  const fromStatic = collectStaticMirandaConfigs();
  const merged = dedupeQuestions([...fromNormalized, ...fromStatic]);
  const questionsWithIssues = merged.filter((row) => row.issueCount > 0);

  const issuesByCode: Record<ChoiceLabelIssueCode, number> = {
    letter_prefix_in_label: 0,
    option_id_concatenated: 0,
    label_equals_id: 0,
    label_exposes_internal_id: 0,
    empty_label: 0,
  };

  let choicesScanned = 0;
  let choicesWithIssues = 0;

  for (const question of merged) {
    for (const choice of question.choices) {
      choicesScanned += 1;
      if (choice.issues.length > 0) {
        choicesWithIssues += 1;
        for (const issue of choice.issues) {
          issuesByCode[issue.code] += 1;
        }
      }
    }
  }

  const missionIssueCounts = new Map<string, { title: string; issueCount: number }>();
  for (const question of questionsWithIssues) {
    const current = missionIssueCounts.get(question.missionId) ?? {
      title: question.missionTitle,
      issueCount: 0,
    };
    current.issueCount += question.issueCount;
    missionIssueCounts.set(question.missionId, current);
  }

  const priorityScanned = Object.keys(PRIORITY_MISSIONS).filter((missionId) =>
    merged.some((row) => row.missionId === missionId),
  );
  const priorityWithIssues = Object.keys(PRIORITY_MISSIONS).filter((missionId) =>
    questionsWithIssues.some((row) => row.missionId === missionId),
  );

  const fixesApplied = [
    'Added src/lib/gameChoiceDisplay.ts to sanitize labels and detect letter/id concatenation.',
    'AnswerChoiceList now renders sanitized display text separate from option id and letter badge.',
    'Removed decorative A/B/C/D tiles from MirandaMissingLetterCard (clue card only).',
    'Disabled letter prefix badges for missing_letter answers (full words shown without A/B/C/D).',
  ];

  const affectedFiles = [
    'src/lib/gameChoiceDisplay.ts',
    'src/lib/__tests__/gameChoiceDisplay.test.ts',
    'src/design-system/game/AnswerChoiceList.tsx',
    'src/components/miranda/MirandaMissingLetterCard.tsx',
    'src/components/game-assessment/GameQuestionRenderer.tsx',
    'scripts/audit-mc-choice-labels.ts',
  ];

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      questionsScanned: merged.length,
      choicesScanned,
      questionsWithIssues: questionsWithIssues.length,
      choicesWithIssues,
      issuesByCode,
      priorityMissionsScanned: priorityScanned,
      priorityMissionsWithIssues: priorityWithIssues,
    },
    fixesApplied,
    affectedFiles,
    affectedMissions: Array.from(missionIssueCounts.entries())
      .map(([missionId, meta]) => ({ missionId, title: meta.title, issueCount: meta.issueCount }))
      .sort((a, b) => b.issueCount - a.issueCount),
    questionsWithIssues,
  };
}

function generateMarkdown(report: LiteracyMcAuditReport): string {
  const lines: string[] = [
    '# Literacy & Multiple-Choice Label Audit',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Questions scanned: **${report.summary.questionsScanned}**`,
    `- Choices scanned: **${report.summary.choicesScanned}**`,
    `- Questions with issues: **${report.summary.questionsWithIssues}**`,
    `- Choices with issues: **${report.summary.choicesWithIssues}**`,
    '',
    '### Issues by code',
    '',
    ...Object.entries(report.summary.issuesByCode).map(
      ([code, count]) => `- \`${code}\`: ${count}`,
    ),
    '',
    '### Priority missions',
    '',
    `- Scanned: ${report.summary.priorityMissionsScanned.map((id) => PRIORITY_MISSIONS[id]?.title ?? id).join(', ') || 'none'}`,
    `- With issues: ${report.summary.priorityMissionsWithIssues.map((id) => PRIORITY_MISSIONS[id]?.title ?? id).join(', ') || 'none'}`,
    '',
    '## Fixes applied',
    '',
    ...report.fixesApplied.map((fix) => `- ${fix}`),
    '',
    '## Affected files',
    '',
    ...report.affectedFiles.map((file) => `- \`${file}\``),
    '',
    '## Affected missions',
    '',
  ];

  if (report.affectedMissions.length === 0) {
    lines.push('- No mission content issues found.');
  } else {
    for (const mission of report.affectedMissions) {
      lines.push(`- **${mission.title}** (\`${mission.missionId}\`): ${mission.issueCount} issue(s)`);
    }
  }

  if (report.questionsWithIssues.length > 0) {
    lines.push('', '## Question details', '');
    for (const question of report.questionsWithIssues.slice(0, 40)) {
      lines.push(
        `### ${question.missionTitle} — ${question.questionId} (${question.gradeBand})`,
        '',
        `- Type: \`${question.questionType}\``,
        `- Source: \`${question.source}\``,
        '',
      );
      for (const choice of question.choices) {
        if (choice.issues.length === 0) continue;
        lines.push(`- **${choice.optionId}** "${choice.label}"`);
        for (const issue of choice.issues) {
          lines.push(`  - \`${issue.code}\`: ${issue.message}`);
        }
      }
      lines.push('');
    }
    if (report.questionsWithIssues.length > 40) {
      lines.push(`_…and ${report.questionsWithIssues.length - 40} more. See JSON report._`);
    }
  } else {
    lines.push('', '## Question details', '', 'All scanned literacy and priority-mission choices passed validation.');
  }

  return lines.join('\n');
}

function main(): void {
  const report = buildReport();
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  fs.writeFileSync(MD_PATH, generateMarkdown(report), 'utf8');

  console.log(`Literacy MC audit complete.`);
  console.log(`  Questions scanned: ${report.summary.questionsScanned}`);
  console.log(`  Choices with issues: ${report.summary.choicesWithIssues}`);
  console.log(`  JSON: ${JSON_PATH}`);
  console.log(`  Markdown: ${MD_PATH}`);

  if (report.summary.choicesWithIssues > 0) {
    process.exitCode = 1;
  }
}

main();
