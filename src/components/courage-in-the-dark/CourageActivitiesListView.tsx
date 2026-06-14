import React from 'react';
import type { CourageHubViewMode } from './CourageHubViewToggle';
import type { Week1ExtrasPaths } from './Week1ExtrasCards';

type CourageActivitiesListViewProps = {
  mapSlot: React.ReactNode | null;
  viewMode: CourageHubViewMode;
  completedMissionIds: readonly string[];
  paths: Week1ExtrasPaths;
  activitiesPanel?: React.ReactNode;
};

export default function CourageActivitiesListView({
  mapSlot,
  viewMode,
  activitiesPanel,
}: CourageActivitiesListViewProps): React.ReactElement | null {
  if (!mapSlot) {
    return activitiesPanel ? <>{activitiesPanel}</> : null;
  }

  return (
    <div
      id="courage-hub-panel-activities"
      role="tabpanel"
      aria-labelledby="courage-hub-tab-activities"
      className="courageAdventureHubSplit"
      data-view={viewMode}
    >
      <div className="courageAdventureHubSplitMap">{mapSlot}</div>
      {activitiesPanel}
    </div>
  );
}
