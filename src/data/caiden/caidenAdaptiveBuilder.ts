import { resolveKidGradeBandWithFallback } from '../../lib/gradeBandContentResolver';
import {
  finalizeAdaptiveQuestions,
  type AdaptiveQuestionSelectionContext,
} from '../../lib/adaptiveQuestionSelection';
import { classifyQuestionDifficultyTier } from '../../lib/questionDifficultySelection';
import { stagingContentVersionSuffix } from '../../lib/stagingQuestionOverrides';
import type { GameAssessmentConfig, GameChoiceQuestion } from '../../types/gameAssessment';
import type { CaidenQuestAccent } from '../../types/gameAssessment';
import type {
  CaidenAdaptiveQuestFile,
  CaidenAdaptiveQuestion,
  CaidenGradeBand,
  CaidenGradeContent,
} from '../../types/caidenAdaptiveQuest';
import { MIRANDA_GRADE_BAND_LABELS } from '../../types/mirandaAdaptiveQuest';
import { CAIDEN_MISSION_AVATAR, CAIDEN_SCENARIO_ICON_SRC } from './sharedAssets';
import { CAIDEN_ADAPTIVE_COACH } from './caidenCoachCopy';

const PROMPT_START_PATTERN =
  /\b(What should|Which|Where should|How should|When should|Who should|Why should|What is|What are|What would|What could|What happens|What needs|What must|What do|What does|What did|What can|How can|How do|How does|Where is|Where are|Who is|Who are)\b/i;

function splitCaidenScenarioAndPrompt(
  question: CaidenAdaptiveQuestion,
): { scenarioText: string; promptText: string } {
  if (question.scenarioText?.trim()) {
    return {
      scenarioText: question.scenarioText.trim(),
      promptText: question.question.trim(),
    };
  }

  const trimmed = question.question.trim();
  const match = trimmed.match(PROMPT_START_PATTERN);
  if (!match || match.index === undefined || match.index === 0) {
    return { scenarioText: trimmed, promptText: trimmed };
  }

  const scenarioText = trimmed.slice(0, match.index).trim().replace(/\.\s*$/, '');
  const promptText = trimmed.slice(match.index).trim();
  return {
    scenarioText: scenarioText || trimmed,
    promptText: promptText || trimmed,
  };
}

export const CAIDEN_ADAPTIVE_QUEST_REGISTRY: Record<string, CaidenAdaptiveQuestFile> = {};

export function registerCaidenAdaptiveQuest(quest: CaidenAdaptiveQuestFile): void {
  CAIDEN_ADAPTIVE_QUEST_REGISTRY[quest.id] = quest;
}

export function isCaidenAdaptiveQuestId(questId: string): boolean {
  return questId in CAIDEN_ADAPTIVE_QUEST_REGISTRY;
}

const LEGACY_DEFAULT_BAND: CaidenGradeBand = '2-3';

export function resolveCaidenGradeContent(
  quest: CaidenAdaptiveQuestFile,
  band: CaidenGradeBand,
): CaidenGradeContent {
  const { content } = resolveKidGradeBandWithFallback(quest.gradeContent, band, LEGACY_DEFAULT_BAND);
  return content;
}

export function caidenContentVersionId(questId: string, band: CaidenGradeBand): string {
  return `${questId}::${band}::${stagingContentVersionSuffix()}`;
}

function buildQuestion(
  question: CaidenAdaptiveQuestion,
  questSubtitle: string,
  index: number,
  diagnostic?: {
    sourceBand: string;
    contentBand: string;
    difficultyTier: string;
    contentVersion?: string;
  },
): GameChoiceQuestion {
  const { scenarioText, promptText } = splitCaidenScenarioAndPrompt(question);
  const tag = question.scenarioTag ?? questSubtitle.toUpperCase();

  return {
    id: question.id,
    type: 'multiple_choice',
    clueCard: {
      variant: 'focus_quest',
      label: 'Scenario',
      tag,
      text: scenarioText,
      accent: (question.scenarioAccent ?? 'priority') as CaidenQuestAccent,
      imageSrc: CAIDEN_SCENARIO_ICON_SRC,
    },
    story: scenarioText,
    question: promptText,
    prompt: promptText,
    options: question.options,
    correctId: question.correctAnswer,
    skillTags: question.skillTags,
    feedbackCorrect: question.explanation,
    correctFeedback: question.explanation,
    feedbackIncorrect: `Not quite. ${question.explanation}`,
    incorrectFeedback: `Not quite. ${question.explanation}`,
    hints: [question.hint],
    lockInTips: [question.hint],
    feedbackDetailCorrect: { whyItMatters: question.explanation },
    feedbackDetailIncorrect: { whyItMatters: question.explanation },
    diagnosticMeta: diagnostic,
  };
}

export function buildCaidenAdaptiveConfig(
  quest: CaidenAdaptiveQuestFile,
  gradeBand: CaidenGradeBand,
  selectionContext?: Omit<AdaptiveQuestionSelectionContext, 'missionId' | 'gradeBand'>,
): GameAssessmentConfig {
  const selection = finalizeAdaptiveQuestions(quest.gradeContent, {
    missionId: quest.id,
    characterId: quest.character,
    gradeBand,
    previewBand: selectionContext?.previewBand ?? null,
    ...selectionContext,
  });

  return {
    id: quest.id,
    fileNumber: quest.questNumber,
    decorVariant: 'caiden',
    presentationStyle: 'focus_quest',
    ...CAIDEN_MISSION_AVATAR,
    landing: quest.landing,
    complete: quest.complete,
    questions: selection.questions.map((q, index) =>
      buildQuestion(q, quest.subtitle, index, {
        sourceBand: selection.sourceBand,
        contentBand: selection.contentBand,
        difficultyTier: classifyQuestionDifficultyTier(q, index, selection.questions.length),
        contentVersion: q.metadata?.contentVersion,
      }),
    ),
    tracking: undefined,
    adaptiveMeta: {
      contentBand: selection.contentBand,
      sourceBand: selection.sourceBand,
      usedStretch: selection.usedStretch,
    },
  };
}

export function getCaidenDashboardDescription(
  quest: CaidenAdaptiveQuestFile,
  gradeBand: CaidenGradeBand,
): string {
  return resolveCaidenGradeContent(quest, gradeBand).dashboardDescription;
}

export function getCaidenDashboardTitle(
  quest: CaidenAdaptiveQuestFile,
  gradeBand: CaidenGradeBand,
): string {
  const content = resolveCaidenGradeContent(quest, gradeBand);
  return content.dashboardTitle || quest.title;
}

export function getCaidenGradeBandLabel(band: CaidenGradeBand): string {
  return MIRANDA_GRADE_BAND_LABELS[band];
}

export const CAIDEN_ADAPTIVE_QUEST_FEEDBACK = {
  feedbackCorrect: CAIDEN_ADAPTIVE_COACH.correct,
  feedbackIncorrect: CAIDEN_ADAPTIVE_COACH.incorrect,
  hints: [CAIDEN_ADAPTIVE_COACH.hint],
};
