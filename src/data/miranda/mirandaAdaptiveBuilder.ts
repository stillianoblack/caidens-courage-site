import type { GameAssessmentConfig, GameChoiceQuestion } from '../../types/gameAssessment';
import { resolveKidGradeBandWithFallback } from '../../lib/gradeBandContentResolver';
import {
  finalizeAdaptiveQuestions,
  type AdaptiveQuestionSelectionContext,
} from '../../lib/adaptiveQuestionSelection';
import {
  applyStagingToQuestions,
  stagingContentVersionSuffix,
} from '../../lib/stagingQuestionOverrides';
import type {
  MirandaAdaptiveFile,
  MirandaAdaptiveQuestion,
  MirandaGradeBand,
  MirandaGradeContent,
  MirandaGradeVariant,
} from '../../types/mirandaAdaptiveQuest';
import { MIRANDA_GRADE_BAND_LABELS } from '../../types/mirandaAdaptiveQuest';
import { MIRANDA_MISSION_AVATAR } from './sharedAssets';
import { MIRANDA_ADAPTIVE_COACH } from './mirandaCoachCopy';

export const MIRANDA_ADAPTIVE_QUEST_REGISTRY: Record<string, MirandaAdaptiveFile> = {};

export function registerMirandaAdaptiveFile(file: MirandaAdaptiveFile): void {
  MIRANDA_ADAPTIVE_QUEST_REGISTRY[file.id] = file;
}

export function isMirandaAdaptiveQuestId(missionId: string): boolean {
  return missionId in MIRANDA_ADAPTIVE_QUEST_REGISTRY;
}

const LEGACY_DEFAULT_BAND: MirandaGradeBand = '2-3';

export function resolveMirandaGradeContent(
  file: MirandaAdaptiveFile,
  band: MirandaGradeBand,
): MirandaGradeContent {
  const { content } = resolveKidGradeBandWithFallback(file.gradeContent, band, LEGACY_DEFAULT_BAND);
  return content;
}

export function mirandaContentVersionId(fileId: string, band: MirandaGradeBand): string {
  return `${fileId}::${band}::${stagingContentVersionSuffix()}`;
}

function buildQuestion(
  question: MirandaAdaptiveQuestion,
  passage: string,
  eyebrow: string,
): GameChoiceQuestion {
  return {
    id: question.id,
    type: 'multiple_choice',
    clueCard: {
      variant: 'case_file',
      label: 'SCENARIO',
      tag: eyebrow,
      text: passage,
      accent: 'note',
    },
    story: passage,
    question: question.question,
    prompt: question.question,
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
  };
}

export function buildGradeVariant(
  band: MirandaGradeBand,
  content: MirandaGradeContent,
): MirandaGradeVariant {
  return {
    gradeBandLabel: MIRANDA_GRADE_BAND_LABELS[band],
    passage: content.passage,
    dashboardDescription: content.dashboardDescription,
    questions: content.questions.map((q) =>
      buildQuestion(q, content.passage, content.scenarioEyebrow),
    ),
  };
}

export function buildMirandaAdaptiveConfig(
  file: MirandaAdaptiveFile,
  gradeBand: MirandaGradeBand,
  selectionContext?: Omit<AdaptiveQuestionSelectionContext, 'missionId' | 'gradeBand'>,
): GameAssessmentConfig {
  const content = resolveMirandaGradeContent(file, gradeBand);
  const selectedQuestions = finalizeAdaptiveQuestions(applyStagingToQuestions(content.questions), {
    missionId: file.id,
    gradeBand,
    ...selectionContext,
  });
  const variant = buildGradeVariant(gradeBand, { ...content, questions: selectedQuestions });

  return {
    id: file.id,
    fileNumber: file.fileNumber,
    decorVariant: 'miranda',
    presentationStyle: file.presentationStyle ?? 'case_file',
    ...MIRANDA_MISSION_AVATAR,
    landing: {
      ...file.landing,
      body:
        file.landing.body ||
        `${content.dashboardDescription} ${content.passage.slice(0, 120)}…`,
    },
    complete: file.complete,
    questions: variant.questions,
    tracking: undefined,
  };
}

export function getMirandaDashboardDescription(
  file: MirandaAdaptiveFile,
  gradeBand: MirandaGradeBand,
): string {
  return resolveMirandaGradeContent(file, gradeBand).dashboardDescription;
}

export function getMirandaDashboardTitle(
  file: MirandaAdaptiveFile,
  gradeBand: MirandaGradeBand,
): string {
  const content = resolveMirandaGradeContent(file, gradeBand);
  return content.dashboardTitle || file.title;
}

export const MIRANDA_ADAPTIVE_QUEST_FEEDBACK = {
  feedbackCorrect: MIRANDA_ADAPTIVE_COACH.correct,
  feedbackIncorrect: MIRANDA_ADAPTIVE_COACH.incorrect,
  hints: [MIRANDA_ADAPTIVE_COACH.hint],
};
