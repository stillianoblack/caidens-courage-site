import type { FlameDefinition } from './types';
import { B4_PROCESSED_ASSET_KEYS } from './assetKeys';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const LEVEL_NAME = 'Level 1: Spark Run';
export const LEVEL_OBJECTIVE = 'Collect 25 Spark Flames';
export const LEVEL_SPARK_GOAL = 25;
export const LEVEL_MAX_SECONDS = 120;
export const STARTING_HEARTS = 3;
export const PLAYER_X = 245;
export const COMBO_WINDOW_MS = 1500;

export const FLAME_DEFINITIONS: FlameDefinition[] = [
  {
    id: 'spark',
    label: 'Spark Flame',
    texture: B4_PROCESSED_ASSET_KEYS.sparkFlame,
    score: 10,
    rarity: 'common',
    glowColor: 0xffd767,
    particleColor: 0xfff3a1,
    spawnWeight: 54,
  },
  {
    id: 'anchor',
    label: 'Anchor Flame',
    texture: B4_PROCESSED_ASSET_KEYS.anchorFlame,
    score: 20,
    rarity: 'medium',
    glowColor: 0x5be7ff,
    particleColor: 0xbff8ff,
    spawnWeight: 27,
  },
  {
    id: 'ember',
    label: 'Ember Flame',
    texture: B4_PROCESSED_ASSET_KEYS.emberFlame,
    score: 35,
    rarity: 'rare',
    glowColor: 0xff5f35,
    particleColor: 0xffc0a8,
    spawnWeight: 14,
  },
];

export const scoreToStars = (score: number, completed: boolean): number => {
  if (completed && score >= 1200) return 5;
  if (completed && score >= 900) return 4;
  if (completed && score >= 600) return 3;
  if (completed) return 2;
  if (score >= 300) return 1;
  return 1;
};
