import type { GameQuestion } from '../../types/gameAssessment';
import type { MissionGameTheme } from '../../components/mission-game/MissionSpeechRow';
import { getB4LockInTip, type B4LockInPortalType } from './getB4LockInTip';

export type FeedbackRhythmMode = 'kid' | 'family' | 'facilitator';

/** B-4 lock-in tips (after Check only) for these themes. */
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

/** @deprecated Prefer getB4LockInTip — kept for legacy callers */
export function resolveLockInTips(
  question: GameQuestion,
  tone: 'success' | 'try' | 'neutral',
  portalType: B4LockInPortalType = 'kid',
): string[] {
  return getB4LockInTip({
    portalType,
    questionId: question.id,
    selectedAnswer: null,
    isCorrect: tone === 'success',
    question,
  }).tips;
}

export function portalTypeToRhythm(portalType: 'facilitator' | 'family' | 'kid'): FeedbackRhythmMode {
  return portalType;
}
