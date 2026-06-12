import React from 'react';
import type { CourageHubViewMode } from './CourageHubViewToggle';
import CourageHubControls from './CourageHubControls';
import CourageHubHeaderCopy from './CourageHubHeaderCopy';

type CourageHubHeroBarProps = {
  variant: 'overlay' | 'panel';
  week: number;
  weekTitle: string;
  selFocus?: string;
  weekUnlockStatus?: string;
  viewMode: CourageHubViewMode;
  onViewModeChange: (mode: CourageHubViewMode) => void;
};

export default function CourageHubHeroBar({
  variant,
  week,
  weekTitle,
  selFocus,
  weekUnlockStatus,
  viewMode,
  onViewModeChange,
}: CourageHubHeroBarProps) {
  return (
    <div
      className={[
        'courageHubHeroBar',
        variant === 'overlay' ? 'courageHubHeroBar--overlay' : 'courageHubHeroBar--panel',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CourageHubHeaderCopy week={week} weekTitle={weekTitle} selFocus={selFocus} />
      <CourageHubControls
        variant="overlay"
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        weekUnlockStatus={weekUnlockStatus}
      />
    </div>
  );
}
