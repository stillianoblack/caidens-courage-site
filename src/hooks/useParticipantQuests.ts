import { useCallback, useEffect, useState } from 'react';
import { MODULE_COMPLETE_EVENT } from '../lib/activeChildContext';
import { FOCUS_COIN_WALLET_EVENT } from '../hooks/useFocusCoinWallet';
import {
  claimParticipantQuest,
  loadParticipantQuests,
  type QuestClaimResult,
  type QuestProgressRow,
} from '../lib/participantQuestService';
import { notifyFocusCoinWalletUpdated } from '../hooks/useFocusCoinWallet';

type UseParticipantQuestsInput = {
  participantId?: string | null;
  weekId: string;
  completedWeekMissions: number;
  monthlyCoinsEarned: number;
  dailyAdventureComplete: boolean;
};

export function useParticipantQuests({
  participantId,
  weekId,
  completedWeekMissions,
  monthlyCoinsEarned,
  dailyAdventureComplete,
}: UseParticipantQuestsInput) {
  const [quests, setQuests] = useState<QuestProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingKey, setClaimingKey] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const rows = await loadParticipantQuests(participantId, weekId, {
      completedWeekMissions,
      monthlyCoinsEarned,
      dailyAdventureComplete,
    });
    setQuests(rows);
    setLoading(false);
  }, [
    participantId,
    weekId,
    completedWeekMissions,
    monthlyCoinsEarned,
    dailyAdventureComplete,
  ]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const handleRefresh = () => {
      void refresh();
    };
    window.addEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
    window.addEventListener(FOCUS_COIN_WALLET_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
      window.removeEventListener(FOCUS_COIN_WALLET_EVENT, handleRefresh);
    };
  }, [refresh]);

  const claimQuest = useCallback(
    async (questKey: string, period: QuestProgressRow['period']): Promise<QuestClaimResult> => {
      if (!participantId) return { ok: false };
      setClaimingKey(questKey);
      const result = await claimParticipantQuest(participantId, questKey, period, weekId);
      if (result.ok && !result.alreadyClaimed) {
        if (result.coinsAwarded && result.newCoinTotal != null) {
          notifyFocusCoinWalletUpdated(result.newCoinTotal);
        } else if (result.coinsAwarded) {
          notifyFocusCoinWalletUpdated(0);
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(MODULE_COMPLETE_EVENT));
        }
      }
      await refresh();
      setClaimingKey(null);
      return result;
    },
    [participantId, refresh, weekId],
  );

  return { quests, loading, claimQuest, claimingKey, refresh };
}
