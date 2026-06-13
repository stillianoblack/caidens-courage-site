import React, { useMemo, useState } from 'react';
import KidsAdventureIcon from '../../design-system/kids-adventure/KidsAdventureIcon';
import type { QuestProgressRow } from '../../lib/participantQuestService';
import { QUEST_DEFINITIONS } from '../../lib/participantQuestService';
import './weekly-quest-tracker.css';

type WeeklyQuestTrackerProps = {
  quests: QuestProgressRow[];
  loading?: boolean;
  claimingKey?: string | null;
  onClaim?: (questKey: string, period: QuestProgressRow['period']) => void;
};

function questTitle(questKey: string): string {
  return QUEST_DEFINITIONS.find((row) => row.key === questKey)?.title ?? 'Quest';
}

function questDescription(questKey: string): string {
  return QUEST_DEFINITIONS.find((row) => row.key === questKey)?.description ?? '';
}

function QuestIcon({ icon }: { icon: QuestProgressRow['icon'] }) {
  if (icon === 'flame') {
    return <KidsAdventureIcon name="flame" size={22} />;
  }
  if (icon === 'chest') {
    return <KidsAdventureIcon name="gift" size={22} />;
  }
  return <KidsAdventureIcon name="badge" size={22} />;
}

export default function WeeklyQuestTracker({
  quests,
  loading = false,
  claimingKey = null,
  onClaim,
}: WeeklyQuestTrackerProps) {
  const [expanded, setExpanded] = useState(false);

  const headline = useMemo(() => {
    const claimable = quests.filter((row) => row.claimable).length;
    if (claimable > 0) {
      return `${claimable} quest reward${claimable === 1 ? '' : 's'} ready`;
    }
    const active = quests.find((row) => row.progressCount < row.targetCount);
    if (active) {
      return `${active.progressCount}/${active.targetCount} · ${questDescription(active.questKey)}`;
    }
    return 'All quests claimed';
  }, [quests]);

  if (loading && quests.length === 0) {
    return null;
  }

  return (
    <section className="weeklyQuestTracker" aria-label="Focus quests">
      <button
        type="button"
        className="weeklyQuestTrackerToggle"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
      >
        <span className="weeklyQuestTrackerToggleIcon" aria-hidden="true">
          <KidsAdventureIcon name="flame" size={20} filled />
        </span>
        <span className="weeklyQuestTrackerToggleCopy">
          <span className="weeklyQuestTrackerToggleTitle">Focus Quests</span>
          <span className="weeklyQuestTrackerToggleMeta">{headline}</span>
        </span>
        <span className="weeklyQuestTrackerChevron" aria-hidden="true">
          {expanded ? '▴' : '▾'}
        </span>
      </button>

      {expanded ? (
        <ul className="weeklyQuestTrackerList">
          {quests.map((quest) => {
            const progressPct = Math.min(
              100,
              Math.round((quest.progressCount / Math.max(quest.targetCount, 1)) * 100),
            );
            return (
              <li key={`${quest.period}-${quest.questKey}`} className="weeklyQuestTrackerItem">
                <div className="weeklyQuestTrackerItemHead">
                  <span className="weeklyQuestTrackerItemIcon" aria-hidden="true">
                    <QuestIcon icon={quest.icon} />
                  </span>
                  <div className="weeklyQuestTrackerItemCopy">
                    <p className="weeklyQuestTrackerItemTitle">{questTitle(quest.questKey)}</p>
                    <p className="weeklyQuestTrackerItemDesc">{questDescription(quest.questKey)}</p>
                  </div>
                  <span className="weeklyQuestTrackerReward">{quest.rewardLabel}</span>
                </div>
                <div
                  className="weeklyQuestTrackerBar"
                  role="progressbar"
                  aria-valuenow={quest.progressCount}
                  aria-valuemin={0}
                  aria-valuemax={quest.targetCount}
                >
                  <div className="weeklyQuestTrackerBarFill" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="weeklyQuestTrackerProgress">
                  {quest.progressCount} / {quest.targetCount}
                </p>
                {quest.claimed ? (
                  <span className="weeklyQuestTrackerClaimed">Claimed</span>
                ) : quest.claimable ? (
                  <button
                    type="button"
                    className="weeklyQuestTrackerClaimBtn"
                    disabled={claimingKey === quest.questKey}
                    onClick={() => onClaim?.(quest.questKey, quest.period)}
                  >
                    {claimingKey === quest.questKey ? 'Claiming…' : 'Claim'}
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
