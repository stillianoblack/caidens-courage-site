import type { CharacterProfileId } from '../data/characterProfiles';
import type { CharacterProgressSummary } from './characterProgressService';

export type CharacterUnlockMore = {
  title: string;
  description: string;
  progressLabel: string;
  icon: 'coin' | 'badge' | 'gift' | 'sticker';
  isUnlocked: boolean;
};

type UnlockConfig = {
  description: string;
  icon: CharacterUnlockMore['icon'];
  missionTarget?: number;
  coinTarget?: number;
  checkInTarget?: number;
};

const UNLOCK_CONFIG: Record<CharacterProfileId, UnlockConfig> = {
  b4: {
    description:
      'Earn 50 Focus Coins or complete 5 B-4 check-ins to unlock a new B-4 avatar.',
    icon: 'gift',
    coinTarget: 50,
    checkInTarget: 5,
  },
  caiden: {
    description: 'Complete 3 Caiden missions to unlock a Focus Flame sticker.',
    icon: 'sticker',
    missionTarget: 3,
  },
  miranda: {
    description: 'Complete 3 mystery missions to unlock a detective badge.',
    icon: 'badge',
    missionTarget: 3,
  },
  zeke: {
    description: 'Complete 3 teamwork missions to unlock a bridge builder sticker.',
    icon: 'sticker',
    missionTarget: 3,
  },
  charlie: {
    description: 'Complete 3 discovery missions to unlock a nature explorer sticker.',
    icon: 'sticker',
    missionTarget: 3,
  },
  'dr-victoria': {
    description: 'Complete 3 guide missions to unlock a family learning badge.',
    icon: 'badge',
    missionTarget: 3,
  },
  'uncle-t': {
    description: 'Complete 3 coaching missions to unlock a courage coach badge.',
    icon: 'badge',
    missionTarget: 3,
  },
};

export function buildCharacterUnlockMore(
  characterId: CharacterProfileId,
  progress: CharacterProgressSummary | null,
  totalCoins: number,
): CharacterUnlockMore {
  const config = UNLOCK_CONFIG[characterId];
  const completed = progress?.completedCount ?? 0;

  if (config.missionTarget) {
    const target = config.missionTarget;
    const isUnlocked = completed >= target;
    return {
      title: 'Unlock More',
      description: config.description,
      progressLabel: isUnlocked ? 'Unlocked!' : `${Math.min(completed, target)} / ${target} missions`,
      icon: config.icon,
      isUnlocked,
    };
  }

  const coinTarget = config.coinTarget ?? 50;
  const checkInTarget = config.checkInTarget ?? 5;
  const coinsMet = totalCoins >= coinTarget;
  const checkInsMet = completed >= checkInTarget;
  const isUnlocked = coinsMet || checkInsMet;

  return {
    title: 'Unlock More',
    description: config.description,
    progressLabel: isUnlocked
      ? 'Unlocked!'
      : `${Math.min(completed, checkInTarget)} / ${checkInTarget} check-ins`,
    icon: config.icon,
    isUnlocked,
  };
}
