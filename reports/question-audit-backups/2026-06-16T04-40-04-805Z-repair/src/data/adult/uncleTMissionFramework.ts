import type { GameAssessmentConfig, GameQuestion, GameScoreMessage } from '../../types/gameAssessment';
import { UNCLE_T_MISSION_AVATAR } from './sharedAssets';

export const UNCLE_T_SERIES_TITLE = "Uncle T\u2019s Coaching Corner";
export const UNCLE_T_SERIES_AUDIENCE = 'Parents, Teachers, Counselors, Camp Staff';

export const UNCLE_T_FRAMEWORK = {
  decorVariant: 'uncle-t' as const,
  presentationStyle: 'coaching_card' as const,
  shellClassName: 'uncle-t-game',
  ...UNCLE_T_MISSION_AVATAR,
};

export type UncleTMissionParams = {
  id: string;
  subtitle: string;
  landingBody: string;
  completeTitle: string;
  completeMessage: string;
  badges: string[];
  scoreMessages: GameScoreMessage[];
  questions: GameQuestion[];
  landingCta?: string;
};

export function buildUncleTMissionConfig(params: UncleTMissionParams): GameAssessmentConfig {
  return {
    id: params.id,
    ...UNCLE_T_MISSION_AVATAR,
    decorVariant: UNCLE_T_FRAMEWORK.decorVariant,
    presentationStyle: UNCLE_T_FRAMEWORK.presentationStyle,
    shellClassName: UNCLE_T_FRAMEWORK.shellClassName,
    landing: {
      eyebrow: 'ADULT TRAINING',
      title: UNCLE_T_SERIES_TITLE,
      subtitle: params.subtitle,
      body: params.landingBody,
      cta: params.landingCta ?? 'Start Coaching',
    },
    complete: {
      title: params.completeTitle,
      message: params.completeMessage,
      badges: params.badges,
      scoreMessages: params.scoreMessages,
    },
    questions: params.questions,
  };
}
