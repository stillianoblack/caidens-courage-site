import React from 'react';

type AnswerButtonProps = {
  label: string;
  onClick: () => void;
  selected?: boolean;
};

export default function AnswerButton({ label, onClick, selected = false }: AnswerButtonProps) {
  return (
    <button
      type="button"
      className={`b4g-answer-btn${selected ? ' b4g-answer-btn--selected' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}
