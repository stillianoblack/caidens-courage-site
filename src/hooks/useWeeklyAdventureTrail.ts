import { useCallback, useEffect, useMemo, useState } from 'react';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { ACTIVE_CHILD_EVENT, MODULE_COMPLETE_EVENT } from '../lib/activeChildContext';
import { resolveTrackingProgramCode } from '../lib/activeProgramContext';
import { decorateTrailNodes } from '../lib/adventureTrailState';
import {
  filterModulesForActiveChild,
  getCompletedModuleIds,
} from '../lib/characterProgressService';
import {
  FAMILY_WEEKLY_ADVENTURE_WEEKS,
  buildWeeklyTrailNodes,
} from '../data/familyWeeklyAdventures';
import { fetchModuleResultsForParticipants } from '../lib/pilotTrackingService';
import { loadLocalModuleResults } from '../lib/pilotTrackingLocalStorage';
import {
  formatWeekUnlockStatus,
  resolveWeekStatus,
} from '../lib/pilotWeekUnlock';
import type { AdventureTrailWeekView } from '../types/adventureTrail';

type WeeklyTrailPaths = {
  kidsBasePath: string;
  downloadsPath: string;
  certificatesPath: string;
};

export function useWeeklyAdventureTrail(
  participantId: string | undefined,
  paths: WeeklyTrailPaths,
  gates: { baselineLocked: boolean },
  pilotStartDate: Date | string | null,
) {
  const programCode = resolveTrackingProgramCode() ?? '';
  const resolvedParticipantId = participantId?.trim() || readActiveChildParticipantId();
  const [remoteModules, setRemoteModules] = useState(loadLocalModuleResults());
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
    setRemoteModules([...results, ...localRows]);
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
    () => filterModulesForActiveChild(remoteModules, resolvedParticipantId ?? '', programCode),
    [remoteModules, resolvedParticipantId, programCode],
  );

  const completedModuleIds = useMemo(
    () => getCompletedModuleIds(scopedModules),
    [scopedModules],
  );

  const weeks: AdventureTrailWeekView[] = useMemo(
    () =>
      FAMILY_WEEKLY_ADVENTURE_WEEKS.filter((week) => week.week <= 8).map((weekMeta) => {
        const weekStatus = resolveWeekStatus(weekMeta.week, pilotStartDate);
        const nodes = buildWeeklyTrailNodes(weekMeta.week, paths, weekMeta.title);

        return {
          week: weekMeta.week,
          title: weekMeta.title,
          selFocus: weekMeta.selFocus,
          weekStatus,
          unlockStatus: formatWeekUnlockStatus(weekMeta.week, pilotStartDate),
          previewActivities: weekMeta.previewActivities,
          nodes: decorateTrailNodes(nodes, completedModuleIds, {
            weekLocked: weekStatus === 'locked',
            baselineLocked: gates.baselineLocked,
          }),
        };
      }),
    [paths, completedModuleIds, gates.baselineLocked, pilotStartDate],
  );

  return { weeks, loading, completedModuleIds, refresh };
}
