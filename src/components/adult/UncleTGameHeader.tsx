import React from 'react';
import SoundToggleButton from '../game-assessment/shared/SoundToggleButton';

type UncleTGameHeaderProps = {
  progressPct: number;
  onExit: () => void;
  showProgress?: boolean;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
};

export default function UncleTGameHeader({
  progressPct,
  onExit,
  showProgress = true,
  soundEnabled = true,
  onToggleSound,
}: UncleTGameHeaderProps) {
  return (
    <header className="uncleT-topBar">
      <button type="button" className="bbc-exitBtn uncleT-exitBtn" onClick={onExit} aria-label="Exit training">
        ×
      </button>
      {showProgress ? (
        <div
          className="uncleT-progressTrack"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="uncleT-progressFill" style={{ width: `${progressPct}%` }} />
        </div>
      ) : (
        <div aria-hidden="true" />
      )}
      <div className="bbc-topBarRight uncleT-topBarRight">
        {onToggleSound ? (
          <SoundToggleButton soundEnabled={soundEnabled} onToggle={onToggleSound} />
        ) : null}
      </div>
    </header>
  );
}
