import React from 'react';
import PortalBreadcrumb from '../../portal/PortalBreadcrumb';
import { formatBackLabel } from '../../../lib/portalBreadcrumbNav';

type GameBackButtonProps = {
  to: string;
  hubName: string;
  label?: string;
  theme?: string;
  onClick?: () => void;
  variant?: 'inline' | 'floating';
  className?: string;
};

/** @deprecated Prefer PortalBreadcrumb with an explicit label. */
export default function GameBackButton({
  to,
  hubName,
  label,
  theme,
  onClick,
  variant = 'inline',
  className = '',
}: GameBackButtonProps) {
  const resolvedLabel = label ?? formatBackLabel(hubName);

  return (
    <PortalBreadcrumb
      label={resolvedLabel}
      href={to}
      onClick={onClick}
      theme={theme}
      variant="game"
      className={[
        'game-backBtn',
        variant === 'floating' ? 'game-backBtn--floating' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
