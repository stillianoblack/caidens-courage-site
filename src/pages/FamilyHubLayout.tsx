import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FamilyDashboardSidebar from '../components/family-portal/FamilyDashboardSidebar';
import FamilyDashboardTopBar from '../components/family-portal/FamilyDashboardTopBar';
import FamilyPortalDashboardContent from '../components/family-portal/FamilyPortalDashboardContent';
import PortalAccessRequired from '../components/portal/PortalAccessRequired';
import PortalShell from '../components/portal/PortalShell';
import '../components/portal/portal-header.css';
import '../components/family-portal/family-dashboard.css';
import '../components/portal/portal-shell.css';
import { FAMILY_HUB_PATH } from '../config/courageRoutes';
import { readActivePortalRole } from '../config/portalContext';
import { FAMILY_PORTAL_TITLE, PROGRAM_FAMILY_SIDEBAR_NAV } from '../data/familyPortalContent';
import { isFamilyNestedRoute, resolvePortalPageTitle } from '../lib/familyPortalNav';
import { resolvePortalRailBrand } from '../lib/portalGamePaths';
import { resolveActivePilotProgram } from '../lib/portalProgramRestore';
import { resetPortalScroll } from '../lib/portalScroll';
import { PORTAL_ROLE_MISMATCH_MESSAGE } from '../lib/portalSessionGuard';

export default function FamilyHubLayout() {
  const location = useLocation();
  const activeProgram = resolveActivePilotProgram();
  const activeRole = readActivePortalRole();
  const brand = resolvePortalRailBrand();
  const pageTitle = resolvePortalPageTitle(location.pathname, FAMILY_HUB_PATH);
  const showNestedRoute = isFamilyNestedRoute(location.pathname, FAMILY_HUB_PATH);
  const sessionOk = activeRole === 'family' && Boolean(activeProgram);

  useEffect(() => {
    document.title = `${FAMILY_PORTAL_TITLE} | Caiden's Courage`;
  }, []);

  useEffect(() => {
    if (sessionOk) {
      resetPortalScroll();
    }
  }, [location.pathname, sessionOk]);

  if (activeRole === 'facilitator') {
    return <PortalAccessRequired message={PORTAL_ROLE_MISMATCH_MESSAGE} />;
  }

  if (!sessionOk) {
    return <PortalAccessRequired />;
  }

  return (
    <PortalShell
      variant="family"
      sidebar={
        <FamilyDashboardSidebar
          navItems={PROGRAM_FAMILY_SIDEBAR_NAV}
          brandTitle={brand.title}
          brandSubtitle={brand.subtitle}
          programCode={activeProgram!.programCode}
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
      {showNestedRoute ? <Outlet /> : <FamilyPortalDashboardContent basePath={FAMILY_HUB_PATH} />}
    </PortalShell>
  );
}
