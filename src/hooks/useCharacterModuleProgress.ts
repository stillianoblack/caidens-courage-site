import { useCallback, useEffect, useMemo, useState } from 'react';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { ACTIVE_CHILD_EVENT, MODULE_COMPLETE_EVENT } from '../lib/activeChildContext';
import { resolveTrackingProgramCode } from '../lib/activeProgramContext';
import { fetchModuleResultsForParticipants } from '../lib/pilotTrackingService';
import type { LocalModuleResultRecord } from '../lib/pilotTrackingLocalStorage';
import {
  filterModulesForActiveChild,
  getCharacterProgress,
  type CharacterProgressSummary,
} from '../lib/characterProgressService';
import { loadLocalModuleResults } from '../lib/pilotTrackingLocalStorage';

export function useCharacterModuleProgress(character: string, participantId?: string) {
  const resolvedParticipantId = participantId?.trim() || readActiveChildParticipantId();
  const programCode = resolveTrackingProgramCode() ?? '';
  const [remoteModules, setRemoteModules] = useState<LocalModuleResultRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const id = participantId?.trim() || readActiveChildParticipantId();
    if (!id) {
      setRemoteModules([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const localRows = loadLocalModuleResults();
    const { results } = await fetchModuleResultsForParticipants([id]);
    const merged = [...results, ...localRows];
    setRemoteModules(merged);
    setLoading(false);
  }, [participantId]);

  useEffect(() => {
    void refresh();
  }, [refresh, programCode, resolvedParticipantId]);

  useEffect(() => {
    const handleRefresh = () => {
      void refresh();
    };
    window.addEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
    window.addEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
    window.addEventListener('cc-baseline-complete', handleRefresh);
    return () => {
      window.removeEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
      window.removeEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
      window.removeEventListener('cc-baseline-complete', handleRefresh);
    };
  }, [refresh]);

  const scopedModules = useMemo(
    () => filterModulesForActiveChild(remoteModules, resolvedParticipantId, programCode),
    [remoteModules, resolvedParticipantId, programCode],
  );

  const progress: CharacterProgressSummary = useMemo(
    () => getCharacterProgress(character, scopedModules),
    [character, scopedModules],
  );

  return {
    progress,
    modules: scopedModules,
    loading,
    refresh,
    participantId: resolvedParticipantId,
    programCode,
  };
}
