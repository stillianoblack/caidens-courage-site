import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalBreadcrumb from '../portal/PortalBreadcrumb';
import type { PortalBreadcrumbVariant } from '../portal/PortalBreadcrumb';

type FamilyPortalBackButtonProps = {
  /** Full label, e.g. “← Back to Adventure Map”. */
  label: string;
  fallbackPath: string;
  onClick?: () => void;
  theme?: string;
  className?: string;
  variant?: PortalBreadcrumbVariant;
};

function normalizeLabel(label: string): string {
  const trimmed = label.trim();
  if (trimmed.startsWith('←')) return trimmed;
  return `← ${trimmed}`;
}

export default function FamilyPortalBackButton({
  label,
  fallbackPath,
  onClick,
  theme,
  className = '',
  variant = 'dashboard',
}: FamilyPortalBackButtonProps) {
  const navigate = useNavigate();
  const resolvedLabel = normalizeLabel(label);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
      return;
    }

    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackPath);
  }, [fallbackPath, navigate, onClick]);

  return (
    <PortalBreadcrumb
      label={resolvedLabel}
      onClick={handleClick}
      theme={theme}
      variant={variant}
      className={['portal-backBtn', className].filter(Boolean).join(' ')}
    />
  );
}
