import React, { Suspense, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import FamilyDashboardSidebar from '../components/family-portal/FamilyDashboardSidebar';
import FamilyDashboardTopBar from '../components/family-portal/FamilyDashboardTopBar';
import PortalShell from '../components/portal/PortalShell';
import '../components/portal/portal-header.css';
import '../components/family-portal/family-dashboard.css';
import '../components/portal/portal-shell.css';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { clearProgramPortalContext, readActivePortalRole } from '../config/portalContext';
import { FAMILY_HUB_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { clearFamilyPortalSession, readFamilyPortalSession } from '../config/familyPortalAccess';
import { FAMILY_PORTAL_TITLE, PROGRAM_FAMILY_SIDEBAR_NAV } from '../data/familyPortalContent';
import { afterIdle } from '../lib/defer';
import { resolvePortalRailBrand } from '../lib/portalGamePaths';
import { requestGalleryCountsRefresh } from '../lib/galleryNavCounts';
import { resolvePortalPageTitle } from '../lib/familyPortalNav';
import PortalRouteLoader from '../components/portal/PortalRouteLoader';
import { resolvePortalOutletKey } from '../lib/portalOutletKey';
import { isPortalRoleAllowed } from '../lib/portalSessionGuard';
import { ensureFamilyPortalProgramSync } from '../lib/portalProgramAssignment';

export default function FamilyHubLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeProgram = readActivePilotProgram();
  const hasSession = readFamilyPortalSession();
  const role = readActivePortalRole();
  const brand = resolvePortalRailBrand();
  const pageTitle = resolvePortalPageTitle(location.pathname, FAMILY_HUB_PATH);
  const sessionValid = Boolean(
    activeProgram && hasSession && role === 'family' && isPortalRoleAllowed(location.pathname),
  );

  useEffect(() => {
    document.title = `${FAMILY_PORTAL_TITLE} | Caiden's Courage`;
  }, []);

  useEffect(() => {
    if (sessionValid) {
      ensureFamilyPortalProgramSync();
    }
  }, [sessionValid]);

  useEffect(() => {
    if (sessionValid) {
      afterIdle(() => requestGalleryCountsRefresh());
    }
  }, [sessionValid]);

  useEffect(() => {
    if (!sessionValid) {
      clearProgramPortalContext();
      clearFamilyPortalSession();
      navigate(PORTAL_PATH, { replace: true, state: { redirect: FAMILY_HUB_PATH } });
    }
  }, [navigate, sessionValid]);

  if (!activeProgram) {
    return null;
  }

  return (
    <PortalShell
      variant="family"
      sidebar={
        <FamilyDashboardSidebar
          navItems={PROGRAM_FAMILY_SIDEBAR_NAV}
          brandTitle={brand.title}
          brandSubtitle={brand.subtitle}
          programCode={activeProgram.programCode}
        />
      }
      topBar={
        <FamilyDashboardTopBar
          pageTitle={pageTitle}
          contextTitle={brand.title}
          contextSubtitle="Family Portal"
        />
      }
      footer={<footer className="family-miniFooter">© 2026 Caiden&apos;s Courage™ Family Portal</footer>}
    >
      <Suspense fallback={<PortalRouteLoader message="Loading Family Portal..." />}>
        <Outlet key={resolvePortalOutletKey(location.pathname, location.search)} />
      </Suspense>
    </PortalShell>
  );
}
