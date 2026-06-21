import React from 'react';
import type { GameChoiceOption } from '../../types/gameAssessment';
import { optionLetter, sanitizeChoiceDisplayLabel } from '../../lib/gameChoiceDisplay';
import AnswerChoiceCard from './cinematic/AnswerChoiceCard';

export type AnswerChoiceListProps = {
  options: GameChoiceOption[];
  selectedId: string | null;
  correctId?: string;
  checked?: boolean;
  disabled?: boolean;
  showLetterPrefix?: boolean;
  className?: string;
  variant?: 'default' | 'cinematic';
  onSelect: (id: string) => void;
  onHoverChoice?: () => void;
};

export default function AnswerChoiceList({
  options,
  selectedId,
  correctId,
  checked = false,
  disabled = false,
  showLetterPrefix = false,
  className = '',
  variant = 'default',
  onSelect,
  onHoverChoice,
}: AnswerChoiceListProps) {
  return (
    <ul
      className={['ds-answerList', className].filter(Boolean).join(' ')}
      role="group"
      aria-label="Answer choices"
    >
      {options.map((choice, index) => {
        const isSelected = selectedId === choice.id;
        const isCorrect = checked && correctId === choice.id;
        const isWrong = checked && isSelected && correctId !== choice.id;
        const prefix = optionLetter(index);
        const displayLabel = sanitizeChoiceDisplayLabel(choice.label, choice.id, index);

        return (
          <li key={choice.id}>
            {variant === 'cinematic' ? (
              <AnswerChoiceCard
                answerId={choice.id}
                label={displayLabel}
                selected={isSelected}
                correct={isCorrect}
                incorrect={isWrong}
                disabled={disabled || checked}
                showLetterPrefix={showLetterPrefix}
                letter={prefix}
                onSelect={() => onSelect(choice.id)}
                onHover={onHoverChoice}
              />
            ) : (
              <button
                type="button"
                data-answer-id={choice.id}
                disabled={disabled || checked}
                className={[
                  'ds-answerChoice',
                  'bbc-answerCard',
                  showLetterPrefix ? 'bbc-answerCard--lettered' : '',
                  isSelected && !checked ? 'ds-answerChoice--selected bbc-answerCard--selected' : '',
                  isCorrect ? 'ds-answerChoice--correct bbc-answerCard--correct' : '',
                  isWrong ? 'ds-answerChoice--incorrect bbc-answerCard--wrong' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelect(choice.id)}
                onMouseEnter={() => onHoverChoice?.()}
                aria-pressed={isSelected}
              >
                {showLetterPrefix ? (
                  <>
                    <span className="bbc-answerLetter">{prefix}</span>
                    <span>{displayLabel}</span>
                  </>
                ) : (
                  displayLabel
                )}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
