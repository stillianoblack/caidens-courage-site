import React, { useEffect } from 'react';
import { useNarration } from './useNarration';
import './read-aloud-control.css';

export type ReadAloudControlProps = {
  segments: string[];
  /** When this key changes, narration stops (e.g. question id). */
  resetKey?: string;
  /** Shown on the Play button for screen readers. */
  playAriaLabel?: string;
  className?: string;
};

export default function ReadAloudControl({
  segments,
  resetKey,
  playAriaLabel = 'Read this question aloud',
  className = '',
}: ReadAloudControlProps) {
  const { supported, state, play, pause, resume, stop } = useNarration();

  useEffect(() => {
    stop();
  }, [resetKey, stop]);

  useEffect(() => () => stop(), [stop]);

  if (!supported || segments.length === 0) return null;

  const isPlaying = state === 'playing';
  const isPaused = state === 'paused';
  const isActive = isPlaying || isPaused;

  const handlePlay = () => {
    if (isPaused) {
      resume();
      return;
    }
    if (isPlaying) return;
    play(segments);
  };

  return (
    <section
      className={['ds-readAloud', className].filter(Boolean).join(' ')}
      aria-label="Read aloud controls"
    >
      <div className="ds-readAloud-head">
        <span className="ds-readAloud-icon" aria-hidden="true">
          🔊
        </span>
        <h3 className="ds-readAloud-title">Read Aloud</h3>
      </div>

      <div className="ds-readAloud-actions" role="group" aria-label="Narration controls">
        {!isActive ? (
          <button
            type="button"
            className="ds-readAloud-btn ds-readAloud-btn--primary"
            onClick={handlePlay}
            aria-label={playAriaLabel}
          >
            Play
          </button>
        ) : (
          <>
            {isPlaying ? (
              <button
                type="button"
                className="ds-readAloud-btn"
                onClick={pause}
                aria-label="Pause narration"
              >
                Pause
              </button>
            ) : (
              <button
                type="button"
                className="ds-readAloud-btn ds-readAloud-btn--primary"
                onClick={handlePlay}
                aria-label="Resume narration"
              >
                Resume
              </button>
            )}
            <button
              type="button"
              className="ds-readAloud-btn"
              onClick={stop}
              aria-label="Stop narration"
            >
              Stop
            </button>
          </>
        )}
      </div>
    </section>
  );
}
