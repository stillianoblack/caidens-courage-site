import React from 'react';

export type HintButtonProps = {
  disabled?: boolean;
  onClick: () => void;
  label?: string;
  className?: string;
};

export default function HintButton({
  disabled = false,
  onClick,
  label = 'Use Hint',
  className = '',
}: HintButtonProps) {
  return (
    <button
      type="button"
      className={['bbc-hintBtn', className].filter(Boolean).join(' ')}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
