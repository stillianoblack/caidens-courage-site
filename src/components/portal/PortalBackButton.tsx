import React from 'react';
import { useLocation } from 'react-router-dom';
import GameBackButton from '../game-assessment/shared/GameBackButton';
import { resolvePortalBackTarget } from '../../lib/portalReturnNav';

type PortalBackButtonProps = {
  to?: string;
  hubName?: string;
  theme?: string;
  onClick?: () => void;
  className?: string;
};

export default function PortalBackButton({
  to,
  hubName,
  theme,
  onClick,
  className = '',
}: PortalBackButtonProps) {
  const location = useLocation();
  const fallback = resolvePortalBackTarget(location.pathname);
  const targetPath = to ?? fallback.path;
  const label = hubName ?? fallback.hubName;

  return (
    <GameBackButton
      to={targetPath}
      hubName={label}
      theme={theme}
      onClick={onClick}
      variant="inline"
      className={['portal-backBtn', className].filter(Boolean).join(' ')}
    />
  );
}
