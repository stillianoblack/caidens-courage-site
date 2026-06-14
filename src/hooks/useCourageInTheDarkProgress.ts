import { useCallback, useEffect, useState } from 'react';
import { ACTIVE_CHILD_EVENT, MODULE_COMPLETE_EVENT } from '../lib/activeChildContext';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { CHILD_PROFILE_UPDATED_EVENT } from '../config/activeChildParticipant';
import { getCourageInTheDarkProgress } from '../lib/getCourageInTheDarkProgress';
import type { CourageInTheDarkProgressSnapshot } from '../types/courageMissionProgress';

type UseCourageInTheDarkProgressResult = {
  progress: CourageInTheDarkProgressSnapshot;
  loading: boolean;
  refresh: () => Promise<void>;
};

const INITIAL_PROGRESS: CourageInTheDarkProgressSnapshot = {
  completedMissionIds: [],
  completedCount: 0,
  totalMissions: 0,
  totalCoins: 0,
  unlockedBadges: [],
};

export function useCourageInTheDarkProgress(
  weekId: string,
  participantId?: string | null,
  totalMissions?: number,
): UseCourageInTheDarkProgressResult {
  const [progress, setProgress] = useState<CourageInTheDarkProgressSnapshot>(INITIAL_PROGRESS);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    const activeId = participantId?.trim() || readActiveChildParticipantId();
    const snapshot = await getCourageInTheDarkProgress(weekId, activeId, totalMissions);
    setProgress(snapshot);
    setLoading(false);
  }, [participantId, totalMissions, weekId]);

  useEffect(() => {
    void refresh();
    const handleRefresh = () => {
      void refresh();
    };
    window.addEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
    window.addEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
    window.addEventListener(CHILD_PROFILE_UPDATED_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
      window.removeEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
      window.removeEventListener(CHILD_PROFILE_UPDATED_EVENT, handleRefresh);
    };
  }, [refresh]);

  return { progress, loading, refresh };
}
