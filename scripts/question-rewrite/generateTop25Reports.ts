#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { auditAllQuestions } from '../question-audit/auditHeuristics';
import { collectAllQuestions } from '../question-audit/collectQuestions';
import type { StagingManifest } from './types';
import {
  formatChoices,
  rankStrongest,
  rankWeakest,
  type RankedQuestion,
} from './top25Ranking';

const ROOT = path.resolve(__dirname, '../..');
const MANIFEST_PATH = path.join(ROOT, 'src/data/staging/manifest.json');
const REPORTS_DIR = path.join(ROOT, 'reports');
const CHOICE_IDS = ['a', 'b', 'c', 'd'] as const;

function manifestToNormalized(manifest: StagingManifest) {
  const production = collectAllQuestions();
  const byId = new Map(production.map((q) => [q.questionId, q]));
  return Object.values(manifest.overrides).map((override) => {
    const base = byId.get(override.questionId)!;
    const options = override.choices.map((label, index) => ({ id: CHOICE_IDS[index], label }));
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

function renderQuestionBlock(entry: RankedQuestion, rank: number, mode: 'weak' | 'strong'): string {
  const q = entry.question;
  const lines: string[] = [];
  lines.push(`## ${rank}. ${q.questionId}`);
  lines.push('');
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| Character | ${q.character} |`);
  lines.push(`| Mission | ${q.missionTitle} (\`${q.missionId}\`) |`);
  lines.push(`| Week | ${q.week ?? '—'} |`);
  lines.push(`| Grade band | ${q.gradeBand} |`);
  lines.push(`| Difficulty | **${q.difficultyScore}/5** |`);
  lines.push(`| Flags | ${q.flags.join(', ') || 'none'} |`);
  lines.push('');
  lines.push(`**Scenario:** ${q.scenarioText || '(none)'}`);
  lines.push('');
  lines.push(`**Question:** ${q.questionText}`);
  lines.push('');
  lines.push('**Answers:**');
  lines.push('');
  lines.push('```');
  lines.push(formatChoices(q));
  lines.push('```');
  lines.push('');

  if (mode === 'weak') {
    lines.push('**Why it is weak:**');
    entry.weaknessReasons.forEach((r) => lines.push(`- ${r}`));
    lines.push('');
    lines.push('**Recommended replacement:**');
    lines.push(entry.recommendedReplacement || q.recommendedRewrite);
  } else {
    lines.push('**Why it is strong:**');
    entry.strengthReasons.forEach((r) => lines.push(`- ${r}`));
    lines.push('');
    lines.push(`**Difficulty reason:** ${q.difficultyReason}`);
  }

  lines.push('');
  return lines.join('\n');
}

async function writePdf(
  title: string,
  subtitle: string,
  entries: RankedQuestion[],
  mode: 'weak' | 'strong',
  outputPath: string,
): Promise<void> {
  const PDFDocument = (await import('pdfkit')).default;
  const MARGIN = 48;
  const WIDTH = 612 - MARGIN * 2;

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: 'LETTER' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(20).text(title, MARGIN, 56);
    doc.font('Helvetica').fontSize(11).fillColor('#444').text(subtitle, MARGIN, 82);
    doc.fontSize(10).text(`Generated ${new Date().toLocaleString()}`, MARGIN, 100);
    doc.fillColor('#000');

    doc.addPage();
    doc.font('Helvetica').fontSize(10);

    entries.forEach((entry, index) => {
      const q = entry.question;
      if (doc.y > 620) doc.addPage();

      doc.font('Helvetica-Bold').fontSize(11).text(`${index + 1}. ${q.questionId} (${q.character})`);
      doc.font('Helvetica').fontSize(9);
      doc.text(
        `${q.missionTitle} · week ${q.week ?? '?'} · ${q.gradeBand} · difficulty ${q.difficultyScore}/5`,
      );
      doc.text(`Flags: ${q.flags.join(', ') || 'none'}`);
      doc.moveDown(0.2);

      const scenario = q.scenarioText || '(none)';
      doc.text(`Scenario: ${scenario.length > 220 ? `${scenario.slice(0, 217)}…` : scenario}`, {
        width: WIDTH,
      });
      doc.text(`Question: ${q.questionText}`, { width: WIDTH });
      doc.moveDown(0.15);
      q.choices.forEach((c, ci) => {
        const mark = c.id === q.correctAnswerId ? ' ✓' : '';
        doc.text(`${['A', 'B', 'C', 'D'][ci]}. ${c.label}${mark}`);
      });
      doc.moveDown(0.2);

      if (mode === 'weak') {
        doc.font('Helvetica-Bold').text('Why weak:');
        doc.font('Helvetica');
        entry.weaknessReasons.forEach((r) => doc.text(`• ${r}`));
        doc.moveDown(0.15);
        doc.font('Helvetica-Bold').text('Recommended replacement:');
        doc.font('Helvetica');
        const rec = entry.recommendedReplacement || q.recommendedRewrite;
        doc.text(rec.length > 400 ? `${rec.slice(0, 397)}…` : rec, { width: WIDTH });
      } else {
        doc.font('Helvetica-Bold').text('Why strong:');
        doc.font('Helvetica');
        entry.strengthReasons.forEach((r) => doc.text(`• ${r}`));
        doc.text(`Reason: ${q.difficultyReason}`);
      }

      doc.moveDown(0.6);
    });

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

async function main(): Promise<void> {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('[top25] staging manifest missing — run npm run rewrite:staging:difficulty first');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as StagingManifest;
  if (manifest.version !== 'adaptive_staging_v4_difficulty') {
    console.warn(`[top25] manifest version is ${manifest.version}, expected adaptive_staging_v4_difficulty`);
  }

  const normalized = manifestToNormalized(manifest);
  const audit = auditAllQuestions(normalized);
  const weakest = rankWeakest(audit.questions).slice(0, 25);
  const strongest = rankStrongest(audit.questions).slice(0, 25);

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const payload = {
    generatedAt: new Date().toISOString(),
    sourceVersion: manifest.version,
    totalQuestions: audit.questions.length,
    weakest25: weakest.map((e, i) => ({
      rank: i + 1,
      questionId: e.question.questionId,
      character: e.question.character,
      missionId: e.question.missionId,
      missionTitle: e.question.missionTitle,
      gradeBand: e.question.gradeBand,
      difficultyScore: e.question.difficultyScore,
      flags: e.question.flags,
      weaknessScore: e.weaknessScore,
      weaknessReasons: e.weaknessReasons,
      recommendedReplacement: e.recommendedReplacement,
      questionText: e.question.questionText,
      scenarioText: e.question.scenarioText,
      choices: e.question.choices.map((c) => c.label),
      correctAnswer: e.question.correctAnswerLabel,
    })),
    strongest25: strongest.map((e, i) => ({
      rank: i + 1,
      questionId: e.question.questionId,
      character: e.question.character,
      missionId: e.question.missionId,
      missionTitle: e.question.missionTitle,
      gradeBand: e.question.gradeBand,
      difficultyScore: e.question.difficultyScore,
      flags: e.question.flags,
      strengthScore: e.strengthScore,
      strengthReasons: e.strengthReasons,
      questionText: e.question.questionText,
      scenarioText: e.question.scenarioText,
      choices: e.question.choices.map((c) => c.label),
      correctAnswer: e.question.correctAnswerLabel,
    })),
  };

  fs.writeFileSync(path.join(REPORTS_DIR, 'top-25-weakest-questions.json'), JSON.stringify(payload.weakest25, null, 2));
  fs.writeFileSync(path.join(REPORTS_DIR, 'top-25-strongest-questions.json'), JSON.stringify(payload.strongest25, null, 2));

  const weakMd = [
    '# Top 25 Weakest Questions — Staging v4',
    '',
    `Analyzed ${audit.questions.length} questions from \`adaptive_staging_v4_difficulty\`.`,
    '',
    ...weakest.flatMap((e, i) => [renderQuestionBlock(e, i + 1, 'weak'), '---', '']),
  ].join('\n');

  const strongMd = [
    '# Top 25 Strongest Questions — Staging v4',
    '',
    ...strongest.flatMap((e, i) => [renderQuestionBlock(e, i + 1, 'strong'), '---', '']),
  ].join('\n');

  fs.writeFileSync(path.join(REPORTS_DIR, 'top-25-weakest-questions.md'), weakMd);
  fs.writeFileSync(path.join(REPORTS_DIR, 'top-25-strongest-questions.md'), strongMd);

  const weakPdf = path.join(REPORTS_DIR, 'top-25-weakest-questions.pdf');
  const strongPdf = path.join(REPORTS_DIR, 'top-25-strongest-questions.pdf');

  await writePdf(
    "Top 25 Weakest Questions",
    "Staging v4 difficulty set — ranked by score, obvious answers, distractors, reasoning, and scenario dependence",
    weakest,
    'weak',
    weakPdf,
  );

  await writePdf(
    "Top 25 Strongest Questions",
    "Staging v4 difficulty set — best examples to compare before publishing",
    strongest,
    'strong',
    strongPdf,
  );

  console.log('[top25] Reports generated');
  console.log(`  Weakest PDF: ${weakPdf}`);
  console.log(`  Strongest PDF: ${strongPdf}`);
  console.log('');
  console.log('  Weakest 5:');
  weakest.slice(0, 5).forEach((e, i) => {
    console.log(
      `    ${i + 1}. ${e.question.questionId} (${e.question.character}) — score ${e.question.difficultyScore}/5 — ${e.weaknessReasons[0]}`,
    );
  });
  console.log('');
  console.log('  Strongest 5:');
  strongest.slice(0, 5).forEach((e, i) => {
    console.log(
      `    ${i + 1}. ${e.question.questionId} (${e.question.character}) — score ${e.question.difficultyScore}/5`,
    );
  });
}

main().catch((err) => {
  console.error('[top25] Failed:', err);
  process.exit(1);
});
