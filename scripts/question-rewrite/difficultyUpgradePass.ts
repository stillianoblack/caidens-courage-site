#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { auditAllQuestions, isGenuineObviousAnswer, isLengthGiveaway } from '../question-audit/auditHeuristics';
import { collectAllQuestions } from '../question-audit/collectQuestions';
import type { NormalizedQuestion } from '../question-audit/types';
import { upgradeQuestionForDifficulty } from './difficultyUpgradeEngine';
import { fixLengthGiveawayOverride, fixObviousOverride } from './fixes/selectiveFixes';
import { balanceCorrectPositions } from './positionBalancer';
import type { StagingManifest, StagingQuestionOverride } from './types';

const ROOT = path.resolve(__dirname, '../..');
const MANIFEST_PATH = path.join(ROOT, 'src/data/staging/manifest.json');
const CHOICE_IDS = ['a', 'b', 'c', 'd'] as const;

const TARGETS: Record<string, number> = {
  caiden: 4.2,
  miranda: 4.0,
  zeke: 3.8,
  charlie: 3.8,
  b4: 3.8,
};

function toNormalized(override: StagingQuestionOverride, base: NormalizedQuestion): NormalizedQuestion {
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
}

function rebalanceCharacterPositions(
  overrides: Record<string, StagingQuestionOverride>,
  character: string,
): void {
  const entries = Object.entries(overrides)
    .filter(([, o]) => o.character === character)
    .sort(([a], [b]) => a.localeCompare(b));

  const positions = balanceCorrectPositions(entries.length);
  entries.forEach(([, override], index) => {
    const newIndex = positions[index];
    if (newIndex === override.correctIndex) return;
    const best = override.choices[override.correctIndex];
    const others = override.choices.filter((_, i) => i !== override.correctIndex) as [
      string,
      string,
      string,
    ];
    override.choices = [
      '',
      '',
      '',
      '',
    ] as [string, string, string, string];
    const slots: string[] = ['', '', '', ''];
    slots[newIndex] = best;
    let oi = 0;
    for (let i = 0; i < 4; i += 1) {
      if (i !== newIndex) {
        slots[i] = others[oi];
        oi += 1;
      }
    }
    override.choices = slots as [string, string, string, string];
    override.correctIndex = newIndex;
  });
}

function avgByCharacter(questions: ReturnType<typeof auditAllQuestions>['questions']): Record<string, number> {
  const map: Record<string, number[]> = {};
  for (const q of questions) {
    map[q.character] = map[q.character] ?? [];
    map[q.character].push(q.difficultyScore);
  }
  const result: Record<string, number> = {};
  for (const [c, scores] of Object.entries(map)) {
    result[c] = scores.reduce((a, b) => a + b, 0) / scores.length;
  }
  return result;
}

function main(): void {
  const production = collectAllQuestions();
  const byId = new Map(production.map((q) => [q.questionId, q]));

  let manifest: StagingManifest;
  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as StagingManifest;
  } else {
    console.error('[difficulty] Run npm run rewrite:staging first');
    process.exit(1);
  }

  const updatedOverrides: Record<string, StagingQuestionOverride> = {};

  for (const q of production) {
    const existing = manifest.overrides[q.questionId];
    const baseOverride: StagingQuestionOverride = existing ?? {
      questionId: q.questionId,
      character: q.character,
      missionId: q.missionId,
      gradeBand: q.gradeBand,
      scenarioText: q.scenarioText,
      questionText: q.questionText,
      choices: q.choices.map((c) => c.label) as [string, string, string, string],
      correctIndex: q.correctIndex as 0 | 1 | 2 | 3,
      contentVersion: 'adaptive_staging_v3_final',
      rewriteNotes: 'baseline from production',
    };

    updatedOverrides[q.questionId] = upgradeQuestionForDifficulty(q, baseOverride);
  }

  for (const character of ['caiden', 'miranda', 'zeke', 'charlie', 'b4']) {
    rebalanceCharacterPositions(updatedOverrides, character);
  }

  let obviousFixes = 0;
  let lengthFixes = 0;
  for (const [questionId, override] of Object.entries(updatedOverrides)) {
    const base = byId.get(questionId)!;
    let current = override;
    const normalized = toNormalized(current, base);

    if (isGenuineObviousAnswer(normalized)) {
      current = fixObviousOverride(current, normalized);
      obviousFixes += 1;
    }
    const afterObvious = toNormalized(current, base);
    if (isLengthGiveaway(afterObvious)) {
      current = fixLengthGiveawayOverride(current);
      lengthFixes += 1;
    }
    current.contentVersion = 'adaptive_staging_v4_difficulty';
    updatedOverrides[questionId] = current;
  }

  const finalManifest: StagingManifest = {
    generatedAt: new Date().toISOString(),
    version: 'adaptive_staging_v4_difficulty',
    totalQuestions: production.length,
    overrides: updatedOverrides,
    beforeSnapshots: manifest.beforeSnapshots ?? {},
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(finalManifest, null, 2), 'utf8');

  const audit = auditAllQuestions(
    Object.values(updatedOverrides).map((o) => toNormalized(o, byId.get(o.questionId)!)),
  );
  const avgs = avgByCharacter(audit.questions);

  console.log('[difficulty] Upgrade pass complete — 512 questions');
  console.log(`  Obvious fixes: ${obviousFixes}`);
  console.log(`  Length fixes: ${lengthFixes}`);
  console.log('');
  console.log('  Character averages (target in parentheses):');
  for (const [character, target] of Object.entries(TARGETS)) {
    const avg = avgs[character] ?? 0;
    const met = avg >= target ? '✓' : '✗';
    console.log(`    ${met} ${character}: ${avg.toFixed(2)} (target ≥ ${target})`);
  }

  const flags = audit.summary.flagCounts;
  console.log('');
  console.log(`  Joke distractors: ${flags.joke_or_impossible_distractor ?? 0}`);
  console.log(`  Guessable without scenario: ${flags.guessable_without_scenario ?? 0}`);
  console.log(`  Obvious correct: ${flags.correct_answer_too_obvious ?? 0}`);

  const caidenMath = audit.questions.filter(
    (q) => q.character === 'caiden' && /\d+|minute|\$|token|budget/i.test(`${q.questionText} ${q.scenarioText}`),
  ).length;
  console.log(`  Caiden math/time/planning questions: ${caidenMath} / ${audit.questions.filter((q) => q.character === 'caiden').length}`);

  console.log(`\n  Wrote ${MANIFEST_PATH}`);
}

main();
