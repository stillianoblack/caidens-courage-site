export type MissionBoardStatus = 'available' | 'completed' | 'active' | 'locked';

export type MissionDesktopPosition =
  | 'row1-left'
  | 'row1-right'
  | 'row2-center'
  | 'row3-left'
  | 'row3-right'
  | 'grid-r1c1'
  | 'grid-r1c2'
  | 'grid-r1c3'
  | 'grid-r2c1'
  | 'grid-r2c2'
  | 'grid-r2c3';

export type MissionFolderLabel =
  | 'CASE FILE'
  | 'CLUE FILE'
  | 'LETTER FILE'
  | 'NOTEBOOK FILE'
  | 'TRAIL FILE'
  | 'Focus Quest';

export type MissionArtworkType =
  | 'case-file'
  | 'grammar-board'
  | 'missing-letters'
  | 'context-notebook'
  | 'trail-notebook'
  | 'focus-quest'
  | 'focus-locked';

export type MissionBoardItem = {
  id: string;
  fileNumber: number;
  title: string;
  subtitle?: string;
  description: string;
  route: string;
  iconType?: string;
  artworkType: MissionArtworkType;
  folderLabel: MissionFolderLabel;
  status: MissionBoardStatus;
  desktopPosition: MissionDesktopPosition;
  mobileOrder: number;
  skills?: string[];
};

export type MissionDashboardHeaderConfig = {
  eyebrow: string;
  title: string;
  subtitle: string;
  intro: string;
};

export type DetectiveRankConfig = {
  rankTitle: string;
  statusLine: string;
};

export type QuestRankConfig = DetectiveRankConfig;
