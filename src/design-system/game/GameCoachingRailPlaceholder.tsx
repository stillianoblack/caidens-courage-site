import React from 'react';
import AvatarContainer from '../components/AvatarContainer';
import { getCharacter } from '../characters/characterRegistry';
import CoachingRailShell from './CoachingRailShell';
import '../components/learning-moment.css';

export type GameCoachingRailVariant = 'b4' | 'facilitator';

export type GameCoachingRailPlaceholderProps = {
  variant?: GameCoachingRailVariant;
  phase?: 'landing' | 'quiz';
  className?: string;
  caretTop?: number;
};

export default function GameCoachingRailPlaceholder({
  variant = 'b4',
  phase = 'quiz',
  className = '',
  caretTop,
}: GameCoachingRailPlaceholderProps) {
  const isFacilitator = variant === 'facilitator';
  const character = getCharacter(isFacilitator ? 'dr-victoria' : 'b4');
  const avatarVariant = isFacilitator ? 'dr-victoria' : 'b4';
  const label = isFacilitator ? 'Dr. Victoria Says' : 'B-4 Lock-In Tips';
  const message = isFacilitator
    ? phase === 'landing'
      ? 'Start training to unlock reflection guidance after each scenario.'
      : 'Choose an answer and tap Check to unlock reflection guidance.'
    : 'Choose an answer to unlock a B-4 Lock-In Tip.';

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
