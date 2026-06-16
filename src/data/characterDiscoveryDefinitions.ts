import type { CharacterThemeId } from '../design-system/kids-adventure/characterThemes';
import { CHARACTER_HOTSPOT_IMAGES } from '../design-system/kids-adventure/characterThemes';

export type CharacterDiscoveryDefinition = {
  id: string;
  characterId: CharacterThemeId;
  name: string;
  characterLabel: string;
  discoveryTypeLabel: string;
  description: string;
  baseMissionId: string;
  imageSrc: string;
};

export const CHARACTER_DISCOVERY_DEFINITIONS: CharacterDiscoveryDefinition[] = [
  {
    id: 'caiden-courage-clue',
    characterId: 'caiden',
    name: 'Caiden Courage Clue',
    characterLabel: 'Caiden',
    discoveryTypeLabel: 'Courage Clue',
    description: 'A brave hint from Caiden about facing the dark.',
    baseMissionId: 'caiden-courage-in-the-dark',
    imageSrc: CHARACTER_HOTSPOT_IMAGES.caiden,
  },
  {
    id: 'miranda-voice-note',
    characterId: 'miranda',
    name: 'Miranda Voice Note',
    characterLabel: 'Miranda',
    discoveryTypeLabel: 'Voice Note',
    description: 'Miranda shares a detective tip for finding clues.',
    baseMissionId: 'miranda-mystery',
    imageSrc: CHARACTER_HOTSPOT_IMAGES.miranda,
  },
  {
    id: 'zeke-teamwork-spark',
    characterId: 'zeke',
    name: 'Zeke Teamwork Spark',
    characterLabel: 'Zeke',
    discoveryTypeLabel: 'Teamwork Spark',
    description: 'Zeke cheers you on to build bridges with friends.',
    baseMissionId: 'zeke-bridge-challenge',
    imageSrc: CHARACTER_HOTSPOT_IMAGES.zeke,
  },
  {
    id: 'charlie-nature-discovery',
    characterId: 'charlie',
    name: 'Charlie Nature Discovery',
    characterLabel: 'Charlie',
    discoveryTypeLabel: 'Nature Discovery',
    description: 'Charlie reveals a rainforest secret from the cave.',
    baseMissionId: 'charlie-discovery-zone',
    imageSrc: CHARACTER_HOTSPOT_IMAGES.charlie,
  },
  {
    id: 'b4-focus-tip',
    characterId: 'b4',
    name: 'B-4 Focus Tip',
    characterLabel: 'B-4',
    discoveryTypeLabel: 'Focus Tip',
    description: 'B-4 shares a quick focus reset for your next mission.',
    baseMissionId: 'b4-self-check-in',
    imageSrc: CHARACTER_HOTSPOT_IMAGES.b4,
  },
];

const BASE_MISSION_TO_CHARACTER: Record<string, CharacterThemeId> = {
  caiden: 'caiden',
  miranda: 'miranda',
  zeke: 'zeke',
  charlie: 'charlie',
  b4: 'b4',
};

const DISCOVERY_BY_ID = new Map(CHARACTER_DISCOVERY_DEFINITIONS.map((entry) => [entry.id, entry]));
const DISCOVERY_BY_MISSION = new Map(
  CHARACTER_DISCOVERY_DEFINITIONS.map((entry) => [entry.baseMissionId, entry]),
);

export const DISCOVERY_REWARD_KEY_PREFIX = 'discovery:';

export function discoveryRewardKey(discoveryId: string): string {
  return `${DISCOVERY_REWARD_KEY_PREFIX}${discoveryId.trim()}`;
}

export function parseDiscoveryIdFromRewardKey(rewardKey: string): string | null {
  const trimmed = rewardKey.trim();
  if (!trimmed.startsWith(DISCOVERY_REWARD_KEY_PREFIX)) return null;
  const id = trimmed.slice(DISCOVERY_REWARD_KEY_PREFIX.length).trim();
  return id || null;
}

export function resolveBaseMissionId(missionId: string): string {
  const trimmed = missionId.trim();
  const weekScoped = /^(\w+)-week-(\d+)$/.exec(trimmed);
  if (weekScoped) {
    const character = weekScoped[1];
    if (DISCOVERY_BY_MISSION.has(trimmed)) return trimmed;
    const characterBase: Record<string, string> = {
      caiden: 'caiden-courage-in-the-dark',
      miranda: 'miranda-mystery',
      zeke: 'zeke-bridge-challenge',
      charlie: 'charlie-discovery-zone',
      b4: 'b4-self-check-in',
    };
    return characterBase[character] ?? trimmed;
  }
  return trimmed;
}

export function resolveCharacterDiscoveryForMission(
  missionId: string,
): CharacterDiscoveryDefinition | null {
  const baseMissionId = resolveBaseMissionId(missionId);
  return DISCOVERY_BY_MISSION.get(baseMissionId) ?? null;
}

export function resolveCharacterDiscoveryById(
  discoveryId: string,
): CharacterDiscoveryDefinition | null {
  return DISCOVERY_BY_ID.get(discoveryId.trim()) ?? null;
}

export function resolveCharacterIdFromMission(missionId: string): CharacterThemeId | null {
  const base = resolveBaseMissionId(missionId);
  const prefix = base.split('-')[0];
  return BASE_MISSION_TO_CHARACTER[prefix] ?? null;
}

export function allCharacterDiscoveryDefinitions(): CharacterDiscoveryDefinition[] {
  return CHARACTER_DISCOVERY_DEFINITIONS;
}
