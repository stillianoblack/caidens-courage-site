import { resolveKidGradeBandWithFallback } from '../../lib/gradeBandContentResolver';
import { resolveAdaptiveGradeBand } from '../../lib/getGradeBand';
import { readParticipantGradeSettings } from '../../lib/mirandaGradeBandResolver';
import {
  finalizeAdaptiveQuestions,
  type AdaptiveQuestionSelectionContext,
} from '../../lib/adaptiveQuestionSelection';
import {
  applyStagingToQuestions,
  stagingContentVersionSuffix,
} from '../../lib/stagingQuestionOverrides';
import type { GameAssessmentConfig, GameChoiceQuestion } from '../../types/gameAssessment';
import type { CharlieNatureAccent } from '../../types/gameAssessment';
import type {
  CharlieAdaptiveMissionFile,
  CharlieAdaptiveQuestion,
  CharlieGradeBand,
  CharlieGradeContent,
} from '../../types/charlieAdaptiveQuest';
import { CHARLIE_ADAPTIVE_COACH } from './charlieCoachCopy';
import { CHARLIE_AVATAR_SRC } from './sharedAssets';

export const CHARLIE_ADAPTIVE_MISSION_REGISTRY: Record<string, CharlieAdaptiveMissionFile> = {};

export function registerCharlieAdaptiveMission(mission: CharlieAdaptiveMissionFile): void {
  CHARLIE_ADAPTIVE_MISSION_REGISTRY[mission.id] = mission;
}

export function isCharlieAdaptiveMissionId(missionId: string): boolean {
  return missionId in CHARLIE_ADAPTIVE_MISSION_REGISTRY;
}

const LEGACY_DEFAULT_BAND: CharlieGradeBand = '2-3';

export function resolveCharlieGradeContent(
  mission: CharlieAdaptiveMissionFile,
  band: CharlieGradeBand,
): CharlieGradeContent {
  const { content } = resolveKidGradeBandWithFallback(mission.gradeContent, band, LEGACY_DEFAULT_BAND);
  return content;
}

export function charlieContentVersionId(missionId: string, band: CharlieGradeBand): string {
  return `${missionId}::${band}::${stagingContentVersionSuffix()}`;
}

function buildQuestion(
  question: CharlieAdaptiveQuestion,
  mission: CharlieAdaptiveMissionFile,
): GameChoiceQuestion {
  const scenarioText = question.scenarioText ?? mission.storySetup;
  const tag = question.scenarioTag ?? mission.subtitle.toUpperCase();

  return {
    id: question.id,
    type: 'multiple_choice',
    clueCard: {
      variant: 'nature_card',
      label: 'SCIENCE MOMENT',
      tag,
      text: scenarioText,
      accent: (question.scenarioAccent ?? mission.scenarioAccent) as CharlieNatureAccent,
    },
    story: scenarioText,
    question: question.question,
    prompt: question.question,
    options: question.options,
    correctId: question.correctAnswer,
    skillTags: question.skillTags,
    feedbackCorrect: question.correctFeedback,
    correctFeedback: question.correctFeedback,
    feedbackIncorrect: question.incorrectFeedback,
    incorrectFeedback: question.incorrectFeedback,
    hints: [question.hint],
    lockInTips: [mission.missionB4Tip],
    feedbackDetailCorrect: { whyItMatters: question.explanation },
    feedbackDetailIncorrect: { whyItMatters: question.explanation },
  };
}

export function buildCharlieAdaptiveConfig(
  mission: CharlieAdaptiveMissionFile,
  gradeBand: CharlieGradeBand,
  selectionContext?: Omit<AdaptiveQuestionSelectionContext, 'missionId' | 'gradeBand'>,
): GameAssessmentConfig {
  const content = resolveCharlieGradeContent(mission, gradeBand);
  const questions = finalizeAdaptiveQuestions(applyStagingToQuestions(content.questions), {
    missionId: mission.id,
    gradeBand,
    ...selectionContext,
  });

  return {
    id: mission.id,
    fileNumber: mission.missionNumber,
    decorVariant: 'charlie',
    presentationStyle: 'nature_card',
    shellClassName: 'charlie-game',
    avatarSrc: CHARLIE_AVATAR_SRC,
    avatarAlt: 'Charlie Perk',
    landing: mission.landing,
    complete: mission.complete,
    questions: questions.map((q) => buildQuestion(q, mission)),
    tracking: undefined,
  };
}

export function getCharlieDashboardDescription(
  mission: CharlieAdaptiveMissionFile,
  gradeBand: CharlieGradeBand,
): string {
  return resolveCharlieGradeContent(mission, gradeBand).dashboardDescription;
}

export function getCharlieMissionForParticipant(input: {
  missionId: string;
  participantId?: string;
  gradeLevel?: string | null;
  gradeBand?: string | null;
}): GameAssessmentConfig | undefined {
  const mission = CHARLIE_ADAPTIVE_MISSION_REGISTRY[input.missionId];
  if (!mission) return undefined;

  const settings = input.participantId
    ? readParticipantGradeSettings(input.participantId)
    : { gradeLevel: input.gradeLevel ?? null, gradeBand: input.gradeBand ?? null, allowStretch: false };

  const band = resolveAdaptiveGradeBand({
    gradeLevel: settings.gradeLevel ?? input.gradeLevel,
    gradeBand: settings.gradeBand ?? input.gradeBand,
    allowStretch: settings.allowStretch,
  });

  return buildCharlieAdaptiveConfig(mission, band, {
    participantId: input.participantId,
    gradeLevel: settings.gradeLevel ?? input.gradeLevel,
  });
}

export const CHARLIE_ADAPTIVE_MISSION_FEEDBACK = CHARLIE_ADAPTIVE_COACH;
