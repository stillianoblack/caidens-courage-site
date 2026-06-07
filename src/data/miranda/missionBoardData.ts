import { KIDS_PORTAL_PATH } from '../../config/courageRoutes';
import type {
  MissionArtworkType,
  MissionBoardItem,
  MissionDesktopPosition,
  MissionFolderLabel,
} from '../../types/missionBoard';
import { MIRANDA_MISSIONS } from './index';

const DESKTOP_POSITIONS: Record<number, MissionDesktopPosition> = {
  1: 'row1-left',
  2: 'row1-right',
  3: 'row2-center',
  4: 'row3-left',
  5: 'row3-right',
};

const ARTWORK_TYPES: Record<number, MissionArtworkType> = {
  1: 'case-file',
  2: 'grammar-board',
  3: 'missing-letters',
  4: 'context-notebook',
  5: 'trail-notebook',
};

const FOLDER_LABELS: Record<number, MissionFolderLabel> = {
  1: 'CASE FILE',
  2: 'CLUE FILE',
  3: 'LETTER FILE',
  4: 'NOTEBOOK FILE',
  5: 'TRAIL FILE',
};

const ICON_TYPES: Record<number, string> = {
  1: 'student-flame',
  2: 'clue-board',
  3: 'abc-letters',
  4: 'context-notebook',
  5: 'trail-footprints',
};

const SKILLS: Record<number, string[]> = {
  1: ['Reading', 'Observation', 'Sequencing'],
  2: ['Grammar', 'Observation', 'Deduction'],
  3: ['Spelling', 'Word Building'],
  4: ['Vocabulary', 'Context Clues'],
  5: ['Comprehension', 'Inference', 'Critical Thinking'],
};

export const MIRANDA_MISSION_BOARD_ITEMS: MissionBoardItem[] = MIRANDA_MISSIONS.map((mission) => ({
  id: mission.id,
  fileNumber: mission.fileNumber,
  title: mission.subtitle,
  subtitle: mission.title,
  description: mission.description,
  route: `${KIDS_PORTAL_PATH}/miranda/${mission.id}`,
  iconType: ICON_TYPES[mission.fileNumber],
  artworkType: ARTWORK_TYPES[mission.fileNumber],
  folderLabel: FOLDER_LABELS[mission.fileNumber],
  status: mission.fileNumber === 1 ? 'active' : 'locked',
  desktopPosition: DESKTOP_POSITIONS[mission.fileNumber] ?? 'row1-left',
  mobileOrder: mission.fileNumber,
  skills: SKILLS[mission.fileNumber],
}));

export const MIRANDA_DETECTIVE_RANK = {
  rankTitle: 'Junior Detective',
  statusLine: 'Start with File #1',
};
