import React from 'react';
import '../../../design-system/game/gameDesignStyles';

type GameInteractionShellProps = {
  children: React.ReactNode;
  className?: string;
};

/** Centered gameplay column — shared width for questions, feedback, and action alignment. */
export default function GameInteractionShell({ children, className = '' }: GameInteractionShellProps) {
  return (
    <div className={['game-interactionShell', className].filter(Boolean).join(' ')}>
      <div className="game-interactionShellInner">{children}</div>
    </div>
  );
}
