import React from 'react';
import AvatarContainer, { type AvatarContainerVariant } from '../components/AvatarContainer';
import { getCharacter } from '../characters/characterRegistry';
import CoachingRailShell from './CoachingRailShell';
import { getGuidePanelLabel, getPreSubmitGuideMessage, type GuideCharacter } from './getPreSubmitGuideMessage';

/** @deprecated Prefer guideCharacter — kept for backward compatibility */
export type GameCoachingRailVariant = 'b4' | 'facilitator';

export type GameCoachingRailPlaceholderProps = {
  /** @deprecated Use guideCharacter */
  variant?: GameCoachingRailVariant;
  /** Activity owner — controls avatar + "X Says" label */
  guideCharacter?: GuideCharacter;
  phase?: 'landing' | 'quiz';
  hasSelection?: boolean;
  hasHints?: boolean;
  className?: string;
  caretTop?: number;
};

function resolveGuideCharacter(
  variant: GameCoachingRailVariant,
  guideCharacter?: GuideCharacter,
): GuideCharacter {
  if (guideCharacter) return guideCharacter;
  if (variant === 'facilitator') return 'dr-victoria';
  return 'b4';
}

function resolveAvatarVariant(character: GuideCharacter): AvatarContainerVariant {
  switch (character) {
    case 'dr-victoria':
      return 'dr-victoria';
    case 'uncle-t':
      return 'uncle-t';
    default:
      return 'b4';
  }
}

function resolveRegistryId(character: GuideCharacter): string {
  switch (character) {
    case 'dr-victoria':
      return 'dr-victoria';
    case 'uncle-t':
      return 'uncle-t';
    case 'reflection-coach':
      return 'dr-victoria';
    default:
      return 'b4';
  }
}

export default function GameCoachingRailPlaceholder({
  variant = 'b4',
  guideCharacter,
  phase = 'quiz',
  hasSelection = false,
  hasHints = false,
  className = '',
  caretTop,
}: GameCoachingRailPlaceholderProps) {
  const resolvedGuide = resolveGuideCharacter(variant, guideCharacter);
  const registryId = resolveRegistryId(resolvedGuide);
  const character = getCharacter(registryId);
  const avatarVariant = resolveAvatarVariant(resolvedGuide);
  const label = getGuidePanelLabel(resolvedGuide);
  const message = getPreSubmitGuideMessage({
    character: resolvedGuide,
    phase,
    hasSelection,
    hasHints,
  });

  return (
    <CoachingRailShell variant="placeholder" className={className} caretTop={caretTop}>
      <aside className="ds-coachingRailPlaceholder ds-coachingRailPlaceholder--compact" aria-label={label}>
        <div className="ds-learningMomentB4Top">
          {character?.avatarSrc ? (
            <AvatarContainer
              src={character.avatarSrc}
              alt={character.displayName}
              variant={avatarVariant}
            />
          ) : null}
          <p className="ds-coachingRailPlaceholderBadge">{label}</p>
        </div>
        <p className="ds-coachingRailPlaceholderText">{message}</p>
      </aside>
    </CoachingRailShell>
  );
}
