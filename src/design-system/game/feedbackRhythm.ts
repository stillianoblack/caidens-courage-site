import type { GameFeedbackDetail, GameQuestion } from '../../types/gameAssessment';
import type { MissionGameTheme } from '../../components/mission-game/MissionSpeechRow';

export type FeedbackRhythmMode = 'kid' | 'family' | 'facilitator';

/** B-4 lock-in tips appear after answer check for these themes. */
export function usesB4LockInFeedback(theme: MissionGameTheme): boolean {
  return theme === 'caiden' || theme === 'b4' || theme === 'miranda' || theme === 'charlie';
}

/** Expert insight cards appear every N questions for adult learning games. */
export function shouldShowExpertInsight(
  questionIndex: number,
  options?: { interval?: number; force?: boolean },
): boolean {
  if (options?.force) return true;
  const interval = options?.interval ?? 3;
  return (questionIndex + 1) % interval === 0;
}

export function resolveLockInTips(
  question: GameQuestion,
  tone: 'success' | 'try' | 'neutral',
): string[] {
  const toneTips =
    tone === 'success'
      ? question.lockInTipsCorrect ?? question.lockInTips
      : question.lockInTipsIncorrect ?? question.lockInTips;
  if (Array.isArray(toneTips) && toneTips.length) {
    return toneTips;
  }

  const detail: GameFeedbackDetail | undefined =
    tone === 'success'
      ? question.feedbackDetailCorrect ?? question.feedbackDetail
      : question.feedbackDetailIncorrect ?? question.feedbackDetail;

  if (detail?.tryThis?.length) {
    return [...detail.tryThis];
  }

  if (tone === 'success') {
    return [
      'Name the first step out loud.',
      'Set a short timer for one focus burst.',
      'Celebrate the small win before moving on.',
    ];
  }

  return [
    'Pause and take one calm breath.',
    'Ask: what needs to happen first?',
    'Pick one small step and try again.',
  ];
}

export function portalTypeToRhythm(portalType: 'facilitator' | 'family' | 'kid'): FeedbackRhythmMode {
  return portalType;
}
