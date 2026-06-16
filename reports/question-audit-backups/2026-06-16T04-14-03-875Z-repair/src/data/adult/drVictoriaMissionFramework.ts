import type { GameAssessmentConfig, GameQuestion, GameScoreMessage } from '../../types/gameAssessment';
import { DR_VICTORIA_MISSION_AVATAR } from './sharedAssets';

/** Shared Dr. Victoria adult training game shell — UI lives in victoria-game / mission-game CSS. */
export const DR_VICTORIA_SERIES_TITLE = "Dr. Victoria\u2019s Understanding Different Minds";
export const DR_VICTORIA_SERIES_AUDIENCE = 'Parents, Teachers, Counselors, Camp Staff';

export const DR_VICTORIA_FRAMEWORK = {
  decorVariant: 'victoria' as const,
  presentationStyle: 'reflection_card' as const,
  shellClassName: 'victoria-game',
  ...DR_VICTORIA_MISSION_AVATAR,
};

export type DrVictoriaMissionParams = {
  id: string;
  subtitle: string;
  landingBody: string;
  completeTitle: string;
  completeMessage: string;
  badges: string[];
  scoreMessages: GameScoreMessage[];
  questions: GameQuestion[];
  presentationStyle?: 'reflection_card' | 'focus_lab';
  decorVariant?: 'victoria' | 'victoria-focus-lab';
  shellClassName?: string;
  landingCta?: string;
};

export function buildDrVictoriaMissionConfig(params: DrVictoriaMissionParams): GameAssessmentConfig {
  return {
    id: params.id,
    ...DR_VICTORIA_MISSION_AVATAR,
    decorVariant: params.decorVariant ?? DR_VICTORIA_FRAMEWORK.decorVariant,
    presentationStyle: params.presentationStyle ?? DR_VICTORIA_FRAMEWORK.presentationStyle,
    shellClassName: params.shellClassName ?? DR_VICTORIA_FRAMEWORK.shellClassName,
    landing: {
      eyebrow: 'ADULT TRAINING',
      title: DR_VICTORIA_SERIES_TITLE,
      subtitle: params.subtitle,
      body: params.landingBody,
      cta: params.landingCta ?? 'Start Training',
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
