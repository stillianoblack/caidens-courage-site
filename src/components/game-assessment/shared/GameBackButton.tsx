import React from 'react';
import { Link } from 'react-router-dom';
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
    <Link
      to={to}
      onClick={onClick}
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
    </Link>
  );
}
