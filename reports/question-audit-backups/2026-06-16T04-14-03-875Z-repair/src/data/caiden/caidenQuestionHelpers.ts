import type {
  CaidenAdaptiveQuestion,
  CaidenGradeBand,
  CaidenGradeContent,
} from '../../types/caidenAdaptiveQuest';
import type { ContentDifficulty } from '../../types/gradeBandContentMetadata';
import type { GradeBandQuestionMetadata } from '../../types/gradeBandContentMetadata';

type ChoiceTuple = readonly [string, string, string, string];

export type RawCaidenQuestion = {
  id: string;
  question: string;
  scenarioText?: string;
  scenarioTag?: string;
  scenarioAccent?: string;
  choices: ChoiceTuple;
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  hint: string;
  skillTags?: string[];
};

const CHOICE_IDS = ['a', 'b', 'c', 'd'] as const;

function difficultyForBand(band: CaidenGradeBand): ContentDifficulty {
  if (band === 'K-1' || band === '2-3') return 'beginner';
  if (band === '4-5') return 'intermediate';
  return 'advanced';
}

export function makeCaidenQuestion(
  raw: RawCaidenQuestion,
  skillArea: string,
  moduleId: string,
  gradeBand: CaidenGradeBand,
): CaidenAdaptiveQuestion {
  const skillTags = raw.skillTags ?? [skillArea];
  return {
    id: raw.id,
    question: raw.question,
    scenarioText: raw.scenarioText,
    scenarioTag: raw.scenarioTag,
    scenarioAccent: raw.scenarioAccent,
    options: raw.choices.map((label, index) => ({ id: CHOICE_IDS[index], label })),
    correctAnswer: CHOICE_IDS[raw.correctIndex],
    explanation: raw.explanation,
    hint: raw.hint,
    skillTags,
    metadata: {
      audience: 'kid',
      gradeBand,
      difficulty: difficultyForBand(gradeBand),
      character: 'caiden',
      skillTags,
      skillArea,
      contentVersion: 'adaptive_v2',
      sourceId: moduleId,
    },
  };
}

export function bandContent(
  dashboardTitle: string,
  dashboardDescription: string,
  questions: CaidenAdaptiveQuestion[],
  skillTags: string[],
): CaidenGradeContent {
  return {
    dashboardTitle,
    dashboardDescription,
    skillTags,
    questions,
  };
}

export function caidenBandMetadata(
  gradeBand: CaidenGradeBand,
  skillArea: string,
  moduleId: string,
  difficulty?: ContentDifficulty,
): GradeBandQuestionMetadata {
  return {
    audience: 'kid',
    gradeBand,
    difficulty: difficulty ?? difficultyForBand(gradeBand),
    character: 'caiden',
    skillTags: [skillArea],
    skillArea,
    contentVersion: 'adaptive_v2',
    sourceId: moduleId,
  };
}

export function buildBandQuestions(
  raws: RawCaidenQuestion[],
  skillArea: string,
  moduleId: string,
  gradeBand: CaidenGradeBand,
): CaidenAdaptiveQuestion[] {
  return raws.map((raw) => makeCaidenQuestion(raw, skillArea, moduleId, gradeBand));
}
