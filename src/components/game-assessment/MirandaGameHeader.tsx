import React from 'react';
import SoundToggleButton from './shared/SoundToggleButton';
import GamePlayerPill from './shared/GamePlayerPill';

const FLAME_SRC = '/images/icons/focus-flame-mark.svg';

type MirandaGameHeaderProps = {
  progressPct: number;
  onExit: () => void;
  flames?: number;
  showProgress?: boolean;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  playerName?: string;
  playerIndex?: number;
  hideExitButton?: boolean;
};

/** Floating Miranda header — no white bar; rounded progress pill on the page. */
export default function MirandaGameHeader({
  progressPct,
  onExit,
  flames = 5,
  showProgress = true,
  soundEnabled = true,
  onToggleSound,
  playerName,
  playerIndex = 1,
  hideExitButton = false,
}: MirandaGameHeaderProps) {
  return (
    <header
      className={[
        'miranda-topBar',
        hideExitButton ? 'miranda-topBar--noExit' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {hideExitButton ? null : (
        <button type="button" className="bbc-exitBtn miranda-exitBtn" onClick={onExit} aria-label="Exit case">
          ×
        </button>
      )}
      {showProgress ? (
        <div
          className="miranda-progressTrack"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="miranda-progressFill" style={{ width: `${progressPct}%` }} />
        </div>
      ) : (
        <div aria-hidden="true" />
      )}
      <div className="bbc-topBarRight miranda-topBarRight">
        <GamePlayerPill displayName={playerName} playerIndex={playerIndex} />
        <div className="bbc-flames" aria-label={`${flames} focus flames`}>
          {[1, 2, 3, 4, 5].map((i) => (
            <img
              key={i}
              src={FLAME_SRC}
              alt=""
              className={`bbc-flameIcon${i <= flames ? ' bbc-flameIcon--lit' : ''}`}
              aria-hidden="true"
            />
          ))}
        </div>
        {onToggleSound ? (
          <SoundToggleButton soundEnabled={soundEnabled} onToggle={onToggleSound} />
        ) : null}
      </div>
    </header>
  );
}
