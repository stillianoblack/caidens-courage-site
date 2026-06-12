import React, { useCallback } from 'react';
import { useCourageHubAudio } from './CourageHubAudioContext';

export type CourageHubViewMode = 'map' | 'list';

type CourageHubViewToggleProps = {
  viewMode: CourageHubViewMode;
  onViewModeChange: (mode: CourageHubViewMode) => void;
};

export default function CourageHubViewToggle({
  viewMode,
  onViewModeChange,
}: CourageHubViewToggleProps) {
  const { playClick } = useCourageHubAudio();

  const handleSelect = useCallback(
    (mode: CourageHubViewMode) => {
      playClick();
      onViewModeChange(mode);
    },
    [onViewModeChange, playClick],
  );

  return (
    <div
      className="courageHubViewToggle"
      role="tablist"
      aria-label="Courage in the Dark view mode"
    >
      <button
        type="button"
        role="tab"
        id="courage-hub-tab-map"
        aria-selected={viewMode === 'map'}
        aria-controls="courage-hub-panel-map"
        className={[
          'courageHubViewToggleBtn',
          viewMode === 'map' ? 'courageHubViewToggleBtn--active' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => handleSelect('map')}
      >
        <span className="courageHubViewToggleIcon" aria-hidden="true">
          🗺
        </span>
        <span className="courageHubViewToggleLabel">Adventure Map</span>
      </button>
      <button
        type="button"
        role="tab"
        id="courage-hub-tab-list"
        aria-selected={viewMode === 'list'}
        aria-controls="courage-hub-panel-list"
        className={[
          'courageHubViewToggleBtn',
          viewMode === 'list' ? 'courageHubViewToggleBtn--active' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => handleSelect('list')}
      >
        <span className="courageHubViewToggleIcon" aria-hidden="true">
          📋
        </span>
        <span className="courageHubViewToggleLabel">Mission List</span>
      </button>
    </div>
  );
}
