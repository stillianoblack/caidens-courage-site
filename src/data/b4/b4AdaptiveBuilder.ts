import { resolveKidGradeBandWithFallback } from '../../lib/gradeBandContentResolver';
import { resolveAdaptiveGradeBand } from '../../lib/getGradeBand';
import { readParticipantGradeSettings } from '../../lib/mirandaGradeBandResolver';
import {
  finalizeAdaptiveQuestions,
  type AdaptiveQuestionSelectionContext,
} from '../../lib/adaptiveQuestionSelection';
import { stagingContentVersionSuffix } from '../../lib/stagingQuestionOverrides';
import type { GameAssessmentConfig, GameChoiceQuestion } from '../../types/gameAssessment';
import type {
  B4AdaptiveMissionFile,
  B4AdaptiveQuestion,
  B4GradeBand,
  B4GradeContent,
} from '../../types/b4AdaptiveQuest';
import { B4_ADAPTIVE_COACH } from './b4CoachCopy';
import { B4_GAME_AVATAR_SRC } from './sharedAssets';

export const B4_ADAPTIVE_MISSION_REGISTRY: Record<string, B4AdaptiveMissionFile> = {};

export function registerB4AdaptiveMission(mission: B4AdaptiveMissionFile): void {
  B4_ADAPTIVE_MISSION_REGISTRY[mission.id] = mission;
}

export function isB4AdaptiveMissionId(missionId: string): boolean {
  return missionId in B4_ADAPTIVE_MISSION_REGISTRY;
}

const LEGACY_DEFAULT_BAND: B4GradeBand = '2-3';

export function resolveB4GradeContent(
  mission: B4AdaptiveMissionFile,
  band: B4GradeBand,
): B4GradeContent {
  const { content } = resolveKidGradeBandWithFallback(mission.gradeContent, band, LEGACY_DEFAULT_BAND);
  return content;
}

export function b4ContentVersionId(missionId: string, band: B4GradeBand): string {
  return `${missionId}::${band}::${stagingContentVersionSuffix()}`;
}

function buildQuestion(
  question: B4AdaptiveQuestion,
  mission: B4AdaptiveMissionFile,
): GameChoiceQuestion {
  const scenarioText = question.scenarioText ?? mission.storySetup;

  return {
    id: question.id,
    type: 'multiple_choice',
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

export function buildB4AdaptiveConfig(
  mission: B4AdaptiveMissionFile,
  gradeBand: B4GradeBand,
  selectionContext?: Omit<AdaptiveQuestionSelectionContext, 'missionId' | 'gradeBand'>,
): GameAssessmentConfig {
  const selection = finalizeAdaptiveQuestions(mission.gradeContent, {
    missionId: mission.id,
    gradeBand,
    previewBand: selectionContext?.previewBand ?? null,
    ...selectionContext,
  });

  return {
    id: mission.id,
    fileNumber: mission.missionNumber,
    decorVariant: 'b4',
    presentationStyle: 'default',
    shellClassName: 'b4-game',
    avatarSrc: B4_GAME_AVATAR_SRC,
    avatarAlt: 'B-4',
    landing: mission.landing,
    complete: mission.complete,
    questions: selection.questions.map((q) => buildQuestion(q, mission)),
    tracking: undefined,
    adaptiveMeta: {
      contentBand: selection.contentBand,
      sourceBand: selection.sourceBand,
      usedStretch: selection.usedStretch,
    },
  };
}

export function getB4DashboardDescription(
  mission: B4AdaptiveMissionFile,
  gradeBand: B4GradeBand,
): string {
  return resolveB4GradeContent(mission, gradeBand).dashboardDescription;
}

export function getB4MissionForParticipant(input: {
  missionId: string;
  participantId?: string;
  gradeLevel?: string | null;
  gradeBand?: string | null;
}): GameAssessmentConfig | undefined {
  const mission = B4_ADAPTIVE_MISSION_REGISTRY[input.missionId];
  if (!mission) return undefined;

  const settings = input.participantId
    ? readParticipantGradeSettings(input.participantId)
    : { gradeLevel: input.gradeLevel ?? null, gradeBand: input.gradeBand ?? null, allowStretch: false };

  const band = resolveAdaptiveGradeBand({
    gradeLevel: settings.gradeLevel ?? input.gradeLevel,
    gradeBand: settings.gradeBand ?? input.gradeBand,
    allowStretch: settings.allowStretch,
  });

  return buildB4AdaptiveConfig(mission, band, {
    participantId: input.participantId,
    gradeLevel: settings.gradeLevel ?? input.gradeLevel,
  });
}

export const B4_ADAPTIVE_MISSION_FEEDBACK = B4_ADAPTIVE_COACH;
