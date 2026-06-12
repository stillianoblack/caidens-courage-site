import React from 'react';
import { useLocation } from 'react-router-dom';
import { formatBackLabel } from '../../lib/portalBreadcrumbNav';
import { resolvePortalBackTarget } from '../../lib/portalReturnNav';
import PortalBreadcrumb from './PortalBreadcrumb';
import type { PortalBreadcrumbVariant } from './PortalBreadcrumb';

type PortalBackButtonProps = {
  to?: string;
  hubName?: string;
  label?: string;
  theme?: string;
  onClick?: () => void;
  className?: string;
  variant?: PortalBreadcrumbVariant;
};

/** @deprecated Prefer PortalBreadcrumb with an explicit label. */
export default function PortalBackButton({
  to,
  hubName,
  label,
  theme,
  onClick,
  className = '',
  variant = 'dashboard',
}: PortalBackButtonProps) {
  const location = useLocation();
  const fallback = resolvePortalBackTarget(location.pathname);
  const targetPath = to ?? fallback.path;
  const resolvedLabel =
    label ?? formatBackLabel(hubName ?? fallback.hubName);

  return (
    <PortalBreadcrumb
      label={resolvedLabel}
      href={targetPath}
      onClick={onClick}
      theme={theme}
      variant={variant}
      className={['portal-backBtn', className].filter(Boolean).join(' ')}
    />
  );
}
