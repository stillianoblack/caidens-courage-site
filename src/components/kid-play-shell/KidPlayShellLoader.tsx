import React from 'react';
import './kid-play-shell-loader.css';

const FOCUS_FLAME_MARK_SRC = '/images/icons/focus-flame-mark.svg';

type KidPlayShellLoaderProps = {
  /** Cover the full viewport including shell chrome (boot + route transitions). */
  fullScreen?: boolean;
  /** Fade out before unmounting (boot handoff into the game shell). */
  exiting?: boolean;
};

export default function KidPlayShellLoader({ fullScreen = true, exiting = false }: KidPlayShellLoaderProps) {
  return (
    <div
      className={[
        'kidPlayShellLoader',
        fullScreen ? 'kidPlayShellLoader--fullScreen' : 'kidPlayShellLoader--inline',
        exiting ? 'kidPlayShellLoader--exiting' : '',
      ].join(' ')}
      role="status"
      aria-live="polite"
      aria-busy={!exiting}
      aria-label="Loading your adventure"
    >
      <img className="kidPlayShellLoaderMark" src={FOCUS_FLAME_MARK_SRC} alt="" decoding="async" />
      <p className="kidPlayShellLoaderText">Loading your adventure…</p>
    </div>
  );
}
