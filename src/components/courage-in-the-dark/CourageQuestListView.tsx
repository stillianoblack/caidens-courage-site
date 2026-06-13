import React from 'react';
import type { CourageHubViewMode } from './CourageHubViewToggle';
import type { QuestProgressRow } from '../../lib/participantQuestService';
import CourageQuestListPanel from './CourageQuestListPanel';

type CourageQuestListViewProps = {
  mapSlot: React.ReactNode;
  viewMode: CourageHubViewMode;
  quests: QuestProgressRow[];
  loading?: boolean;
  claimingKey?: string | null;
  onClaim?: (questKey: string, period: QuestProgressRow['period']) => void;
};

export default function CourageQuestListView({
  mapSlot,
  viewMode,
  quests,
  loading,
  claimingKey,
  onClaim,
}: CourageQuestListViewProps) {
  return (
    <div
      id="courage-hub-panel-quests"
      role="tabpanel"
      aria-labelledby="courage-hub-tab-quests"
      className="courageAdventureHubSplit"
      data-view={viewMode}
    >
      <div className="courageAdventureHubSplitMap">{mapSlot}</div>
      <CourageQuestListPanel
        quests={quests}
        loading={loading}
        claimingKey={claimingKey}
        onClaim={onClaim}
      />
    </div>
  );
}
