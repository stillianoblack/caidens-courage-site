import React from 'react';
import FocusCoinWalletBadge from '../rewards/FocusCoinWalletBadge';
import CourageHubSoundToggle from './CourageHubSoundToggle';
import CourageHubViewToggle, { type CourageHubViewMode } from './CourageHubViewToggle';

type CourageHubControlsProps = {
  variant: 'overlay' | 'mobileBar';
  viewMode: CourageHubViewMode;
  onViewModeChange: (mode: CourageHubViewMode) => void;
  weekUnlockStatus?: string;
};

export default function CourageHubControls({
  variant,
  viewMode,
  onViewModeChange,
  weekUnlockStatus,
}: CourageHubControlsProps) {
  return (
    <div
      className={[
        'courageHubControls',
        variant === 'mobileBar' ? 'courageHubControls--mobileBar' : 'courageHubControls--overlay',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CourageHubViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
      {weekUnlockStatus ? (
        <span className="courageMapCanvasStatus" role="status">
          {weekUnlockStatus}
        </span>
      ) : null}
      <div className="courageHubControlsTrailing">
        <FocusCoinWalletBadge compact />
        <CourageHubSoundToggle />
      </div>
    </div>
  );
}
