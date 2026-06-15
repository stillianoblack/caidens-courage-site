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
  ZekeAdaptiveMissionFile,
  ZekeAdaptiveQuestion,
  ZekeGradeBand,
  ZekeGradeContent,
} from '../../types/zekeAdaptiveQuest';
import { ZEKE_ADAPTIVE_COACH } from './zekeCoachCopy';
import { ZEKE_AVATAR_SRC } from './sharedAssets';

export const ZEKE_ADAPTIVE_MISSION_REGISTRY: Record<string, ZekeAdaptiveMissionFile> = {};

export function registerZekeAdaptiveMission(mission: ZekeAdaptiveMissionFile): void {
  ZEKE_ADAPTIVE_MISSION_REGISTRY[mission.id] = mission;
}

export function isZekeAdaptiveMissionId(missionId: string): boolean {
  return missionId in ZEKE_ADAPTIVE_MISSION_REGISTRY;
}

const LEGACY_DEFAULT_BAND: ZekeGradeBand = '2-3';

export function resolveZekeGradeContent(
  mission: ZekeAdaptiveMissionFile,
  band: ZekeGradeBand,
): ZekeGradeContent {
  const { content } = resolveKidGradeBandWithFallback(mission.gradeContent, band, LEGACY_DEFAULT_BAND);
  return content;
}

export function zekeContentVersionId(missionId: string, band: ZekeGradeBand): string {
  return `${missionId}::${band}::${stagingContentVersionSuffix()}`;
}

function buildQuestion(
  question: ZekeAdaptiveQuestion,
  mission: ZekeAdaptiveMissionFile,
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

export function buildZekeAdaptiveConfig(
  mission: ZekeAdaptiveMissionFile,
  gradeBand: ZekeGradeBand,
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
    decorVariant: 'default',
    presentationStyle: 'default',
    shellClassName: 'zeke-game',
    avatarSrc: ZEKE_AVATAR_SRC,
    avatarAlt: 'Zeke',
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

export function getZekeDashboardDescription(
  mission: ZekeAdaptiveMissionFile,
  gradeBand: ZekeGradeBand,
): string {
  return resolveZekeGradeContent(mission, gradeBand).dashboardDescription;
}

export function getZekeMissionForParticipant(input: {
  missionId: string;
  participantId?: string;
  gradeLevel?: string | null;
  gradeBand?: string | null;
}): GameAssessmentConfig | undefined {
  const mission = ZEKE_ADAPTIVE_MISSION_REGISTRY[input.missionId];
  if (!mission) return undefined;

  const settings = input.participantId
    ? readParticipantGradeSettings(input.participantId)
    : { gradeLevel: input.gradeLevel ?? null, gradeBand: input.gradeBand ?? null, allowStretch: false };

  const band = resolveAdaptiveGradeBand({
    gradeLevel: settings.gradeLevel ?? input.gradeLevel,
    gradeBand: settings.gradeBand ?? input.gradeBand,
    allowStretch: settings.allowStretch,
  });

  return buildZekeAdaptiveConfig(mission, band, {
    participantId: input.participantId,
    gradeLevel: settings.gradeLevel ?? input.gradeLevel,
  });
}

export const ZEKE_ADAPTIVE_MISSION_FEEDBACK = ZEKE_ADAPTIVE_COACH;
