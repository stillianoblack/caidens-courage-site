import { CAIDEN_ADAPTIVE_QUEST_REGISTRY } from './caidenAdaptiveBuilder';
import { CAIDEN_K1_GRADE_BANDS } from './caidenLegacyK1Bands';

/** Merge preserved K-1 legacy content into adaptive quests without overwriting other bands. */
export function applyCaidenLegacyK1Bands(): void {
  for (const [questId, k1Content] of Object.entries(CAIDEN_K1_GRADE_BANDS)) {
    const quest = CAIDEN_ADAPTIVE_QUEST_REGISTRY[questId];
    if (!quest) continue;
    if (!quest.gradeContent['K-1']) {
      quest.gradeContent['K-1'] = k1Content;
    }
  }
}
