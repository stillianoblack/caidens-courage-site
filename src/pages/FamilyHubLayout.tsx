import React, { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FamilyDashboardSidebar from '../components/family-portal/FamilyDashboardSidebar';
import FamilyDashboardTopBar from '../components/family-portal/FamilyDashboardTopBar';
import FamilyPortalDashboardContent from '../components/family-portal/FamilyPortalDashboardContent';
import PortalShell from '../components/portal/PortalShell';
import '../components/portal/portal-header.css';
import '../components/family-portal/family-dashboard.css';
import '../components/portal/portal-shell.css';
import { readActivePilotProgram } from '../config/activePilotProgram';
import {
  forcePortalRoleForRoute,
  logActivePortalDev,
  readActivePortalRole,
} from '../config/portalContext';
import { FAMILY_HUB_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { readFamilyPortalSession } from '../config/familyPortalAccess';
import {
  FAMILY_PORTAL_TITLE,
  PROGRAM_FAMILY_SIDEBAR_NAV,
  type FamilySidebarNavId,
} from '../data/familyPortalContent';
import { resolvePortalRailBrand } from '../lib/portalGamePaths';
import { resolvePortalNavId, resolvePortalPageTitle } from '../lib/familyPortalNav';
import { logPortalRedirect } from '../lib/portalDebug';

function resetFamilyScroll(): void {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  document.querySelector('.family-content')?.scrollTo(0, 0);
}

export default function FamilyHubLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeProgram = readActivePilotProgram();
  const hasSession = readFamilyPortalSession();
  const brand = resolvePortalRailBrand();
  const pageTitle = resolvePortalPageTitle(location.pathname, FAMILY_HUB_PATH);

  const activeNav = useMemo(
    () => resolvePortalNavId(location.pathname, FAMILY_HUB_PATH),
    [location.pathname],
  );

  const handleSelectNav = useCallback(
    (id: FamilySidebarNavId) => {
      const item = PROGRAM_FAMILY_SIDEBAR_NAV.find((nav) => nav.id === id);
      if (!item || location.pathname === item.path) return;
      resetFamilyScroll();
      navigate(item.path);
    },
    [location.pathname, navigate],
  );

  useEffect(() => {
    document.title = `${FAMILY_PORTAL_TITLE} | Caiden's Courage`;
    forcePortalRoleForRoute(location.pathname);
    logActivePortalDev();
  }, [location.pathname]);

  useEffect(() => {
    if (!activeProgram || readActivePortalRole() !== 'family' || !hasSession) {
      logPortalRedirect(location.pathname, PORTAL_PATH, 'family-hub-gate-failed');
      navigate(PORTAL_PATH, { replace: true, state: { redirect: FAMILY_HUB_PATH } });
    }
  }, [activeProgram, hasSession, location.pathname, navigate]);

  if (!activeProgram || !hasSession) {
    return null;
  }

  return (
    <PortalShell
      variant="family"
      sidebar={
        <FamilyDashboardSidebar
          activeId={activeNav}
          onSelect={handleSelectNav}
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
      <FamilyPortalDashboardContent basePath={FAMILY_HUB_PATH} />
    </PortalShell>
  );
}
