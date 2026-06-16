import { CAIDEN_QUEST_HUB_PATH } from '../../config/courageRoutes';
import type { MissionBoardItem } from '../../types/missionBoard';
import type { CaidenGradeBand } from '../../types/caidenAdaptiveQuest';
import { CAIDEN_QUESTS, resolveCaidenQuestDescription } from './index';

const DESKTOP_POSITIONS: MissionBoardItem['desktopPosition'][] = [
  'grid-r1c1',
  'grid-r1c2',
  'grid-r1c3',
  'grid-r2c1',
  'grid-r2c2',
  'grid-r2c3',
  'grid-r2c1',
  'grid-r2c2',
  'grid-r2c3',
];

export function buildCaidenQuestBoardItems(
  gradeBand: CaidenGradeBand = '2-3',
): MissionBoardItem[] {
  return CAIDEN_QUESTS.map((quest) => ({
    id: quest.id,
    fileNumber: quest.questNumber,
    title: quest.subtitle,
    subtitle: quest.title,
    description: resolveCaidenQuestDescription(quest.id, gradeBand),
    route: `${CAIDEN_QUEST_HUB_PATH}/${quest.id}`,
    iconType: 'focus-flame',
    artworkType: 'focus-quest',
    folderLabel: 'Focus Quest',
    status: 'available' as const,
    desktopPosition: DESKTOP_POSITIONS[quest.questNumber - 1] ?? 'grid-r2c3',
    mobileOrder: quest.questNumber,
    skills: quest.skills,
  }));
}

/** Default board — use buildCaidenQuestBoardItems(gradeBand) for adaptive descriptions */
export const CAIDEN_QUEST_BOARD_ITEMS: MissionBoardItem[] = buildCaidenQuestBoardItems('2-3');

export const CAIDEN_QUEST_RANK = {
  rankTitle: 'Focus Starter',
  statusLine: '9 Focus Quests Available',
};
