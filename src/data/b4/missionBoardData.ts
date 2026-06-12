import { B4_HUB_PATH } from './sharedAssets';
import type { MissionBoardItem } from '../../types/missionBoard';
import type { B4GradeBand } from '../../types/b4AdaptiveQuest';
import { getB4DashboardDescription } from './b4AdaptiveBuilder';
import { B4_ADAPTIVE_MISSION_FILES } from './b4AdaptiveMissions';

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

export function buildB4MissionBoardItems(gradeBand: B4GradeBand = '2-3'): MissionBoardItem[] {
  return B4_ADAPTIVE_MISSION_FILES.map((mission) => ({
    id: mission.id,
    fileNumber: mission.missionNumber,
    title: mission.subtitle,
    subtitle: mission.title,
    description: getB4DashboardDescription(mission, gradeBand),
    route: `${B4_HUB_PATH}/${mission.id}`,
    iconType: 'focus-flame',
    artworkType: 'focus-quest' as const,
    folderLabel: 'Focus Quest' as const,
    status: 'available' as const,
    desktopPosition: DESKTOP_POSITIONS[mission.missionNumber - 1] ?? 'grid-r2c3',
    mobileOrder: mission.missionNumber,
    skills: mission.skillFocus,
  }));
}

export const B4_MISSION_RANK = {
  rankTitle: 'Focus Starter',
  statusLine: '8 SEL Missions Available',
};

export const B4_MISSION_BOARD_ITEMS: MissionBoardItem[] = buildB4MissionBoardItems('2-3');
