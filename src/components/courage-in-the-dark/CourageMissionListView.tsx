import React from 'react';
import type { CourageInTheDarkMission } from '../../data/courageInTheDarkMap';
import type { CourageHubViewMode } from './CourageHubViewToggle';
import CourageMissionListPanel from './CourageMissionListPanel';

type CourageMissionListViewProps = {
  week: number;
  mapSlot: React.ReactNode;
  completedCount: number;
  totalAdventures: number;
  selectedMissionId: string | null;
  isMissionComplete: (mission: CourageInTheDarkMission) => boolean;
  isMissionLocked: (mission: CourageInTheDarkMission) => boolean;
  getMissionUnlockReason?: (mission: CourageInTheDarkMission) => string;
  getMissionHref?: (mission: CourageInTheDarkMission) => string | null;
  onSelectMission: (mission: CourageInTheDarkMission) => void;
  onLaunchMission: (mission: CourageInTheDarkMission) => void;
  comingSoonMissionId?: string | null;
  viewMode: CourageHubViewMode;
};

export default function CourageMissionListView({
  week,
  mapSlot,
  completedCount,
  totalAdventures,
  selectedMissionId,
  isMissionComplete,
  isMissionLocked,
  getMissionUnlockReason,
  getMissionHref,
  onSelectMission,
  onLaunchMission,
  comingSoonMissionId,
  viewMode,
}: CourageMissionListViewProps) {
  return (
    <div
      id="courage-hub-panel-missions"
      role="tabpanel"
      aria-labelledby="courage-hub-tab-missions"
      className="courageAdventureHubSplit"
      data-view={viewMode}
    >
      <div className="courageAdventureHubSplitMap">{mapSlot}</div>

      <CourageMissionListPanel
        week={week}
        completedCount={completedCount}
        totalAdventures={totalAdventures}
        selectedMissionId={selectedMissionId}
        isMissionComplete={isMissionComplete}
        isMissionLocked={isMissionLocked}
        getMissionUnlockReason={getMissionUnlockReason}
        getMissionHref={getMissionHref}
        onSelectMission={onSelectMission}
        onLaunchMission={onLaunchMission}
        comingSoonMissionId={comingSoonMissionId}
      />
    </div>
  );
}
