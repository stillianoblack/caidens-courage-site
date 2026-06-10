import { useLayoutEffect, useState, type RefObject } from 'react';
import type { GameAnswerValue } from '../../types/gameAssessment';

function measureCaretTop(
  answer: GameAnswerValue,
  answersEl: HTMLElement,
  railEl: HTMLElement,
): number | undefined {
  const selectedId =
    typeof answer === 'string'
      ? answer
      : typeof answer === 'boolean'
        ? answer
          ? 'true'
          : 'false'
        : null;
  if (!selectedId) return undefined;

  const selectedBtn = answersEl.querySelector<HTMLElement>(`[data-answer-id="${selectedId}"]`);
  if (!selectedBtn) return undefined;

  const railRect = railEl.getBoundingClientRect();
  const btnRect = selectedBtn.getBoundingClientRect();
  const center = btnRect.top - railRect.top + btnRect.height / 2;
  return Math.max(12, center - 6);
}

export function useCoachingRailCaret(
  answer: GameAnswerValue,
  answersWrapRef: RefObject<HTMLElement | null>,
  railShellRef: RefObject<HTMLElement | null>,
): number | undefined {
  const [caretTop, setCaretTop] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const answersEl = answersWrapRef.current;
    const railEl = railShellRef.current;

    if (!answersEl || !railEl) {
      setCaretTop(undefined);
      return;
    }

    const update = () => {
      setCaretTop(measureCaretTop(answer, answersEl, railEl));
    };

    update();

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(answersEl);
    window.addEventListener('resize', update);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [answer, answersWrapRef, railShellRef]);

  return caretTop;
}
