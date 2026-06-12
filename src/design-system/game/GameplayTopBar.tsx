import React from 'react';
import PortalBreadcrumb from '../../components/portal/PortalBreadcrumb';
import GamePlayerPill from '../../components/game-assessment/shared/GamePlayerPill';
import SoundToggleButton from '../../components/game-assessment/shared/SoundToggleButton';
import FocusCoinWalletBadge from '../../components/rewards/FocusCoinWalletBadge';
import type { MissionGameTheme } from '../../components/mission-game/MissionSpeechRow';
import './gameplay-top-bar.css';

const FLAME_SRC = '/images/icons/focus-flame-mark.svg';

export type GameplayTopBarVariant = MissionGameTheme | 'zeke';

export type GameplayTopBarFlameDisplay = 'none' | 'single' | 'multi';

export type GameplayTopBarProps = {
  /** Theme token for progress bar + back chevron color */
  variant?: GameplayTopBarVariant;
  /** Full breadcrumb label — omit to hide back control */
  backLabel?: string;
  /** @deprecated Use backLabel with full “Back to …” text */
  hubName?: string;
  backHref?: string;
  onBackClick?: () => void;
  /** Fallback when no backHref (e.g. baseline check exit) */
  onBack?: () => void;
  progressPercent?: number;
  showProgress?: boolean;
  playerName?: string;
  playerIndex?: number;
  showFlameStatus?: boolean;
  flameDisplay?: GameplayTopBarFlameDisplay;
  /** Lit flame count (multi = 1–5, single = 0|1) */
  flamesLit?: number;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  className?: string;
};

function FlameStatus({
  display,
  lit,
}: {
  display: GameplayTopBarFlameDisplay;
  lit: number;
}) {
  if (display === 'none') return null;

  if (display === 'single') {
    if (lit <= 0) return null;
    return (
      <div className="ds-gameplayTopBar-flames" aria-hidden="true">
        <img
          src={FLAME_SRC}
          alt=""
          className="ds-gameplayTopBar-flameIcon ds-gameplayTopBar-flameIcon--lit"
        />
      </div>
    );
  }

  const total = 5;
  return (
    <div className="ds-gameplayTopBar-flames" aria-label={`${lit} focus flames`}>
      {Array.from({ length: total }, (_, i) => i + 1).map((index) => (
        <img
          key={index}
          src={FLAME_SRC}
          alt=""
          className={[
            'ds-gameplayTopBar-flameIcon',
            index <= lit ? 'ds-gameplayTopBar-flameIcon--lit' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/**
 * Standard gameplay header — back breadcrumb | progress bar | player pill + flame + sound.
 */
export default function GameplayTopBar({
  variant = 'default',
  backLabel,
  hubName,
  backHref,
  onBackClick,
  onBack,
  progressPercent = 0,
  showProgress = true,
  playerName,
  playerIndex = 1,
  showFlameStatus = true,
  flameDisplay = 'single',
  flamesLit = 1,
  soundEnabled = true,
  onToggleSound,
  className = '',
}: GameplayTopBarProps) {
  const resolvedBackLabel = backLabel ?? (hubName ? `Back to ${hubName}` : undefined);
  const showBack = Boolean(resolvedBackLabel && (backHref || onBack));
  const resolvedFlameDisplay = showFlameStatus ? flameDisplay : 'none';

  return (
    <header
      className={['ds-gameplayTopBar', `ds-gameplayTopBar--${variant}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="ds-gameplayTopBar-back">
        {showBack && backHref && resolvedBackLabel ? (
          <PortalBreadcrumb
            label={resolvedBackLabel}
            href={backHref}
            onClick={onBackClick}
            theme={variant}
            variant="game"
          />
        ) : showBack && onBack && resolvedBackLabel ? (
          <PortalBreadcrumb
            label={resolvedBackLabel}
            onClick={onBack}
            theme={variant}
            variant="game"
          />
        ) : null}
      </div>

      <div className="ds-gameplayTopBar-progress">
        {showProgress ? (
          <div className="ds-gameplayTopBar-progressGlow">
            <div
              className="ds-gameplayTopBar-progressTrack"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="ds-gameplayTopBar-progressFill"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
          </div>
        ) : (
          <div aria-hidden="true" />
        )}
      </div>

      <div className="ds-gameplayTopBar-controls">
        <FocusCoinWalletBadge compact />
        <GamePlayerPill displayName={playerName} playerIndex={playerIndex} />
        <FlameStatus display={resolvedFlameDisplay} lit={flamesLit} />
        {onToggleSound ? (
          <SoundToggleButton soundEnabled={soundEnabled} onToggle={onToggleSound} />
        ) : null}
      </div>
    </header>
  );
}
