import React from 'react';
import SoundToggleButton from '../game-assessment/shared/SoundToggleButton';
import GamePlayerPill from '../game-assessment/shared/GamePlayerPill';

import { B4_AVATAR_SRC } from '../../data/b4/avatar';

const B4_IMG = B4_AVATAR_SRC;
const FLAME_SRC = '/images/icons/focus-flame-mark.svg';

type B4BaselineTopBarProps = {
  progressPct: number;
  onExit: () => void;
  flames?: number;
  showProgress?: boolean;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  playerName?: string;
  playerIndex?: number;
};

export default function B4BaselineTopBar({
  progressPct,
  onExit,
  flames = 5,
  showProgress = true,
  soundEnabled = true,
  onToggleSound,
  playerName,
  playerIndex = 1,
}: B4BaselineTopBarProps) {
  return (
    <header className="bbc-topBar">
      <button type="button" className="bbc-exitBtn" onClick={onExit} aria-label="Exit check">
        ×
      </button>
      {showProgress ? (
        <div
          className="bbc-progressTrack"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="bbc-progressFill" style={{ width: `${progressPct}%` }} />
        </div>
      ) : (
        <div aria-hidden="true" />
      )}
      <div className="bbc-topBarRight">
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

export function B4Avatar({ size = 'hero', src }: { size?: 'hero' | 'hub' | 'quiz' | 'large'; src?: string }) {
  const className =
    size === 'quiz' || size === 'large'
      ? 'bbc-quizB4'
      : size === 'hub'
        ? 'bbc-hubB4'
        : 'bbc-b4Avatar';

  const avatar = (
    <div className={className} aria-hidden={size !== 'hero'}>
      <img src={src ?? B4_IMG} alt="" decoding="async" />
    </div>
  );

  if (size === 'hero') {
    return <div className="bbc-b4Hero">{avatar}</div>;
  }

  return avatar;
}

export function B4BaselineDecor() {
  return (
    <>
      <div className="bbc-deco bbc-deco--flame bbc-deco--tl" aria-hidden="true">
        <img src={FLAME_SRC} alt="" />
      </div>
      <div className="bbc-deco bbc-deco--circle bbc-deco--tr" aria-hidden="true" />
      <div className="bbc-deco bbc-deco--dots bbc-deco--bl" aria-hidden="true" />
      <div className="bbc-deco bbc-deco--arc bbc-deco--br" aria-hidden="true" />
    </>
  );
}
