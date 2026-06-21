import React, { useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import CourageHeader from '../components/courage/CourageHeader';
import CourageFooter from '../components/courage/CourageFooter';
import PortalHero from '../components/courage/PortalHero';
import { parsePortalAudienceParam, type PortalAudienceTab } from '../config/portalAudience';
import { usePortalUnlock } from '../hooks/usePortalUnlock';
import { resolveFamilyKidDefaultLandingPath } from '../lib/familyKidLanding';
import { PORTAL_PATH, PROGRAM_DASHBOARD_PATH } from '../config/courageRoutes';
import { logPortalRedirect } from '../lib/portalDebug';
import {
  hasFacilitatorPortalSession,
  hasFamilyPortalSession,
} from '../lib/portalSessionGuard';
import { replaceWithPortalRoute } from '../lib/portalHardNavigation';

/**
 * Caiden's Courage Portal — access-code entry only.
 * Enter a code to open Family Portal (/family-hub) or Facilitator Portal (/program-dashboard).
 */
const Portal: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const portalMessage = useMemo(
    () => (location.state as { portalMessage?: string } | null)?.portalMessage ?? null,
    [location.state],
  );

  const {
    accessCode,
    parentEmail,
    parentLastName,
    needsLastNameConfirm,
    rememberDevice,
    hasRememberedProgram,
    rememberedSession,
    error,
    submitting,
    handleSubmit,
    onAccessCodeChange,
    onParentEmailChange,
    onParentLastNameChange,
    onRememberDeviceChange,
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
      logPortalRedirect(PORTAL_PATH, resolveFamilyKidDefaultLandingPath(), 'resume-family-session');
      replaceWithPortalRoute(resolveFamilyKidDefaultLandingPath());
      return;
    }
    if (hasFacilitatorPortalSession()) {
      logPortalRedirect(PORTAL_PATH, PROGRAM_DASHBOARD_PATH, 'resume-facilitator-session');
      replaceWithPortalRoute(PROGRAM_DASHBOARD_PATH);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-cream font-body">
      <CourageHeader />

      <PortalHero
        audience={audience}
        accessCode={accessCode}
        parentEmail={parentEmail}
        parentLastName={parentLastName}
        needsLastNameConfirm={needsLastNameConfirm}
        rememberDevice={rememberDevice}
        hasRememberedProgram={hasRememberedProgram}
        rememberedSession={rememberedSession}
        error={error}
        submitting={submitting}
        onAccessCodeChange={onAccessCodeChange}
        onParentEmailChange={onParentEmailChange}
        onParentLastNameChange={onParentLastNameChange}
        onRememberDeviceChange={onRememberDeviceChange}
        onSubmit={handleSubmit}
        onUseDifferentCode={clearAccessCode}
      />

      <CourageFooter />
    </div>
  );
};

export default Portal;
