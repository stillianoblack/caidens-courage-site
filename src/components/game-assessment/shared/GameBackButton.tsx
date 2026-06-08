import React from 'react';
import { assignPortalRoute } from '../../../lib/portalHardNavigation';
import { resolveCharacterThemeColor } from './characterThemeColors';
import './game-back-button.css';

type GameBackButtonProps = {
  to: string;
  hubName: string;
  theme?: string;
  onClick?: () => void;
  variant?: 'inline' | 'floating';
  className?: string;
};

function isPlainLeftClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function isSameSiteRoute(to: string) {
  try {
    const url = new URL(to, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

export default function GameBackButton({
  to,
  hubName,
  theme,
  onClick,
  variant = 'inline',
  className = '',
}: GameBackButtonProps) {
  const chevronColor = resolveCharacterThemeColor(theme);
  const label = `Back to ${hubName}`;

  return (
    <a
      href={to}
      onClick={(event) => {
        onClick?.();

        if (!isPlainLeftClick(event) || !isSameSiteRoute(to)) {
          return;
        }

        event.preventDefault();
        assignPortalRoute(to);
      }}
      className={['game-backBtn', variant === 'floating' ? 'game-backBtn--floating' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="game-backBtn-icon" style={{ color: chevronColor }} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M14 6 L8 12 L14 18"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="game-backBtn-label">{label}</span>
    </a>
  );
}
