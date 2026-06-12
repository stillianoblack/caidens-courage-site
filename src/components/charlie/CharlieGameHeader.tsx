import React from 'react';
import SoundToggleButton from '../game-assessment/shared/SoundToggleButton';
import GamePlayerPill from '../game-assessment/shared/GamePlayerPill';

type CharlieGameHeaderProps = {
  progressPct: number;
  onExit: () => void;
  showProgress?: boolean;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  playerName?: string;
  playerIndex?: number;
  hideExitButton?: boolean;
};

export default function CharlieGameHeader({
  progressPct,
  onExit,
  showProgress = true,
  soundEnabled = true,
  onToggleSound,
  playerName,
  playerIndex = 1,
  hideExitButton = false,
}: CharlieGameHeaderProps) {
  return (
    <header
      className={[
        'charlie-topBar',
        hideExitButton ? 'charlie-topBar--noExit' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {hideExitButton ? null : (
        <button type="button" className="bbc-exitBtn charlie-exitBtn" onClick={onExit} aria-label="Exit mission">
          ×
        </button>
      )}
      {showProgress ? (
        <div
          className="charlie-progressTrack"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="charlie-progressFill" style={{ width: `${progressPct}%` }} />
        </div>
      ) : (
        <div aria-hidden="true" />
      )}
      <div className="bbc-topBarRight charlie-topBarRight">
        <GamePlayerPill displayName={playerName} playerIndex={playerIndex} />
        {onToggleSound ? (
          <SoundToggleButton soundEnabled={soundEnabled} onToggle={onToggleSound} />
        ) : null}
      </div>
    </header>
  );
}
