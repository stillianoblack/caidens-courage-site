import React from 'react';
import AvatarContainer from '../components/AvatarContainer';
import { getCharacter } from '../characters/characterRegistry';
import CoachingRailShell from './CoachingRailShell';
import { getGuidePanelLabel, getPreSubmitGuideMessage } from './getPreSubmitGuideMessage';

export type GameCoachingRailVariant = 'b4' | 'facilitator';

export type GameCoachingRailPlaceholderProps = {
  variant?: GameCoachingRailVariant;
  phase?: 'landing' | 'quiz';
  hasSelection?: boolean;
  hasHints?: boolean;
  className?: string;
  caretTop?: number;
};

export default function GameCoachingRailPlaceholder({
  variant = 'b4',
  phase = 'quiz',
  hasSelection = false,
  hasHints = false,
  className = '',
  caretTop,
}: GameCoachingRailPlaceholderProps) {
  const isFacilitator = variant === 'facilitator';
  const character = getCharacter(isFacilitator ? 'dr-victoria' : 'b4');
  const avatarVariant = isFacilitator ? 'dr-victoria' : 'b4';
  const guideCharacter = isFacilitator ? 'dr-victoria' : 'b4';
  const label = getGuidePanelLabel(guideCharacter);
  const message = getPreSubmitGuideMessage({
    character: guideCharacter,
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
