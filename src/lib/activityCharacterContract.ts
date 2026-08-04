import {
  CHARACTER_COMIC_ICONS,
  type CharacterThemeId,
} from '../design-system/kids-adventure/characterThemes';
import type { AdventureModuleRecord, AdventureSpotCharacterKey } from '../types/adventureModule';

export type ActivityCharacter = {
  characterId: CharacterThemeId;
  characterName: string;
  characterAsset: string;
  source: 'activity' | 'game' | 'mission' | 'generic_b4';
};

const CHARACTER_NAMES: Record<CharacterThemeId, string> = {
  caiden: 'Caiden',
  miranda: 'Miranda',
  b4: 'B-4',
  charlie: 'Charlie Perk',
  zeke: 'Zeke',
};

/** Approved five-activity order shared by Explore and the adventure mission world. */
export const APPROVED_ACTIVITY_CHARACTER_ORDER: readonly CharacterThemeId[] = [
  'caiden',
  'miranda',
  'b4',
  'charlie',
  'zeke',
];

function resolved(characterId: CharacterThemeId, source: ActivityCharacter['source']): ActivityCharacter {
  return {
    characterId,
    characterName: CHARACTER_NAMES[characterId],
    characterAsset: CHARACTER_COMIC_ICONS[characterId],
    source,
  };
}

export function resolveActivityCharacter(input: {
  activityCharacterId?: AdventureSpotCharacterKey | null;
  gameCharacterId?: AdventureSpotCharacterKey | null;
  missionCharacterId?: AdventureSpotCharacterKey | null;
  activityIndex?: number;
  cmsModule?: AdventureModuleRecord | null;
}): ActivityCharacter {
  if (input.activityCharacterId) return resolved(input.activityCharacterId, 'activity');
  if (input.gameCharacterId) return resolved(input.gameCharacterId, 'game');
  if (input.missionCharacterId) return resolved(input.missionCharacterId, 'mission');

  const indexedMission = input.cmsModule?.hotspots?.[input.activityIndex ?? -1]?.character_key;
  if (indexedMission) return resolved(indexedMission, 'mission');

  const approved = APPROVED_ACTIVITY_CHARACTER_ORDER[input.activityIndex ?? -1];
  if (approved) return resolved(approved, 'mission');

  if (process.env.NODE_ENV === 'development') {
    console.warn('[ACTIVITY_CHARACTER_FALLBACK]', {
      reason: 'missing_explicit_activity_character',
      week: input.cmsModule?.week_number ?? null,
      activityIndex: input.activityIndex ?? null,
      fallback: 'b4',
    });
  }
  return resolved('b4', 'generic_b4');
}
