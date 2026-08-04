import {
  CHARACTER_COMIC_ICONS,
  CHARACTER_HOTSPOT_IMAGES,
} from '../../design-system/kids-adventure/characterThemes';
import { courageInTheDarkMissions } from '../../data/courageInTheDarkMap';
import { resolveActivityCharacter } from '../activityCharacterContract';

describe('student-world transparent character assets', () => {
  test('world, mission cards, and Explore use the approved transparent hotspot exports', () => {
    expect(CHARACTER_COMIC_ICONS).toEqual(CHARACTER_HOTSPOT_IMAGES);

    courageInTheDarkMissions.forEach((mission) => {
      expect(mission.token).toBe(CHARACTER_HOTSPOT_IMAGES[mission.id]);
      expect(mission.thumbnail).toBe(CHARACTER_HOTSPOT_IMAGES[mission.id]);
    });

    ['caiden', 'miranda', 'b4', 'charlie', 'zeke'].forEach((characterId, activityIndex) => {
      expect(resolveActivityCharacter({ activityIndex }).characterAsset).toBe(
        CHARACTER_HOTSPOT_IMAGES[characterId as keyof typeof CHARACTER_HOTSPOT_IMAGES],
      );
    });
  });

  test('does not reference the opaque photo-icon exports', () => {
    Object.values(CHARACTER_COMIC_ICONS).forEach((asset) => {
      expect(asset).toMatch(/\/Game-Hub\/characters\/.+-hotspot\.webp$/);
      expect(asset).not.toContain('photo_icon_game');
    });
  });
});
