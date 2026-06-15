import type { CharlieAdaptiveQuestion, CharlieGradeBand, CharlieGradeContent } from '../../types/charlieAdaptiveQuest';
import type { ContentDifficulty } from '../../types/gradeBandContentMetadata';

type ChoiceTuple = readonly [string, string, string, string];

type RawQuestion = {
  id: string;
  question: string;
  scenario?: string;
  tag?: string;
  choices: ChoiceTuple;
  correctIndex: 0 | 1 | 2 | 3;
  correctFeedback: string;
  incorrectFeedback: string;
  hint: string;
};

const CHOICE_IDS = ['a', 'b', 'c', 'd'] as const;

function difficultyForBand(band: CharlieGradeBand): ContentDifficulty {
  if (band === 'K-1') return 'beginner';
  if (band === '2-3') return 'beginner';
  if (band === '4-5') return 'intermediate';
  return 'advanced';
}

export function makeCharlieQuestion(
  raw: RawQuestion,
  skillArea: string,
  moduleId: string,
  moduleTitle: string,
  gradeBand: CharlieGradeBand,
): CharlieAdaptiveQuestion {
  return {
    id: raw.id,
    question: raw.question,
    scenarioText: raw.scenario,
    scenarioTag: raw.tag,
    options: raw.choices.map((label, index) => ({ id: CHOICE_IDS[index], label })),
    correctAnswer: CHOICE_IDS[raw.correctIndex],
    explanation: raw.correctFeedback,
    correctFeedback: raw.correctFeedback,
    incorrectFeedback: raw.incorrectFeedback,
    hint: raw.hint,
    skillTags: [skillArea],
    metadata: {
      audience: 'kid',
      gradeBand,
      difficulty: difficultyForBand(gradeBand),
      contentVersion: 'adaptive_v2',
      skillArea,
      skillTags: [skillArea],
      character: 'charlie',
      sourceId: moduleId,
    },
  };
}

export function bandContent(
  dashboardDescription: string,
  questions: CharlieAdaptiveQuestion[],
  skillArea: string,
  dashboardTitle?: string,
): CharlieGradeContent {
  return {
    dashboardTitle: dashboardTitle ?? '',
    dashboardDescription,
    skillTags: [skillArea, 'Science', 'Critical Thinking'],
    questions,
  };
}
