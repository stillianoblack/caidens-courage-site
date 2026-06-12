/**
 * Adult-facing instructional content classification.
 * Generated/validated by scripts/normalizeAdultContent.mjs — do not map to kid 6-8 bands.
 */
import type {
  AdultContentDifficulty,
  ContentAudience,
  ContentVersionTag,
} from '../types/gradeBandContentMetadata';

export type AdultClassifiedEntry = {
  id: string;
  character: string;
  moduleId: string;
  sourceFile: string;
  questionPreview: string;
  audience: ContentAudience;
  gradeBand: 'adult';
  difficulty: AdultContentDifficulty;
  contentVersion: ContentVersionTag;
  skillTags: string[];
  skillArea: string;
  classificationNote?: string;
};

function uncleTQuestions(
  missionNum: number,
  moduleId: string,
  sourceFile: string,
  idPrefix: string,
  skillArea: string,
): AdultClassifiedEntry[] {
  const ids =
    missionNum === 1
      ? ['ut-q1', 'ut-q2', 'ut-q3', 'ut-q4', 'ut-q5', 'ut-q6', 'ut-q7', 'ut-q8']
      : Array.from({ length: 8 }, (_, i) => `${idPrefix}-q${i + 1}`);

  return ids.map((id, i) => ({
    id,
    character: 'uncle-t',
    moduleId,
    sourceFile,
    questionPreview: `Uncle T mission ${missionNum} coaching scenario ${i + 1}`,
    audience: 'facilitator' as ContentAudience,
    gradeBand: 'adult' as const,
    difficulty: 'adult_guidance' as AdultContentDifficulty,
    contentVersion: 'adult_normalized' as ContentVersionTag,
    skillTags: ['Coaching', 'Growth Mindset', 'Parent Mentor'],
    skillArea,
  }));
}

function drVictoriaQuestions(
  missionNum: number,
  moduleId: string,
  sourceFile: string,
  idPrefix: string,
  skillArea: string,
): AdultClassifiedEntry[] {
  const ids =
    missionNum === 1
      ? ['dv-q1', 'dv-q2', 'dv-q3', 'dv-q4', 'dv-q5', 'dv-q6', 'dv-q7', 'dv-q8']
      : Array.from({ length: 8 }, (_, i) => `${idPrefix}-q${i + 1}`);

  return ids.map((id, i) => ({
    id,
    character: 'dr-victoria',
    moduleId,
    sourceFile,
    questionPreview: `Dr. Victoria mission ${missionNum} reflection scenario ${i + 1}`,
    audience: 'facilitator' as ContentAudience,
    gradeBand: 'adult' as const,
    difficulty: 'adult_reflection' as AdultContentDifficulty,
    contentVersion: 'adult_normalized' as ContentVersionTag,
    skillTags: ['Understanding', 'Support Strategies', 'Facilitator Reflection'],
    skillArea,
  }));
}

export const ADULT_CONTENT_CLASSIFICATION: AdultClassifiedEntry[] = [
  ...uncleTQuestions(1, 'mission-1', 'adult/uncleTMission1.ts', 'ut', 'coaching'),
  ...uncleTQuestions(2, 'mission-2', 'adult/uncleTMission2.ts', 'ut2', 'confidence'),
  ...uncleTQuestions(3, 'mission-3', 'adult/uncleTMission3.ts', 'ut3', 'persistence'),
  ...drVictoriaQuestions(1, 'mission-1', 'adult/drVictoriaMission1.ts', 'dv', 'understanding'),
  ...drVictoriaQuestions(2, 'mission-2', 'adult/drVictoriaMission2.ts', 'dv2', 'communication'),
  ...drVictoriaQuestions(3, 'mission-3', 'adult/drVictoriaMission3.ts', 'dv3', 'executive-function'),
  ...drVictoriaQuestions(4, 'mission-4', 'adult/drVictoriaMission4.ts', 'dv4', 'behavior-support'),
  ...drVictoriaQuestions(5, 'mission-5', 'adult/drVictoriaMission5.ts', 'dv5', 'learning-styles'),
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `ag-q${i + 1}`,
    character: 'adult-training',
    moduleId: 'adult-growth-check',
    sourceFile: 'adultGrowthCheckContent.ts',
    questionPreview: `Adult growth check question ${i + 1}`,
    audience: 'facilitator' as ContentAudience,
    gradeBand: 'adult' as const,
    difficulty: 'adult_reflection' as AdultContentDifficulty,
    contentVersion: 'adult_normalized' as ContentVersionTag,
    skillTags: ['Adult Learning', 'Understanding', 'Support Strategies'],
    skillArea: 'adult-learning',
  })),
];

export const ADULT_CONTENT_SOURCE_FILES = [
  'adult/uncleTMission1.ts',
  'adult/uncleTMission2.ts',
  'adult/uncleTMission3.ts',
  'adult/drVictoriaMission1.ts',
  'adult/drVictoriaMission2.ts',
  'adult/drVictoriaMission3.ts',
  'adult/drVictoriaMission4.ts',
  'adult/drVictoriaMission5.ts',
  'adultGrowthCheckContent.ts',
  'adult/adultGuideRegistry.ts',
] as const;
