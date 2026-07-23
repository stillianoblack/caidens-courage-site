import { useCallback, useEffect, useState } from 'react';
import { ACTIVE_CHILD_EVENT, MODULE_COMPLETE_EVENT } from '../lib/activeChildContext';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { fetchCompletedMissionIdsByWeek } from '../lib/adventureWeekProgress';

const SESSION_CACHE_TTL_MS = 30_000;
const completionCache = new Map<
  string,
  { data: Record<number, string[]>; cachedAt: number }
>();
const completionRequests = new Map<
  string,
  ReturnType<typeof fetchCompletedMissionIdsByWeek>
>();

function loadCompletions(participantId: string) {
  const pending = completionRequests.get(participantId);
  if (pending) return pending;
  const request = fetchCompletedMissionIdsByWeek(participantId);
  completionRequests.set(participantId, request);
  void request.finally(() => completionRequests.delete(participantId));
  return request;
}

export function useAdventureWeekCompletions(participantId?: string | null) {
  const resolvedId = participantId?.trim() || readActiveChildParticipantId();
  const cachedCompletions = resolvedId ? completionCache.get(resolvedId)?.data : undefined;
  const [completedByWeek, setCompletedByWeek] = useState<Record<number, string[]>>(
    cachedCompletions ?? {},
  );
  const [loading, setLoading] = useState(!cachedCompletions);

  const refresh = useCallback(async (force = false) => {
    const id = participantId?.trim() || readActiveChildParticipantId();
    if (!id) {
      setCompletedByWeek({});
      setLoading(false);
      return;
    }

    const cachedEntry = completionCache.get(id);
    const cached = cachedEntry?.data;
    if (cached) {
      setCompletedByWeek(cached);
    }
    if (
      !force &&
      cachedEntry &&
      Date.now() - cachedEntry.cachedAt < SESSION_CACHE_TTL_MS
    ) {
      setLoading(false);
      return;
    }
    setLoading(!cached);
    const next = await loadCompletions(id);
    completionCache.set(id, { data: next, cachedAt: Date.now() });
    setCompletedByWeek(next);
    setLoading(false);
  }, [participantId]);

  useEffect(() => {
    void refresh();
  }, [refresh, resolvedId]);

  useEffect(() => {
    const handleRefresh = () => void refresh(true);
    window.addEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
    window.addEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
      window.removeEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
    };
  }, [refresh]);

  return { completedByWeek, loading, refresh };
}
