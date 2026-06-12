import {
  CAIDEN_SCENARIO_ICON_ALT,
  CAIDEN_SCENARIO_ICON_SRC,
} from '../../data/caiden/sharedAssets';
import { MIRANDA_AVATAR_ALT, MIRANDA_AVATAR_SRC } from '../../data/miranda/sharedAssets';
import { CHARLIE_AVATAR_SRC } from '../../data/charlie/sharedAssets';
import { DR_VICTORIA_GUIDE_SRC, UNCLE_T_GUIDE_SRC } from '../../data/adult/sharedAssets';
import { getCharacter } from '../characters/characterRegistry';
import type { CharacterScenarioImageFit } from './CharacterScenarioImage';

export type GameScenarioImage = {
  src: string;
  alt: string;
  objectFit: CharacterScenarioImageFit;
};

export type GameScenarioFlags = {
  useCaidenHeader?: boolean;
  useMirandaHeader?: boolean;
  useCharlieHeader?: boolean;
  useUncleTHeader?: boolean;
  useVictoriaHeader?: boolean;
  useB4Header?: boolean;
};

type ResolveGameScenarioImageInput = GameScenarioFlags & {
  imageSrc?: string;
};

function withCustomSrc(
  image: GameScenarioImage,
  imageSrc?: string,
): GameScenarioImage {
  if (!imageSrc) return image;
  return { ...image, src: imageSrc };
}

export function resolveGameScenarioImage(
  input: ResolveGameScenarioImageInput,
): GameScenarioImage | null {
  const { imageSrc } = input;

  if (input.useCaidenHeader) {
    return withCustomSrc(
      {
        src: CAIDEN_SCENARIO_ICON_SRC,
        alt: CAIDEN_SCENARIO_ICON_ALT,
        objectFit: 'contain',
      },
      imageSrc,
    );
  }

  if (input.useMirandaHeader) {
    const miranda = getCharacter('miranda');
    return withCustomSrc(
      {
        src: miranda?.avatarSrc ?? MIRANDA_AVATAR_SRC,
        alt: MIRANDA_AVATAR_ALT,
        objectFit: 'contain',
      },
      imageSrc,
    );
  }

  if (input.useCharlieHeader) {
    return withCustomSrc(
      {
        src: CHARLIE_AVATAR_SRC,
        alt: 'Charlie Perk character gameplay icon',
        objectFit: 'contain',
      },
      imageSrc,
    );
  }

  if (input.useUncleTHeader) {
    return withCustomSrc(
      {
        src: UNCLE_T_GUIDE_SRC,
        alt: 'Uncle T',
        objectFit: 'contain',
      },
      imageSrc,
    );
  }

  if (input.useVictoriaHeader) {
    return withCustomSrc(
      {
        src: DR_VICTORIA_GUIDE_SRC,
        alt: 'Dr. Victoria',
        objectFit: 'contain',
      },
      imageSrc,
    );
  }

  if (input.useB4Header) {
    const b4 = getCharacter('b4');
    return withCustomSrc(
      {
        src: b4?.avatarSrc ?? '/images/characters/b-4_photo_icon_game.webp',
        alt: 'B-4 gameplay icon',
        objectFit: 'contain',
      },
      imageSrc,
    );
  }

  return null;
}
