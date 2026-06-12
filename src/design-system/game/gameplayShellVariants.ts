import type { GameplayTopBarVariant } from './GameplayTopBar';
import type { GuideCharacter } from './getPreSubmitGuideMessage';

export type GameBackgroundDecorVariant =
  | 'default'
  | 'miranda'
  | 'caiden'
  | 'victoria'
  | 'victoria-focus-lab'
  | 'uncle-t'
  | 'charlie'
  | 'b4';

/** Standard gameplay shell variants — Miranda-style coaching shell is the reference. */
export type GameplayShellVariantId =
  | 'caiden'
  | 'miranda'
  | 'b4'
  | 'drVictoria'
  | 'uncleT'
  | 'charlie'
  | 'zeke'
  | 'adultAssessment';

export type GameplayShellVariantConfig = {
  id: GameplayShellVariantId;
  themeClass: string;
  topBarVariant: GameplayTopBarVariant;
  decorVariant: GameBackgroundDecorVariant;
  defaultGuideCharacter: GuideCharacter;
  scenarioLabel: string;
};

export const GAMEPLAY_SHELL_VARIANTS: Record<GameplayShellVariantId, GameplayShellVariantConfig> = {
  caiden: {
    id: 'caiden',
    themeClass: 'caiden-game',
    topBarVariant: 'caiden',
    decorVariant: 'caiden',
    defaultGuideCharacter: 'b4',
    scenarioLabel: 'Scenario',
  },
  miranda: {
    id: 'miranda',
    themeClass: 'miranda-game',
    topBarVariant: 'miranda',
    decorVariant: 'miranda',
    defaultGuideCharacter: 'b4',
    scenarioLabel: 'Scenario',
  },
  b4: {
    id: 'b4',
    themeClass: 'b4-game',
    topBarVariant: 'b4',
    decorVariant: 'b4',
    defaultGuideCharacter: 'b4',
    scenarioLabel: 'Scenario',
  },
  drVictoria: {
    id: 'drVictoria',
    themeClass: 'victoria-game',
    topBarVariant: 'victoria',
    decorVariant: 'victoria',
    defaultGuideCharacter: 'dr-victoria',
    scenarioLabel: 'Training Scenario',
  },
  uncleT: {
    id: 'uncleT',
    themeClass: 'uncle-t-game',
    topBarVariant: 'uncle-t',
    decorVariant: 'uncle-t',
    defaultGuideCharacter: 'uncle-t',
    scenarioLabel: 'Training Scenario',
  },
  charlie: {
    id: 'charlie',
    themeClass: 'charlie-game',
    topBarVariant: 'charlie',
    decorVariant: 'charlie',
    defaultGuideCharacter: 'b4',
    scenarioLabel: 'Scenario',
  },
  zeke: {
    id: 'zeke',
    themeClass: 'zeke-game',
    topBarVariant: 'zeke',
    decorVariant: 'default',
    defaultGuideCharacter: 'b4',
    scenarioLabel: 'Scenario',
  },
  adultAssessment: {
    id: 'adultAssessment',
    themeClass: 'adult-assessment-game',
    topBarVariant: 'default',
    decorVariant: 'b4',
    defaultGuideCharacter: 'reflection-coach',
    scenarioLabel: 'Training Scenario',
  },
};

export function resolveGameplayShellVariant(
  id: GameplayShellVariantId,
): GameplayShellVariantConfig {
  return GAMEPLAY_SHELL_VARIANTS[id];
}

export function resolveGuideCharacterForShell(
  variantId: GameplayShellVariantId,
  override?: GuideCharacter,
): GuideCharacter {
  if (override) return override;
  return GAMEPLAY_SHELL_VARIANTS[variantId].defaultGuideCharacter;
}
