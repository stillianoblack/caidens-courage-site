import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/portal-design-system/ToastProvider';
import {
  courageInTheDarkMissions,
  type CourageInTheDarkMission,
  type CourageMapHotspotId,
} from '../data/courageInTheDarkMap';
import { readAndClearRecentlyCompletedHotspot } from '../lib/courageMapReturnFeedback';
import { resolveCourageMapTargetHref } from '../lib/courageInTheDarkRoutes';
import { isCourageMapHotspotComplete, resolveCourageWeekId } from '../lib/courageInTheDarkProgress';
import { resolvePortalKidsBasePath } from '../lib/portalGamePaths';
import {
  CAMP_PILOT_UNLOCK_ALL,
  detectNewlyUnlockedWeek1Missions,
  getWeek1MissionUnlockState,
  type Week1MissionUnlockState,
} from '../lib/week1MissionUnlock';
import type { AdventureTrailNodeView } from '../types/adventureTrail';
import { useCourageInTheDarkProgress } from './useCourageInTheDarkProgress';

function resolveTrailNodeForHotspot(
  hotspotId: CourageMapHotspotId,
  nodes: AdventureTrailNodeView[],
): AdventureTrailNodeView | undefined {
  return nodes.find((node) => node.characterId === hotspotId);
}

type UseCourageAdventureHubOptions = {
  weekNodes: AdventureTrailNodeView[];
  weekTitle?: string;
  week?: number;
  kidsBasePath?: string;
  baselineLocked?: boolean;
  mapLocked?: boolean;
};

export function useCourageAdventureHub({
  weekNodes,
  weekTitle = 'Courage in the Dark',
  week = 1,
  kidsBasePath,
  baselineLocked = false,
  mapLocked = false,
}: UseCourageAdventureHubOptions) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedHotspot, setSelectedHotspot] = useState<CourageInTheDarkMission | null>(null);
  const [comingSoonSlug, setComingSoonSlug] = useState<string | null>(null);
  const weekId = resolveCourageWeekId(week);
  const { progress, refresh } = useCourageInTheDarkProgress(weekId);
  const [animatingHotspotId, setAnimatingHotspotId] = useState<CourageMapHotspotId | null>(null);
  const previousCompletedIdsRef = useRef<string[] | null>(null);

  useEffect(() => {
    const hotspotId = readAndClearRecentlyCompletedHotspot();
    if (!hotspotId) return undefined;

    setAnimatingHotspotId(hotspotId as CourageMapHotspotId);
    void refresh();
    const timer = window.setTimeout(() => setAnimatingHotspotId(null), 350);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const resolvedKidsBase =
    kidsBasePath?.replace(/\/+$/, '') ??
    resolvePortalKidsBasePath(typeof window !== 'undefined' ? window.location.pathname : '');

  const isHotspotComplete = useCallback(
    (hotspot: CourageInTheDarkMission) => {
      if (week === 1) {
        return isCourageMapHotspotComplete(hotspot.id, progress.completedMissionIds);
      }
      const trailNode = resolveTrailNodeForHotspot(hotspot.id, weekNodes);
      if (trailNode?.state === 'complete') return true;
      return isCourageMapHotspotComplete(hotspot.id, progress.completedMissionIds);
    },
    [progress.completedMissionIds, week, weekNodes],
  );

  const getMissionUnlockState = useCallback(
    (mission: CourageInTheDarkMission): Week1MissionUnlockState => {
      if (week === 1) {
        if (!CAMP_PILOT_UNLOCK_ALL && (mapLocked || baselineLocked)) {
          return { unlocked: false, reason: 'Complete check-in to begin' };
        }
        return getWeek1MissionUnlockState(mission.targetGameSlug, progress.completedMissionIds);
      }
      if (mapLocked || baselineLocked) {
        return { unlocked: false, reason: 'Complete check-in to begin' };
      }
      return { unlocked: !mission.locked, reason: mission.locked ? 'Locked' : 'Available now' };
    },
    [baselineLocked, mapLocked, progress.completedMissionIds, week],
  );

  const isHotspotLocked = useCallback(
    (hotspot: CourageInTheDarkMission) => !getMissionUnlockState(hotspot).unlocked,
    [getMissionUnlockState],
  );

  useEffect(() => {
    if (week !== 1 || CAMP_PILOT_UNLOCK_ALL) return;

    const currentCompletedIds = progress.completedMissionIds;
    if (previousCompletedIdsRef.current === null) {
      previousCompletedIdsRef.current = currentCompletedIds;
      return;
    }

    const newlyUnlocked = detectNewlyUnlockedWeek1Missions(
      previousCompletedIdsRef.current,
      currentCompletedIds,
    );
    previousCompletedIdsRef.current = currentCompletedIds;

    if (newlyUnlocked.length > 0) {
      showToast('New adventure unlocked!', 'success');
    }
  }, [progress.completedMissionIds, showToast, week]);

  const completedCount = useMemo(
    () => courageInTheDarkMissions.filter((mission) => isHotspotComplete(mission)).length,
    [isHotspotComplete],
  );

  const selectHotspot = useCallback(
    (hotspot: CourageInTheDarkMission) => {
      setComingSoonSlug(null);
      setSelectedHotspot(hotspot);
    },
    [],
  );

  const deselectHotspot = useCallback(() => {
    setSelectedHotspot(null);
    setComingSoonSlug(null);
  }, []);

  const targetHref = useMemo(() => {
    if (!selectedHotspot) return null;
    return resolveCourageMapTargetHref(
      selectedHotspot.targetGameSlug,
      resolvedKidsBase,
      week,
      weekTitle,
    );
  }, [resolvedKidsBase, selectedHotspot, week, weekTitle]);

  const resolveMissionHref = useCallback(
    (mission: CourageInTheDarkMission) =>
      resolveCourageMapTargetHref(mission.targetGameSlug, resolvedKidsBase, week, weekTitle),
    [resolvedKidsBase, week, weekTitle],
  );

  const launchMission = useCallback(
    (mission: CourageInTheDarkMission) => {
      if (isHotspotLocked(mission)) return false;

      const href = resolveMissionHref(mission);

      if (!href) {
        console.warn(
          '[COURAGE_MAP] Adventure coming soon — missing route for slug:',
          mission.targetGameSlug,
        );
        setComingSoonSlug(mission.targetGameSlug);
        return false;
      }

      navigate(href);
      return true;
    },
    [isHotspotLocked, navigate, resolveMissionHref],
  );

  const startAdventure = useCallback(() => {
    if (!selectedHotspot) return;
    launchMission(selectedHotspot);
  }, [launchMission, selectedHotspot]);

  return {
    selectedHotspot,
    comingSoonSlug,
    completedCount,
    totalAdventures: progress.totalMissions || courageInTheDarkMissions.length,
    isHotspotComplete,
    isHotspotLocked,
    getMissionUnlockState,
    selectHotspot,
    deselectHotspot,
    launchMission,
    resolveMissionHref,
    startAdventure,
    targetHref,
    totalCoins: progress.totalCoins,
    unlockedBadges: progress.unlockedBadges,
    animatingHotspotId,
    refreshProgress: refresh,
    completedMissionIds: progress.completedMissionIds,
  };
}
