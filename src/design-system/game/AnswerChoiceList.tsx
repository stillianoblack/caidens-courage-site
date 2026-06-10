import React from 'react';
import type { GameChoiceOption } from '../../types/gameAssessment';
import './game-learning.css';

export type AnswerChoiceListProps = {
  options: GameChoiceOption[];
  selectedId: string | null;
  correctId?: string;
  checked?: boolean;
  disabled?: boolean;
  showLetterPrefix?: boolean;
  className?: string;
  onSelect: (id: string) => void;
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function AnswerChoiceList({
  options,
  selectedId,
  correctId,
  checked = false,
  disabled = false,
  showLetterPrefix = false,
  className = '',
  onSelect,
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
        const prefix = OPTION_LETTERS[index] ?? String(index + 1);

        return (
          <li key={choice.id}>
            <button
              type="button"
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
              aria-pressed={isSelected}
            >
              {showLetterPrefix ? (
                <>
                  <span className="bbc-answerLetter">{prefix}</span>
                  <span>{choice.label}</span>
                </>
              ) : (
                choice.label
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
