#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { auditAllQuestions } from '../question-audit/auditHeuristics';
import { collectAllQuestions, indexToLetter } from '../question-audit/collectQuestions';
import type { AuditedQuestion, AuditReport, NormalizedQuestion } from '../question-audit/types';
import { generatePdfReport } from '../question-audit/generatePdf';
import type { StagingManifest } from '../question-rewrite/types';

const ROOT = path.resolve(__dirname, '../..');
const MANIFEST_PATH = path.join(ROOT, 'src/data/staging/manifest.json');
const REPORTS_DIR = path.join(ROOT, 'reports');

const CHOICE_IDS = ['a', 'b', 'c', 'd'] as const;

function manifestToNormalized(manifest: StagingManifest): NormalizedQuestion[] {
  const production = collectAllQuestions();
  const byId = new Map(production.map((q) => [q.questionId, q]));

  return Object.values(manifest.overrides).map((override) => {
    const base = byId.get(override.questionId);
    if (!base) {
      throw new Error(`Missing production question for override ${override.questionId}`);
    }
    const options = override.choices.map((label, index) => ({
      id: CHOICE_IDS[index],
      label,
    }));
    return {
      ...base,
      scenarioText: override.scenarioText ?? base.scenarioText,
      questionText: override.questionText,
      choices: options,
      correctAnswerId: CHOICE_IDS[override.correctIndex],
      correctAnswerLabel: override.choices[override.correctIndex],
      correctIndex: override.correctIndex,
      skillTags: override.skillTags ?? base.skillTags,
    };
  });
}

function avgDifficultyByMission(questions: AuditedQuestion[]): Record<string, number> {
  const map: Record<string, number[]> = {};
  for (const q of questions) {
    const key = `${q.character}::${q.missionId}`;
    map[key] = map[key] ?? [];
    map[key].push(q.difficultyScore);
  }
  const result: Record<string, number> = {};
  for (const [key, scores] of Object.entries(map)) {
    result[key] = scores.reduce((a, b) => a + b, 0) / scores.length;
  }
  return result;
}

function readingLevelStats(questions: AuditedQuestion[]): Record<string, { flagged: number; total: number }> {
  const stats: Record<string, { flagged: number; total: number }> = {};
  for (const q of questions) {
    stats[q.character] = stats[q.character] ?? { flagged: 0, total: 0 };
    stats[q.character].total += 1;
    if (q.flags.includes('reading_level_below_band')) stats[q.character].flagged += 1;
  }
  return stats;
}

function formatExample(before: StagingManifest['beforeSnapshots'][string], after: AuditedQuestion): string {
  return `#### ${before.questionId} (${before.character} / ${before.missionId} / ${before.gradeBand})

**Before (${indexToLetter(before.correctIndex)} correct):** ${before.questionText}

Choices: ${before.choices.map((c, i) => `${indexToLetter(i)}. ${c}`).join(' | ')}

**After (${indexToLetter(after.correctIndex)} correct, difficulty ${after.difficultyScore}/5):** ${after.questionText}

Choices: ${after.choices.map((c, i) => `${indexToLetter(i)}. ${c.label}${c.id === after.correctAnswerId ? ' ✓' : ''}`).join(' | ')}

Flags remaining: ${after.flags.join(', ') || 'none'}
`;
}

function generateV2Markdown(
  beforeReport: AuditReport,
  afterReport: AuditReport,
  manifest: StagingManifest,
  examples: { before: StagingManifest['beforeSnapshots'][string]; after: AuditedQuestion }[],
): string {
  const lines: string[] = [];
  lines.push('# Question Quality Audit v2 — Staging Rewrites');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Staging version: ${manifest.version}`);
  lines.push(`Questions rewritten: ${manifest.totalQuestions}`);
  lines.push('');

  lines.push('## Summary Comparison');
  lines.push('');
  lines.push('| Metric | Before | After |');
  lines.push('|--------|--------|-------|');
  lines.push(`| Total questions | ${beforeReport.summary.totalQuestions} | ${afterReport.summary.totalQuestions} |`);
  lines.push(
    `| High priority rewrites | ${beforeReport.summary.rewritePriorityCounts.high} | ${afterReport.summary.rewritePriorityCounts.high} |`,
  );
  lines.push(
    `| Medium priority | ${beforeReport.summary.rewritePriorityCounts.medium} | ${afterReport.summary.rewritePriorityCounts.medium} |`,
  );
  lines.push(
    `| Low priority | ${beforeReport.summary.rewritePriorityCounts.low} | ${afterReport.summary.rewritePriorityCounts.low} |`,
  );
  lines.push('');

  lines.push('### Average Difficulty by Character');
  lines.push('');
  lines.push('| Character | Before | After |');
  lines.push('|-----------|--------|-------|');
  const characters = [...new Set(afterReport.questions.map((q) => q.character))].sort();
  for (const character of characters) {
    const before = beforeReport.summary.averageDifficultyByCharacter[character]?.toFixed(2) ?? '—';
    const after = afterReport.summary.averageDifficultyByCharacter[character]?.toFixed(2) ?? '—';
    lines.push(`| ${character} | ${before} | ${after} |`);
  }
  lines.push('');

  lines.push('### Flag Count Comparison');
  lines.push('');
  const allFlags = new Set([
    ...Object.keys(beforeReport.summary.flagCounts),
    ...Object.keys(afterReport.summary.flagCounts),
  ]);
  lines.push('| Flag | Before | After |');
  lines.push('|------|--------|-------|');
  for (const flag of [...allFlags].sort()) {
    lines.push(
      `| ${flag} | ${beforeReport.summary.flagCounts[flag as keyof typeof beforeReport.summary.flagCounts] ?? 0} | ${afterReport.summary.flagCounts[flag as keyof typeof afterReport.summary.flagCounts] ?? 0} |`,
    );
  }
  lines.push('');

  lines.push('### Answer Position Distribution (After)');
  lines.push('');
  lines.push('| Character | A | B | C | D |');
  lines.push('|-----------|---|---|---|---|');
  for (const character of characters) {
    const dist = afterReport.summary.positionDistributionByCharacter[character];
    lines.push(`| ${character} | ${dist.A} | ${dist.B} | ${dist.C} | ${dist.D} |`);
  }
  lines.push('');

  lines.push('### Reading Level Flags by Character (After)');
  lines.push('');
  const reading = readingLevelStats(afterReport.questions);
  lines.push('| Character | Below-band flags | Total |');
  lines.push('|-----------|------------------|-------|');
  for (const character of characters) {
    const row = reading[character];
    lines.push(`| ${character} | ${row?.flagged ?? 0} | ${row?.total ?? 0} |`);
  }
  lines.push('');

  lines.push('### Average Difficulty by Mission (After)');
  lines.push('');
  const missionAvgs = avgDifficultyByMission(afterReport.questions);
  lines.push('| Mission | Avg difficulty |');
  lines.push('|---------|------------------|');
  for (const [mission, avg] of Object.entries(missionAvgs).sort()) {
    lines.push(`| ${mission} | ${avg.toFixed(2)} |`);
  }
  lines.push('');

  lines.push('## Before / After Examples (Top 12 improved)');
  lines.push('');
  for (const ex of examples) {
    lines.push(formatExample(ex.before, ex.after));
    lines.push('');
  }

  lines.push('## Remaining Issues (After)');
  lines.push('');
  const remaining = afterReport.questions.filter((q) => q.flags.length > 0);
  lines.push(`Questions with flags: ${remaining.length}`);
  lines.push('');
  remaining.slice(0, 30).forEach((q) => {
    lines.push(`- \`${q.questionId}\` (${q.character}) — ${q.flags.join(', ')}`);
  });
  if (remaining.length > 30) {
    lines.push(`- _…and ${remaining.length - 30} more_`);
  }
  lines.push('');

  lines.push('## Recommendations');
  lines.push('');
  lines.push('1. Review staging in app: `REACT_APP_STAGING_QUESTIONS=true yarn start`');
  lines.push('2. Spot-check Caiden math-enhanced questions for scenario fit');
  lines.push('3. Promote approved overrides to production mission files when ready');
  lines.push('4. Re-run `npm run audit:questions:v2` after any manual edits to manifest');
  lines.push('');
  lines.push('_Production mission files were not modified. Staging manifest only._');

  return lines.join('\n');
}

async function main(): Promise<void> {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('[audit:v2] Run npm run rewrite:staging first');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as StagingManifest;

  console.log('[audit:v2] Auditing production (before)…');
  const beforeReport = auditAllQuestions(collectAllQuestions());

  console.log('[audit:v2] Auditing staging (after)…');
  const afterQuestions = manifestToNormalized(manifest);
  const afterReport = auditAllQuestions(afterQuestions);

  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const v2Json = {
    generatedAt: new Date().toISOString(),
    before: beforeReport.summary,
    after: afterReport.summary,
    missionDifficultyAfter: avgDifficultyByMission(afterReport.questions),
    readingLevelAfter: readingLevelStats(afterReport.questions),
  };
  fs.writeFileSync(path.join(REPORTS_DIR, 'question-audit-v2.json'), JSON.stringify(v2Json, null, 2));

  const beforeById = new Map(beforeReport.questions.map((q) => [q.questionId, q]));
  const improved = afterReport.questions
    .map((after) => {
      const before = beforeById.get(after.questionId);
      if (!before) return null;
      const flagDelta = before.flags.length - after.flags.length;
      const diffDelta = after.difficultyScore - before.difficultyScore;
      return { after, before, score: flagDelta * 2 + diffDelta };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  const examples = improved.map(({ after, before }) => ({
    before: manifest.beforeSnapshots[before.questionId],
    after,
  }));

  const markdown = generateV2Markdown(beforeReport, afterReport, manifest, examples);
  fs.writeFileSync(path.join(REPORTS_DIR, 'question-audit-v2.md'), markdown);

  console.log('[audit:v2] Generating PDF…');
  await generatePdfReport(afterReport, path.join(REPORTS_DIR, 'question-audit-v2.pdf'));

  // Extended PDF content: prepend comparison via markdown is separate; PDF uses after report
  // Write a comparison summary file for PDF appendix
  const comparisonPdfPath = path.join(REPORTS_DIR, 'question-audit-v2-comparison.pdf');
  await generateComparisonPdf(beforeReport, afterReport, examples, comparisonPdfPath);

  console.log('');
  console.log('=== v2 Audit Summary ===');
  console.log(`High priority: ${beforeReport.summary.rewritePriorityCounts.high} → ${afterReport.summary.rewritePriorityCounts.high}`);
  console.log(`Obvious answer flags: ${beforeReport.summary.flagCounts.correct_answer_too_obvious ?? 0} → ${afterReport.summary.flagCounts.correct_answer_too_obvious ?? 0}`);
  console.log(`Joke distractor flags: ${beforeReport.summary.flagCounts.joke_or_impossible_distractor ?? 0} → ${afterReport.summary.flagCounts.joke_or_impossible_distractor ?? 0}`);
  console.log(`Caiden avg difficulty: ${beforeReport.summary.averageDifficultyByCharacter.caiden?.toFixed(2)} → ${afterReport.summary.averageDifficultyByCharacter.caiden?.toFixed(2)}`);
  console.log('');
  console.log(`Wrote ${path.join(REPORTS_DIR, 'question-audit-v2.pdf')}`);
}

async function generateComparisonPdf(
  before: AuditReport,
  after: AuditReport,
  examples: { before: StagingManifest['beforeSnapshots'][string]; after: AuditedQuestion }[],
  outputPath: string,
): Promise<void> {
  const PDFDocument = (await import('pdfkit')).default;
  const fsMod = await import('fs');

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: 'LETTER' });
    const stream = fsMod.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(22).text('Question Audit v2 — Before/After', 48, 60);
    doc.font('Helvetica').fontSize(11).text(`Generated ${new Date().toLocaleString()}`, 48, 90);

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Summary Comparison');
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10);
    doc.text(`High priority: ${before.summary.rewritePriorityCounts.high} → ${after.summary.rewritePriorityCounts.high}`);
    doc.text(`Obvious answers: ${before.summary.flagCounts.correct_answer_too_obvious ?? 0} → ${after.summary.flagCounts.correct_answer_too_obvious ?? 0}`);
    doc.text(`Joke distractors: ${before.summary.flagCounts.joke_or_impossible_distractor ?? 0} → ${after.summary.flagCounts.joke_or_impossible_distractor ?? 0}`);

    doc.moveDown();
    doc.font('Helvetica-Bold').text('Difficulty by Character (after)');
    doc.font('Helvetica');
    for (const [character, avg] of Object.entries(after.summary.averageDifficultyByCharacter).sort()) {
      const beforeAvg = before.summary.averageDifficultyByCharacter[character]?.toFixed(2) ?? '—';
      doc.text(`${character}: ${beforeAvg} → ${avg.toFixed(2)}`);
    }

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Before / After Examples');
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(9);

    for (const ex of examples.slice(0, 8)) {
      if (doc.y > 680) doc.addPage();
      doc.font('Helvetica-Bold').text(`${ex.before.questionId} (${ex.before.character})`);
      doc.font('Helvetica');
      doc.text(`Before: ${ex.before.questionText}`);
      doc.text(`After: ${ex.after.questionText}`);
      doc.moveDown(0.4);
    }

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });

  // Merge isn't trivial with pdfkit — user asked for question-audit-v2.pdf
  // Overwrite v2 pdf with richer version by regenerating
  await generateRichV2Pdf(before, after, examples, path.join(REPORTS_DIR, 'question-audit-v2.pdf'));
}

async function generateRichV2Pdf(
  before: AuditReport,
  after: AuditReport,
  examples: { before: StagingManifest['beforeSnapshots'][string]; after: AuditedQuestion }[],
  outputPath: string,
): Promise<void> {
  const PDFDocument = (await import('pdfkit')).default;
  const fsMod = await import('fs');
  const MARGIN = 48;

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: 'LETTER' });
    const stream = fsMod.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(24).text("Caiden's Courage", MARGIN, 100);
    doc.fontSize(18).text('Question Quality Audit v2 — Staging Rewrites');
    doc.font('Helvetica').fontSize(11).text(`Generated ${new Date().toLocaleString()}`, MARGIN, doc.y + 10);

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Executive Summary');
    doc.moveDown(0.4);
    doc.font('Helvetica').fontSize(10);
    doc.text(`Total questions: ${after.summary.totalQuestions}`);
    doc.text(`High priority rewrites: ${before.summary.rewritePriorityCounts.high} → ${after.summary.rewritePriorityCounts.high}`);
    doc.text(`Obvious answer flags: ${before.summary.flagCounts.correct_answer_too_obvious ?? 0} → ${after.summary.flagCounts.correct_answer_too_obvious ?? 0}`);
    doc.text(`Joke distractor flags: ${before.summary.flagCounts.joke_or_impossible_distractor ?? 0} → ${after.summary.flagCounts.joke_or_impossible_distractor ?? 0}`);
    doc.text(`Length imbalance flags: ${before.summary.flagCounts.answer_length_imbalance ?? 0} → ${after.summary.flagCounts.answer_length_imbalance ?? 0}`);

    doc.moveDown();
    doc.font('Helvetica-Bold').text('Difficulty by Character');
    doc.font('Helvetica');
    for (const [character, avg] of Object.entries(after.summary.averageDifficultyByCharacter).sort()) {
      const b = before.summary.averageDifficultyByCharacter[character]?.toFixed(2) ?? '—';
      doc.text(`${character}: ${b} → ${avg.toFixed(2)} / 5`);
    }

    doc.moveDown();
    doc.font('Helvetica-Bold').text('Answer Position Distribution (After)');
    doc.font('Helvetica');
    for (const [character, dist] of Object.entries(after.summary.positionDistributionByCharacter).sort()) {
      doc.text(`${character}: A=${dist.A} B=${dist.B} C=${dist.C} D=${dist.D}`);
    }

    doc.moveDown();
    doc.font('Helvetica-Bold').text('Remaining Flag Counts (After)');
    doc.font('Helvetica');
    const flags = Object.entries(after.summary.flagCounts).sort((a, b) => b[1] - a[1]);
    if (flags.length === 0) doc.text('None');
    else flags.forEach(([flag, count]) => doc.text(`${flag}: ${count}`));

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Before / After Examples');
    doc.moveDown(0.4);
    doc.font('Helvetica').fontSize(9);
    for (const ex of examples) {
      if (doc.y > 650) doc.addPage();
      doc.font('Helvetica-Bold').text(`${ex.before.questionId} — ${ex.before.character} / ${ex.before.gradeBand}`);
      doc.font('Helvetica');
      doc.text(`BEFORE (${['A','B','C','D'][ex.before.correctIndex]}): ${ex.before.questionText}`);
      doc.text(`AFTER (${['A','B','C','D'][ex.after.correctIndex]}, diff ${ex.after.difficultyScore}/5): ${ex.after.questionText}`);
      doc.text(`Remaining flags: ${ex.after.flags.join(', ') || 'none'}`);
      doc.moveDown(0.5);
    }

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Recommendations');
    doc.font('Helvetica').fontSize(10);
    doc.text('• Preview staging: REACT_APP_STAGING_QUESTIONS=true yarn start');
    doc.text('• Review src/data/staging/manifest.json before promoting to production');
    doc.text('• Caiden should remain the most challenging character — spot-check math-enhanced items');
    doc.text('• Production mission files are unchanged until you approve deployment');

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

main().catch((error) => {
  console.error('[audit:v2] Failed:', error);
  process.exit(1);
});
