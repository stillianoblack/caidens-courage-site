import React from 'react';
import { Link } from 'react-router-dom';
import {
  resolveCharacterThemeId,
  themeDataAttributes,
  type CharacterThemeId,
} from './characterThemes';

type MissionActionCardProps = {
  label?: string;
  themeId?: CharacterThemeId | string | null;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function MissionActionCard({
  label = 'Start Adventure',
  themeId,
  href,
  disabled = false,
  onClick,
  className,
}: MissionActionCardProps) {
  const resolvedTheme = resolveCharacterThemeId(themeId ?? null);
  const themeAttrs = resolvedTheme ? themeDataAttributes(resolvedTheme) : {};
  const cardClass = ['kidMissionActionCard', className].filter(Boolean).join(' ');

  if (href && !disabled) {
    return (
      <Link to={href} className={cardClass} {...themeAttrs} onClick={onClick}>
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cardClass}
      {...themeAttrs}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
