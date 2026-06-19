import { useCallback, useEffect, useState } from 'react';
import type { AdventureModuleRecord } from '../types/adventureModule';
import { ACTIVE_CHILD_EVENT, MODULE_COMPLETE_EVENT } from '../lib/activeChildContext';
import { CHILD_PROFILE_UPDATED_EVENT } from '../config/activeChildParticipant';
import {
  loadChildRewardCompletionSnapshot,
  type ChildRewardCompletionSnapshot,
  type LoadChildRewardCompletionOptions,
} from '../lib/childRewardCompletionSnapshot';
import type { WeekProgressPaths } from '../lib/childProgressStatus';

type UseChildRewardCompletionInput = {
  participantId?: string | null;
  cmsModules?: readonly AdventureModuleRecord[];
  paths?: WeekProgressPaths;
};

export function useChildRewardCompletion({
  participantId,
  cmsModules = [],
  paths,
}: UseChildRewardCompletionInput) {
  const [snapshot, setSnapshot] = useState<ChildRewardCompletionSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const id = participantId?.trim() ?? '';
    if (!id) {
      setSnapshot(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const options: LoadChildRewardCompletionOptions = { cmsModules, paths };
    const next = await loadChildRewardCompletionSnapshot(id, options);
    setSnapshot(next);
    setLoading(false);
  }, [cmsModules, participantId, paths]);

  useEffect(() => {
    void refresh();
    const handleRefresh = () => {
      void refresh();
    };
    window.addEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
    window.addEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
    window.addEventListener(CHILD_PROFILE_UPDATED_EVENT, handleRefresh);
    window.addEventListener('cc-reward-claimed', handleRefresh);
    return () => {
      window.removeEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
      window.removeEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
      window.removeEventListener(CHILD_PROFILE_UPDATED_EVENT, handleRefresh);
      window.removeEventListener('cc-reward-claimed', handleRefresh);
    };
  }, [refresh]);

  return { snapshot, loading, refresh };
}
