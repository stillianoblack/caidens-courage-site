import React from 'react';
import FocusCoinWalletBadge from '../rewards/FocusCoinWalletBadge';
import CourageHubSoundToggle from './CourageHubSoundToggle';
import CourageHubViewToggle, { type CourageHubViewMode } from './CourageHubViewToggle';

type CourageHubControlsProps = {
  variant: 'overlay' | 'mobileBar';
  viewMode: CourageHubViewMode;
  onViewModeChange: (mode: CourageHubViewMode) => void;
  weekUnlockStatus?: string;
  showQuestsTab?: boolean;
  showActivitiesTab?: boolean;
  hideUnlockStatus?: boolean;
  hideCoinBadge?: boolean;
  iconOnActiveOnly?: boolean;
};

export default function CourageHubControls({
  variant,
  viewMode,
  onViewModeChange,
  weekUnlockStatus,
  showQuestsTab = false,
  showActivitiesTab = true,
  hideUnlockStatus = false,
  hideCoinBadge = false,
  iconOnActiveOnly = false,
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
      <CourageHubViewToggle
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        showQuestsTab={showQuestsTab}
        showActivitiesTab={showActivitiesTab}
        iconOnActiveOnly={iconOnActiveOnly}
      />
      {weekUnlockStatus && !hideUnlockStatus ? (
        <span className="courageMapCanvasStatus" role="status">
          {weekUnlockStatus}
        </span>
      ) : null}
      <div className="courageHubControlsTrailing">
        {!hideCoinBadge ? <FocusCoinWalletBadge compact /> : null}
        <CourageHubSoundToggle />
      </div>
    </div>
  );
}
