import type { GameplayTopBarFlameDisplay, GameplayTopBarVariant } from './GameplayTopBar';
import type { MissionGameTheme } from '../../components/mission-game/MissionSpeechRow';

type TopBarHeaderFlags = {
  useCaidenHeader?: boolean;
  useMirandaHeader?: boolean;
  useCharlieHeader?: boolean;
  useB4Header?: boolean;
  useZekeHeader?: boolean;
  useVictoriaHeader?: boolean;
  useUncleTHeader?: boolean;
};

export function resolveGameplayTopBarVariant(
  theme: MissionGameTheme,
  flags: TopBarHeaderFlags = {},
): GameplayTopBarVariant {
  if (flags.useCaidenHeader || theme === 'caiden') return 'caiden';
  if (flags.useMirandaHeader || theme === 'miranda') return 'miranda';
  if (flags.useCharlieHeader || theme === 'charlie') return 'charlie';
  if (flags.useB4Header || theme === 'b4') return 'b4';
  if (flags.useZekeHeader) return 'zeke';
  if (flags.useUncleTHeader || theme === 'uncle-t') return 'uncle-t';
  if (flags.useVictoriaHeader || theme === 'victoria') return 'victoria';
  return theme === 'default' ? 'default' : theme;
}

export function resolveGameplayTopBarFlames(
  variant: GameplayTopBarVariant,
  flags: TopBarHeaderFlags = {},
): { flameDisplay: GameplayTopBarFlameDisplay; flamesLit: number } {
  if (flags.useVictoriaHeader || flags.useUncleTHeader) {
    return { flameDisplay: 'none', flamesLit: 0 };
  }
  if (flags.useMirandaHeader || variant === 'miranda') {
    return { flameDisplay: 'multi', flamesLit: 5 };
  }
  if (flags.useCaidenHeader || flags.useCharlieHeader || variant === 'caiden' || variant === 'charlie') {
    return { flameDisplay: 'single', flamesLit: 1 };
  }
  if (flags.useB4Header || variant === 'b4') {
    return { flameDisplay: 'multi', flamesLit: 5 };
  }
  if (flags.useZekeHeader || variant === 'zeke') {
    return { flameDisplay: 'single', flamesLit: 1 };
  }
  return { flameDisplay: 'single', flamesLit: 1 };
}
