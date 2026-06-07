import React from 'react';
import SoundToggleButton from '../game-assessment/shared/SoundToggleButton';

type VictoriaGameHeaderProps = {
  progressPct: number;
  onExit: () => void;
  showProgress?: boolean;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
};

export default function VictoriaGameHeader({
  progressPct,
  onExit,
  showProgress = true,
  soundEnabled = true,
  onToggleSound,
}: VictoriaGameHeaderProps) {
  return (
    <header className="victoria-topBar">
      <button type="button" className="bbc-exitBtn victoria-exitBtn" onClick={onExit} aria-label="Exit training">
        ×
      </button>
      {showProgress ? (
        <div
          className="victoria-progressTrack"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="victoria-progressFill" style={{ width: `${progressPct}%` }} />
        </div>
      ) : (
        <div aria-hidden="true" />
      )}
      <div className="bbc-topBarRight victoria-topBarRight">
        {onToggleSound ? (
          <SoundToggleButton soundEnabled={soundEnabled} onToggle={onToggleSound} />
        ) : null}
      </div>
    </header>
  );
}
