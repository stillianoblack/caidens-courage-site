import { ZEKE_HUB_PATH } from './sharedAssets';
import type { MissionBoardItem } from '../../types/missionBoard';
import type { ZekeGradeBand } from '../../types/zekeAdaptiveQuest';
import { getZekeDashboardDescription } from './zekeAdaptiveBuilder';
import { ZEKE_ADAPTIVE_MISSION_FILES } from './zekeAdaptiveMissions';

const DESKTOP_POSITIONS: MissionBoardItem['desktopPosition'][] = [
  'grid-r1c1',
  'grid-r1c2',
  'grid-r1c3',
  'grid-r2c1',
  'grid-r2c2',
  'grid-r2c3',
  'grid-r2c1',
  'grid-r2c2',
];

export function buildZekeMissionBoardItems(gradeBand: ZekeGradeBand = '2-3'): MissionBoardItem[] {
  return ZEKE_ADAPTIVE_MISSION_FILES.map((mission) => ({
    id: mission.id,
    fileNumber: mission.missionNumber,
    title: mission.subtitle,
    subtitle: mission.title,
    description: getZekeDashboardDescription(mission, gradeBand),
    route: `${ZEKE_HUB_PATH}/${mission.id}`,
    iconType: 'focus-flame',
    artworkType: 'focus-quest' as const,
    folderLabel: 'Focus Quest' as const,
    status: 'available' as const,
    desktopPosition: DESKTOP_POSITIONS[mission.missionNumber - 1] ?? 'grid-r2c3',
    mobileOrder: mission.missionNumber,
    skills: mission.skillFocus,
  }));
}

export const ZEKE_MISSION_RANK = {
  rankTitle: 'Team Starter',
  statusLine: '8 Team Quests Available',
};

export const ZEKE_MISSION_BOARD_ITEMS: MissionBoardItem[] = buildZekeMissionBoardItems('2-3');
