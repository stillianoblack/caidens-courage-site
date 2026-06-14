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
import type { AdventureModuleRecord } from '../types/adventureModule';
import type { AdventureTrailWeekView } from '../types/adventureTrail';
import { resolveAdventureThumbnailUrl } from '../lib/adventureThumbnail';
import {
  formatCmsAdventureUnlockStatus,
  listCmsTrailAdventures,
  resolveCmsAdventureWeekStatus,
  type AdventureVisibilityContext,
} from '../lib/adventureVisibility';

type WeeklyTrailPaths = {
  kidsBasePath: string;
  downloadsPath: string;
  certificatesPath: string;
};

type WeeklyAdventureTrailOptions = {
  cmsModules?: AdventureModuleRecord[];
  visibilityCtx?: AdventureVisibilityContext;
  /** Map-mission completion by week (from player_progress). Overrides module-based completion for unlock. */
  mapCompletedWeekNumbers?: number[];
};

export function useWeeklyAdventureTrail(
  participantId: string | undefined,
  paths: WeeklyTrailPaths,
  gates: { baselineLocked: boolean },
  pilotStartDate: Date | string | null,
  options: WeeklyAdventureTrailOptions = {},
) {
  const programCode = resolveTrackingProgramCode() ?? '';
  const resolvedParticipantId = participantId?.trim() || readActiveChildParticipantId();
  const [remoteModules, setRemoteModules] = useState(loadLocalModuleResults());
  const [loading, setLoading] = useState(false);
  const cmsModules = options.cmsModules ?? [];
  const visibilityCtx = options.visibilityCtx ?? { now: new Date() };

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

  const completedWeekNumbers = useMemo(() => {
    if (options.mapCompletedWeekNumbers?.length) {
      return options.mapCompletedWeekNumbers;
    }
    const completed = new Set<number>();
    FAMILY_WEEKLY_ADVENTURE_WEEKS.forEach((weekMeta) => {
      const nodes = buildWeeklyTrailNodes(weekMeta.week, paths, weekMeta.title);
      const allDone = nodes.every((node) =>
        node.moduleId ? completedModuleIds.has(node.moduleId) : false,
      );
      if (allDone && nodes.some((node) => node.moduleId)) {
        completed.add(weekMeta.week);
      }
    });
    return Array.from(completed);
  }, [completedModuleIds, options.mapCompletedWeekNumbers, paths]);

  const cmsTrailModules = useMemo(
    () => listCmsTrailAdventures(cmsModules, visibilityCtx),
    [cmsModules, visibilityCtx],
  );

  const weeks: AdventureTrailWeekView[] = useMemo(() => {
    const staticWeeks = FAMILY_WEEKLY_ADVENTURE_WEEKS.filter((week) => week.week <= 8);
    const cmsByWeek = new Map(cmsTrailModules.map((row) => [row.week_number, row]));
    const mergedWeekNumbers = new Set<number>();

    staticWeeks.forEach((weekMeta) => mergedWeekNumbers.add(weekMeta.week));
    cmsTrailModules.forEach((row) => mergedWeekNumbers.add(row.week_number));

    return Array.from(mergedWeekNumbers)
      .sort((a, b) => a - b)
      .map((weekNumber) => {
        const weekMeta =
          staticWeeks.find((row) => row.week === weekNumber) ??
          ({
            week: weekNumber,
            title: `Week ${weekNumber} Adventure`,
            selFocus: 'Focus & Courage',
            previewActivities: ['Character missions', 'Family activity', 'Downloads'],
          } as (typeof staticWeeks)[number]);
        const cmsRow =
          cmsByWeek.get(weekNumber) ??
          cmsModules.find((row) => row.week_number === weekNumber);

        let weekStatus: 'available' | 'locked';
        let unlockStatus: string;

        if (cmsRow) {
          weekStatus = resolveCmsAdventureWeekStatus(
            cmsRow,
            cmsModules,
            visibilityCtx,
            completedWeekNumbers,
          );
          unlockStatus = formatCmsAdventureUnlockStatus(
            cmsRow,
            cmsModules,
            visibilityCtx,
            completedWeekNumbers,
          );
        } else {
          weekStatus = resolveWeekStatus(weekNumber, pilotStartDate);
          unlockStatus = formatWeekUnlockStatus(weekNumber, pilotStartDate);
        }

        const nodes = buildWeeklyTrailNodes(weekNumber, paths, weekMeta.title);

        return {
          week: weekNumber,
          title: cmsRow?.title || weekMeta.title,
          selFocus: cmsRow?.subtitle || weekMeta.selFocus,
          weekStatus,
          unlockStatus,
          previewActivities: cmsRow?.preview_activities ?? weekMeta.previewActivities,
          thumbnailUrl: resolveAdventureThumbnailUrl(cmsRow ?? null, weekNumber),
          nodes: decorateTrailNodes(nodes, completedModuleIds, {
            weekLocked: weekStatus === 'locked',
            baselineLocked: gates.baselineLocked,
          }),
        };
      });
  }, [
    cmsModules,
    cmsTrailModules,
    completedWeekNumbers,
    completedModuleIds,
    gates.baselineLocked,
    paths,
    pilotStartDate,
    visibilityCtx,
  ]);

  return { weeks, loading, completedModuleIds, refresh, completedWeekNumbers };
}
