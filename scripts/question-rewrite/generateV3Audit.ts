#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { auditAllQuestions } from '../question-audit/auditHeuristics';
import { collectAllQuestions, indexToLetter } from '../question-audit/collectQuestions';
import type { AuditedQuestion, NormalizedQuestion } from '../question-audit/types';
import type { StagingManifest } from '../question-rewrite/types';

const ROOT = path.resolve(__dirname, '../..');
const MANIFEST_PATH = path.join(ROOT, 'src/data/staging/manifest.json');
const REPORTS_DIR = path.join(ROOT, 'reports');
const CHOICE_IDS = ['a', 'b', 'c', 'd'] as const;

function manifestToNormalized(manifest: StagingManifest): NormalizedQuestion[] {
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

function missionDifficulty(questions: AuditedQuestion[]): [string, number][] {
  const map: Record<string, number[]> = {};
  for (const q of questions) {
    const key = `${q.character}::${q.missionTitle} (${q.missionId})`;
    map[key] = map[key] ?? [];
    map[key].push(q.difficultyScore);
  }
  return Object.entries(map)
    .map(([key, scores]) => [key, scores.reduce((a, b) => a + b, 0) / scores.length] as [string, number])
    .sort((a, b) => b[1] - a[1]);
}

const TARGETS: Record<string, { min: number; max?: number }> = {
  caiden: { min: 4.2, max: 4.5 },
  miranda: { min: 4.0, max: 4.3 },
  zeke: { min: 3.8, max: 4.1 },
  charlie: { min: 3.8, max: 4.0 },
  b4: { min: 3.8, max: 4.2 },
};

function positionCheck(questions: AuditedQuestion[]): Record<string, { ok: boolean; maxPct: number }> {
  const result: Record<string, { ok: boolean; maxPct: number }> = {};
  const characters = [...new Set(questions.map((q) => q.character))];
  for (const character of characters) {
    const subset = questions.filter((q) => q.character === character);
    const counts = [0, 0, 0, 0];
    for (const q of subset) {
      counts[q.correctIndex] += 1;
    }
    const maxPct = Math.max(...counts) / Math.max(subset.length, 1);
    result[character] = { ok: maxPct <= 0.3, maxPct };
  }
  return result;
}

function characterRanking(questions: AuditedQuestion[]): [string, number][] {
  const map: Record<string, number[]> = {};
  for (const q of questions) {
    map[q.character] = map[q.character] ?? [];
    map[q.character].push(q.difficultyScore);
  }
  return Object.entries(map)
    .map(([c, s]) => [c, s.reduce((a, b) => a + b, 0) / s.length] as [string, number])
    .sort((a, b) => b[1] - a[1]);
}

async function generateV3Pdf(input: {
  before: AuditedQuestion[];
  after: AuditedQuestion[];
  manifest: StagingManifest;
  outputPath: string;
}): Promise<void> {
  const PDFDocument = (await import('pdfkit')).default;
  const MARGIN = 48;

  const flagged = input.after.filter((q) => q.flags.length > 0);
  const weakest = [...input.after].sort((a, b) => a.difficultyScore - b.difficultyScore).slice(0, 20);
  const strongest = [...input.after].sort((a, b) => b.difficultyScore - a.difficultyScore).slice(0, 20);
  const charRank = characterRanking(input.after);
  const missionRank = missionDifficulty(input.after);

  const improved = input.after
    .map((q) => {
      const before = input.before.find((b) => b.questionId === q.questionId);
      if (!before) return null;
      return { before, after: q, delta: before.flags.length - q.flags.length };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null && r.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 8);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: 'LETTER' });
    const stream = fs.createWriteStream(input.outputPath);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(22).text("Caiden's Courage — Question Audit v3", MARGIN, 60);
    doc.font('Helvetica').fontSize(11).text(`Final staging pass · ${new Date().toLocaleString()}`, MARGIN, 90);
    doc.text('Production files unchanged. Review with REACT_APP_STAGING_QUESTIONS=true', MARGIN, 108);

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Difficulty Targets (Staging v4)');
    doc.moveDown(0.4);
    doc.font('Helvetica').fontSize(10);
    for (const [character, target] of Object.entries(TARGETS)) {
      const avg = charRank.find(([c]) => c === character)?.[1] ?? 0;
      const met = avg >= target.min ? 'MET' : 'BELOW';
      doc.text(`${character}: ${avg.toFixed(2)} / 5 (target ${target.min}–${target.max ?? '—'}) — ${met}`);
    }

    doc.moveDown();
    doc.font('Helvetica-Bold').text('Answer Position Balance (max 30% per slot)');
    doc.font('Helvetica');
    const pos = positionCheck(input.after);
    for (const [character, check] of Object.entries(pos)) {
      doc.text(`${character}: max slot ${(check.maxPct * 100).toFixed(1)}% — ${check.ok ? 'OK' : 'REVIEW'}`);
    }

    doc.moveDown();
    doc.font('Helvetica-Bold').text('Flag Summary');
    doc.font('Helvetica');
    const fc = input.after.reduce(
      (acc, q) => {
        for (const f of q.flags) acc[f] = (acc[f] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    Object.entries(fc)
      .sort((a, b) => b[1] - a[1])
      .forEach(([f, n]) => doc.text(`${f}: ${n}`));

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Character Difficulty Rankings');
    doc.moveDown(0.4);
    doc.font('Helvetica').fontSize(10);
    charRank.forEach(([character, avg], i) => {
      doc.text(`${i + 1}. ${character}: ${avg.toFixed(2)} / 5`);
    });

    doc.moveDown();
    doc.font('Helvetica-Bold').text('Mission Difficulty Rankings (Top 15)');
    doc.font('Helvetica');
    missionRank.slice(0, 15).forEach(([mission, avg], i) => {
      doc.text(`${i + 1}. ${mission}: ${avg.toFixed(2)}`);
    });

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text(`Remaining Flagged Questions (${flagged.length})`);
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(9);
    flagged.slice(0, 45).forEach((q) => {
      if (doc.y > 700) doc.addPage();
      doc.text(`• ${q.questionId} (${q.character}) — ${q.flags.join(', ')}`);
    });
    if (flagged.length > 45) doc.text(`…and ${flagged.length - 45} more`);

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Before / After Examples (v3 fixes)');
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(9);
    for (const ex of improved) {
      if (doc.y > 640) doc.addPage();
      const snap = input.manifest.beforeSnapshots[ex.before.questionId];
      doc.font('Helvetica-Bold').text(`${ex.after.questionId} (${ex.after.character})`);
      doc.font('Helvetica');
      if (snap) {
        doc.text(`BEFORE: ${snap.questionText}`);
        doc.text(`Choices: ${snap.choices.join(' | ')}`);
      }
      doc.text(`AFTER: ${ex.after.questionText}`);
      doc.text(`Flags: ${ex.before.flags.join(', ') || 'none'} → ${ex.after.flags.join(', ') || 'none'}`);
      doc.moveDown(0.4);
    }

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Top 20 Weakest (Still Need Review)');
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(9);
    weakest.forEach((q, i) => {
      doc.text(
        `${i + 1}. ${q.questionId} — ${q.character} / ${q.missionTitle} — score ${q.difficultyScore}/5 — ${q.flags.join(', ') || 'clean'}`,
      );
    });

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Top 20 Strongest (After Rewrite)');
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(9);
    strongest.forEach((q, i) => {
      doc.text(
        `${i + 1}. ${q.questionId} — ${q.character} / ${q.missionTitle} — score ${q.difficultyScore}/5`,
      );
    });

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

async function main(): Promise<void> {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('[audit:v3] manifest missing — run rewrite:staging && rewrite:final-pass');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as StagingManifest;
  const beforeAudit = auditAllQuestions(collectAllQuestions());
  const afterAudit = auditAllQuestions(manifestToNormalized(manifest));

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const payload = {
    generatedAt: new Date().toISOString(),
    version: manifest.version,
    totalQuestions: afterAudit.questions.length,
    targets: TARGETS,
    targetResults: Object.fromEntries(
      characterRanking(afterAudit.questions).map(([c, avg]) => [
        c,
        { average: avg, met: avg >= (TARGETS[c]?.min ?? 0) },
      ]),
    ),
    positionBalance: positionCheck(afterAudit.questions),
    characterRankings: characterRanking(afterAudit.questions),
    beforeCharacterAverages: Object.fromEntries(
      characterRanking(beforeAudit.questions),
    ),
    missionRankings: missionDifficulty(afterAudit.questions),
    flagCounts: afterAudit.summary.flagCounts,
    caidenMathTimeCount: afterAudit.questions.filter(
      (q) =>
        q.character === 'caiden' &&
        /\d+|minute|\$|token|budget|plan/i.test(`${q.questionText} ${q.scenarioText}`),
    ).length,
    remainingFlagged: afterAudit.questions
      .filter((q) => q.flags.length > 0)
      .map((q) => ({
        questionId: q.questionId,
        character: q.character,
        missionId: q.missionId,
        flags: q.flags,
        difficultyScore: q.difficultyScore,
      })),
    weakest20: [...afterAudit.questions]
      .sort((a, b) => a.difficultyScore - b.difficultyScore)
      .slice(0, 20)
      .map((q) => ({ id: q.questionId, character: q.character, score: q.difficultyScore, flags: q.flags })),
    strongest20: [...afterAudit.questions]
      .sort((a, b) => b.difficultyScore - a.difficultyScore)
      .slice(0, 20)
      .map((q) => ({ id: q.questionId, character: q.character, score: q.difficultyScore })),
    summary: afterAudit.summary,
  };

  fs.writeFileSync(path.join(REPORTS_DIR, 'question-audit-v3.json'), JSON.stringify(payload, null, 2));

  const md: string[] = [
    '# Question Audit v3 — Difficulty Upgrade (Staging)',
    '',
    `Total questions: ${payload.totalQuestions}`,
    '',
    '## Target Results',
    '',
    ...Object.entries(payload.targetResults).map(
      ([c, r]) => `- **${c}**: ${(r as { average: number; met: boolean }).average.toFixed(2)} ${(r as { met: boolean }).met ? '✓' : '✗'} (target ≥ ${TARGETS[c]?.min})`,
    ),
    '',
    '## Character Rankings',
    '',
    ...payload.characterRankings.map(([c, avg], i) => `${i + 1}. **${c}**: ${avg.toFixed(2)}`),
    '',
    '## Flag Summary',
    '',
    ...Object.entries(payload.flagCounts).map(([f, n]) => `- ${f}: ${n}`),
    '',
    `Caiden math/time/planning questions: ${payload.caidenMathTimeCount}`,
    '',
    '## Remaining Flagged (sample)',
    '',
    ...payload.remainingFlagged.slice(0, 40).map(
      (q) => `- \`${q.questionId}\` (${q.character}) — ${q.flags.join(', ')}`,
    ),
  ];
  fs.writeFileSync(path.join(REPORTS_DIR, 'question-audit-v3.md'), md.join('\n'));

  const pdfPath = path.join(REPORTS_DIR, 'question-audit-v3.pdf');
  await generateV3Pdf({
    before: beforeAudit.questions,
    after: afterAudit.questions,
    manifest,
    outputPath: pdfPath,
  });

  console.log('[audit:v3] Complete');
  console.log(`  Flagged remaining: ${payload.remainingFlagged.length}`);
  console.log(`  Character #1: ${payload.characterRankings[0]?.[0]} (${payload.characterRankings[0]?.[1].toFixed(2)})`);
  console.log(`  Wrote ${pdfPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
