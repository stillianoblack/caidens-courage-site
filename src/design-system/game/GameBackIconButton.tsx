import React, { useRef } from 'react';

type GameBackIconButtonProps = {
  onClick: () => void;
  ariaLabel?: string;
  theme?: string;
  className?: string;
};

export default function GameBackIconButton({
  onClick,
  ariaLabel = 'Go back',
  theme,
  className = '',
}: GameBackIconButtonProps) {
  const ignoreNextClickRef = useRef(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (ignoreNextClickRef.current) {
      ignoreNextClickRef.current = false;
      return;
    }
    onClick();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    ignoreNextClickRef.current = true;
    event.preventDefault();
    event.stopPropagation();
    onClick();
  };

  return (
    <button
      type="button"
      className={['ds-gameplayTopBar-backIconBtn', className].filter(Boolean).join(' ')}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      aria-label={ariaLabel}
      data-theme={theme}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M14 6 L8 12 L14 18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
