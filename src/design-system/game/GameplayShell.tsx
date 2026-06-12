import React from 'react';
import GameBackgroundDecor from '../../components/game-assessment/shared/GameBackgroundDecor';
import { IdleSessionGuard } from '../narration';
import {
  resolveGameplayShellVariant,
  type GameplayShellVariantId,
} from './gameplayShellVariants';
import './gameplay-shell.css';

export type GameplayShellProps = {
  /** Shell accent + coach defaults */
  variant: GameplayShellVariantId;
  embedded?: boolean;
  /** Quiz / active gameplay — enables sticky bottom bar + scroll containment */
  active?: boolean;
  /** Miranda-style two-column coaching layout */
  coachingShell?: boolean;
  /** Extra theme classes (e.g. victoria-game) */
  themeClassName?: string;
  topBar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  idleSessionGuard?: {
    enabled?: boolean;
    onEndSession: () => void;
  };
};

/**
 * Standard gameplay shell wrapper — Miranda-style coaching shell is the reference.
 * Used directly by legacy assessment flows and mirrors GameAssessmentFlow layout classes.
 */
export default function GameplayShell({
  variant,
  embedded = false,
  active = false,
  coachingShell = true,
  themeClassName = '',
  topBar,
  footer,
  children,
  className = '',
  idleSessionGuard,
}: GameplayShellProps) {
  const config = resolveGameplayShellVariant(variant);
  const themeClasses = (themeClassName || config.themeClass).split(' ').filter(Boolean);
  const embeddedClass = embedded && themeClasses[0] ? `${themeClasses[0]}--embedded` : '';

  const rootClass = [
    'bbc-app',
    'ds-gameplayShell',
    ...themeClasses,
    embeddedClass,
    embedded ? 'portal-gameFrame' : '',
    coachingShell ? 'bbc-app--coachingShell' : '',
    active ? 'bbc-app--game-active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <GameBackgroundDecor variant={config.decorVariant} />
      {topBar}
      {children}
      {footer}
      {idleSessionGuard ? (
        <IdleSessionGuard
          enabled={idleSessionGuard.enabled ?? active}
          onEndSession={idleSessionGuard.onEndSession}
        />
      ) : null}
    </div>
  );
}
