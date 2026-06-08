import React, { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import B4BaselineCheckFlow from '../components/b4/B4BaselineCheckFlow';
import FamilyDashboardSidebar from '../components/family-portal/FamilyDashboardSidebar';
import FamilyDashboardTopBar from '../components/family-portal/FamilyDashboardTopBar';
import PortalShell from '../components/portal/PortalShell';
import '../components/family-portal/family-dashboard.css';
import '../components/portal/portal-shell.css';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { forcePortalRoleForRoute, readActivePortalRole } from '../config/portalContext';
import { FAMILY_HUB_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { PROGRAM_FAMILY_SIDEBAR_NAV, type FamilySidebarNavId } from '../data/familyPortalContent';
import { resolvePortalNavId } from '../lib/familyPortalNav';
import { readFamilyPortalSession } from '../config/familyPortalAccess';
import { getPortalRoute, resolvePortalRailBrand } from '../lib/portalGamePaths';

export default function FamilyHubBaselineCheckPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeProgram = readActivePilotProgram();
  const hasSession = readFamilyPortalSession();
  const brand = resolvePortalRailBrand();
  const activeNav = resolvePortalNavId(location.pathname, FAMILY_HUB_PATH);

  const handleSelectNav = useCallback(
    (id: FamilySidebarNavId) => {
      const item = PROGRAM_FAMILY_SIDEBAR_NAV.find((nav) => nav.id === id);
      if (item) navigate(item.path);
    },
    [navigate],
  );

  useEffect(() => {
    forcePortalRoleForRoute('/family-hub');
    if (!activeProgram || readActivePortalRole() !== 'family' || !hasSession) {
      navigate(PORTAL_PATH, { replace: true });
    }
  }, [activeProgram, hasSession, navigate]);

  if (!activeProgram || !hasSession) return null;

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
          pageTitle="B-4 Baseline Check"
          contextTitle={brand.title}
          contextSubtitle="Family Portal"
        />
      }
      footer={<footer className="family-miniFooter">© 2026 Caiden&apos;s Courage™ Family Portal</footer>}
    >
      <B4BaselineCheckFlow embedded onExit={() => navigate(getPortalRoute('characters'))} />
    </PortalShell>
  );
}
