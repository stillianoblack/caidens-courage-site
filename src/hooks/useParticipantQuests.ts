import { useCallback, useEffect, useRef, useState } from 'react';
import { MODULE_COMPLETE_EVENT } from '../lib/activeChildContext';
import { FOCUS_COIN_WALLET_EVENT } from '../hooks/useFocusCoinWallet';
import {
  claimParticipantQuest,
  loadParticipantQuests,
  type QuestClaimResult,
  type QuestProgressRow,
} from '../lib/participantQuestService';
import { notifyFocusCoinWalletUpdated } from '../hooks/useFocusCoinWallet';
import type { WeeklyQuestRewardConfig } from '../lib/adventureWeekAssets';

type UseParticipantQuestsInput = {
  participantId?: string | null;
  weekId: string;
  completedWeekMissions: number;
  monthlyCoinsEarned: number;
  dailyAdventureComplete: boolean;
  weeklyQuestReward?: WeeklyQuestRewardConfig | null;
};

export const QUEST_LOAD_TIMEOUT_MS = 12_000;

export class QuestLoadTimeoutError extends Error {
  constructor() {
    super('Quest loading timed out.');
    this.name = 'QuestLoadTimeoutError';
  }
}

export function loadQuestsWithTimeout(
  request: Promise<QuestProgressRow[]>,
  timeoutMs = QUEST_LOAD_TIMEOUT_MS,
): Promise<QuestProgressRow[]> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new QuestLoadTimeoutError()), timeoutMs);
    request.then(
      (rows) => {
        window.clearTimeout(timeoutId);
        resolve(rows);
      },
      (error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

export function useParticipantQuests({
  participantId,
  weekId,
  completedWeekMissions,
  monthlyCoinsEarned,
  dailyAdventureComplete,
  weeklyQuestReward,
}: UseParticipantQuestsInput) {
  const [quests, setQuests] = useState<QuestProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingKey, setClaimingKey] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const rows = await loadQuestsWithTimeout(
        loadParticipantQuests(participantId, weekId, {
          completedWeekMissions,
          monthlyCoinsEarned,
          dailyAdventureComplete,
        }, weeklyQuestReward),
      );
      if (requestId === requestIdRef.current) {
        setQuests(rows);
      }
    } catch (requestError) {
      if (requestId === requestIdRef.current) {
        setError(
          requestError instanceof QuestLoadTimeoutError
            ? 'Quests took too long to load.'
            : 'We couldn\'t load quests right now.',
        );
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [
    participantId,
    weekId,
    completedWeekMissions,
    monthlyCoinsEarned,
    dailyAdventureComplete,
    weeklyQuestReward,
  ]);

  useEffect(() => {
    void refresh();
    return () => {
      requestIdRef.current += 1;
    };
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
      const result = await claimParticipantQuest(participantId, questKey, period, weekId, weeklyQuestReward);
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
    [participantId, refresh, weekId, weeklyQuestReward],
  );

  return { quests, loading, error, claimQuest, claimingKey, refresh };
}
