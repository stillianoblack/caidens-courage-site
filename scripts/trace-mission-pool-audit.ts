/**
 * Trace authored → runtime question pool for pilot missions.
 * Run: yarn tsx scripts/trace-mission-pool-audit.ts
 */
process.env.REACT_APP_SUPABASE_URL = '';
process.env.REACT_APP_SUPABASE_ANON_KEY = '';

import '../src/data/caiden/index';
import '../src/data/miranda/index';
import { CAIDEN_ADAPTIVE_QUEST_REGISTRY } from '../src/data/caiden/caidenAdaptiveBuilder';
import { MIRANDA_ADAPTIVE_QUEST_REGISTRY } from '../src/data/miranda/mirandaAdaptiveBuilder';
import { selectAdaptiveQuestionPool } from '../src/lib/gradeBandQuestionSelection';
import { finalizeAdaptiveQuestions } from '../src/lib/adaptiveQuestionSelection';
import {
  classifyQuestionDifficultyTier,
  resolveGradeBandDifficultyCounts,
} from '../src/lib/questionDifficultySelection';
import { applyStagingToQuestions } from '../src/lib/stagingQuestionOverrides';
import { applyProductionQualityToQuestions } from '../src/lib/productionQualityPass';
import { filterQuestionsForGradeProfile } from '../src/lib/reasoningDepthFilter';
import type { StudentGradeBand } from '../src/types/gradeBandContentMetadata';

type AuditCase = {
  character: string;
  missionId: string;
  gradeLevel: string;
  gradeBand: StudentGradeBand;
  allowStretch: boolean;
};

const CASES: AuditCase[] = [
  { character: 'caiden', missionId: 'quest-3', gradeLevel: '6', gradeBand: '6-8', allowStretch: false },
  { character: 'caiden', missionId: 'quest-3', gradeLevel: '6', gradeBand: '6-8', allowStretch: true },
  { character: 'miranda', missionId: 'miranda-mystery-file-3', gradeLevel: '4', gradeBand: '4-5', allowStretch: false },
  { character: 'miranda', missionId: 'miranda-mystery-file-3', gradeLevel: '4', gradeBand: '4-5', allowStretch: true },
];

function auditCase(row: AuditCase): void {
  const registry =
    row.character === 'caiden' ? CAIDEN_ADAPTIVE_QUEST_REGISTRY : MIRANDA_ADAPTIVE_QUEST_REGISTRY;
  const mission = registry[row.missionId];
  if (!mission) {
    console.log('MISSING MISSION', row.missionId);
    return;
  }

  const authored = mission.gradeContent[row.gradeBand]?.questions ?? [];
  const pool = selectAdaptiveQuestionPool(mission.gradeContent, {
    gradeLevel: row.gradeLevel,
    gradeBand: row.gradeBand,
    allowStretch: row.allowStretch,
  });
  const afterReasoning = filterQuestionsForGradeProfile(pool.questions, row.gradeLevel);
  const staged = applyStagingToQuestions(pool.questions);
  const polished = applyProductionQualityToQuestions(staged);
  const final = finalizeAdaptiveQuestions(mission.gradeContent, {
    missionId: row.missionId,
    characterId: row.character,
    gradeLevel: row.gradeLevel,
    gradeBand: row.gradeBand,
    allowStretch: row.allowStretch,
  });

  const mix = resolveGradeBandDifficultyCounts(row.gradeBand);
  const tiers = pool.questions.map((q, i) => ({
    id: q.id,
    tier: classifyQuestionDifficultyTier(q, i, pool.questions.length),
    metadata: q.metadata?.difficulty ?? 'none',
  }));

  console.log('---');
  console.log('missionId:', row.missionId);
  console.log('character:', row.character);
  console.log('gradeBand:', row.gradeBand, 'gradeLevel:', row.gradeLevel, 'stretch:', row.allowStretch);
  console.log('authoredQuestionCount:', authored.length);
  console.log('authoredQuestionIds:', authored.map((q) => q.id));
  console.log('poolAfterBandSelect:', pool.questions.length, pool.questions.map((q) => q.id));
  console.log('afterReasoningFilter:', afterReasoning.length, afterReasoning.map((q) => q.id));
  console.log('difficultyMixTarget:', mix);
  console.log('tierBuckets:', tiers);
  console.log('selectedQuestionCount:', final.questions.length);
  console.log('selectedQuestionIds:', final.questions.map((q) => q.id));
  console.log('totalQuestions (runtime):', final.questions.length);
}

for (const row of CASES) {
  auditCase(row);
}
