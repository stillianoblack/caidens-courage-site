import React, { Suspense, useCallback, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import FamilyDashboardSidebar from '../components/family-portal/FamilyDashboardSidebar';
import FamilyDashboardTopBar from '../components/family-portal/FamilyDashboardTopBar';
import FamilyMobileBottomNav from '../components/family-portal/FamilyMobileBottomNav';
import { AppShell } from '../components/portal-design-system';
import '../components/portal-design-system/portal-design-system.css';
import '../components/portal/portal-header.css';
import '../components/family-portal/family-dashboard.css';
import '../components/family-portal/family-mobile-bottom-nav.css';
import '../design-system/kids-adventure/kids-adventure-visual-system.css';
import '../design-system/kids-adventure/kids-adventure-visual-system-desktop.css';
import '../components/portal/portal-shell.css';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { clearProgramPortalContext, readActivePortalRole } from '../config/portalContext';
import { FAMILY_HUB_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { clearFamilyPortalSession, readFamilyPortalSession } from '../config/familyPortalAccess';
import { FAMILY_PORTAL_TITLE, PROGRAM_FAMILY_SIDEBAR_NAV } from '../data/familyPortalContent';
import { afterIdle } from '../lib/defer';
import { resolvePortalRailBrand } from '../lib/portalGamePaths';
import { requestGalleryCountsRefresh } from '../lib/galleryNavCounts';
import { resolvePortalPageTitle, isCharacterGameRoute } from '../lib/familyPortalNav';
import { isKidFacingPortalRoute } from '../lib/kidFacingPortalRoutes';
import PortalRouteLoader from '../components/portal/PortalRouteLoader';
import { resolvePortalOutletKey } from '../lib/portalOutletKey';
import { isPortalRoleAllowed } from '../lib/portalSessionGuard';
import { ensureFamilyPortalProgramSync } from '../lib/portalProgramAssignment';
import { prefetchFamilyPortalRoutes } from '../lib/portalRoutePrefetch';
import { useFamilyPortalShell } from '../hooks/useFamilyPortalShell';
import { useFamilyMobileNav } from '../hooks/useFamilyMobileNav';
import { FamilyJourneyCoachRail } from '../components/family-portal/FamilyJourneyCoachPlacement';
import { OPEN_FOCUS_FLAME_JOURNEY_EVENT } from '../lib/focusFlameJourney';
import { familyGoalsPath, familySettingsTabPath } from '../lib/familyPortalPaths';
import { isFamilyHubHomePath } from '../lib/familyPortalHomeRoute';
import { OPEN_PROGRAM_GOALS_EVENT } from '../lib/openProgramGoals';

export default function FamilyHubLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeProgram = readActivePilotProgram();
  const hasSession = readFamilyPortalSession();
  const role = readActivePortalRole();
  const brand = resolvePortalRailBrand();
  const pageTitle = resolvePortalPageTitle(location.pathname, FAMILY_HUB_PATH);
  const programCode = activeProgram?.programCode ?? '';
  const showJourneyRail = isFamilyHubHomePath(location.pathname);
  const sessionValid = Boolean(
    activeProgram && hasSession && role === 'family' && isPortalRoleAllowed(location.pathname),
  );

  const { linkedCampLabel, notifications } = useFamilyPortalShell(programCode);
  const { isMobileNav } = useFamilyMobileNav();
  const isMobileGameRoute = isMobileNav && isCharacterGameRoute(location.pathname);
  const kidFacingRoute = isKidFacingPortalRoute(location.pathname, FAMILY_HUB_PATH) || isMobileGameRoute;

  const sidebarProps = useMemo(
    () => ({
      navItems: PROGRAM_FAMILY_SIDEBAR_NAV,
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
  }, []);

  useEffect(() => {
    if (sessionValid) {
      ensureFamilyPortalProgramSync();
      prefetchFamilyPortalRoutes();
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
    <>
      <div
        className={[
          isMobileNav ? 'portal-shell--familyMobileNav' : '',
          isMobileGameRoute ? 'portal-shell--familyMobileGame' : '',
          kidFacingRoute ? 'kids-adventure-shell' : '',
        ]
          .filter(Boolean)
          .join(' ') || undefined}
      >
        <AppShell
          variant="family"
          rightRail={showJourneyRail && !isMobileGameRoute ? <FamilyJourneyCoachRail /> : undefined}
          sidebar={!isMobileNav ? <FamilyDashboardSidebar {...sidebarProps} /> : null}
          topBar={
            isMobileGameRoute
              ? null
              : (
                <FamilyDashboardTopBar
                  pageTitle={pageTitle}
                  onOpenProgramGoals={openFamilyGoalsSettings}
                  linkedCampLabel={linkedCampLabel}
                  notifications={notifications}
                  mobileFamilySimplified={isMobileNav}
                />
              )
          }
          footer={<footer className="family-miniFooter">© 2026 Caiden&apos;s Courage™ Family Portal</footer>}
        >
          <Suspense fallback={<PortalRouteLoader message="Loading Family Portal..." />}>
            <Outlet key={resolvePortalOutletKey(location.pathname, location.search)} />
          </Suspense>
        </AppShell>
      </div>
      {isMobileNav && !isMobileGameRoute ? <FamilyMobileBottomNav /> : null}
    </>
  );
}
