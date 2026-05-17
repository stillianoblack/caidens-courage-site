import React, { useCallback, useEffect, useRef, useState } from 'react';
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

  const [selectedWrongIds, setSelectedWrongIds] = useState<string[]>([]);
  const [storyClueAttempts, setStoryClueAttempts] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [selectedCorrectId, setSelectedCorrectId] = useState<string | null>(null);
  const [revealedCorrect, setRevealedCorrect] = useState(false);
  const [headline, setHeadline] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPoints, setShowPoints] = useState(false);
  const [feedbackKey, setFeedbackKey] = useState(0);

  const feedbackPlayedRef = useRef(false);
  const pointsAwardedRef = useRef(false);

  const resetStep = useCallback(() => {
    setSelectedWrongIds([]);
    setStoryClueAttempts(0);
    setResolved(false);
    setSelectedCorrectId(null);
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
    setSelectedCorrectId(opt.id);
    setResolved(true);

    if (!pointsAwardedRef.current) {
      pointsAwardedRef.current = true;
      onAwardPoints();
      setShowPoints(true);
    }

    if (wrongCount === 0) {
      setHeadline('Nice. That’s the story clue.');
    } else {
      setHeadline('Nice. You found the story clue.');
    }
    setMessage(null);
    onB4Message(STORY_CLUE_B4.correct);
    bumpFeedback();
  };

  const handleSelect = (opt: WhyOption) => {
    if (resolved) return;
    if (selectedWrongIds.includes(opt.id)) return;

    if (opt.isCorrect) {
      handleCorrect(opt, storyClueAttempts);
      return;
    }

    const nextWrongIds = [...selectedWrongIds, opt.id];
    setSelectedWrongIds(nextWrongIds);
    const nextAttempts = storyClueAttempts + 1;
    setStoryClueAttempts(nextAttempts);

    if (nextAttempts === 1) {
      onB4Message(STORY_CLUE_B4.wrongFirst);
      setHeadline(null);
      setMessage('Try again — look for the story clue.');
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
    onB4Message(STORY_CLUE_B4.revealed);
    setHeadline(null);
    setMessage(`Good try. The story clue was: ${correctOption.label}`);
    setShowPoints(false);
    bumpFeedback();
  };

  const optionClass = (opt: WhyOption) => {
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
    <div className="ffl-selStep ffl-reasoningWhyStep">
      <header className="ffl-questionHeader ffl-step-header">
        <div className="ffl-kicker">{kicker}</div>
        <h2 className="ffl-h2">{prompt}</h2>
      </header>

      <div className="ffl-reasoningWhy-options" role="group" aria-label={prompt}>
        {options.map((opt) => {
          const isWrong = selectedWrongIds.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              className={optionClass(opt)}
              aria-pressed={selectedCorrectId === opt.id}
              aria-disabled={isWrong || resolved}
              disabled={isWrong}
              onClick={() => handleSelect(opt)}
            >
              <span className="ffl-reasoningWhy-option-label">{opt.label}</span>
              {isWrong ? (
                <span className="ffl-reasoningWhy-option-mark" aria-hidden="true">
                  ×
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <StepMicroFeedback
        headline={headline}
        message={message}
        points={showPoints ? FOCUS_POINT_AWARDS.reasoning : null}
        triggerKey={feedbackKey}
      />

      <div className="ffl-stepActions">
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
      </div>
    </div>
  );
}
