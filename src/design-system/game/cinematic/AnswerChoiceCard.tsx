import React from 'react';

export type AnswerChoiceCardProps = {
  label: React.ReactNode;
  selected?: boolean;
  correct?: boolean;
  incorrect?: boolean;
  disabled?: boolean;
  showLetterPrefix?: boolean;
  letter?: string;
  answerId: string;
  onSelect: () => void;
  onHover?: () => void;
};

/** Dark glass answer choice — cinematic mission mode. */
export default function AnswerChoiceCard({
  label,
  selected = false,
  correct = false,
  incorrect = false,
  disabled = false,
  showLetterPrefix = false,
  letter,
  answerId,
  onSelect,
  onHover,
}: AnswerChoiceCardProps) {
  return (
    <button
      type="button"
      data-answer-id={answerId}
      disabled={disabled}
      className={[
        'cinematicAnswerChoice',
        'ds-answerChoice',
        'bbc-answerCard',
        showLetterPrefix ? 'bbc-answerCard--lettered' : '',
        selected && !correct && !incorrect ? 'cinematicAnswerChoice--selected ds-answerChoice--selected bbc-answerCard--selected' : '',
        correct ? 'cinematicAnswerChoice--correct ds-answerChoice--correct bbc-answerCard--correct' : '',
        incorrect ? 'cinematicAnswerChoice--incorrect ds-answerChoice--incorrect bbc-answerCard--wrong' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onSelect}
      onMouseEnter={() => onHover?.()}
      aria-pressed={selected}
    >
      {showLetterPrefix && letter ? (
        <>
          <span className="bbc-answerLetter">{letter}</span>
          <span>{label}</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
