import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import FamilyDashboardSidebar from '../components/family-portal/FamilyDashboardSidebar';
import FamilyDashboardTopBar from '../components/family-portal/FamilyDashboardTopBar';
import FamilyMobileBottomNav from '../components/family-portal/FamilyMobileBottomNav';
import { AppShell } from '../components/portal-design-system';
import '../components/portal-design-system/portal-design-system.css';
import '../design-system/components/weekly-review-sheet.css';
import '../design-system/components/b4-insights-drawer.css';
import '../components/portal/portal-header.css';
import '../components/family-portal/family-dashboard.css';
import '../components/family-portal/family-mobile-bottom-nav.css';
import '../design-system/kids-adventure/kids-adventure-visual-system.css';
import '../design-system/kids-adventure/kids-adventure-visual-system-desktop.css';
import '../components/portal/portal-shell.css';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { resolveTrackingProgramCode } from '../lib/activeProgramContext';
import FamilyPortalDevDiagnosticBanner from '../components/family-portal/FamilyPortalDevDiagnosticBanner';
import { FAMILY_PORTAL_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { requestGalleryCountsRefresh } from '../lib/galleryNavCounts';
import { readLegacyFamilyPortalSession } from '../config/familyPortalAccess';
import { afterIdle } from '../lib/defer';
import { FAMILY_PORTAL_TITLE, FAMILY_SIDEBAR_NAV } from '../data/familyPortalContent';
import { resolvePortalRailBrand } from '../lib/portalGamePaths';
import { resolvePortalPageTitle, isMobileFamilyGameplayShellRoute } from '../lib/familyPortalNav';
import { isKidFacingPortalRoute } from '../lib/kidFacingPortalRoutes';
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
import { isAdminAdventurePreviewActive } from '../lib/adventureVisibility';
import { resetPortalInteractionState } from '../lib/resetPortalInteractionState';
import { ActiveParticipantProvider } from '../context/ActiveParticipantContext';
import ActiveParticipantPickerGate from '../components/family-portal/ActiveParticipantPickerGate';
import { OPEN_PROGRAM_GOALS_EVENT } from '../lib/openProgramGoals';

export default function FamilyPortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const hasSession = readLegacyFamilyPortalSession();
  const adminPreviewAccess = isAdminAdventurePreviewActive(location.search);
  const canAccessShell = hasSession || adminPreviewAccess;
  const brand = resolvePortalRailBrand();
  const pageTitle = resolvePortalPageTitle(location.pathname);
  const activeProgram = readActivePilotProgram();
  const [programCode, setProgramCode] = useState(
    () => resolveTrackingProgramCode() ?? activeProgram?.programCode ?? '',
  );
  const showJourneyRail = isFamilyPortalHomePath(location.pathname);

  const { linkedCampLabel, notifications } = useFamilyPortalShell(programCode);
  const { isMobileNav } = useFamilyMobileNav();
  const isMobileGameRoute =
    isMobileNav && isMobileFamilyGameplayShellRoute(location.pathname);
  const kidFacingRoute = isKidFacingPortalRoute(location.pathname) || isMobileGameRoute;

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
    resetPortalInteractionState();
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.title = `${FAMILY_PORTAL_TITLE} | Caiden's Courage`;
    if (hasSession) {
      const resolved = ensureFamilyPortalProgramSync();
      setProgramCode(resolved.code ?? resolveTrackingProgramCode() ?? activeProgram?.programCode ?? '');
    }
    prefetchFamilyPortalRoutes();
  }, [activeProgram?.programCode, hasSession]);

  useEffect(() => {
    afterIdle(() => requestGalleryCountsRefresh());
  }, []);

  useEffect(() => {
    if (!canAccessShell) {
      navigate(PORTAL_PATH, { replace: true, state: { redirect: FAMILY_PORTAL_PATH } });
    }
  }, [canAccessShell, navigate]);

  if (!canAccessShell) {
    return null;
  }

  return (
    <ActiveParticipantProvider programCode={programCode}>
      <ActiveParticipantPickerGate />
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
          footer={
            <footer className="family-miniFooter">© 2026 Caiden&apos;s Courage™ Family Portal</footer>
          }
        >
          <FamilyPortalDevDiagnosticBanner />
          <Suspense fallback={<PortalRouteLoader message="Loading Family Portal..." />}>
            <Outlet key={resolvePortalOutletKey(location.pathname, location.search)} />
          </Suspense>
        </AppShell>
      </div>
      {isMobileNav && !isMobileGameRoute ? <FamilyMobileBottomNav /> : null}
    </ActiveParticipantProvider>
  );
}
