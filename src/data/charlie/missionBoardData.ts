import { CHARLIE_HUB_PATH } from './sharedAssets';
import type { MissionBoardItem } from '../../types/missionBoard';
import type { CharlieGradeBand } from '../../types/charlieAdaptiveQuest';
import { getCharlieDashboardDescription } from './charlieAdaptiveBuilder';
import { CHARLIE_ADAPTIVE_MISSION_FILES } from './charlieAdaptiveMissions';

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

export function buildCharlieMissionBoardItems(
  gradeBand: CharlieGradeBand = '2-3',
): MissionBoardItem[] {
  return CHARLIE_ADAPTIVE_MISSION_FILES.map((mission) => ({
    id: mission.id,
    fileNumber: mission.missionNumber,
    title: mission.subtitle,
    subtitle: mission.title,
    description: getCharlieDashboardDescription(mission, gradeBand),
    route: `${CHARLIE_HUB_PATH}/${mission.id}`,
    iconType: 'nature-nook',
    artworkType: 'trail-notebook' as const,
    folderLabel: 'TRAIL FILE' as const,
    status: 'available' as const,
    desktopPosition: DESKTOP_POSITIONS[mission.missionNumber - 1] ?? 'grid-r2c3',
    mobileOrder: mission.missionNumber,
    skills: mission.skillFocus,
  }));
}

export const CHARLIE_MISSION_RANK = {
  rankTitle: 'Junior Scientist',
  statusLine: '8 Science Missions Available',
};

export const CHARLIE_MISSION_BOARD_ITEMS: MissionBoardItem[] = buildCharlieMissionBoardItems('2-3');
