import React, { useCallback } from 'react';
import { useCourageHubAudio } from './CourageHubAudioContext';

export type CourageHubViewMode = 'explore' | 'missions' | 'activities' | 'quests';

type CourageHubViewToggleProps = {
  viewMode: CourageHubViewMode;
  onViewModeChange: (mode: CourageHubViewMode) => void;
  showQuestsTab?: boolean;
  showActivitiesTab?: boolean;
};

export default function CourageHubViewToggle({
  viewMode,
  onViewModeChange,
  showQuestsTab = false,
  showActivitiesTab = true,
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
      aria-label="Weekly adventure view mode"
    >
      <button
        type="button"
        role="tab"
        id="courage-hub-tab-explore"
        aria-selected={viewMode === 'explore'}
        aria-controls="courage-hub-panel-explore"
        className={[
          'courageHubViewToggleBtn',
          viewMode === 'explore' ? 'courageHubViewToggleBtn--active' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => handleSelect('explore')}
      >
        <span className="courageHubViewToggleIcon" aria-hidden="true">🗺</span>
        <span className="courageHubViewToggleLabel">Explore</span>
      </button>
      <button
        type="button"
        role="tab"
        id="courage-hub-tab-missions"
        aria-selected={viewMode === 'missions'}
        aria-controls="courage-hub-panel-missions"
        className={[
          'courageHubViewToggleBtn',
          viewMode === 'missions' ? 'courageHubViewToggleBtn--active' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => handleSelect('missions')}
      >
        <span className="courageHubViewToggleIcon" aria-hidden="true">📋</span>
        <span className="courageHubViewToggleLabel">Missions</span>
      </button>
      {showActivitiesTab ? (
        <button
          type="button"
          role="tab"
          id="courage-hub-tab-activities"
          aria-selected={viewMode === 'activities'}
          aria-controls="courage-hub-panel-activities"
          className={[
            'courageHubViewToggleBtn',
            viewMode === 'activities' ? 'courageHubViewToggleBtn--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => handleSelect('activities')}
        >
          <span className="courageHubViewToggleIcon" aria-hidden="true">🎨</span>
          <span className="courageHubViewToggleLabel">Activities</span>
        </button>
      ) : null}
      {showQuestsTab ? (
        <button
          type="button"
          role="tab"
          id="courage-hub-tab-quests"
          aria-selected={viewMode === 'quests'}
          aria-controls="courage-hub-panel-quests"
          className={[
            'courageHubViewToggleBtn',
            viewMode === 'quests' ? 'courageHubViewToggleBtn--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => handleSelect('quests')}
        >
          <span className="courageHubViewToggleIcon" aria-hidden="true">🔥</span>
          <span className="courageHubViewToggleLabel">Quests</span>
        </button>
      ) : null}
    </div>
  );
}
