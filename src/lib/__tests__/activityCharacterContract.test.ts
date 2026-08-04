import {
  APPROVED_ACTIVITY_CHARACTER_ORDER,
  resolveActivityCharacter,
} from '../activityCharacterContract';

describe('canonical activity character contract', () => {
  test('Month 2 Explore resolves the approved five distinct mission characters', () => {
    const resolved = APPROVED_ACTIVITY_CHARACTER_ORDER.map((_, activityIndex) =>
      resolveActivityCharacter({ activityIndex }),
    );
    expect(resolved.map((item) => item.characterId)).toEqual([
      'caiden', 'miranda', 'b4', 'charlie', 'zeke',
    ]);
    expect(new Set(resolved.map((item) => item.characterAsset)).size).toBe(5);
  });

  test('uses explicit activity, game, then mission identity before the safe fallback', () => {
    expect(resolveActivityCharacter({ activityCharacterId: 'zeke', gameCharacterId: 'caiden' }).source).toBe('activity');
    expect(resolveActivityCharacter({ gameCharacterId: 'miranda', missionCharacterId: 'caiden' }).characterId).toBe('miranda');
    expect(resolveActivityCharacter({ missionCharacterId: 'charlie' }).characterId).toBe('charlie');
    expect(resolveActivityCharacter({ activityIndex: 99 })).toMatchObject({ characterId: 'b4', source: 'generic_b4' });
  });
});
