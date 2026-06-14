import type { CourageInTheDarkMission } from '../data/courageInTheDarkMap';
import { FAMILY_WEEKLY_ADVENTURE_WEEKS, buildWeeklyTrailNodes } from '../data/familyWeeklyAdventures';
import type { AdventureModuleRecord } from '../types/adventureModule';
import type { AdventureTrailWeekView } from '../types/adventureTrail';
import { resolveAdventureMapMissions } from './adventureMapMissions';
import { isMapMissionComplete } from './courageInTheDarkProgress';

export function isMapMissionCompleteForWeek(
  mission: CourageInTheDarkMission,
  completedMissionIds: readonly string[],
): boolean {
  return isMapMissionComplete(mission, completedMissionIds);
}

export function isMapWeekFullyComplete(
  mapMissions: CourageInTheDarkMission[],
  completedMissionIds: readonly string[],
): boolean {
  const characterMissions = mapMissions.filter((mission) =>
    ['caiden', 'miranda', 'zeke', 'charlie', 'b4'].includes(mission.id),
  );
  if (characterMissions.length === 0) return false;
  return characterMissions.every((mission) => isMapMissionComplete(mission, completedMissionIds));
}

export function countCompletedMapMissions(
  mapMissions: CourageInTheDarkMission[],
  completedMissionIds: readonly string[],
): number {
  return mapMissions.filter((mission) => isMapMissionComplete(mission, completedMissionIds)).length;
}

export function resolveWeekMapMissions(input: {
  week: AdventureTrailWeekView;
  cmsModule?: AdventureModuleRecord | null;
  weekNodes: AdventureTrailWeekView['nodes'];
}): CourageInTheDarkMission[] {
  return resolveAdventureMapMissions({
    week: input.week.week,
    weekTitle: input.week.title,
    cmsModule: input.cmsModule,
    weekNodes: input.weekNodes,
  });
}

type WeekProgressPaths = {
  kidsBasePath: string;
  downloadsPath: string;
  certificatesPath: string;
};

function resolveWeekCompletion(
  weekNumber: number,
  completedByWeek: Record<number, readonly string[]>,
  cmsModules: AdventureModuleRecord[],
  paths: WeekProgressPaths,
): boolean {
  const weekMeta =
    FAMILY_WEEKLY_ADVENTURE_WEEKS.find((row) => row.week === weekNumber) ??
    ({
      week: weekNumber,
      title: `Week ${weekNumber} Adventure`,
      selFocus: 'Focus & Courage',
      previewActivities: [],
    } as (typeof FAMILY_WEEKLY_ADVENTURE_WEEKS)[number]);
  const cmsModule = cmsModules.find((row) => row.week_number === weekNumber) ?? null;
  const weekTitle = cmsModule?.title || weekMeta.title;
  const characterNodes = buildCharacterNodesForWeek(weekNumber, paths, weekTitle);
  const weekView: AdventureTrailWeekView = {
    week: weekNumber,
    title: weekTitle,
    selFocus: cmsModule?.subtitle || weekMeta.selFocus,
    weekStatus: 'available',
    unlockStatus: '',
    previewActivities: cmsModule?.preview_activities ?? weekMeta.previewActivities,
    nodes: characterNodes,
  };
  const mapMissions = resolveWeekMapMissions({
    week: weekView,
    cmsModule,
    weekNodes: characterNodes,
  });
  const completedIds = completedByWeek[weekNumber] ?? [];
  return isMapWeekFullyComplete(mapMissions, completedIds);
}

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

/** All weeks fully complete for the active child (map missions scoped by week). */
export function resolveFullyCompletedWeekNumbers(input: {
  completedByWeek: Record<number, readonly string[]>;
  cmsModules: AdventureModuleRecord[];
  paths: WeekProgressPaths;
}): number[] {
  const weekNumbers = new Set<number>();
  FAMILY_WEEKLY_ADVENTURE_WEEKS.forEach((row) => weekNumbers.add(row.week));
  input.cmsModules.forEach((row) => weekNumbers.add(row.week_number));

  const completed: number[] = [];
  for (const weekNumber of Array.from(weekNumbers).sort((a, b) => a - b)) {
    if (resolveWeekCompletion(weekNumber, input.completedByWeek, input.cmsModules, input.paths)) {
      completed.push(weekNumber);
    }
  }
  return completed;
}

export function resolveCompletedWeekNumbers(input: {
  completedByWeek: Record<number, readonly string[]>;
  cmsModules: AdventureModuleRecord[];
  heroWeekNumber: number;
  paths: WeekProgressPaths;
}): number[] {
  return resolveFullyCompletedWeekNumbers({
    completedByWeek: input.completedByWeek,
    cmsModules: input.cmsModules,
    paths: input.paths,
  }).filter((week) => week !== input.heroWeekNumber);
}
