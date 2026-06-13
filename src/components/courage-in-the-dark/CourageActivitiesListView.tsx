import React from 'react';
import type { CourageHubViewMode } from './CourageHubViewToggle';
import CourageActivitiesPanel from './CourageActivitiesPanel';
import type { Week1ExtrasPaths } from './Week1ExtrasCards';

type CourageActivitiesListViewProps = {
  mapSlot: React.ReactNode | null;
  viewMode: CourageHubViewMode;
  completedMissionIds: readonly string[];
  paths: Week1ExtrasPaths;
};

export default function CourageActivitiesListView({
  mapSlot,
  viewMode,
  completedMissionIds,
  paths,
}: CourageActivitiesListViewProps) {
  const panel = (
    <CourageActivitiesPanel completedMissionIds={completedMissionIds} paths={paths} />
  );

  if (!mapSlot) {
    return panel;
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
      {panel}
    </div>
  );
}
