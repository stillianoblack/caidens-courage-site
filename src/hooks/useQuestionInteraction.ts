import { useCallback, useMemo, useRef, useState } from 'react';
import type { GameAnswerValue } from '../types/gameAssessment';
import type { QuestionAttemptRecord, QuestionInteractionState } from '../types/questionInteraction';

export type UseQuestionInteractionOptions = {
  questionId: string;
  /** Max submitted checks before Continue is allowed on incorrect. Default 2. */
  maxAttempts?: number;
  /** Hint strings (max 2). */
  hints?: string[];
  isAnswerComplete: (answer: GameAnswerValue) => boolean;
  isAnswerCorrect: (answer: GameAnswerValue) => boolean;
  getCorrectFeedback: () => string;
  getIncorrectFeedback: () => string;
  explainMore?: string;
};

export type UseQuestionInteractionResult = {
  answer: GameAnswerValue;
  interactionState: QuestionInteractionState;
  checked: boolean;
  feedback: string | null;
  feedbackTone: 'success' | 'try' | 'neutral';
  attemptsCount: number;
  hintsUsedCount: number;
  activeHint: string | null;
  showExplainMore: boolean;
  canCheck: boolean;
  canContinue: boolean;
  canTryAgain: boolean;
  canUseHint: boolean;
  canExplainMore: boolean;
  isCorrect: boolean;
  selectAnswer: (value: GameAnswerValue) => void;
  check: () => void;
  tryAgain: () => void;
  useHint: () => void;
  toggleExplainMore: () => void;
  reset: () => void;
  buildAttemptRecord: () => QuestionAttemptRecord;
};

function emptyAnswer(): GameAnswerValue {
  return null;
}

export function useQuestionInteraction(
  options: UseQuestionInteractionOptions,
): UseQuestionInteractionResult {
  const {
    questionId,
    maxAttempts = 2,
    hints = [],
    isAnswerComplete,
    isAnswerCorrect,
    getCorrectFeedback,
    getIncorrectFeedback,
    explainMore,
  } = options;

  const [answer, setAnswer] = useState<GameAnswerValue>(emptyAnswer());
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'try' | 'neutral'>('neutral');
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [showExplainMore, setShowExplainMore] = useState(false);

  const firstSelectedRef = useRef<GameAnswerValue>(null);
  const firstAttemptCorrectRef = useRef<boolean | null>(null);

  const isCorrect = checked && isAnswerCorrect(answer);
  const hasAnswer = isAnswerComplete(answer);

  const interactionState: QuestionInteractionState = useMemo(() => {
    if (checked && isAnswerCorrect(answer)) return 'submitted_correct';
    if (checked && !isAnswerCorrect(answer)) return 'submitted_incorrect';
    if (hintsUsedCount >= 2) return 'hint_2_used';
    if (hintsUsedCount >= 1) return 'hint_1_used';
    if (hasAnswer) return 'selected';
    return 'idle';
  }, [answer, checked, hasAnswer, hintsUsedCount, isAnswerCorrect]);

  const canCheck = hasAnswer && !checked;
  const canTryAgain = checked && !isAnswerCorrect(answer) && attemptsCount < maxAttempts;
  const canUseHint =
    hints.length > 0 && hintsUsedCount < hints.length && (!checked || canTryAgain);
  const canExplainMore = Boolean(
    explainMore && checked && (isAnswerCorrect(answer) || attemptsCount >= maxAttempts),
  );
  const canContinue =
    checked && (isAnswerCorrect(answer) || attemptsCount >= maxAttempts);

  const selectAnswer = useCallback(
    (value: GameAnswerValue) => {
      if (checked) return;
      setAnswer(value);
    },
    [checked],
  );

  const check = useCallback(() => {
    if (!isAnswerComplete(answer) || checked) return;

    const correct = isAnswerCorrect(answer);
    const nextAttempts = attemptsCount + 1;

    if (firstSelectedRef.current == null) {
      firstSelectedRef.current = answer;
      firstAttemptCorrectRef.current = correct;
    }

    setAttemptsCount(nextAttempts);
    setChecked(true);
    setFeedback(correct ? getCorrectFeedback() : getIncorrectFeedback());
    setFeedbackTone(correct ? 'success' : 'try');
  }, [
    answer,
    attemptsCount,
    checked,
    getCorrectFeedback,
    getIncorrectFeedback,
    isAnswerComplete,
    isAnswerCorrect,
  ]);

  const tryAgain = useCallback(() => {
    if (!canTryAgain) return;
    setChecked(false);
    setFeedback(null);
    setFeedbackTone('neutral');
    setShowExplainMore(false);
    setAnswer(emptyAnswer());
  }, [canTryAgain]);

  const useHint = useCallback(() => {
    if (!canUseHint || hintsUsedCount >= hints.length) return;
    const hint = hints[hintsUsedCount];
    setHintsUsedCount((count) => count + 1);
    setActiveHint(hint);
  }, [canUseHint, hints, hintsUsedCount]);

  const toggleExplainMore = useCallback(() => {
    if (!canExplainMore) return;
    setShowExplainMore((open) => !open);
  }, [canExplainMore]);

  const reset = useCallback(() => {
    setAnswer(emptyAnswer());
    setChecked(false);
    setFeedback(null);
    setFeedbackTone('neutral');
    setAttemptsCount(0);
    setHintsUsedCount(0);
    setActiveHint(null);
    setShowExplainMore(false);
    firstSelectedRef.current = null;
    firstAttemptCorrectRef.current = null;
  }, []);

  const buildAttemptRecord = useCallback((): QuestionAttemptRecord => {
    const finalCorrect = isAnswerCorrect(answer);
    return {
      questionId,
      first_selected_answer: firstSelectedRef.current ?? answer,
      final_selected_answer: answer,
      is_correct_first_try: firstAttemptCorrectRef.current ?? finalCorrect,
      is_correct_final: finalCorrect,
      attempts_count: Math.max(attemptsCount, 1),
      hints_used_count: hintsUsedCount,
      completed_at: new Date().toISOString(),
    };
  }, [answer, attemptsCount, hintsUsedCount, isAnswerCorrect, questionId]);

  return {
    answer,
    interactionState,
    checked,
    feedback,
    feedbackTone,
    attemptsCount,
    hintsUsedCount,
    activeHint,
    showExplainMore,
    canCheck,
    canContinue,
    canTryAgain,
    canUseHint,
    canExplainMore,
    isCorrect,
    selectAnswer,
    check,
    tryAgain,
    useHint,
    toggleExplainMore,
    reset,
    buildAttemptRecord,
  };
}
