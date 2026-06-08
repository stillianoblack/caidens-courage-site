import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import FamilyDashboardSidebar from '../components/family-portal/FamilyDashboardSidebar';
import FamilyDashboardTopBar from '../components/family-portal/FamilyDashboardTopBar';
import PortalShell from '../components/portal/PortalShell';
import '../components/portal/portal-header.css';
import '../components/family-portal/family-dashboard.css';
import '../components/portal/portal-shell.css';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { FAMILY_PORTAL_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { requestGalleryCountsRefresh } from '../lib/galleryNavCounts';
import { readLegacyFamilyPortalSession } from '../config/familyPortalAccess';
import { afterIdle } from '../lib/defer';
import { FAMILY_PORTAL_TITLE, FAMILY_SIDEBAR_NAV } from '../data/familyPortalContent';
import { resolvePortalRailBrand } from '../lib/portalGamePaths';
import { resolvePortalPageTitle } from '../lib/familyPortalNav';

export default function FamilyPortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasSession = readLegacyFamilyPortalSession();
  const brand = resolvePortalRailBrand();
  const pageTitle = resolvePortalPageTitle(location.pathname);
  const programCode = readActivePilotProgram()?.programCode;

  useEffect(() => {
    document.title = `${FAMILY_PORTAL_TITLE} | Caiden's Courage`;
  }, []);

  useEffect(() => {
    afterIdle(() => requestGalleryCountsRefresh());
  }, []);

  useEffect(() => {
    if (!hasSession) {
      navigate(PORTAL_PATH, { replace: true, state: { redirect: FAMILY_PORTAL_PATH } });
    }
  }, [hasSession, navigate]);

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
      <Outlet />
    </PortalShell>
  );
}
