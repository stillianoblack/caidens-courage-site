import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import FamilyDashboardSidebar from '../components/family-portal/FamilyDashboardSidebar';
import FamilyDashboardTopBar from '../components/family-portal/FamilyDashboardTopBar';
import PortalShell from '../components/portal/PortalShell';
import '../components/portal/portal-header.css';
import '../components/family-portal/family-dashboard.css';
import '../components/portal/portal-shell.css';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { readActivePortalRole } from '../config/portalContext';
import { FAMILY_HUB_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { readFamilyPortalSession } from '../config/familyPortalAccess';
import { FAMILY_PORTAL_TITLE, PROGRAM_FAMILY_SIDEBAR_NAV } from '../data/familyPortalContent';
import { afterIdle } from '../lib/defer';
import { resolvePortalRailBrand } from '../lib/portalGamePaths';
import { requestGalleryCountsRefresh } from '../lib/galleryNavCounts';
import { resolvePortalPageTitle } from '../lib/familyPortalNav';

export default function FamilyHubLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeProgram = readActivePilotProgram();
  const hasSession = readFamilyPortalSession();
  const brand = resolvePortalRailBrand();
  const pageTitle = resolvePortalPageTitle(location.pathname, FAMILY_HUB_PATH);

  useEffect(() => {
    document.title = `${FAMILY_PORTAL_TITLE} | Caiden's Courage`;
  }, []);

  useEffect(() => {
    afterIdle(() => requestGalleryCountsRefresh());
  }, []);

  useEffect(() => {
    if (!activeProgram || readActivePortalRole() !== 'family' || !hasSession) {
      navigate(PORTAL_PATH, { replace: true, state: { redirect: FAMILY_HUB_PATH } });
    }
  }, [activeProgram, hasSession, navigate]);

  if (!activeProgram || !hasSession) {
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
      <Outlet />
    </PortalShell>
  );
}
