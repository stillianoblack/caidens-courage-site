import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../components/portal-design-system/ToastProvider';
import {
  courageInTheDarkMissions,
  type CourageInTheDarkMission,
  type CourageMapHotspotId,
} from '../data/courageInTheDarkMap';
import { readAndClearRecentlyCompletedHotspot } from '../lib/courageMapReturnFeedback';
import { isCourageMapHotspotComplete, resolveCourageWeekId } from '../lib/courageInTheDarkProgress';
import {
  launchWeeklyMission,
  resolveWeeklyMissionRoute,
  resolveWeeklyMissionUnlockReason,
  isWeeklyMissionLocked,
  type WeeklyMissionLaunchSource,
} from '../lib/launchWeeklyMission';
import { resolvePortalKidsBasePath } from '../lib/portalGamePaths';
import {
  CAMP_PILOT_UNLOCK_ALL,
  detectNewlyUnlockedWeek1Missions,
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
  mapMissions?: CourageInTheDarkMission[];
};

export function useCourageAdventureHub({
  weekNodes,
  weekTitle = 'Courage in the Dark',
  week = 1,
  kidsBasePath,
  baselineLocked = false,
  mapLocked = false,
  mapMissions = courageInTheDarkMissions,
}: UseCourageAdventureHubOptions) {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [selectedHotspot, setSelectedHotspot] = useState<CourageInTheDarkMission | null>(null);
  const [comingSoonSlug, setComingSoonSlug] = useState<string | null>(null);
  const weekId = resolveCourageWeekId(week);
  const { progress, refresh } = useCourageInTheDarkProgress(weekId, undefined, mapMissions.length);
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
      if (progress.completedMissionIds.includes(hotspot.targetGameSlug)) return true;
      if (progress.completedMissionIds.includes(hotspot.id)) return true;
      if (week === 1) {
        return isCourageMapHotspotComplete(
          hotspot.id,
          progress.completedMissionIds,
          hotspot.targetGameSlug,
        );
      }
      const trailNode = resolveTrailNodeForHotspot(hotspot.id, weekNodes);
      return trailNode?.state === 'complete';
    },
    [progress.completedMissionIds, week, weekNodes],
  );

  const missionUnlockOptions = useMemo(
    () => ({
      week,
      baselineLocked,
      mapLocked,
      completedMissionIds: progress.completedMissionIds,
    }),
    [baselineLocked, mapLocked, progress.completedMissionIds, week],
  );

  const getMissionUnlockState = useCallback(
    (mission: CourageInTheDarkMission): Week1MissionUnlockState => ({
      unlocked: !isWeeklyMissionLocked(mission, missionUnlockOptions),
      reason: resolveWeeklyMissionUnlockReason(mission, missionUnlockOptions),
    }),
    [missionUnlockOptions],
  );

  const isHotspotLocked = useCallback(
    (hotspot: CourageInTheDarkMission) => isWeeklyMissionLocked(hotspot, missionUnlockOptions),
    [missionUnlockOptions],
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
    () => mapMissions.filter((mission) => isHotspotComplete(mission)).length,
    [isHotspotComplete, mapMissions],
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
    return resolveWeeklyMissionRoute({
      mission: selectedHotspot,
      weekId: week,
      weekTitle,
      kidsBasePath: resolvedKidsBase,
      pathname: location.pathname,
    });
  }, [location.pathname, resolvedKidsBase, selectedHotspot, week, weekTitle]);

  const resolveMissionHref = useCallback(
    (mission: CourageInTheDarkMission) =>
      resolveWeeklyMissionRoute({
        mission,
        weekId: week,
        weekTitle,
        kidsBasePath: resolvedKidsBase,
        pathname: location.pathname,
      }),
    [location.pathname, resolvedKidsBase, week, weekTitle],
  );

  const launchMission = useCallback(
    (mission: CourageInTheDarkMission, source: WeeklyMissionLaunchSource = 'character-hotspot') => {
      const launched = launchWeeklyMission({
        mission,
        weekId: week,
        weekTitle,
        kidsBasePath: resolvedKidsBase,
        pathname: location.pathname,
        characterId: mission.id,
        missionId: mission.targetGameSlug,
        source,
        baselineLocked,
        mapLocked,
        completedMissionIds: progress.completedMissionIds,
        navigate,
      });

      if (!launched) {
        if (!isHotspotLocked(mission)) {
          setComingSoonSlug(mission.targetGameSlug);
        }
        return false;
      }

      return true;
    },
    [
      baselineLocked,
      isHotspotLocked,
      location.pathname,
      mapLocked,
      navigate,
      progress.completedMissionIds,
      resolvedKidsBase,
      week,
      weekTitle,
    ],
  );

  const startAdventure = useCallback(() => {
    if (!selectedHotspot) return;
    launchMission(selectedHotspot);
  }, [launchMission, selectedHotspot]);

  return {
    selectedHotspot,
    comingSoonSlug,
    completedCount,
    totalAdventures: progress.totalMissions || mapMissions.length,
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
    mapMissions,
  };
}
