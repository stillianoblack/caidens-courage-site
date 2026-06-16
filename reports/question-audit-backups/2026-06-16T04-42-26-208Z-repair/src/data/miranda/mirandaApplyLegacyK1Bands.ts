import { MIRANDA_ADAPTIVE_QUEST_REGISTRY } from './mirandaAdaptiveBuilder';
import { MIRANDA_K1_GRADE_BANDS } from './mirandaLegacyK1Bands';

/** Merge preserved K-1 legacy content into adaptive mystery files without overwriting other bands. */
export function applyMirandaLegacyK1Bands(): void {
  for (const [fileId, k1Content] of Object.entries(MIRANDA_K1_GRADE_BANDS)) {
    const file = MIRANDA_ADAPTIVE_QUEST_REGISTRY[fileId];
    if (!file) continue;
    if (!file.gradeContent['K-1']) {
      file.gradeContent['K-1'] = k1Content;
    }
  }
}
