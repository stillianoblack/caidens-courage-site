import React, { Suspense, useCallback, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import FamilyDashboardSidebar from '../components/family-portal/FamilyDashboardSidebar';
import FamilyDashboardTopBar from '../components/family-portal/FamilyDashboardTopBar';
import FamilyMobileNavDrawer from '../components/family-portal/FamilyMobileNavDrawer';
import { AppShell } from '../components/portal-design-system';
import '../components/portal-design-system/portal-design-system.css';
import '../design-system/components/b4-insights-drawer.css';
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
import PortalRouteLoader from '../components/portal/PortalRouteLoader';
import { resolvePortalOutletKey } from '../lib/portalOutletKey';
import { prefetchFamilyPortalRoutes } from '../lib/portalRoutePrefetch';
import { ensureFamilyPortalProgramSync } from '../lib/portalProgramAssignment';
import { useFamilyPortalShell } from '../hooks/useFamilyPortalShell';
import { useFamilyMobileNav } from '../hooks/useFamilyMobileNav';
import { FamilyJourneyCoachRail } from '../components/family-portal/FamilyJourneyCoachPlacement';
import { OPEN_FOCUS_FLAME_JOURNEY_EVENT } from '../lib/focusFlameJourney';
import { familyGoalsPath, familySettingsTabPath } from '../lib/familyPortalPaths';
import { isFamilyPortalHomePath } from '../lib/familyPortalHomeRoute';
import { OPEN_PROGRAM_GOALS_EVENT } from '../lib/openProgramGoals';

export default function FamilyPortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const hasSession = readLegacyFamilyPortalSession();
  const brand = resolvePortalRailBrand();
  const pageTitle = resolvePortalPageTitle(location.pathname);
  const activeProgram = readActivePilotProgram();
  const programCode = activeProgram?.programCode ?? '';
  const showJourneyRail = isFamilyPortalHomePath(location.pathname);

  const { linkedCampLabel, notifications } = useFamilyPortalShell(programCode);
  const { isMobileNav, mobileNavOpen, openMobileNav, closeMobileNav } = useFamilyMobileNav();

  const sidebarProps = useMemo(
    () => ({
      navItems: FAMILY_SIDEBAR_NAV,
      brandTitle: brand.title,
      brandSubtitle: brand.subtitle,
      programCode,
    }),
    [brand.subtitle, brand.title, programCode],
  );

  const openFamilyGoalsSettings = useCallback(() => {
    navigate(familyGoalsPath(location.pathname));
  }, [location.pathname, navigate]);

  const openJourneySettings = useCallback(() => {
    navigate(familySettingsTabPath('overview', location.pathname));
  }, [location.pathname, navigate]);

  useEffect(() => {
    const handleOpenGoals = () => openFamilyGoalsSettings();
    const handleOpenJourney = () => openJourneySettings();
    window.addEventListener(OPEN_PROGRAM_GOALS_EVENT, handleOpenGoals);
    window.addEventListener(OPEN_FOCUS_FLAME_JOURNEY_EVENT, handleOpenJourney);
    return () => {
      window.removeEventListener(OPEN_PROGRAM_GOALS_EVENT, handleOpenGoals);
      window.removeEventListener(OPEN_FOCUS_FLAME_JOURNEY_EVENT, handleOpenJourney);
    };
  }, [openFamilyGoalsSettings, openJourneySettings]);

  useEffect(() => {
    if (searchParams.get('openGoals') !== '1') return;
    navigate(familyGoalsPath(location.pathname), { replace: true });
  }, [location.pathname, navigate, searchParams]);

  useEffect(() => {
    document.title = `${FAMILY_PORTAL_TITLE} | Caiden's Courage`;
    if (hasSession) {
      ensureFamilyPortalProgramSync();
    }
    prefetchFamilyPortalRoutes();
  }, [hasSession]);

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
    <>
      <AppShell
        variant="family"
        rightRail={showJourneyRail ? <FamilyJourneyCoachRail /> : undefined}
        sidebar={!isMobileNav ? <FamilyDashboardSidebar {...sidebarProps} /> : null}
        topBar={
          <FamilyDashboardTopBar
            pageTitle={pageTitle}
            onOpenProgramGoals={openFamilyGoalsSettings}
            linkedCampLabel={linkedCampLabel}
            notifications={notifications}
            onOpenMobileNav={isMobileNav ? openMobileNav : undefined}
          />
        }
        footer={
          <footer className="family-miniFooter">© 2026 Caiden&apos;s Courage™ Family Portal</footer>
        }
      >
        <Suspense fallback={<PortalRouteLoader message="Loading Family Portal..." />}>
          <Outlet key={resolvePortalOutletKey(location.pathname, location.search)} />
        </Suspense>
      </AppShell>
      {isMobileNav ? (
        <FamilyMobileNavDrawer open={mobileNavOpen} onClose={closeMobileNav}>
          <FamilyDashboardSidebar
            {...sidebarProps}
            variant="drawer"
            onNavigate={closeMobileNav}
          />
        </FamilyMobileNavDrawer>
      ) : null}
    </>
  );
}
