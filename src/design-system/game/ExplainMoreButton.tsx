import React from 'react';

export type ExplainMoreButtonProps = {
  expanded?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label?: string;
  className?: string;
};

export default function ExplainMoreButton({
  expanded = false,
  disabled = false,
  onClick,
  label = 'Explain More',
  className = '',
}: ExplainMoreButtonProps) {
  return (
    <button
      type="button"
      className={['bbc-explainMoreBtn', expanded ? 'bbc-explainMoreBtn--expanded' : '', className]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled}
      onClick={onClick}
      aria-expanded={expanded}
    >
      {expanded ? 'Hide Explanation' : label}
    </button>
  );
}
