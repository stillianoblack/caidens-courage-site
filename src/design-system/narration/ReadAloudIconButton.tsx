import React, { useEffect } from 'react';
import { useNarration } from './useNarration';

type ReadAloudIconButtonProps = {
  segments: string[];
  resetKey?: string;
  ariaLabel?: string;
  className?: string;
};

/** Compact speaker button for gameplay top bars. */
export default function ReadAloudIconButton({
  segments,
  resetKey,
  ariaLabel = 'Read aloud',
  className = '',
}: ReadAloudIconButtonProps) {
  const { supported, state, play, pause, resume, stop } = useNarration();

  useEffect(() => {
    stop();
  }, [resetKey, stop]);

  useEffect(() => () => stop(), [stop]);

  if (!supported || segments.length === 0) return null;

  const isPlaying = state === 'playing';
  const isPaused = state === 'paused';

  const handleClick = () => {
    if (isPaused) {
      resume();
      return;
    }
    if (isPlaying) {
      pause();
      return;
    }
    play(segments);
  };

  return (
    <button
      type="button"
      className={['ds-readAloudIconBtn', isPlaying ? 'ds-readAloudIconBtn--active' : '', className]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-pressed={isPlaying || isPaused}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="ds-readAloudIconBtnSvg">
        <path
          d="M8 9.5v5l4.5 3V6.5L8 9.5z"
          fill="currentColor"
        />
        <path
          d="M15.5 8.5a4.5 4.5 0 010 7M17.8 6.2a7.5 7.5 0 010 11.6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
