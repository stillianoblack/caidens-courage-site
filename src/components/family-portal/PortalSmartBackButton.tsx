import React, { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FAMILY_PORTAL_PATH } from '../../config/courageRoutes';
import {
  resolvePortalReturnLabel,
  getPortalReturnPath,
  getPortalReturnFromQuery,
  shouldUseHistoryBack,
} from '../../lib/portalReturnNav';

type PortalSmartBackButtonProps = {
  className?: string;
  variant?: 'mission-board' | 'inline';
};

export default function PortalSmartBackButton({
  className = '',
  variant = 'mission-board',
}: PortalSmartBackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = getPortalReturnFromQuery(location.search) ?? getPortalReturnPath();
  const label = returnPath
    ? resolvePortalReturnLabel(returnPath)
    : '← Back to Family Portal';

  const handleBack = useCallback(() => {
    if (returnPath) {
      navigate(returnPath);
      return;
    }
    if (shouldUseHistoryBack(null)) {
      navigate(-1);
      return;
    }
    navigate(FAMILY_PORTAL_PATH);
  }, [navigate, returnPath]);

  const btnClass =
    variant === 'mission-board'
      ? ['mission-boardBackBtn', className].filter(Boolean).join(' ')
      : ['family-smartBackBtn', className].filter(Boolean).join(' ');

  return (
    <button type="button" className={btnClass} onClick={handleBack}>
      {label}
    </button>
  );
}
