import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CourageHeader from '../components/courage/CourageHeader';
import CourageFooter from '../components/courage/CourageFooter';
import PortalHero from '../components/courage/PortalHero';
import { parsePortalAudienceParam, type PortalAudienceTab } from '../config/portalAudience';
import { usePortalUnlock } from '../hooks/usePortalUnlock';
import { readFamilyPortalSession } from '../config/familyPortalAccess';
import { readPortalSessionUnlock } from '../config/portalAccess';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { readActivePortalRole } from '../config/portalContext';
import {
  FACILITATOR_PORTAL_PATH,
  FAMILY_HUB_PATH,
  FAMILY_PORTAL_PATH,
  PORTAL_PATH,
  PROGRAM_DASHBOARD_PATH,
} from '../config/courageRoutes';
import { logPortalRedirect } from '../lib/portalDebug';

/**
 * Caiden's Courage Portal — access/login gateway only.
 * Pricing and persona offers live on /parents, /teachers, /camps, and /schools.
 */
const Portal: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { accessCode, error, submitting, handleSubmit, onAccessCodeChange, clearAccessCode } =
    usePortalUnlock('hero');

  // Session/role detection for redirecting from `/portal`.
  const role = readActivePortalRole();
  const activeProgram = readActivePilotProgram();
  const familySession = readFamilyPortalSession();
  const portalSession = readPortalSessionUnlock();

  const audienceParam = searchParams.get('audience');
  const audience: PortalAudienceTab | null = audienceParam
    ? parsePortalAudienceParam(audienceParam)
    : null;

  useEffect(() => {
    document.title = "Caiden's Courage Portal";
  }, []);

  useEffect(() => {
    // If the user already has an active portal session, skip straight to the correct portal.
    // If no valid session exists, this page stays as the access-code entry screen.
    if (!role) return;

    if (role === 'family' && familySession) {
      const destination = activeProgram ? FAMILY_HUB_PATH : FAMILY_PORTAL_PATH;
      logPortalRedirect(PORTAL_PATH, destination, 'active-family-session');
      navigate(destination, { replace: true });
      return;
    }

    if (role === 'facilitator' && portalSession) {
      const destination = activeProgram ? PROGRAM_DASHBOARD_PATH : FACILITATOR_PORTAL_PATH;
      logPortalRedirect(PORTAL_PATH, destination, 'active-facilitator-session');
      navigate(destination, { replace: true });
    }
  }, [navigate, role, activeProgram, familySession, portalSession]);

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
