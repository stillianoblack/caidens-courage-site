#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { auditAllQuestions } from '../question-audit/auditHeuristics';
import { collectAllQuestions, indexToLetter } from '../question-audit/collectQuestions';
import type { AuditedQuestion } from '../question-audit/types';
import {
  analyzeGoldPatterns,
  buildGoldRubric,
  classifyBelowFour,
  inferReasoningLabel,
} from './goldStandardRubric';
import { rankStrongest } from './top25Ranking';
import type { StagingManifest } from './types';

const ROOT = path.resolve(__dirname, '../..');
const MANIFEST_PATH = path.join(ROOT, 'src/data/staging/manifest.json');
const REPORTS_DIR = path.join(ROOT, 'reports');
const CHOICE_IDS = ['a', 'b', 'c', 'd'] as const;

function manifestToNormalized(manifest: StagingManifest) {
  const production = collectAllQuestions();
  const byId = new Map(production.map((q) => [q.questionId, q]));
  return Object.values(manifest.overrides).map((override) => {
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

async function writeRubricPdf(
  rubric: ReturnType<typeof buildGoldRubric>,
  goldQuestions: AuditedQuestion[],
  outputPath: string,
): Promise<void> {
  const PDFDocument = (await import('pdfkit')).default;
  const M = 48;
  const W = 612 - M * 2;
  const stats = rubric.goldPatterns;

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: M, size: 'LETTER' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const heading = (t: string) => {
      if (doc.y > 680) doc.addPage();
      doc.moveDown(0.4);
      doc.font('Helvetica-Bold').fontSize(13).text(t);
      doc.font('Helvetica').fontSize(9);
    };

    doc.font('Helvetica-Bold').fontSize(22).text("Gold Standard Question Rubric", M, 52);
    doc.font('Helvetica').fontSize(10).fillColor('#444');
    doc.text("Derived from top 25 strongest staging v4 questions", M, 78);
    doc.text(`Generated ${new Date().toLocaleString()}`, M, 94);
    doc.fillColor('#000');

    doc.addPage();
    heading('Pattern Analysis (Top 25 Strongest)');
    doc.text(`Sample size: ${stats.count} questions`);
    doc.text(`Average scenario length: ${stats.avgScenarioWords.toFixed(0)} words`);
    doc.text(`Average question stem: ${stats.avgQuestionWords.toFixed(0)} words`);
    doc.text(`Average choice label length: ${stats.avgChoiceLength.toFixed(0)} characters`);
    doc.text(`Zero quality flags: ${stats.zeroFlagsPct.toFixed(0)}%`);
    doc.text(`Comparison / best-choice stems: ${stats.comparisonStemPct.toFixed(0)}%`);
    doc.text(`Grade bands: ${JSON.stringify(stats.gradeBandBreakdown)}`);
    doc.text(`Characters: ${JSON.stringify(stats.characterBreakdown)}`);
    doc.text(`Correct position spread: A=${stats.positionDistribution.A} B=${stats.positionDistribution.B} C=${stats.positionDistribution.C} D=${stats.positionDistribution.D}`);

    for (const tier of rubric.tiers) {
      doc.addPage();
      heading(`${tier.title}`);
      doc.text(tier.summary);
      doc.moveDown(0.3);
      tier.criteria.forEach((c) => doc.text(`• ${c}`, { width: W }));
    }

    doc.addPage();
    heading('Common Anti-Patterns');
    rubric.antiPatterns.forEach((a) => doc.text(`• ${a}`, { width: W }));

    doc.addPage();
    heading('Distractor Guidelines');
    rubric.distractorGuidelines.forEach((d) => doc.text(`• ${d}`, { width: W }));

    doc.addPage();
    heading('Grade-Band Guidelines');
    for (const [band, lines] of Object.entries(rubric.gradeBandGuidelines)) {
      doc.font('Helvetica-Bold').text(band);
      doc.font('Helvetica');
      lines.forEach((l) => doc.text(`  • ${l}`));
      doc.moveDown(0.2);
    }

    doc.addPage();
    heading('Character-Specific Guidelines');
    for (const [character, lines] of Object.entries(rubric.characterGuidelines)) {
      doc.font('Helvetica-Bold').text(character.toUpperCase());
      doc.font('Helvetica');
      lines.forEach((l) => doc.text(`  • ${l}`));
      doc.moveDown(0.2);
    }

    doc.addPage();
    heading('Gold Standard Library — Top 10 Examples');
    goldQuestions.slice(0, 10).forEach((q, i) => {
      if (doc.y > 640) doc.addPage();
      doc.font('Helvetica-Bold').fontSize(10).text(`${i + 1}. ${q.questionId} (${q.character} · ${q.gradeBand})`);
      doc.font('Helvetica').fontSize(8);
      doc.text(`Q: ${q.questionText}`, { width: W });
      doc.text(`Reasoning: ${inferReasoningLabel(q)} · Score ${q.difficultyScore}/5`);
      doc.moveDown(0.3);
    });

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

async function writeBelowFourPdf(
  below: Array<{ q: AuditedQuestion; gaps: string[]; k1Expected: boolean }>,
  outputPath: string,
): Promise<void> {
  const PDFDocument = (await import('pdfkit')).default;
  const M = 48;
  const W = 612 - M * 2;

  const needsReview = below.filter((b) => !b.k1Expected);
  const k1Floor = below.filter((b) => b.k1Expected);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: M, size: 'LETTER' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(20).text('Questions Below 4/5', M, 52);
    doc.font('Helvetica').fontSize(10).fillColor('#444');
    doc.text('Rubric comparison — staging v4 (audit only, no rewrites)', M, 78);
    doc.text(`Generated ${new Date().toLocaleString()}`, M, 94);
    doc.fillColor('#000');

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(12).text('Summary');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Total below 4/5: ${below.length}`);
    doc.text(`K–1 expected floor (3/5): ${k1Floor.length}`);
    doc.text(`Needs review before publish: ${needsReview.length}`);
    doc.moveDown(0.5);

    if (needsReview.length > 0) {
      doc.font('Helvetica-Bold').text('Priority review (non–K-1 below 4/5)');
      doc.font('Helvetica').fontSize(9);
      needsReview.forEach((entry, i) => {
        if (doc.y > 700) doc.addPage();
        const q = entry.q;
        doc.font('Helvetica-Bold').text(`${i + 1}. ${q.questionId} — ${q.character} / ${q.missionTitle} / ${q.gradeBand}`);
        doc.font('Helvetica');
        doc.text(`Score: ${q.difficultyScore}/5 · Flags: ${q.flags.join(', ') || 'none'}`);
        doc.text(`Gap: ${entry.gaps.join('; ')}`);
        doc.text(`Q: ${q.questionText}`, { width: W });
        doc.moveDown(0.4);
      });
    }

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(12).text(`K–1 Floor (${k1Floor.length} questions at 3/5)`);
    doc.font('Helvetica').fontSize(8);
    doc.text('These meet age-appropriate ceiling; listed for completeness, not urgent rewrite.');
    doc.moveDown(0.3);
    k1Floor.forEach((entry, i) => {
      if (doc.y > 720) doc.addPage();
      doc.text(`${i + 1}. ${entry.q.questionId} (${entry.q.character} · ${entry.q.missionId})`);
    });

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

async function main(): Promise<void> {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('[gold-standard] Run npm run rewrite:staging:difficulty first');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as StagingManifest;
  const normalized = manifestToNormalized(manifest);
  const audit = auditAllQuestions(normalized);
  const top25 = rankStrongest(audit.questions)
    .slice(0, 25)
    .map((e) => e.question);

  const stats = analyzeGoldPatterns(top25);
  const rubric = buildGoldRubric(stats);

  const belowAll = audit.questions
    .map((q) => {
      const { belowThreshold, rubricGap, k1Expected } = classifyBelowFour(q);
      return belowThreshold ? { q, gaps: rubricGap, k1Expected } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => {
      if (a.k1Expected !== b.k1Expected) return a.k1Expected ? 1 : -1;
      return a.q.difficultyScore - b.q.difficultyScore;
    });

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const library = top25.map((q, i) => ({
    rank: i + 1,
    questionId: q.questionId,
    character: q.character,
    missionId: q.missionId,
    missionTitle: q.missionTitle,
    gradeBand: q.gradeBand,
    difficultyScore: q.difficultyScore,
    reasoningType: inferReasoningLabel(q),
    scenarioWords: q.scenarioText.trim().split(/\s+/).filter(Boolean).length,
    questionText: q.questionText,
    scenarioText: q.scenarioText,
    choices: q.choices.map((c) => ({ label: c.label, correct: c.id === q.correctAnswerId })),
    correctPosition: indexToLetter(q.correctIndex),
    flags: q.flags,
  }));

  fs.writeFileSync(
    path.join(REPORTS_DIR, 'gold-standard-question-library.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), library, patternStats: stats }, null, 2),
  );

  fs.writeFileSync(
    path.join(REPORTS_DIR, 'gold-standard-question-rubric.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), rubric }, null, 2),
  );

  fs.writeFileSync(
    path.join(REPORTS_DIR, 'questions-below-4.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalBelow4: belowAll.length,
        needsReview: belowAll.filter((b) => !b.k1Expected).length,
        k1ExpectedFloor: belowAll.filter((b) => b.k1Expected).length,
        questions: belowAll.map((b) => ({
          questionId: b.q.questionId,
          character: b.q.character,
          missionId: b.q.missionId,
          missionTitle: b.q.missionTitle,
          gradeBand: b.q.gradeBand,
          difficultyScore: b.q.difficultyScore,
          flags: b.q.flags,
          rubricGaps: b.gaps,
          k1Expected: b.k1Expected,
          questionText: b.q.questionText,
        })),
      },
      null,
      2,
    ),
  );

  const rubricPdf = path.join(REPORTS_DIR, 'gold-standard-question-rubric.pdf');
  const belowPdf = path.join(REPORTS_DIR, 'questions-below-4.pdf');

  await writeRubricPdf(rubric, top25, rubricPdf);
  await writeBelowFourPdf(belowAll, belowPdf);

  console.log('[gold-standard] Reports generated');
  console.log(`  Rubric PDF: ${rubricPdf}`);
  console.log(`  Below 4/5 PDF: ${belowPdf}`);
  console.log(`  Gold library: ${path.join(REPORTS_DIR, 'gold-standard-question-library.json')}`);
  console.log('');
  console.log(`  Top 25 patterns: ~${stats.avgScenarioWords.toFixed(0)} word scenarios, ${stats.zeroFlagsPct.toFixed(0)}% zero flags`);
  console.log(`  Below 4/5: ${belowAll.length} total (${belowAll.filter((b) => !b.k1Expected).length} need review, ${belowAll.filter((b) => b.k1Expected).length} K-1 expected)`);
}

main().catch((err) => {
  console.error('[gold-standard] Failed:', err);
  process.exit(1);
});
