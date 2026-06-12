import { KIDS_PORTAL_PATH } from '../../config/courageRoutes';
import type {
  MissionArtworkType,
  MissionBoardItem,
  MissionDesktopPosition,
  MissionFolderLabel,
} from '../../types/missionBoard';
import type { MirandaGradeBand } from '../../types/mirandaAdaptiveQuest';
import { MIRANDA_MISSIONS, resolveMirandaMissionDescription } from './index';

const DESKTOP_POSITIONS: Record<number, MissionDesktopPosition> = {
  1: 'row1-left',
  2: 'row1-right',
  3: 'row2-center',
  4: 'row3-left',
  5: 'row3-right',
  6: 'row3-right',
};

const ARTWORK_TYPES: Record<number, MissionArtworkType> = {
  1: 'case-file',
  2: 'case-file',
  3: 'grammar-board',
  4: 'missing-letters',
  5: 'context-notebook',
  6: 'trail-notebook',
};

const FOLDER_LABELS: Record<number, MissionFolderLabel> = {
  1: 'CASE FILE',
  2: 'CASE FILE',
  3: 'CLUE FILE',
  4: 'LETTER FILE',
  5: 'NOTEBOOK FILE',
  6: 'TRAIL FILE',
};

const ICON_TYPES: Record<number, string> = {
  1: 'student-flame',
  2: 'student-flame',
  3: 'clue-board',
  4: 'abc-letters',
  5: 'context-notebook',
  6: 'trail-footprints',
};

function resolveMissionStatus(missionId: string, fileNumber: number): MissionBoardItem['status'] {
  if (fileNumber <= 3) {
    return fileNumber === 1 ? 'active' : 'available';
  }
  return 'locked';
}

export function buildMirandaMissionBoardItems(
  gradeBand: MirandaGradeBand = '2-3',
): MissionBoardItem[] {
  return MIRANDA_MISSIONS.map((mission) => ({
    id: mission.id,
    fileNumber: mission.fileNumber,
    title: mission.subtitle,
    subtitle: mission.title,
    description: resolveMirandaMissionDescription(mission.id, gradeBand),
    route: `${KIDS_PORTAL_PATH}/miranda/${mission.id}`,
    iconType: ICON_TYPES[mission.fileNumber] ?? 'student-flame',
    artworkType: ARTWORK_TYPES[mission.fileNumber] ?? 'case-file',
    folderLabel: FOLDER_LABELS[mission.fileNumber] ?? 'CASE FILE',
    status: resolveMissionStatus(mission.id, mission.fileNumber),
    desktopPosition: DESKTOP_POSITIONS[mission.fileNumber] ?? 'row1-left',
    mobileOrder: mission.fileNumber,
    skills: mission.skillTags ?? ['Reading'],
  }));
}

/** Default board — use buildMirandaMissionBoardItems(gradeBand) for adaptive descriptions */
export const MIRANDA_MISSION_BOARD_ITEMS: MissionBoardItem[] = buildMirandaMissionBoardItems('2-3');

export const MIRANDA_DETECTIVE_RANK = {
  rankTitle: 'Junior Detective',
  statusLine: 'Start with The Missing Schedule',
};
