import React from 'react';
import type { GameUIPatternId } from '../../../design-system/game/patterns/gameUIPatterns';
import '../../../design-system/game/gameDesignStyles';

export type GameInteractionShellSlots = {
  story?: React.ReactNode;
  question?: React.ReactNode;
  answers?: React.ReactNode;
  feedback?: React.ReactNode;
};

type GameInteractionShellProps = {
  children?: React.ReactNode;
  className?: string;
  patternId?: GameUIPatternId;
  slots?: GameInteractionShellSlots;
  usePlayLayout?: boolean;
};

/**
 * Shared gameplay column — width, pattern tokens, and optional 3-zone layout.
 * Pass `slots` for story / question / answers / feedback; otherwise render `children`.
 */
export default function GameInteractionShell({
  children,
  className = '',
  patternId,
  slots,
  usePlayLayout = false,
}: GameInteractionShellProps) {
  const hasSlots = Boolean(slots?.story || slots?.question || slots?.answers || slots?.feedback);
  const layoutClass = [
    'game-interactionShell',
    usePlayLayout || hasSlots ? 'game-interactionShell--play' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={layoutClass}
      data-game-pattern={patternId}
      data-game-layout={hasSlots ? 'shell' : undefined}
    >
      <div className="game-interactionShellInner">
        {hasSlots ? (
          <div
            className={[
              'game-interactionShellLayout',
              usePlayLayout ? 'game-interactionShellLayout--play' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {slots?.story ? (
              <div className="game-interactionShellLayoutStory">{slots.story}</div>
            ) : null}
            {slots?.question ? (
              <div className="game-interactionShellLayoutQuestion">{slots.question}</div>
            ) : null}
            {slots?.answers ? (
              <div className="game-interactionShellLayoutAnswers">{slots.answers}</div>
            ) : null}
            {slots?.feedback ? (
              <div className="game-interactionShellLayoutFeedback">{slots.feedback}</div>
            ) : null}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
