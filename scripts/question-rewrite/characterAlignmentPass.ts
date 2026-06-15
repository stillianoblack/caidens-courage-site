#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { auditAllQuestions } from '../question-audit/auditHeuristics';
import { collectAllQuestions } from '../question-audit/collectQuestions';
import {
  auditCharacterViolations,
  CHARACTER_IDS,
  type CharacterId,
} from './characterGoldStandard';
import {
  applyCharacterAlignmentFixes,
  CHARACTER_ALIGNMENT_FIXES,
  type CharacterAlignmentFix,
} from './characterAlignmentFixes';
import type { StagingManifest, StagingQuestionOverride } from './types';

const ROOT = path.resolve(__dirname, '../..');
const MANIFEST_PATH = path.join(ROOT, 'src/data/staging/manifest.json');
const REPORTS_DIR = path.join(ROOT, 'reports');
const CHOICE_IDS = ['a', 'b', 'c', 'd'] as const;

const PRE_PASS_VIOLATIONS: Record<CharacterId, number> = {
  caiden: 16,
  miranda: 0,
  zeke: 2,
  charlie: 0,
  b4: 16,
};

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

function countCharacterViolations(characters: CharacterId[]): Record<CharacterId, number> {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as StagingManifest;
  const audit = auditAllQuestions(manifestToNormalized(manifest.overrides));
  const violations = auditCharacterViolations(audit.questions);
  const counts = {} as Record<CharacterId, number>;
  for (const c of CHARACTER_IDS) {
    counts[c] = characters.includes(c) ? violations[c].length : 0;
  }
  return counts;
}

function buildDifficultyChecks(): Array<{
  questionId: string;
  before: number | null;
  after: number | null;
}> {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as StagingManifest;
  const production = collectAllQuestions();
  const byId = new Map(production.map((q) => [q.questionId, q]));

  const beforeOverrides: Record<string, StagingQuestionOverride> = {};
  for (const fix of CHARACTER_ALIGNMENT_FIXES) {
    const current = manifest.overrides[fix.questionId];
    if (!current) continue;
    beforeOverrides[fix.questionId] = {
      ...current,
      questionText: fix.before.questionText,
      scenarioText: fix.before.scenarioText ?? current.scenarioText,
      choices: (fix.before.choices ?? current.choices) as [string, string, string, string],
    };
  }

  const beforeAudit = auditAllQuestions(
    CHARACTER_ALIGNMENT_FIXES.map((fix) => {
      const base = byId.get(fix.questionId)!;
      const staged = beforeOverrides[fix.questionId];
      return {
        ...base,
        scenarioText: staged.scenarioText ?? base.scenarioText,
        questionText: staged.questionText,
        choices: staged.choices.map((label, index) => ({ id: CHOICE_IDS[index], label })),
        correctAnswerId: CHOICE_IDS[staged.correctIndex],
        correctAnswerLabel: staged.choices[staged.correctIndex],
        correctIndex: staged.correctIndex,
      };
    }),
  );

  const afterAudit = auditAllQuestions(
    CHARACTER_ALIGNMENT_FIXES.map((fix) => {
      const staged = manifest.overrides[fix.questionId];
      const base = byId.get(fix.questionId)!;
      return {
        ...base,
        scenarioText: staged.scenarioText ?? base.scenarioText,
        questionText: staged.questionText,
        choices: staged.choices.map((label, index) => ({ id: CHOICE_IDS[index], label })),
        correctAnswerId: CHOICE_IDS[staged.correctIndex],
        correctAnswerLabel: staged.choices[staged.correctIndex],
        correctIndex: staged.correctIndex,
      };
    }),
  );

  const beforeMap = new Map(beforeAudit.questions.map((q) => [q.questionId, q]));
  const afterMap = new Map(afterAudit.questions.map((q) => [q.questionId, q]));

  return CHARACTER_ALIGNMENT_FIXES.map((fix) => ({
    questionId: fix.questionId,
    before: beforeMap.get(fix.questionId)?.difficultyScore ?? null,
    after: afterMap.get(fix.questionId)?.difficultyScore ?? null,
  }));
}

async function writeAlignmentPdf(
  fixes: CharacterAlignmentFix[],
  beforeViolations: Record<CharacterId, number>,
  afterViolations: Record<CharacterId, number>,
  difficultyChecks: Array<{
    questionId: string;
    before: number | null;
    after: number | null;
  }>,
  outputPath: string,
): Promise<void> {
  const PDFDocument = (await import('pdfkit')).default;
  const M = 48;
  const W = 612 - M * 2;

  const totalBefore = Object.values(beforeViolations).reduce((a, b) => a + b, 0);
  const totalAfter = Object.values(afterViolations).reduce((a, b) => a + b, 0);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: M, size: 'LETTER' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(20).text('Character Alignment Pass', M, 52);
    doc.font('Helvetica').fontSize(10).fillColor('#444');
    doc.text('Targeted stem/scenario alignment — staging v4 (no global rewrite)', M, 78);
    doc.text(`Generated ${new Date().toLocaleString()}`, M, 94);
    doc.fillColor('#000');

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(12).text('Summary');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Questions updated: ${fixes.length}`);
    doc.text(`Violations before: ${totalBefore}`);
    doc.text(`Violations after: ${totalAfter}`);
    doc.text(`Violations removed: ${totalBefore - totalAfter}`);
    doc.moveDown(0.4);
    doc.text('By character (before → after):');
    for (const c of ['caiden', 'zeke', 'b4'] as CharacterId[]) {
      doc.text(`  ${c}: ${beforeViolations[c]} → ${afterViolations[c]}`);
    }
    doc.moveDown(0.4);
    doc.text('Miranda and Charlie: unchanged (0 edits).');
    doc.moveDown(0.4);
    doc.font('Helvetica-Bold').text('Difficulty notes');
    doc.font('Helvetica').fontSize(9);
    const caidenB4 = difficultyChecks.filter((d) => !d.questionId.startsWith('zk'));
    const caidenB4Unchanged = caidenB4.filter((d) => d.before === d.after);
    doc.text(
      `Caiden & B-4: ${caidenB4Unchanged.length}/${caidenB4.length} items kept the same difficulty score (no difficulty upgrade pass).`,
    );
    const zekeDiff = difficultyChecks.filter((d) => d.questionId.startsWith('zkm'));
    zekeDiff.forEach((d) => {
      doc.text(`Zeke ${d.questionId}: ${d.before}/5 → ${d.after}/5 (critical reasoning alignment)`);
    });

    const byCharacter = {
      zeke: fixes.filter((f) => f.character === 'zeke'),
      caiden: fixes.filter((f) => f.character === 'caiden'),
      b4: fixes.filter((f) => f.character === 'b4'),
    };

    for (const [character, charFixes] of Object.entries(byCharacter)) {
      if (charFixes.length === 0) continue;
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(14).text(`${character.toUpperCase()} (${charFixes.length} items)`);
      doc.font('Helvetica').fontSize(9);

      charFixes.forEach((fix, index) => {
        if (doc.y > 640) doc.addPage();
        doc.font('Helvetica-Bold').fontSize(10).text(`${index + 1}. ${fix.questionId}`);
        doc.font('Helvetica').fontSize(9);
        doc.text(`Rationale: ${fix.rationale}`, { width: W });
        doc.moveDown(0.15);
        doc.font('Helvetica-Bold').text('Before:');
        doc.font('Helvetica').text(`  Q: ${fix.before.questionText}`, { width: W });
        if (fix.before.scenarioText) {
          const s =
            fix.before.scenarioText.length > 180
              ? `${fix.before.scenarioText.slice(0, 177)}…`
              : fix.before.scenarioText;
          doc.text(`  Scenario: ${s}`, { width: W });
        }
        doc.font('Helvetica-Bold').text('After:');
        doc.font('Helvetica').text(`  Q: ${fix.after.questionText}`, { width: W });
        if (fix.after.scenarioText) {
          const s =
            fix.after.scenarioText.length > 180
              ? `${fix.after.scenarioText.slice(0, 177)}…`
              : fix.after.scenarioText;
          doc.text(`  Scenario: ${s}`, { width: W });
        }
        doc.moveDown(0.35);
      });
    }

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

async function writeReports(applied: number): Promise<void> {
  const targetCharacters: CharacterId[] = ['caiden', 'zeke', 'b4'];
  const afterViolations = countCharacterViolations(targetCharacters);
  const difficultyChecks = buildDifficultyChecks();

  const reportJson = {
    generatedAt: new Date().toISOString(),
    applied,
    violationsBefore: PRE_PASS_VIOLATIONS,
    violationsAfter: afterViolations,
    violationsRemoved:
      targetCharacters.reduce((s, c) => s + PRE_PASS_VIOLATIONS[c], 0) -
      targetCharacters.reduce((s, c) => s + afterViolations[c], 0),
    difficultyChecks,
    fixes: CHARACTER_ALIGNMENT_FIXES,
  };

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  fs.writeFileSync(
    path.join(REPORTS_DIR, 'character-alignment-pass.json'),
    JSON.stringify(reportJson, null, 2),
  );

  const pdfPath = path.join(REPORTS_DIR, 'character-alignment-pass.pdf');
  await writeAlignmentPdf(
    CHARACTER_ALIGNMENT_FIXES,
    PRE_PASS_VIOLATIONS,
    afterViolations,
    difficultyChecks,
    pdfPath,
  );

  console.log('[character-alignment] Reports generated');
  console.log(`  Violations removed: ${reportJson.violationsRemoved}`);
  console.log(`  PDF: ${pdfPath}`);
  for (const c of targetCharacters) {
    console.log(`  ${c}: ${PRE_PASS_VIOLATIONS[c]} → ${afterViolations[c]} violations`);
  }
}

async function main(): Promise<void> {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('[character-alignment] Run npm run rewrite:staging:difficulty first');
    process.exit(1);
  }

  const reportOnly = process.argv.includes('--report-only');
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as StagingManifest;

  if (reportOnly) {
    await writeReports(CHARACTER_ALIGNMENT_FIXES.length);
    return;
  }

  const applied = applyCharacterAlignmentFixes(manifest.overrides);
  manifest.generatedAt = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log('[character-alignment] Pass complete');
  console.log(`  Applied: ${applied} question updates`);
  await writeReports(applied);
}

main().catch((err) => {
  console.error('[character-alignment] Failed:', err);
  process.exit(1);
});
