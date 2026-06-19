import { FAMILY_HUB_PATH } from '../config/courageRoutes';
import type { AdventureModuleRecord } from '../types/adventureModule';
import { FAMILY_WEEKLY_ADVENTURE_WEEKS, buildWeeklyTrailNodes } from '../data/familyWeeklyAdventures';
import { resolveFullyCompletedWeekNumbers } from './adventureWeekCompletion';
import { fetchCompletedMissionIdsByWeek } from './adventureWeekProgress';
import { checkBaselineCompletion } from './baselineCompletion';
import { getEarnedCharacterDiscoveries, type EarnedCharacterDiscovery } from './characterDiscoveryService';
import {
  isMapWeekFullyComplete,
  resolveWeekMapMissions,
} from './adventureWeekCompletion';
import type { AdventureTrailWeekView } from '../types/adventureTrail';
import { isCheckInMissionId } from './cmsBadgeArtwork';
import type { WeeklyBadgeEarnedState } from './weeklyBadgeUnlock';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { isWeekFullyComplete } from './weekBadgeProgression';

export type WeekProgressPaths = {
  kidsBasePath: string;
  downloadsPath: string;
  certificatesPath: string;
};

export const DEFAULT_WEEK_PROGRESS_PATHS: WeekProgressPaths = {
  kidsBasePath: `${FAMILY_HUB_PATH}/kids`,
  downloadsPath: `${FAMILY_HUB_PATH}/downloads`,
  certificatesPath: `${FAMILY_HUB_PATH}/certificates`,
};

export type ChildProgressStatus = {
  completedByWeek: Record<number, readonly string[]>;
  completedWeekNumbers: number[];
  weeklyBadgeState: WeeklyBadgeEarnedState;
  baselineComplete: boolean;
  ownsCheckIn: boolean;
  earnedDiscoveries: EarnedCharacterDiscovery[];
};

export type WeekProgressOptions = {
  cmsModules?: readonly AdventureModuleRecord[];
  paths?: WeekProgressPaths;
};

function buildCharacterNodesForWeek(
  weekNumber: number,
  paths: WeekProgressPaths,
  weekTitle: string,
): AdventureTrailWeekView['nodes'] {
  return buildWeeklyTrailNodes(weekNumber, paths, weekTitle)
    .filter((node) => ['caiden', 'miranda', 'b4', 'charlie', 'zeke'].includes(node.kind))
    .map((node, index) => ({
      ...node,
      state: 'available' as const,
      stepNumber: index + 1,
      side: index % 2 === 0 ? ('left' as const) : ('right' as const),
    }));
}

export function resolveWeekMapMissionsForProgress(
  weekNumber: number,
  cmsModules: readonly AdventureModuleRecord[] = [],
  paths: WeekProgressPaths = DEFAULT_WEEK_PROGRESS_PATHS,
) {
  const weekMeta = FAMILY_WEEKLY_ADVENTURE_WEEKS.find((row) => row.week === weekNumber);
  const cmsModule = cmsModules.find((row) => row.week_number === weekNumber) ?? null;
  const weekTitle = cmsModule?.title?.trim() || weekMeta?.title || `Week ${weekNumber}`;
  const weekNodes = buildCharacterNodesForWeek(weekNumber, paths, weekTitle);
  const weekView: AdventureTrailWeekView = {
    week: weekNumber,
    title: weekTitle,
    selFocus: cmsModule?.subtitle || weekMeta?.selFocus || 'Focus & Courage',
    weekStatus: 'available',
    unlockStatus: '',
    previewActivities: cmsModule?.preview_activities ?? weekMeta?.previewActivities ?? [],
    nodes: weekNodes,
  };
  return resolveWeekMapMissions({
    week: weekView,
    cmsModule,
    weekNodes,
  });
}

function weekNumberFromWeekId(weekId: string): number | null {
  const match = /^week-(\d+)$/.exec(weekId.trim());
  if (!match) return null;
  const week = Number.parseInt(match[1], 10);
  return Number.isFinite(week) && week > 0 ? week : null;
}

export async function fetchClaimedWeeklyWeeksFromBadges(participantId: string): Promise<Set<number>> {
  const earned = new Set<number>();
  if (!isSupabaseConfigured() || !supabase) return earned;

  const { data, error } = await supabase
    .from('player_badges')
    .select('week_id')
    .eq('participant_id', participantId);

  if (error) {
    console.warn('[INVENTORY_BADGE_DEBUG] badge fetch failed', error);
    return earned;
  }

  for (const row of data ?? []) {
    const week = weekNumberFromWeekId(String(row.week_id ?? ''));
    if (week) earned.add(week);
  }

  return earned;
}

async function fetchEarnedWeeklyWeeksFromBadges(participantId: string): Promise<Set<number>> {
  return fetchClaimedWeeklyWeeksFromBadges(participantId);
}

export function logInventoryBadgeDebug(input: {
  childId: string;
  weekNumber: number;
  weeklyComplete: boolean;
  badgeUnlocked: boolean;
  sourceTable: string;
  sourceQuery: string;
  completedMissionIds?: readonly string[];
}): void {
  if (process.env.NODE_ENV !== 'development') return;
  console.info('[INVENTORY_BADGE_DEBUG]', {
    childId: input.childId,
    weekNumber: input.weekNumber,
    weeklyComplete: input.weeklyComplete,
    badgeUnlocked: input.badgeUnlocked,
    sourceTable: input.sourceTable,
    sourceQuery: input.sourceQuery,
    completedMissionIds: input.completedMissionIds ?? [],
  });
}

export async function getWeekCompletionStatus(
  childId: string,
  weekNumber: number,
  options: WeekProgressOptions = {},
): Promise<{ complete: boolean; completedMissionIds: readonly string[] }> {
  const participantId = childId.trim();
  const paths = options.paths ?? DEFAULT_WEEK_PROGRESS_PATHS;
  const cmsModules = options.cmsModules ?? [];

  if (!participantId) {
    return { complete: false, completedMissionIds: [] };
  }

  const completedByWeek = await fetchCompletedMissionIdsByWeek(participantId);
  const completedMissionIds = completedByWeek[weekNumber] ?? [];
  const mapMissions = resolveWeekMapMissionsForProgress(weekNumber, cmsModules, paths);
  const complete = isMapWeekFullyComplete(mapMissions, completedMissionIds);

  logInventoryBadgeDebug({
    childId: participantId,
    weekNumber,
    weeklyComplete: complete,
    badgeUnlocked: complete,
    sourceTable: 'player_progress',
    sourceQuery: 'fetchCompletedMissionIdsByWeek',
    completedMissionIds,
  });

  return { complete, completedMissionIds };
}

export async function getEarnedBadges(
  childId: string,
  options: WeekProgressOptions = {},
): Promise<{ weeklyWeeks: number[]; ownsCheckIn: boolean }> {
  const status = await loadChildProgressStatus(childId, options);
  return {
    weeklyWeeks: Array.from(status.weeklyBadgeState.earnedWeeklyWeeks).sort((a, b) => a - b),
    ownsCheckIn: status.ownsCheckIn,
  };
}

export async function getBaselineCompletionStatus(
  childId: string,
  programCode?: string,
): Promise<boolean> {
  return checkBaselineCompletion(programCode, childId);
}

export async function getCharacterDiscoveryStatus(
  childId: string,
): Promise<EarnedCharacterDiscovery[]> {
  return getEarnedCharacterDiscoveries(childId);
}

export async function loadChildProgressStatus(
  childId: string,
  options: WeekProgressOptions = {},
): Promise<ChildProgressStatus> {
  const participantId = childId.trim();
  const paths = options.paths ?? DEFAULT_WEEK_PROGRESS_PATHS;
  const cmsModules = options.cmsModules ?? [];

  if (!participantId) {
    return {
      completedByWeek: {},
      completedWeekNumbers: [],
      weeklyBadgeState: { completedMissionIds: [], earnedWeeklyWeeks: new Set() },
      baselineComplete: false,
      ownsCheckIn: false,
      earnedDiscoveries: [],
    };
  }

  const [completedByWeek, baselineComplete, earnedDiscoveries, claimedWeeklyWeeks] = await Promise.all([
    fetchCompletedMissionIdsByWeek(participantId),
    checkBaselineCompletion(undefined, participantId),
    getEarnedCharacterDiscoveries(participantId),
    fetchEarnedWeeklyWeeksFromBadges(participantId),
  ]);

  const completedWeekNumbers = resolveFullyCompletedWeekNumbers({
    completedByWeek,
    cmsModules: [...cmsModules],
    paths,
  });

  const completedMissionIds = Object.values(completedByWeek).flat();
  const progressOptions = { cmsModules, paths };
  const earnedWeeklyWeeks = new Set<number>();
  for (const weekNumber of completedWeekNumbers) {
    if (isWeekFullyComplete(weekNumber, completedMissionIds, progressOptions)) {
      earnedWeeklyWeeks.add(weekNumber);
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.info('[INVENTORY_SYNC_DEBUG]', {
      childId: participantId,
      completedWeekNumbers,
      earnedWeeklyWeeks: Array.from(earnedWeeklyWeeks),
      claimedWeeklyWeeks: Array.from(claimedWeeklyWeeks),
      completedMissionIds,
    });
  }

  for (const weekNumber of Array.from(claimedWeeklyWeeks)) {
    logInventoryBadgeDebug({
      childId: participantId,
      weekNumber,
      weeklyComplete: completedWeekNumbers.includes(weekNumber),
      badgeUnlocked: true,
      sourceTable: 'player_badges',
      sourceQuery: 'fetchEarnedWeeklyWeeksFromBadges',
      completedMissionIds: completedByWeek[weekNumber] ?? [],
    });
  }

  const ownsCheckIn =
    baselineComplete ||
    completedMissionIds.some((missionId) => isCheckInMissionId(missionId)) ||
    earnedDiscoveries.some((entry) => entry.definition.characterId === 'b4');

  return {
    completedByWeek,
    completedWeekNumbers,
    weeklyBadgeState: {
      completedMissionIds,
      earnedWeeklyWeeks,
      claimedWeeklyWeeks,
    },
    baselineComplete,
    ownsCheckIn,
    earnedDiscoveries,
  };
}

/** @deprecated Prefer resolveWeekMapMissionsForProgress — kept for import stability. */
export function resolveWeekCharacterMissionIds(weekNumber: number): string[] {
  return resolveWeekMapMissionsForProgress(weekNumber).map((mission) => mission.targetGameSlug);
}
