#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { auditAllQuestions } from '../question-audit/auditHeuristics';
import { collectAllQuestions, indexToLetter } from '../question-audit/collectQuestions';
import {
  auditCharacterViolations,
  buildCharacterRubric,
  CHARACTER_IDS,
  rankTop10ByCharacter,
  type CharacterId,
  type CharacterRubric,
  type CharacterViolation,
} from './characterGoldStandard';
import { formatChoices, type RankedQuestion } from './top25Ranking';
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

function ensureSpace(doc: import('pdfkit').default, yThreshold = 680): void {
  if (doc.y > yThreshold) doc.addPage();
}

async function writeGoldStandardsPdf(
  top10ByCharacter: Record<CharacterId, RankedQuestion[]>,
  rubrics: Record<CharacterId, CharacterRubric>,
  outputPath: string,
): Promise<void> {
  const PDFDocument = (await import('pdfkit')).default;
  const M = 48;
  const W = 612 - M * 2;

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: M, size: 'LETTER' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(22).text('Character Gold Standard Report', M, 52);
    doc.font('Helvetica').fontSize(10).fillColor('#444');
    doc.text('Top 10 strongest questions per character — staging v4', M, 78);
    doc.text(`Generated ${new Date().toLocaleString()}`, M, 94);
    doc.fillColor('#000');

    for (const character of CHARACTER_IDS) {
      const rubric = rubrics[character];
      const top10 = top10ByCharacter[character];

      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(16).text(`${rubric.displayName} — Gold Standard Library`);
      doc.font('Helvetica').fontSize(9);
      doc.text(`Core skills: ${rubric.coreSkills.join(' · ')}`);
      doc.moveDown(0.4);

      doc.font('Helvetica-Bold').fontSize(11).text('Common Success Patterns');
      doc.font('Helvetica').fontSize(9);
      rubric.successPatterns.forEach((p) => doc.text(`• ${p}`, { width: W }));
      doc.moveDown(0.3);

      if (rubric.patternStats.commonStems.length > 0) {
        doc.font('Helvetica-Bold').fontSize(10).text('Frequent stem patterns in top 10');
        doc.font('Helvetica').fontSize(8);
        rubric.patternStats.commonStems.forEach((s) => doc.text(`  • ${s}`, { width: W }));
        doc.moveDown(0.3);
      }

      doc.font('Helvetica-Bold').fontSize(11).text('Top 10 Questions');
      doc.font('Helvetica').fontSize(8);

      top10.forEach((entry, i) => {
        ensureSpace(doc, 620);
        const q = entry.question;
        doc.font('Helvetica-Bold').text(`${i + 1}. ${q.questionId} — ${q.missionTitle} (${q.gradeBand}) · ${q.difficultyScore}/5`);
        doc.font('Helvetica');
        doc.text(`Q: ${q.questionText}`, { width: W });
        doc.text(`Why strong: ${entry.strengthReasons.slice(0, 3).join('; ')}`, { width: W });
        doc.text(`Correct: ${indexToLetter(q.correctIndex)} · Flags: ${q.flags.join(', ') || 'none'}`);
        doc.moveDown(0.35);
      });
    }

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

async function writeCharacterRubricsPdf(
  rubrics: Record<CharacterId, CharacterRubric>,
  violations: Record<CharacterId, CharacterViolation[]>,
  outputPath: string,
): Promise<void> {
  const PDFDocument = (await import('pdfkit')).default;
  const M = 48;
  const W = 612 - M * 2;

  const section = (doc: import('pdfkit').default, title: string, lines: string[]) => {
    ensureSpace(doc);
    doc.font('Helvetica-Bold').fontSize(10).text(title);
    doc.font('Helvetica').fontSize(9);
    lines.forEach((l) => doc.text(`• ${l}`, { width: W }));
    doc.moveDown(0.25);
  };

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: M, size: 'LETTER' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(22).text('Character-Specific Rubrics', M, 52);
    doc.font('Helvetica').fontSize(10).fillColor('#444');
    doc.text('Derived from each character’s top 10 strongest questions', M, 78);
    doc.text(`Generated ${new Date().toLocaleString()}`, M, 94);
    doc.fillColor('#000');

    for (const character of CHARACTER_IDS) {
      const rubric = rubrics[character];
      const charViolations = violations[character];
      const critical = charViolations.filter((v) => v.severity === 'critical');
      const review = charViolations.filter((v) => v.severity === 'review');

      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(16).text(`${rubric.displayName} Rubric`);
      doc.font('Helvetica').fontSize(9);
      doc.text(`Core skills: ${rubric.coreSkills.join(', ')}`);
      doc.moveDown(0.4);

      section(doc, 'Gold criteria (from top 10 patterns)', rubric.goldCriteria);
      section(doc, 'What makes a 5/5 question', rubric.fiveOfFive);
      section(doc, 'What makes a 4/5 question', rubric.fourOfFive);
      section(doc, 'What makes a 3/5 question', rubric.threeOfFive);
      section(doc, 'What should NEVER appear', rubric.neverAppear);
      section(doc, 'Distractor guidelines', rubric.distractorGuidelines);

      doc.font('Helvetica-Bold').fontSize(10).text('Grade-band notes');
      doc.font('Helvetica').fontSize(9);
      for (const [band, note] of Object.entries(rubric.gradeBandNotes)) {
        doc.text(`  ${band}: ${note}`);
      }
      doc.moveDown(0.4);

      doc.font('Helvetica-Bold').fontSize(11).text('Rubric Violations');
      doc.font('Helvetica').fontSize(9);
      doc.text(`Total violations: ${charViolations.length} (critical: ${critical.length}, review: ${review.length})`);
      doc.moveDown(0.2);

      if (critical.length > 0) {
        doc.font('Helvetica-Bold').fontSize(10).text('Critical / priority review');
        doc.font('Helvetica').fontSize(8);
        critical.slice(0, 25).forEach((v, i) => {
          ensureSpace(doc, 700);
          doc.font('Helvetica-Bold').text(`${i + 1}. ${v.questionId} — ${v.missionTitle} (${v.gradeBand}) · ${v.difficultyScore}/5`);
          doc.font('Helvetica');
          v.violations.slice(0, 4).forEach((line) => doc.text(`   • ${line}`, { width: W }));
          doc.moveDown(0.2);
        });
        if (critical.length > 25) {
          doc.text(`… and ${critical.length - 25} more critical items (see JSON report)`);
        }
      }

      if (review.length > 0) {
        doc.addPage();
        doc.font('Helvetica-Bold').fontSize(10).text(`${rubric.displayName} — Review items (${review.length})`);
        doc.font('Helvetica').fontSize(8);
        review.slice(0, 40).forEach((v, i) => {
          ensureSpace(doc, 720);
          doc.text(`${i + 1}. ${v.questionId} (${v.gradeBand}, ${v.difficultyScore}/5): ${v.violations[0]}`);
        });
        if (review.length > 40) {
          doc.text(`… and ${review.length - 40} more (see JSON report)`);
        }
      }
    }

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

async function main(): Promise<void> {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('[character-gold] Run npm run rewrite:staging:difficulty first');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as StagingManifest;
  const normalized = manifestToNormalized(manifest);
  const audit = auditAllQuestions(normalized);

  const top10ByCharacter = rankTop10ByCharacter(audit.questions);
  const rubrics = {} as Record<CharacterId, CharacterRubric>;
  for (const character of CHARACTER_IDS) {
    const top10 = top10ByCharacter[character].map((e) => e.question);
    rubrics[character] = buildCharacterRubric(character, top10);
  }

  const violations = auditCharacterViolations(audit.questions);

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const jsonPayload = {
    generatedAt: new Date().toISOString(),
    top10ByCharacter: Object.fromEntries(
      CHARACTER_IDS.map((c) => [
        c,
        top10ByCharacter[c].map((e, i) => ({
          rank: i + 1,
          questionId: e.question.questionId,
          missionId: e.question.missionId,
          missionTitle: e.question.missionTitle,
          gradeBand: e.question.gradeBand,
          difficultyScore: e.question.difficultyScore,
          flags: e.question.flags,
          strengthReasons: e.strengthReasons,
          questionText: e.question.questionText,
          scenarioText: e.question.scenarioText,
          choices: formatChoices(e.question),
        })),
      ]),
    ),
    rubrics,
    violations: Object.fromEntries(
      CHARACTER_IDS.map((c) => [
        c,
        {
          total: violations[c].length,
          critical: violations[c].filter((v) => v.severity === 'critical').length,
          review: violations[c].filter((v) => v.severity === 'review').length,
          items: violations[c],
        },
      ]),
    ),
  };

  fs.writeFileSync(
    path.join(REPORTS_DIR, 'character-gold-standards.json'),
    JSON.stringify(jsonPayload, null, 2),
  );

  const goldPdf = path.join(REPORTS_DIR, 'character-gold-standards.pdf');
  const rubricsPdf = path.join(REPORTS_DIR, 'character-rubrics.pdf');

  await writeGoldStandardsPdf(top10ByCharacter, rubrics, goldPdf);
  await writeCharacterRubricsPdf(rubrics, violations, rubricsPdf);

  console.log('[character-gold] Reports generated');
  console.log(`  Gold standards PDF: ${goldPdf}`);
  console.log(`  Character rubrics PDF: ${rubricsPdf}`);
  console.log(`  JSON: ${path.join(REPORTS_DIR, 'character-gold-standards.json')}`);
  console.log('');
  for (const c of CHARACTER_IDS) {
    const crit = violations[c].filter((v) => v.severity === 'critical').length;
    console.log(`  ${c}: top10 avg ${rubrics[c].patternStats.avgDifficulty.toFixed(1)}/5 · ${violations[c].length} violations (${crit} critical)`);
  }
}

main().catch((err) => {
  console.error('[character-gold] Failed:', err);
  process.exit(1);
});
