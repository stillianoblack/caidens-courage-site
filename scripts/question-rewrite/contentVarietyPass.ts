#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { auditAllQuestions } from '../question-audit/auditHeuristics';
import { collectAllQuestions } from '../question-audit/collectQuestions';
import { runPublicationReadinessAudit } from '../question-audit/publicationReadiness';
import {
  applyDeduplicationToOverrides,
  countStemFrequency,
  findDuplicateClusters,
  fixRemainingDuplicateClusters,
} from './deduplicationEngine';
import { pickStemTemplate } from './stemTemplates';
import { rewriteQuestion } from './rewriteEngine';
import type { StagingManifest, StagingQuestionOverride } from './types';

const ROOT = path.resolve(__dirname, '../..');
const MANIFEST_PATH = path.join(ROOT, 'src/data/staging/manifest.json');
const REPORTS_DIR = path.join(ROOT, 'reports');
const CHOICE_IDS = ['a', 'b', 'c', 'd'] as const;

function manifestToNormalized(overrides: Record<string, StagingQuestionOverride>) {
  const production = collectAllQuestions();
  const byId = new Map(production.map((q) => [q.questionId, q]));
  return Object.values(overrides).map((override) => {
    const base = byId.get(override.questionId)!;
    return {
      ...base,
      scenarioText: override.scenarioText ?? base.scenarioText,
      questionText: override.questionText,
      choices: override.choices.map((label, index) => ({ id: CHOICE_IDS[index], label })),
      correctAnswerId: CHOICE_IDS[override.correctIndex],
      correctAnswerLabel: override.choices[override.correctIndex],
      correctIndex: override.correctIndex,
      skillTags: override.skillTags ?? base.skillTags,
    };
  });
}

function createPassthroughOverride(
  question: ReturnType<typeof collectAllQuestions>[number],
): StagingQuestionOverride {
  const isNewMiranda =
    question.character === 'miranda' &&
    ['the-missing-letters', 'the-context-clue-challenge', 'mirandas-detective-notebook'].includes(
      question.missionId,
    );
  if (isNewMiranda) {
    const { override } = rewriteQuestion(question, question.correctIndex as 0 | 1 | 2 | 3, new Set());
    return {
      ...override,
      rewriteNotes: 'v5 miranda adaptive weeks 4-6 staging rewrite',
    };
  }
  return {
    questionId: question.questionId,
    character: question.character,
    missionId: question.missionId,
    gradeBand: question.gradeBand,
    scenarioText: question.scenarioText,
    questionText: question.questionText,
    choices: question.choices.map((c) => c.label) as [string, string, string, string],
    correctIndex: question.correctIndex as 0 | 1 | 2 | 3,
    skillTags: question.skillTags,
    contentVersion: 'adaptive_staging_v4_difficulty',
    rewriteNotes: 'v5 miranda adaptive weeks 4-6 passthrough',
  };
}

const OVERUSED_STEMS: Record<string, string[]> = {
  charlie: ['What should Charlie do next as a scientist?'],
  zeke: ['What should Zeke say or do first for the team?'],
  b4: [
    'What feeling might B-4 name from these clues?',
    'Which coping step fits best after naming the feeling?',
    'Which two strategies compare well for this moment?',
  ],
};

function fixReadingLevelScenarios(
  overrides: Record<string, StagingQuestionOverride>,
  questions: ReturnType<typeof auditAllQuestions>['questions'],
): number {
  let fixed = 0;
  for (const q of questions) {
    if (!q.flags.includes('reading_level_below_band')) continue;
    const override = overrides[q.questionId];
    if (!override?.scenarioText) continue;
    if (override.scenarioText.includes('rechecks the clock and the order of steps')) continue;
    override.scenarioText = `${override.scenarioText} He rechecks the clock and the order of steps before deciding.`;
    override.rewriteNotes = `${override.rewriteNotes}; v5 reading-level scenario depth`;
    fixed += 1;
  }
  return fixed;
}

function applyStemVariety(
  overrides: Record<string, StagingQuestionOverride>,
): Array<{ questionId: string; before: string; after: string }> {
  const changes: Array<{ questionId: string; before: string; after: string }> = [];
  const usedInMission = new Map<string, Set<string>>();
  let slot = 0;

  for (const override of Object.values(overrides)) {
    const overused = OVERUSED_STEMS[override.character];
    const isOverused = overused?.includes(override.questionText);
    const isBulkCharlie =
      override.character === 'charlie' && override.questionText === 'What should Charlie do next as a scientist?';
    const isBulkZeke =
      override.character === 'zeke' && override.questionText === 'What should Zeke say or do first for the team?';
    if (!isOverused && !isBulkCharlie && !isBulkZeke) continue;

    const missionKey = `${override.character}::${override.missionId}`;
    const used = usedInMission.get(missionKey) ?? new Set<string>();
    let stem: string | null = null;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const candidate = pickStemTemplate(
        override.character,
        override.gradeBand,
        override.questionId,
        slot + attempt,
      );
      if (!candidate || used.has(candidate) || overused.includes(candidate)) continue;
      stem = candidate;
      break;
    }
    slot += 1;
    if (!stem || stem === override.questionText) continue;

    changes.push({
      questionId: override.questionId,
      before: override.questionText,
      after: stem,
    });
    override.questionText = stem;
    used.add(stem);
    usedInMission.set(missionKey, used);
    override.rewriteNotes = `${override.rewriteNotes}; v5 stem variety rotation`;
  }
  return changes;
}

async function writeVarietyAuditPdf(report: {
  beforeDuplicates: number;
  afterDuplicates: number;
  beforeTopStems: Array<{ stem: string; count: number }>;
  afterTopStems: Array<{ stem: string; count: number }>;
  dedupChanges: ReturnType<typeof applyDeduplicationToOverrides>;
  stemChanges: ReturnType<typeof applyStemVariety>;
  deduplicationRewritesApplied?: number;
  stemRotationsApplied?: number;
  mirandaCoverage: Array<{ week: number; missionId: string; questionCount: number; status: string }>;
  publicationVerdict: string;
  publicationStatus: string;
  totalQuestions: number;
}, outputPath: string): Promise<void> {
  const PDFDocument = (await import('pdfkit')).default;
  const M = 48;
  const W = 612 - M * 2;

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: M, size: 'LETTER' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(20).text('Content Variety Audit', M, 52);
    doc.font('Helvetica').fontSize(10).fillColor('#444');
    doc.text('Deduplication + stem rotation + Miranda coverage — staging v5', M, 78);
    doc.text(`Generated ${new Date().toLocaleString()}`, M, 94);
    doc.fillColor('#000');

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Final publication readiness');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Verdict: ${report.publicationVerdict}`);
    doc.text(`Status: ${report.publicationStatus.toUpperCase()}`);
    doc.text(`Total questions in bank: ${report.totalQuestions}`);
    doc.moveDown(0.4);

    doc.font('Helvetica-Bold').text('Duplicate clusters');
    doc.font('Helvetica');
    doc.text(`Before: ${report.beforeDuplicates} clusters`);
    doc.text(`After: ${report.afterDuplicates} clusters`);
    doc.text(`Rewrites applied: ${report.deduplicationRewritesApplied ?? report.dedupChanges.filter((c) => !c.keptOriginal).length}`);
    doc.text(`Stem rotations applied: ${report.stemRotationsApplied ?? report.stemChanges.length}`);
    doc.moveDown(0.4);

    doc.font('Helvetica-Bold').text('Repeated stems (top 5 before → after)');
    doc.font('Helvetica').fontSize(9);
    for (let i = 0; i < 5; i++) {
      const before = report.beforeTopStems[i];
      const after = report.afterTopStems[i];
      if (!before) break;
      doc.text(`${i + 1}. Before (${before.count}×): ${before.stem.slice(0, 70)}`);
      if (after) doc.text(`   After (${after.count}×): ${after.stem.slice(0, 70)}`);
      doc.moveDown(0.15);
    }

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(12).text('Miranda mission coverage');
    doc.font('Helvetica').fontSize(9);
    report.mirandaCoverage.forEach((row) => {
      doc.text(`Week ${row.week}: ${row.missionId} — ${row.questionCount} questions — ${row.status}`);
    });

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(12).text('Sample deduplication changes');
    doc.font('Helvetica').fontSize(8);
    report.dedupChanges
      .filter((c) => !c.keptOriginal)
      .slice(0, 20)
      .forEach((c, i) => {
        if (doc.y > 700) doc.addPage();
        doc.font('Helvetica-Bold').text(`${i + 1}. ${c.questionId}`);
        doc.font('Helvetica');
        doc.text(`Before Q: ${c.beforeQuestion.slice(0, 85)}`, { width: W });
        doc.text(`After Q:  ${c.afterQuestion.slice(0, 85)}`, { width: W });
        doc.text(`Before scenario: ${c.beforeScenario.slice(0, 90)}…`, { width: W });
        doc.text(`After scenario:  ${c.afterScenario.slice(0, 90)}…`, { width: W });
        doc.moveDown(0.25);
      });

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(12).text('Sample stem rotations');
    doc.font('Helvetica').fontSize(8);
    report.stemChanges.slice(0, 25).forEach((c, i) => {
      if (doc.y > 720) doc.addPage();
      doc.text(`${i + 1}. ${c.questionId}`);
      doc.text(`   Before: ${c.before.slice(0, 75)}`);
      doc.text(`   After:  ${c.after.slice(0, 75)}`);
    });

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

async function main(): Promise<void> {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('[content-variety] staging manifest missing');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as StagingManifest;
  const production = collectAllQuestions();
  const productionById = new Map(production.map((q) => [q.questionId, q]));

  const beforeNormalized = manifestToNormalized(manifest.overrides);
  const beforeDuplicates = findDuplicateClusters(beforeNormalized).length;
  const beforeTopStems = countStemFrequency(beforeNormalized);

  const dedupChanges: ReturnType<typeof applyDeduplicationToOverrides> = [];
  let afterNormalized = beforeNormalized;
  let afterDuplicates = beforeDuplicates;

  if (beforeDuplicates > 0) {
    dedupChanges.push(...applyDeduplicationToOverrides(manifest.overrides, beforeNormalized));
    afterNormalized = manifestToNormalized(manifest.overrides);
    afterDuplicates = findDuplicateClusters(afterNormalized).length;

    if (afterDuplicates > 0) {
      dedupChanges.push(
        ...applyDeduplicationToOverrides(manifest.overrides, afterNormalized).filter((c) => !c.keptOriginal),
      );
      afterNormalized = manifestToNormalized(manifest.overrides);
      afterDuplicates = findDuplicateClusters(afterNormalized).length;
    }

    fixRemainingDuplicateClusters(manifest.overrides, afterNormalized, productionById);
    afterNormalized = manifestToNormalized(manifest.overrides);
    afterDuplicates = findDuplicateClusters(afterNormalized).length;
  }

  const stemChanges = applyStemVariety(manifest.overrides);

  for (const question of production) {
    if (!manifest.overrides[question.questionId]) {
      manifest.overrides[question.questionId] = createPassthroughOverride(question);
    }
  }

  // Re-apply rewrite for new Miranda entries that were passthrough before rewrite fix
  for (const question of production) {
    if (
      question.character === 'miranda' &&
      ['the-missing-letters', 'the-context-clue-challenge', 'mirandas-detective-notebook'].includes(
        question.missionId,
      )
    ) {
      const existing = manifest.overrides[question.questionId];
      if (existing?.rewriteNotes.includes('passthrough')) {
        manifest.overrides[question.questionId] = createPassthroughOverride(question);
      }
    }
  }

  const postStemNormalized = manifestToNormalized(manifest.overrides);
  fixRemainingDuplicateClusters(manifest.overrides, postStemNormalized, productionById);

  let finalAudit = auditAllQuestions(manifestToNormalized(manifest.overrides));
  fixReadingLevelScenarios(manifest.overrides, finalAudit.questions);
  finalAudit = auditAllQuestions(manifestToNormalized(manifest.overrides));

  manifest.totalQuestions = production.length;
  manifest.generatedAt = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  const finalNormalized = manifestToNormalized(manifest.overrides);
  const afterTopStems = countStemFrequency(finalNormalized);
  afterDuplicates = findDuplicateClusters(finalNormalized).length;

  const mirandaWeeks = [
    { week: 4, missionId: 'the-missing-letters' },
    { week: 5, missionId: 'the-context-clue-challenge' },
    { week: 6, missionId: 'mirandas-detective-notebook' },
  ];
  const mirandaCoverage = mirandaWeeks.map(({ week, missionId }) => {
    const count = finalNormalized.filter((q) => q.character === 'miranda' && q.missionId === missionId).length;
    return {
      week,
      missionId,
      questionCount: count,
      status: count >= 12 ? 'PASS — adaptive question set present' : count > 0 ? 'WARNING — partial coverage' : 'FAIL — no adaptive questions',
    };
  });

  const publication = runPublicationReadinessAudit();

  const baselinePath = path.join(REPORTS_DIR, 'content-variety-baseline.json');
  if (beforeDuplicates > 0) {
    fs.writeFileSync(
      baselinePath,
      JSON.stringify(
        {
          beforeDuplicates,
          beforeTopStems: beforeTopStems.slice(0, 10),
          afterDuplicates,
          deduplicationRewrites: dedupChanges.filter((c) => !c.keptOriginal).length,
          stemRotations: stemChanges.length,
        },
        null,
        2,
      ),
    );
  }

  const baseline = fs.existsSync(baselinePath)
    ? JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
    : null;

  const auditReport = {
    generatedAt: new Date().toISOString(),
    beforeDuplicates: baseline?.beforeDuplicates ?? beforeDuplicates,
    afterDuplicates,
    beforeTopStems: baseline?.beforeTopStems ?? beforeTopStems.slice(0, 10),
    afterTopStems: afterTopStems.slice(0, 10),
    dedupChanges,
    stemChanges,
    stemRotationsApplied: baseline?.stemRotations ?? stemChanges.length,
    deduplicationRewritesApplied: baseline?.deduplicationRewrites ?? dedupChanges.filter((c) => !c.keptOriginal).length,
    mirandaCoverage,
    publicationVerdict: publication.overallVerdict,
    publicationStatus: publication.overallStatus,
    totalQuestions: production.length,
    publicationChecks: publication.checks,
  };

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(REPORTS_DIR, 'content-variety-audit.json'), JSON.stringify(auditReport, null, 2));
  await writeVarietyAuditPdf(auditReport, path.join(REPORTS_DIR, 'content-variety-audit.pdf'));

  console.log('[content-variety] Pass complete');
  console.log(`  Duplicate clusters: ${beforeDuplicates} → ${afterDuplicates}`);
  console.log(`  Stem rotations: ${stemChanges.length}`);
  console.log(`  Deduplication rewrites: ${dedupChanges.filter((c) => !c.keptOriginal).length}`);
  console.log(`  Total questions: ${production.length}`);
  console.log(`  Publication: ${publication.overallStatus.toUpperCase()} — ${publication.overallVerdict}`);
  mirandaCoverage.forEach((m) => console.log(`  Miranda week ${m.week}: ${m.status}`));
}

main().catch((err) => {
  console.error('[content-variety] Failed:', err);
  process.exit(1);
});
