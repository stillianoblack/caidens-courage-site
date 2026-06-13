import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalBreadcrumb from '../../components/portal/PortalBreadcrumb';
import SoundToggleButton from '../../components/game-assessment/shared/SoundToggleButton';
import FocusCoinWalletBadge from '../../components/rewards/FocusCoinWalletBadge';
import type { MissionGameTheme } from '../../components/mission-game/MissionSpeechRow';
import { resolveMobileGameBackTarget } from '../../lib/mobileGameBackNav';
import GameBackIconButton from './GameBackIconButton';
import './gameplay-top-bar.css';

const FLAME_SRC = '/images/icons/focus-flame-mark.svg';
const MOBILE_GAME_BACK_MQ = '(max-width: 719px)';

function resolveIsMobileGameBack(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_GAME_BACK_MQ).matches;
}

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
  className = '',
}: {
  display: GameplayTopBarFlameDisplay;
  lit: number;
  className?: string;
}) {
  if (display === 'none') return null;

  if (display === 'single') {
    if (lit <= 0) return null;
    return (
      <div className={['ds-gameplayTopBar-flames', className].filter(Boolean).join(' ')} aria-hidden="true">
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
    <div className={['ds-gameplayTopBar-flames', className].filter(Boolean).join(' ')} aria-label={`${lit} focus flames`}>
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
  const navigate = useNavigate();
  const [isMobileGameBack, setIsMobileGameBack] = useState(resolveIsMobileGameBack);
  const resolvedBackLabel = backLabel ?? (hubName ? `Back to ${hubName}` : undefined);
  const showBack = Boolean(resolvedBackLabel && (backHref || onBack || onBackClick));

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_GAME_BACK_MQ);
    const update = () => setIsMobileGameBack(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const resolvedFlameDisplay = showFlameStatus ? flameDisplay : 'none';

  const handleMobileBack = useCallback(() => {
    onBackClick?.();
    if (onBack) {
      onBack();
      return;
    }
    if (backHref) {
      navigate(backHref);
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(resolveMobileGameBackTarget(window.location.pathname, window.location.search).path);
  }, [backHref, navigate, onBack, onBackClick]);

  const mobileBackLabel = backHref
    ? resolvedBackLabel
    : resolveMobileGameBackTarget(window.location.pathname, window.location.search).ariaLabel;

  return (
    <header
      className={['ds-gameplayTopBar', `ds-gameplayTopBar--${variant}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="ds-gameplayTopBar-back">
        {showBack && !isMobileGameBack && resolvedBackLabel ? (
          backHref ? (
            <PortalBreadcrumb
              label={resolvedBackLabel}
              href={backHref}
              onClick={onBackClick}
              theme={variant}
              variant="game"
              className="ds-gameplayTopBar-backText"
            />
          ) : (
            <PortalBreadcrumb
              label={resolvedBackLabel}
              onClick={onBack ?? onBackClick}
              theme={variant}
              variant="game"
              className="ds-gameplayTopBar-backText"
            />
          )
        ) : null}
        {showBack && isMobileGameBack ? (
          <GameBackIconButton
            onClick={handleMobileBack}
            ariaLabel={mobileBackLabel}
            theme={variant}
            className="ds-gameplayTopBar-backIconOnly"
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
        <FocusCoinWalletBadge compact className="ds-gameplayTopBar-coinChip family-portalMobileChip" />
        {playerName ? (
          <span className="ds-gameplayTopBar-playerChip family-portalMobilePlayerChip" title={playerName}>
            <span className="ds-gameplayTopBar-playerAvatar family-portalMobilePlayerAvatar" aria-hidden="true">
              {playerName.charAt(0).toUpperCase()}
            </span>
            <span className="ds-gameplayTopBar-playerName family-portalMobilePlayerName">{playerName}</span>
          </span>
        ) : null}
        <FlameStatus display={resolvedFlameDisplay} lit={flamesLit} className="ds-gameplayTopBar-flamesDesktop" />
        {onToggleSound ? (
          <SoundToggleButton soundEnabled={soundEnabled} onToggle={onToggleSound} className="ds-gameplayTopBar-soundBtn" />
        ) : null}
      </div>
    </header>
  );
}
