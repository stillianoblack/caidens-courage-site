import { useEffect, useMemo, useState } from 'react';

export type CinematicCharacterAnimationState = 'idle' | 'success' | 'thinking' | 'incorrect';

type UseCinematicCharacterAnimationStateInput = {
  enabled: boolean;
  questionKey: string;
  checked: boolean;
  feedbackTone: 'success' | 'try' | 'neutral';
  hasAnswer: boolean;
};

const SUCCESS_ANIMATION_MS = 1000;
const INCORRECT_ANIMATION_MS = 900;

/**
 * Drives `data-character-state` on the cinematic hero panel.
 * CSS keyframes handle motion for now.
 *
 * TODO(future): Swap CSS celebration classes for Lottie/Rive character rigs
 * (success bounce, thinking loop, gentle incorrect reaction) without changing callers.
 */
export function useCinematicCharacterAnimationState({
  enabled,
  questionKey,
  checked,
  feedbackTone,
  hasAnswer,
}: UseCinematicCharacterAnimationStateInput): CinematicCharacterAnimationState {
  const [celebrationState, setCelebrationState] = useState<'success' | 'incorrect' | null>(null);

  useEffect(() => {
    setCelebrationState(null);
  }, [questionKey]);

  useEffect(() => {
    if (!enabled) {
      setCelebrationState(null);
      return;
    }

    if (!checked) {
      setCelebrationState(null);
      return;
    }

    if (feedbackTone === 'success') {
      setCelebrationState('success');
      const timer = window.setTimeout(() => setCelebrationState(null), SUCCESS_ANIMATION_MS);
      return () => window.clearTimeout(timer);
    }

    if (feedbackTone === 'try') {
      setCelebrationState('incorrect');
      const timer = window.setTimeout(() => setCelebrationState(null), INCORRECT_ANIMATION_MS);
      return () => window.clearTimeout(timer);
    }

    setCelebrationState(null);
  }, [checked, enabled, feedbackTone, questionKey]);

  return useMemo(() => {
    if (!enabled) return 'idle';
    if (celebrationState) return celebrationState;
    if (hasAnswer && !checked) return 'thinking';
    return 'idle';
  }, [celebrationState, checked, enabled, hasAnswer]);
}
