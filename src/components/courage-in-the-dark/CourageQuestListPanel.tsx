import React from 'react';
import KidsAdventureIcon from '../../design-system/kids-adventure/KidsAdventureIcon';
import type { QuestProgressRow } from '../../lib/participantQuestService';
import { QUEST_DEFINITIONS } from '../../lib/participantQuestService';
import './courage-quest-list-panel.css';

type CourageQuestListPanelProps = {
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
    return <KidsAdventureIcon name="flame" size={22} filled />;
  }
  if (icon === 'chest') {
    return <KidsAdventureIcon name="gift" size={22} filled />;
  }
  return <KidsAdventureIcon name="badge" size={22} filled />;
}

export default function CourageQuestListPanel({
  quests,
  loading = false,
  claimingKey = null,
  onClaim,
}: CourageQuestListPanelProps) {
  const claimableCount = quests.filter((row) => row.claimable).length;

  return (
    <aside className="courageQuestListPanel" aria-label="Focus quests">
      <header className="courageQuestListPanelHeader">
        <h3 className="courageQuestListPanelTitle">Focus Quests</h3>
        <p className="courageQuestListPanelIntro">Daily, weekly, and monthly rewards.</p>
        {claimableCount > 0 ? (
          <p className="courageQuestListPanelReady" role="status">
            {claimableCount} reward{claimableCount === 1 ? '' : 's'} ready to claim
          </p>
        ) : null}
      </header>

      {loading && quests.length === 0 ? (
        <p className="courageQuestListPanelEmpty">Loading quests…</p>
      ) : null}

      <ul className="courageQuestListRows">
        {quests.map((quest, index) => {
          const progressPct = Math.min(
            100,
            Math.round((quest.progressCount / Math.max(quest.targetCount, 1)) * 100),
          );

          return (
            <li
              key={`${quest.period}-${quest.questKey}`}
              className={[
                'courageQuestListCard',
                quest.claimable ? 'courageQuestListCard--ready' : '',
                quest.claimed ? 'courageQuestListCard--claimed' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="courageQuestListCardHead">
                <span className="courageQuestListCardIcon" aria-hidden="true">
                  <QuestIcon icon={quest.icon} />
                </span>
                <div className="courageQuestListCardCopy">
                  <p className="courageQuestListCardTitle">{questTitle(quest.questKey)}</p>
                  <p className="courageQuestListCardDesc">{questDescription(quest.questKey)}</p>
                </div>
                <span className="courageQuestListCardReward">{quest.rewardLabel}</span>
              </div>

              <div
                className="courageQuestListCardBar"
                role="progressbar"
                aria-valuenow={quest.progressCount}
                aria-valuemin={0}
                aria-valuemax={quest.targetCount}
                aria-label={`${quest.progressCount} of ${quest.targetCount}`}
              >
                <span
                  className="courageQuestListCardBarFill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <p className="courageQuestListCardProgress">
                {quest.progressCount} / {quest.targetCount}
              </p>

              {quest.claimed ? (
                <span className="courageQuestListCardClaimed">Claimed</span>
              ) : quest.claimable ? (
                <button
                  type="button"
                  className="courageQuestListCardClaimBtn"
                  disabled={claimingKey === quest.questKey}
                  onClick={() => onClaim?.(quest.questKey, quest.period)}
                >
                  {claimingKey === quest.questKey ? 'Claiming…' : 'Claim Reward'}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
