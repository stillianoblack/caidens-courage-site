import React, { useCallback, useEffect, useRef, useState } from 'react';
import CheckButton from '../../design-system/game/CheckButton';
import StepMicroFeedback from './StepMicroFeedback';
import {
  FOCUS_REFLECTION_B4,
  FOCUS_REFLECTION_HEADER,
  FOCUS_REFLECTION_OPTIONS,
  FOCUS_REFLECTION_PROMPT,
  type ReflectionOption,
} from './focusFlameReflection';
import { FOCUS_POINT_AWARDS } from './focusFlameRanks';

export default function FocusReflectionStep({
  resetKey,
  onAwardPoints,
  onB4Message,
  onTryAgainSound,
  onCorrectB4Clip,
  onContinue,
  onContinueClick,
}: {
  resetKey: string;
  onAwardPoints: () => void;
  onB4Message: (message: string) => void;
  onTryAgainSound?: () => void;
  onCorrectB4Clip?: () => void;
  onContinue: () => void;
  onContinueClick: () => void;
}) {
  const correctOption = FOCUS_REFLECTION_OPTIONS.find((o) => o.isCorrect)!;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [revealedCorrect, setRevealedCorrect] = useState(false);
  const [headline, setHeadline] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPoints, setShowPoints] = useState(false);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [showContinue, setShowContinue] = useState(false);

  const feedbackPlayedRef = useRef(false);
  const pointsAwardedRef = useRef(false);

  const resetStep = useCallback(() => {
    setSelectedId(null);
    setChecked(false);
    setAttempts(0);
    setResolved(false);
    setRevealedCorrect(false);
    setHeadline(null);
    setMessage(null);
    setShowPoints(false);
    setFeedbackKey(0);
    setShowContinue(false);
    feedbackPlayedRef.current = false;
    pointsAwardedRef.current = false;
  }, []);

  useEffect(() => {
    resetStep();
  }, [resetKey, resetStep]);

  const bumpFeedback = () => setFeedbackKey((k) => k + 1);

  const finishCorrect = useCallback(
    (opt: ReflectionOption, wrongCount: number) => {
      setResolved(true);
      setShowContinue(true);

      if (!pointsAwardedRef.current) {
        pointsAwardedRef.current = true;
        onAwardPoints();
        setShowPoints(true);
      }

      setHeadline(wrongCount === 0 ? 'Nice!' : 'Nice! You got it.');
      setMessage(null);
      onB4Message(FOCUS_REFLECTION_B4.correct);
      onCorrectB4Clip?.();
      bumpFeedback();
    },
    [onAwardPoints, onB4Message, onCorrectB4Clip],
  );

  const handleCheck = () => {
    if (!selectedId || checked) return;
    const opt = FOCUS_REFLECTION_OPTIONS.find((option) => option.id === selectedId);
    if (!opt) return;

    setChecked(true);

    if (opt.isCorrect) {
      finishCorrect(opt, attempts);
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (nextAttempts === 1) {
      onB4Message(FOCUS_REFLECTION_B4.wrongFirst);
      setHeadline(null);
      setMessage('Not quite. Try again or think about what helps you refocus.');
      if (!feedbackPlayedRef.current) {
        feedbackPlayedRef.current = true;
        onTryAgainSound?.();
      }
      bumpFeedback();
      return;
    }

    setRevealedCorrect(true);
    setResolved(true);
    setShowContinue(true);
    onB4Message(FOCUS_REFLECTION_B4.revealed);
    setHeadline(null);
    setMessage(`Good try. The answer is: ${correctOption.label}`);
    setShowPoints(false);
    onCorrectB4Clip?.();
    bumpFeedback();
  };

  const handleTryAgain = () => {
    if (resolved || attempts === 0 || attempts >= 2) return;
    setChecked(false);
    setSelectedId(null);
    setHeadline(null);
    setMessage(null);
  };

  const optionClass = (opt: ReflectionOption) => {
    const isSelected = selectedId === opt.id;
    const isCorrect = checked && isSelected && opt.isCorrect;
    const isWrong = checked && isSelected && !opt.isCorrect;
    const isRevealedCorrect = revealedCorrect && opt.isCorrect;
    return [
      'ffl-reasoningWhy-option',
      isSelected && !checked ? 'ffl-reasoningWhy-option--selected' : '',
      isWrong ? 'ffl-reasoningWhy-option--wrong' : '',
      isCorrect || isRevealedCorrect ? 'ffl-reasoningWhy-option--correct' : '',
      isRevealedCorrect ? 'ffl-reasoningWhy-option--revealed' : '',
    ]
      .filter(Boolean)
      .join(' ');
  };

  const canTryAgain = checked && !resolved && attempts === 1;

  return (
    <div className="ffl-selStep ffl-reasoningWhyStep ffl-focusReflectionStep">
      <header className="ffl-questionHeader ffl-step-header">
        <div className="ffl-kicker">REFLECTION</div>
        <h2 className="ffl-h2">{FOCUS_REFLECTION_HEADER}</h2>
        <p className="ffl-focusReflection-lead">{FOCUS_REFLECTION_PROMPT}</p>
      </header>

      <div className="ffl-reasoningWhy-options" role="group" aria-label={FOCUS_REFLECTION_PROMPT}>
        {FOCUS_REFLECTION_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={optionClass(opt)}
            aria-pressed={selectedId === opt.id}
            disabled={checked && !canTryAgain}
            onClick={() => {
              if (checked && !canTryAgain) return;
              setSelectedId(opt.id);
            }}
          >
            <span className="ffl-reasoningWhy-option-label">{opt.label}</span>
          </button>
        ))}
      </div>

      <StepMicroFeedback
        headline={headline}
        message={message}
        points={showPoints ? FOCUS_POINT_AWARDS.reflection : null}
        triggerKey={feedbackKey}
      />

      <div
        className={`ffl-stepActions ffl-focusReflection-actions${showContinue ? ' ffl-focusReflection-actions--visible' : ''}`}
      >
        {!checked ? (
          <CheckButton disabled={!selectedId} onClick={handleCheck} />
        ) : canTryAgain ? (
          <button type="button" className="bbc-tryAgainBtn" onClick={handleTryAgain}>
            Try Again
          </button>
        ) : (
          <button
            type="button"
            className="ffl-ctaPrimary ffl-ctaPrimary--small ffl-focusReflection-continue"
            onClick={() => {
              onContinueClick();
              onContinue();
            }}
            disabled={!showContinue}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
