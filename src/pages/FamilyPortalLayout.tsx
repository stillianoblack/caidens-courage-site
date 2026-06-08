import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FamilyDashboardSidebar from '../components/family-portal/FamilyDashboardSidebar';
import FamilyDashboardTopBar from '../components/family-portal/FamilyDashboardTopBar';
import PortalShell from '../components/portal/PortalShell';
import '../components/portal/portal-header.css';
import '../components/family-portal/family-dashboard.css';
import '../components/portal/portal-shell.css';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { FAMILY_HUB_PATH, FAMILY_PORTAL_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { readActivePortalRole } from '../config/portalContext';
import FamilyPortalOutlet from '../components/family-portal/FamilyPortalOutlet';
import { readFamilyPortalSession } from '../config/familyPortalAccess';
import { FAMILY_PORTAL_TITLE, FAMILY_SIDEBAR_NAV } from '../data/familyPortalContent';
import { resolvePortalRailBrand } from '../lib/portalGamePaths';
import { resolvePortalPageTitle } from '../lib/familyPortalNav';
import { logPortalRedirect } from '../lib/portalDebug';

export default function FamilyPortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasSession = readFamilyPortalSession();
  const activeProgram = readActivePilotProgram();
  const activeRole = readActivePortalRole();
  const brand = resolvePortalRailBrand();
  const pageTitle = resolvePortalPageTitle(location.pathname);
  const programCode = activeProgram?.programCode;

  useEffect(() => {
    document.title = `${FAMILY_PORTAL_TITLE} | Caiden's Courage`;
  }, []);

  useEffect(() => {
    if (!hasSession) {
      logPortalRedirect(location.pathname, PORTAL_PATH, 'family-session-missing');
      navigate(PORTAL_PATH, { replace: true, state: { redirect: FAMILY_PORTAL_PATH } });
    }
  }, [hasSession, location.pathname, navigate]);

  useEffect(() => {
    // Legacy route compatibility:
    // If the family session is coming from a program signup, we force old `/portal/family/*`
    // URLs onto the canonical `/family-hub/*` route tree so rendering stays consistent.
    if (!hasSession) return;
    if (activeRole !== 'family') return;
    if (!activeProgram) return;

    const prefix = FAMILY_PORTAL_PATH;
    if (!location.pathname.startsWith(prefix)) return;

    const remainder = location.pathname.slice(prefix.length) || '';
    const mappedRemainder = remainder.startsWith('/parent-corner')
      ? remainder.replace('/parent-corner', '/guide')
      : remainder;

    const destination = `${FAMILY_HUB_PATH}${mappedRemainder}`;
    logPortalRedirect(location.pathname, destination, 'legacy-family-portal-to-hub');
    navigate(destination, { replace: true });
  }, [activeProgram, activeRole, hasSession, location.pathname, navigate]);

  if (!hasSession) {
    return null;
  }

  return (
    <PortalShell
      variant="family"
      sidebar={
        <FamilyDashboardSidebar
          navItems={FAMILY_SIDEBAR_NAV}
          brandTitle={brand.title}
          brandSubtitle={brand.subtitle}
          programCode={programCode}
        />
      }
      topBar={
        <FamilyDashboardTopBar
          pageTitle={pageTitle}
          contextTitle={brand.title}
          contextSubtitle="Family Portal"
        />
      }
      footer={
        <footer className="family-miniFooter">© 2026 Caiden&apos;s Courage™ Family Portal</footer>
      }
    >
      <FamilyPortalOutlet />
    </PortalShell>
  );
}
