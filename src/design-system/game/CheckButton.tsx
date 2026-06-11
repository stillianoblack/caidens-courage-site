import React from 'react';

export type CheckButtonProps = {
  disabled?: boolean;
  onClick: () => void;
  label?: string;
  className?: string;
};

export default function CheckButton({
  disabled = false,
  onClick,
  label = 'Check',
  className = '',
}: CheckButtonProps) {
  return (
    <button
      type="button"
      className={['bbc-checkBtn', className].filter(Boolean).join(' ')}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
