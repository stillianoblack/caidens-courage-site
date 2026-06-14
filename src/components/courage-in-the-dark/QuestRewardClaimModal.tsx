import './courage-quest-list-panel.css';
import React from 'react';
import { Link } from 'react-router-dom';
import type { QuestClaimResult } from '../../lib/participantQuestService';

type QuestRewardClaimModalProps = {
  result: QuestClaimResult;
  inventoryPath: string;
  onClose: () => void;
};

function resolveRewardBody(result: QuestClaimResult): string {
  if (result.rewardKind === 'coins' && result.coinsAwarded) {
    return `+${result.coinsAwarded} Focus Coins added to your wallet.`;
  }
  if (result.rewardKind === 'chest') {
    return 'Explorer Chest added to your Inventory.';
  }
  if (result.rewardKind === 'badge') {
    return 'Focus Flame Badge unlocked.';
  }
  return result.rewardLabel ?? 'Your reward is ready.';
}

export default function QuestRewardClaimModal({
  result,
  inventoryPath,
  onClose,
}: QuestRewardClaimModalProps) {
  if (!result.ok || result.alreadyClaimed) return null;

  return (
    <div className="questRewardClaimBackdrop" role="presentation" onClick={onClose}>
      <div
        className="questRewardClaimModal"
        role="dialog"
        aria-labelledby="quest-reward-claimed-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="quest-reward-claimed-title" className="questRewardClaimTitle">Reward Claimed!</h2>
        <p className="questRewardClaimBody">{resolveRewardBody(result)}</p>
        <div className="questRewardClaimActions">
          <Link to={inventoryPath} className="questRewardClaimBtn questRewardClaimBtn--primary">
            View Inventory
          </Link>
          <button type="button" className="questRewardClaimBtn" onClick={onClose}>
            Keep Playing
          </button>
        </div>
      </div>
    </div>
  );
}
