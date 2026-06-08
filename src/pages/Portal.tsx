import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import CourageHeader from '../components/courage/CourageHeader';
import CourageFooter from '../components/courage/CourageFooter';
import PortalHero from '../components/courage/PortalHero';
import { parsePortalAudienceParam, type PortalAudienceTab } from '../config/portalAudience';
import { usePortalUnlock } from '../hooks/usePortalUnlock';
import { FAMILY_HUB_PATH, PORTAL_PATH, PROGRAM_DASHBOARD_PATH } from '../config/courageRoutes';
import { logPortalRedirect } from '../lib/portalDebug';
import {
  hasFacilitatorPortalSession,
  hasFamilyPortalSession,
} from '../lib/portalSessionGuard';

/**
 * Caiden's Courage Portal — access-code entry only.
 * Enter a code to open Family Portal (/family-hub) or Facilitator Portal (/program-dashboard).
 */
const Portal: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const portalMessage = useMemo(
    () => (location.state as { portalMessage?: string } | null)?.portalMessage ?? null,
    [location.state],
  );

  const {
    accessCode,
    error,
    submitting,
    handleSubmit,
    onAccessCodeChange,
    clearAccessCode,
    setError,
  } = usePortalUnlock('hero');

  const audienceParam = searchParams.get('audience');
  const audience: PortalAudienceTab | null = audienceParam
    ? parsePortalAudienceParam(audienceParam)
    : null;

  useEffect(() => {
    document.title = "Caiden's Courage Portal";
  }, []);

  useEffect(() => {
    if (portalMessage) {
      setError(portalMessage);
    }
  }, [portalMessage, setError]);

  useEffect(() => {
    if (hasFamilyPortalSession()) {
      logPortalRedirect(PORTAL_PATH, FAMILY_HUB_PATH, 'resume-family-session');
      navigate(FAMILY_HUB_PATH, { replace: true });
      return;
    }
    if (hasFacilitatorPortalSession()) {
      logPortalRedirect(PORTAL_PATH, PROGRAM_DASHBOARD_PATH, 'resume-facilitator-session');
      navigate(PROGRAM_DASHBOARD_PATH, { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-cream font-body">
      <CourageHeader />

      <PortalHero
        audience={audience}
        accessCode={accessCode}
        error={error}
        submitting={submitting}
        onAccessCodeChange={onAccessCodeChange}
        onSubmit={handleSubmit}
        onUseDifferentCode={clearAccessCode}
      />

      <CourageFooter />
    </div>
  );
};

export default Portal;
