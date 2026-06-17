import type { CourageInTheDarkMission } from '../data/courageInTheDarkMap';
import { isMapMissionComplete } from './courageInTheDarkProgress';
import { resolveCourageMapTargetHref } from './courageInTheDarkRoutes';
import { assignPortalRoute } from './portalHardNavigation';
import { remapPortalKidsRoute } from './portalGamePaths';
import {
  CAMP_PILOT_UNLOCK_ALL,
  getWeek1MissionUnlockState,
} from './week1MissionUnlock';

export const BASELINE_GATE_MESSAGE =
  'Complete your B-4 Check-In first to unlock the rest of the adventure.';

export type WeeklyMissionLaunchSource =
  | 'hero-map'
  | 'week-card'
  | 'week-card-cta'
  | 'character-hotspot'
  | 'mission-list';

export type WeeklyMissionUnlockOptions = {
  week: number;
  baselineLocked: boolean;
  mapLocked?: boolean;
  completedMissionIds: readonly string[];
};

export function isWeeklyMissionLocked(
  mission: CourageInTheDarkMission,
  options: WeeklyMissionUnlockOptions,
): boolean {
  const { week, baselineLocked, mapLocked = false, completedMissionIds } = options;

  if (baselineLocked) {
    return mission.id !== 'b4';
  }

  if (week === 1) {
    if (!CAMP_PILOT_UNLOCK_ALL && mapLocked) {
      return true;
    }
    return !getWeek1MissionUnlockState(mission.targetGameSlug, completedMissionIds).unlocked;
  }

  if (mapLocked) {
    return true;
  }

  return Boolean(mission.locked);
}

export function resolveWeeklyMissionUnlockReason(
  mission: CourageInTheDarkMission,
  options: WeeklyMissionUnlockOptions,
): string {
  if (options.baselineLocked) {
    return mission.id === 'b4' ? 'Start here' : BASELINE_GATE_MESSAGE;
  }

  if (options.week === 1) {
    return getWeek1MissionUnlockState(mission.targetGameSlug, options.completedMissionIds).reason;
  }

  if (options.mapLocked) {
    return 'Complete check-in to begin';
  }

  return mission.locked ? 'Locked' : 'Available now';
}

export function resolveLaunchMissionForWeek(
  mapMissions: readonly CourageInTheDarkMission[],
  options: WeeklyMissionUnlockOptions,
): CourageInTheDarkMission | null {
  const characterMissions = mapMissions.filter((mission) =>
    ['caiden', 'miranda', 'b4', 'charlie', 'zeke'].includes(mission.id),
  );

  if (characterMissions.length === 0) return null;

  if (options.baselineLocked) {
    return characterMissions.find((mission) => mission.id === 'b4') ?? null;
  }

  const nextIncomplete = characterMissions.find(
    (mission) =>
      !isWeeklyMissionLocked(mission, options) &&
      !isMapMissionComplete(mission, options.completedMissionIds),
  );
  if (nextIncomplete) return nextIncomplete;

  return characterMissions.find((mission) => !isWeeklyMissionLocked(mission, options)) ?? null;
}

export type ResolveWeeklyMissionRouteInput = {
  mission: CourageInTheDarkMission;
  weekId: number;
  weekTitle: string;
  kidsBasePath: string;
  pathname: string;
};

export function resolveWeeklyMissionRoute(input: ResolveWeeklyMissionRouteInput): string | null {
  const base = input.kidsBasePath.replace(/\/+$/, '');
  const rawHref =
    input.mission.directHref ??
    resolveCourageMapTargetHref(
      input.mission.targetGameSlug,
      base,
      input.weekId,
      input.weekTitle,
    );

  if (!rawHref || rawHref === '#') return null;
  return remapPortalKidsRoute(rawHref, input.pathname);
}

export type LaunchWeeklyMissionInput = {
  mission: CourageInTheDarkMission;
  weekId: number;
  monthId?: number | null;
  weekTitle: string;
  kidsBasePath: string;
  pathname: string;
  characterId?: string;
  missionId?: string;
  selectedChildId?: string;
  source: WeeklyMissionLaunchSource;
  baselineLocked?: boolean;
  mapLocked?: boolean;
  completedMissionIds?: readonly string[];
  navigate: (to: string) => void;
};

export function launchWeeklyMission(input: LaunchWeeklyMissionInput): boolean {
  const unlockOptions: WeeklyMissionUnlockOptions = {
    week: input.weekId,
    baselineLocked: Boolean(input.baselineLocked),
    mapLocked: input.mapLocked,
    completedMissionIds: input.completedMissionIds ?? [],
  };

  if (isWeeklyMissionLocked(input.mission, unlockOptions)) {
    return false;
  }

  const route = resolveWeeklyMissionRoute({
    mission: input.mission,
    weekId: input.weekId,
    weekTitle: input.weekTitle,
    kidsBasePath: input.kidsBasePath,
    pathname: input.pathname,
  });

  const characterId = input.characterId ?? input.mission.id;
  const missionId = input.missionId ?? input.mission.targetGameSlug;

  if (!route) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WEEKLY_MISSION_LAUNCH] missing route', {
        weekId: input.weekId,
        characterId,
        missionId,
        source: input.source,
        targetGameSlug: input.mission.targetGameSlug,
        directHref: input.mission.directHref ?? null,
      });
    }
    return false;
  }

  if (process.env.NODE_ENV === 'development') {
    console.info('[WEEKLY_MISSION_LAUNCH]', {
      weekId: input.weekId,
      monthId: input.monthId ?? null,
      characterId,
      missionId,
      route,
      source: input.source,
      selectedChildId: input.selectedChildId ?? null,
    });
  }

  if (route.startsWith('/family-hub/kids/')) {
    assignPortalRoute(route);
  } else {
    input.navigate(route);
  }
  return true;
}
