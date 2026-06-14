import React, { useCallback } from 'react';
import { useCourageHubAudio } from './CourageHubAudioContext';

export type CourageHubViewMode = 'explore' | 'missions' | 'activities' | 'quests';

type CourageHubViewToggleProps = {
  viewMode: CourageHubViewMode;
  onViewModeChange: (mode: CourageHubViewMode) => void;
  showQuestsTab?: boolean;
  showActivitiesTab?: boolean;
  /** Hide emoji icons on inactive tabs so labels fit (mobile bar). */
  iconOnActiveOnly?: boolean;
};

export default function CourageHubViewToggle({
  viewMode,
  onViewModeChange,
  showQuestsTab = false,
  showActivitiesTab = true,
  iconOnActiveOnly = false,
}: CourageHubViewToggleProps) {
  const { playClick } = useCourageHubAudio();

  const handleSelect = useCallback(
    (mode: CourageHubViewMode) => {
      playClick();
      onViewModeChange(mode);
    },
    [onViewModeChange, playClick],
  );

  const renderTab = (
    mode: CourageHubViewMode,
    tabId: string,
    panelId: string,
    icon: string,
    label: string,
  ) => {
    const isActive = viewMode === mode;
    const showIcon = !iconOnActiveOnly || isActive;

    return (
      <button
        type="button"
        role="tab"
        id={tabId}
        aria-selected={isActive}
        aria-controls={panelId}
        className={[
          'courageHubViewToggleBtn',
          isActive ? 'courageHubViewToggleBtn--active' : '',
          iconOnActiveOnly ? 'courageHubViewToggleBtn--compact' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => handleSelect(mode)}
      >
        {showIcon ? <span className="courageHubViewToggleIcon" aria-hidden="true">{icon}</span> : null}
        <span className="courageHubViewToggleLabel">{label}</span>
      </button>
    );
  };

  return (
    <div
      className={[
        'courageHubViewToggle',
        iconOnActiveOnly ? 'courageHubViewToggle--compact' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="tablist"
      aria-label="Weekly adventure view mode"
    >
      {renderTab('explore', 'courage-hub-tab-explore', 'courage-hub-panel-explore', '🗺', 'Explore')}
      {renderTab('missions', 'courage-hub-tab-missions', 'courage-hub-panel-missions', '📋', 'Missions')}
      {showActivitiesTab
        ? renderTab(
            'activities',
            'courage-hub-tab-activities',
            'courage-hub-panel-activities',
            '🎨',
            'Activities',
          )
        : null}
      {showQuestsTab
        ? renderTab('quests', 'courage-hub-tab-quests', 'courage-hub-panel-quests', '🔥', 'Quests')
        : null}
    </div>
  );
}
