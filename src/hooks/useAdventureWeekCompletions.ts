import { useCallback, useEffect, useState } from 'react';
import { ACTIVE_CHILD_EVENT, MODULE_COMPLETE_EVENT } from '../lib/activeChildContext';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { fetchCompletedMissionIdsByWeek } from '../lib/adventureWeekProgress';

export function useAdventureWeekCompletions(participantId?: string | null) {
  const resolvedId = participantId?.trim() || readActiveChildParticipantId();
  const [completedByWeek, setCompletedByWeek] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const id = participantId?.trim() || readActiveChildParticipantId();
    if (!id) {
      setCompletedByWeek({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const next = await fetchCompletedMissionIdsByWeek(id);
    setCompletedByWeek(next);
    setLoading(false);
  }, [participantId]);

  useEffect(() => {
    void refresh();
  }, [refresh, resolvedId]);

  useEffect(() => {
    const handleRefresh = () => void refresh();
    window.addEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
    window.addEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
      window.removeEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
    };
  }, [refresh]);

  return { completedByWeek, loading, refresh };
}
