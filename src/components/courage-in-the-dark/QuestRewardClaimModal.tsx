import './courage-quest-list-panel.css';
import React from 'react';
import RewardClaimModal from '../rewards/RewardClaimModal';
import type { QuestClaimResult } from '../../lib/participantQuestService';
import { questResultToRewardClaim } from '../../lib/rewardClaimService';

type QuestRewardClaimModalProps = {
  result: QuestClaimResult;
  inventoryPath: string;
  onClose: () => void;
};

/** @deprecated Use RewardClaimModal directly. */
export default function QuestRewardClaimModal({
  result,
  inventoryPath,
  onClose,
}: QuestRewardClaimModalProps) {
  return (
    <RewardClaimModal
      result={questResultToRewardClaim(result)}
      inventoryPath={inventoryPath}
      onClose={onClose}
    />
  );
}
