import React from 'react';
import SoundToggleButton from '../game-assessment/shared/SoundToggleButton';
import GamePlayerPill from '../game-assessment/shared/GamePlayerPill';

const FLAME_SRC = '/images/icons/focus-flame-mark.svg';

type CaidenGameHeaderProps = {
  progressPct: number;
  onExit: () => void;
  showProgress?: boolean;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  playerName?: string;
  playerIndex?: number;
  hideExitButton?: boolean;
};

export default function CaidenGameHeader({
  progressPct,
  onExit,
  showProgress = true,
  soundEnabled = true,
  onToggleSound,
  playerName,
  playerIndex = 1,
  hideExitButton = false,
}: CaidenGameHeaderProps) {
  return (
    <header
      className={[
        'caiden-topBar',
        hideExitButton ? 'caiden-topBar--noExit' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {hideExitButton ? null : (
        <button type="button" className="bbc-exitBtn caiden-exitBtn" onClick={onExit} aria-label="Exit quest">
          ×
        </button>
      )}
      {showProgress ? (
        <div
          className="caiden-progressTrack"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="caiden-progressFill" style={{ width: `${progressPct}%` }} />
        </div>
      ) : (
        <div aria-hidden="true" />
      )}
      <div className="bbc-topBarRight caiden-topBarRight">
        <GamePlayerPill displayName={playerName} playerIndex={playerIndex} />
        <div className="caiden-topFlames" aria-hidden="true">
          <img src={FLAME_SRC} alt="" className="caiden-topFlameIcon caiden-topFlameIcon--lit" />
        </div>
        {onToggleSound ? (
          <SoundToggleButton soundEnabled={soundEnabled} onToggle={onToggleSound} />
        ) : null}
      </div>
    </header>
  );
}
