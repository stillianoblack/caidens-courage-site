import React, { useCallback, useEffect, useRef, useState } from 'react';
import CheckButton from '../../design-system/game/CheckButton';
import StepMicroFeedback from './StepMicroFeedback';
import type { WhyOption } from './focusFlameReasoning';
import { STORY_CLUE_B4, storyClueCorrectOption } from './focusFlameReasoning';
import { FOCUS_POINT_AWARDS } from './focusFlameRanks';

export default function ReasoningWhyStep({
  kicker,
  prompt,
  options,
  resetKey,
  onAwardPoints,
  onB4Message,
  onTryAgainSound,
  onNext,
  onNextClick,
}: {
  kicker: string;
  prompt: string;
  options: readonly WhyOption[];
  resetKey: string;
  onAwardPoints: () => void;
  onB4Message: (message: string) => void;
  onTryAgainSound?: () => void;
  onNext: () => void;
  onNextClick: () => void;
}) {
  const correctOption = storyClueCorrectOption(options);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [storyClueAttempts, setStoryClueAttempts] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [revealedCorrect, setRevealedCorrect] = useState(false);
  const [headline, setHeadline] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPoints, setShowPoints] = useState(false);
  const [feedbackKey, setFeedbackKey] = useState(0);

  const feedbackPlayedRef = useRef(false);
  const pointsAwardedRef = useRef(false);

  const resetStep = useCallback(() => {
    setSelectedId(null);
    setChecked(false);
    setStoryClueAttempts(0);
    setResolved(false);
    setRevealedCorrect(false);
    setHeadline(null);
    setMessage(null);
    setShowPoints(false);
    setFeedbackKey(0);
    feedbackPlayedRef.current = false;
    pointsAwardedRef.current = false;
  }, []);

  useEffect(() => {
    resetStep();
  }, [resetKey, resetStep]);

  const bumpFeedback = () => setFeedbackKey((k) => k + 1);

  const handleCorrect = (opt: WhyOption, wrongCount: number) => {
    setResolved(true);

    if (!pointsAwardedRef.current) {
      pointsAwardedRef.current = true;
      onAwardPoints();
      setShowPoints(true);
    }

    if (wrongCount === 0) {
      setHeadline('Nice. That\u2019s the story clue.');
    } else {
      setHeadline('Nice. You found the story clue.');
    }
    setMessage(null);
    onB4Message(STORY_CLUE_B4.correct);
    bumpFeedback();
  };

  const handleCheck = () => {
    if (!selectedId || checked) return;
    const opt = options.find((option) => option.id === selectedId);
    if (!opt) return;

    setChecked(true);

    if (opt.isCorrect) {
      handleCorrect(opt, storyClueAttempts);
      return;
    }

    const nextAttempts = storyClueAttempts + 1;
    setStoryClueAttempts(nextAttempts);

    if (nextAttempts === 1) {
      onB4Message(STORY_CLUE_B4.wrongFirst);
      setHeadline(null);
      setMessage('Not quite. Try again or look for the story clue.');
      if (!feedbackPlayedRef.current) {
        feedbackPlayedRef.current = true;
        onTryAgainSound?.();
      }
      bumpFeedback();
      return;
    }

    setRevealedCorrect(true);
    setResolved(true);
    onB4Message(STORY_CLUE_B4.revealed);
    setHeadline(null);
    setMessage(`Good try. The story clue was: ${correctOption.label}`);
    setShowPoints(false);
    bumpFeedback();
  };

  const handleTryAgain = () => {
    if (resolved || storyClueAttempts === 0 || storyClueAttempts >= 2) return;
    setChecked(false);
    setSelectedId(null);
    setHeadline(null);
    setMessage(null);
  };

  const optionClass = (opt: WhyOption) => {
    const isSelected = selectedId === opt.id;
    const isCorrect = checked && opt.isCorrect && isSelected;
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

  const canTryAgain = checked && !resolved && storyClueAttempts === 1;

  return (
    <div className="ffl-selStep ffl-reasoningWhyStep">
      <header className="ffl-questionHeader ffl-step-header">
        <div className="ffl-kicker">{kicker}</div>
        <h2 className="ffl-h2">{prompt}</h2>
      </header>

      <div className="ffl-reasoningWhy-options" role="group" aria-label={prompt}>
        {options.map((opt) => (
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
        points={showPoints ? FOCUS_POINT_AWARDS.reasoning : null}
        triggerKey={feedbackKey}
      />

      <div className="ffl-stepActions">
        {!checked ? (
          <CheckButton disabled={!selectedId} onClick={handleCheck} />
        ) : canTryAgain ? (
          <button type="button" className="bbc-tryAgainBtn" onClick={handleTryAgain}>
            Try Again
          </button>
        ) : (
          <button
            type="button"
            className="ffl-ctaPrimary ffl-ctaPrimary--small"
            onClick={() => {
              onNextClick();
              onNext();
            }}
            disabled={!resolved}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
