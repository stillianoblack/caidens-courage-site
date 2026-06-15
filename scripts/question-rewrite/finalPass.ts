#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import {
  auditAllQuestions,
  isGenuineObviousAnswer,
  isLengthGiveaway,
} from '../question-audit/auditHeuristics';
import { collectAllQuestions } from '../question-audit/collectQuestions';
import type { NormalizedQuestion } from '../question-audit/types';
import { CAIDEN_MATH_QUESTION_IDS, enhanceCaidenMathOverride } from './fixes/caidenFinalPass';
import { enhanceMirandaOverride } from './fixes/mirandaFinalPass';
import { fixLengthGiveawayOverride, fixObviousOverride } from './fixes/selectiveFixes';
import type { StagingManifest, StagingQuestionOverride } from './types';

const ROOT = path.resolve(__dirname, '../..');
const MANIFEST_PATH = path.join(ROOT, 'src/data/staging/manifest.json');

const CHOICE_IDS = ['a', 'b', 'c', 'd'] as const;

function toNormalized(override: StagingQuestionOverride, base: NormalizedQuestion): NormalizedQuestion {
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
}

function manifestToNormalized(manifest: StagingManifest): NormalizedQuestion[] {
  const production = collectAllQuestions();
  const byId = new Map(production.map((q) => [q.questionId, q]));
  return Object.values(manifest.overrides).map((override) => {
    const base = byId.get(override.questionId);
    if (!base) throw new Error(`Missing base question ${override.questionId}`);
    return toNormalized(override, base);
  });
}

function main(): void {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('[final-pass] Run npm run rewrite:staging first');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as StagingManifest;
  const production = collectAllQuestions();
  const byId = new Map(production.map((q) => [q.questionId, q]));

  let mirandaCount = 0;
  let caidenCount = 0;
  let obviousCount = 0;
  let lengthCount = 0;

  const updatedOverrides: Record<string, StagingQuestionOverride> = { ...manifest.overrides };

  for (const [questionId, override] of Object.entries(updatedOverrides)) {
    const base = byId.get(questionId);
    if (!base) continue;

    let current = { ...override };

    if (current.character === 'miranda') {
      current = enhanceMirandaOverride(current);
      mirandaCount += 1;
    }

    if (CAIDEN_MATH_QUESTION_IDS.has(questionId)) {
      current = enhanceCaidenMathOverride(current);
      caidenCount += 1;
    }

    updatedOverrides[questionId] = current;
  }

  const midNormalized = Object.values(updatedOverrides).map((o) => {
    const base = byId.get(o.questionId)!;
    return toNormalized(o, base);
  });
  const midAudit = auditAllQuestions(midNormalized);
  const auditedById = new Map(midAudit.questions.map((q) => [q.questionId, q]));

  for (const [questionId, override] of Object.entries(updatedOverrides)) {
    const base = byId.get(questionId)!;
    let current = override;
    const audited = auditedById.get(questionId);
    if (!audited) continue;

    const normalized = toNormalized(current, base);

    if (isGenuineObviousAnswer(normalized)) {
      current = fixObviousOverride(current, normalized);
      obviousCount += 1;
    }

    const afterObvious = toNormalized(current, base);
    if (isLengthGiveaway(afterObvious)) {
      current = fixLengthGiveawayOverride(current);
      lengthCount += 1;
    }

    updatedOverrides[questionId] = current;
  }

  const finalManifest: StagingManifest = {
    ...manifest,
    generatedAt: new Date().toISOString(),
    version: 'adaptive_staging_v3_final',
    overrides: updatedOverrides,
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(finalManifest, null, 2), 'utf8');

  const finalAudit = auditAllQuestions(manifestToNormalized(finalManifest));
  const mirandaEvidence = finalAudit.questions.filter(
    (q) => q.character === 'miranda' && q.flags.includes('insufficient_scenario_evidence'),
  ).length;
  const caidenMath = finalAudit.questions.filter((q) =>
    q.flags.includes('caiden_needs_more_math_focus'),
  ).length;

  console.log('[final-pass] v3 staging pass complete');
  console.log(`  Miranda enhanced: ${mirandaCount}`);
  console.log(`  Caiden math enhanced: ${caidenCount}`);
  console.log(`  Genuine obvious fixes: ${obviousCount}`);
  console.log(`  Length giveaway fixes: ${lengthCount}`);
  console.log(`  Remaining Miranda evidence flags: ${mirandaEvidence}`);
  console.log(`  Remaining Caiden math flags: ${caidenMath}`);
  console.log(`  Wrote ${MANIFEST_PATH}`);
}

main();
