import React, { useCallback, useEffect, useRef, useState } from 'react';
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

  const [selectedWrongIds, setSelectedWrongIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [selectedCorrectId, setSelectedCorrectId] = useState<string | null>(null);
  const [revealedCorrect, setRevealedCorrect] = useState(false);
  const [headline, setHeadline] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPoints, setShowPoints] = useState(false);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [showContinue, setShowContinue] = useState(false);

  const feedbackPlayedRef = useRef(false);
  const pointsAwardedRef = useRef(false);

  const resetStep = useCallback(() => {
    setSelectedWrongIds([]);
    setAttempts(0);
    setResolved(false);
    setSelectedCorrectId(null);
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
      setSelectedCorrectId(opt.id);
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
    [onAwardPoints, onB4Message, onCorrectB4Clip]
  );

  const handleSelect = (opt: ReflectionOption) => {
    if (resolved) return;
    if (selectedWrongIds.includes(opt.id)) return;

    if (opt.isCorrect) {
      finishCorrect(opt, attempts);
      return;
    }

    const nextWrongIds = [...selectedWrongIds, opt.id];
    setSelectedWrongIds(nextWrongIds);
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (nextAttempts === 1) {
      onB4Message(FOCUS_REFLECTION_B4.wrongFirst);
      setHeadline(null);
      setMessage(FOCUS_REFLECTION_B4.wrongFirst);
      if (!feedbackPlayedRef.current) {
        feedbackPlayedRef.current = true;
        onTryAgainSound?.();
      }
      bumpFeedback();
      return;
    }

    setRevealedCorrect(true);
    setSelectedCorrectId(correctOption.id);
    setResolved(true);
    setShowContinue(true);
    onB4Message(FOCUS_REFLECTION_B4.revealed);
    setHeadline(null);
    setMessage(`Good try. The answer is: ${correctOption.label}`);
    setShowPoints(false);
    onCorrectB4Clip?.();
    bumpFeedback();
  };

  const optionClass = (opt: ReflectionOption) => {
    const isWrong = selectedWrongIds.includes(opt.id);
    const isChosenCorrect = selectedCorrectId === opt.id && opt.isCorrect;
    const isRevealedCorrect = revealedCorrect && opt.isCorrect;
    return [
      'ffl-reasoningWhy-option',
      isWrong ? 'ffl-reasoningWhy-option--wrong' : '',
      isChosenCorrect || isRevealedCorrect ? 'ffl-reasoningWhy-option--correct' : '',
      isRevealedCorrect ? 'ffl-reasoningWhy-option--revealed' : '',
    ]
      .filter(Boolean)
      .join(' ');
  };

  return (
    <div className="ffl-selStep ffl-reasoningWhyStep ffl-focusReflectionStep">
      <header className="ffl-questionHeader ffl-step-header">
        <div className="ffl-kicker">REFLECTION</div>
        <h2 className="ffl-h2">{FOCUS_REFLECTION_HEADER}</h2>
        <p className="ffl-focusReflection-lead">{FOCUS_REFLECTION_PROMPT}</p>
      </header>

      <div className="ffl-reasoningWhy-options" role="group" aria-label={FOCUS_REFLECTION_PROMPT}>
        {FOCUS_REFLECTION_OPTIONS.map((opt) => {
          const isWrong = selectedWrongIds.includes(opt.id);
          const isCorrect = selectedCorrectId === opt.id && opt.isCorrect;
          return (
            <button
              key={opt.id}
              type="button"
              className={optionClass(opt)}
              aria-pressed={isCorrect}
              aria-disabled={isWrong || resolved}
              disabled={isWrong}
              onClick={() => handleSelect(opt)}
            >
              <span className="ffl-reasoningWhy-option-label">{opt.label}</span>
              {isWrong ? (
                <span className="ffl-reasoningWhy-option-mark" aria-hidden="true">
                  ×
                </span>
              ) : isCorrect ? (
                <span className="ffl-reasoningWhy-option-mark ffl-reasoningWhy-option-mark--check" aria-hidden="true">
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <StepMicroFeedback
        headline={headline}
        message={message}
        points={showPoints ? FOCUS_POINT_AWARDS.reflection : null}
        triggerKey={feedbackKey}
      />

      <div className={`ffl-stepActions ffl-focusReflection-actions${showContinue ? ' ffl-focusReflection-actions--visible' : ''}`}>
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
      </div>
    </div>
  );
}
