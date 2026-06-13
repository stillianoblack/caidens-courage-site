import type { CharacterProfileId } from '../data/characterProfiles';
import type { CharacterProgressSummary } from './characterProgressService';

export type CharacterRewardProgress = {
  missionsRemainingText: string;
  unlockLabel: string;
  isComplete: boolean;
};

const CHARACTER_UNLOCK_LABELS: Record<CharacterProfileId, string> = {
  caiden: 'Caiden Focus Flame avatar',
  miranda: 'Miranda detective badge',
  b4: 'B-4 blue skin',
  charlie: 'Charlie nature sticker pack',
  zeke: 'Zeke team captain sticker',
  'dr-victoria': 'Dr. Victoria guide portrait',
  'uncle-t': 'Uncle T courage badge',
};

export function buildCharacterRewardProgress(
  characterId: CharacterProfileId,
  progress: CharacterProgressSummary | null,
): CharacterRewardProgress {
  const unlockLabel = CHARACTER_UNLOCK_LABELS[characterId];

  if (!progress || progress.totalCount === 0) {
    return {
      missionsRemainingText: 'Complete missions to earn rewards',
      unlockLabel,
      isComplete: false,
    };
  }

  if (progress.completedCount >= progress.totalCount) {
    return {
      missionsRemainingText: 'All missions complete!',
      unlockLabel,
      isComplete: true,
    };
  }

  const remaining = progress.totalCount - progress.completedCount;
  return {
    missionsRemainingText:
      remaining === 1 ? 'Complete 1 more mission' : `Complete ${remaining} more missions`,
    unlockLabel,
    isComplete: false,
  };
}
