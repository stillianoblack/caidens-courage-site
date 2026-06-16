import { CAIDEN_QUEST_HUB_PATH } from '../../config/courageRoutes';
import { CAIDEN_QUESTS } from './index';

export const CAIDEN_RETURN_HUB_LABEL = '← Return to Focus Quest Map';

export function getCaidenNextQuest(currentId: string): { path: string; label: string } | null {
  const index = CAIDEN_QUESTS.findIndex((q) => q.id === currentId);
  const next = index >= 0 ? CAIDEN_QUESTS[index + 1] : undefined;
  if (!next) return null;
  return {
    path: `${CAIDEN_QUEST_HUB_PATH}/${next.id}`,
    label: 'Next Quest →',
  };
}
