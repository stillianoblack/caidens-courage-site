import React from 'react';
import type { CourageHubViewMode } from './CourageHubViewToggle';
import CourageHubControls from './CourageHubControls';
import CourageHubHeaderCopy from './CourageHubHeaderCopy';

type CourageHubHeroBarProps = {
  variant: 'overlay' | 'panel' | 'stacked';
  week: number;
  weekTitle: string;
  selFocus?: string;
  weekUnlockStatus?: string;
  viewMode: CourageHubViewMode;
  onViewModeChange: (mode: CourageHubViewMode) => void;
  showQuestsTab?: boolean;
  showActivitiesTab?: boolean;
  headerTrailing?: React.ReactNode;
};

export default function CourageHubHeroBar({
  variant,
  week,
  weekTitle,
  selFocus,
  weekUnlockStatus,
  viewMode,
  onViewModeChange,
  showQuestsTab = false,
  showActivitiesTab = true,
  headerTrailing,
}: CourageHubHeroBarProps) {
  return (
    <div
      className={[
        'courageHubHeroBar',
        variant === 'overlay' ? 'courageHubHeroBar--overlay' : '',
        variant === 'panel' ? 'courageHubHeroBar--panel' : '',
        variant === 'stacked' ? 'courageHubHeroBar--stacked' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CourageHubHeaderCopy
        week={week}
        weekTitle={weekTitle}
        selFocus={selFocus}
        variant={variant === 'stacked' ? 'mobile' : 'overlay'}
        trailing={headerTrailing}
      />
      <CourageHubControls
        variant={variant === 'stacked' ? 'mobileBar' : 'overlay'}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        weekUnlockStatus={weekUnlockStatus}
        showQuestsTab={showQuestsTab}
        showActivitiesTab={showActivitiesTab}
      />
    </div>
  );
}
