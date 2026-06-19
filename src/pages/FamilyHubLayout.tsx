import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import FamilyDashboardSidebar from '../components/family-portal/FamilyDashboardSidebar';
import FamilyDashboardTopBar from '../components/family-portal/FamilyDashboardTopBar';
import FamilyMobileBottomNav from '../components/family-portal/FamilyMobileBottomNav';
import { AppShell } from '../components/portal-design-system';
import '../components/portal-design-system/portal-design-system.css';
import '../design-system/components/weekly-review-sheet.css';
import '../components/portal/portal-header.css';
import '../components/family-portal/family-dashboard.css';
import '../components/family-portal/family-mobile-bottom-nav.css';
import '../design-system/kids-adventure/kids-adventure-visual-system.css';
import '../design-system/kids-adventure/kids-adventure-visual-system-desktop.css';
import '../components/portal/portal-shell.css';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { resolveTrackingProgramCode } from '../lib/activeProgramContext';
import FamilyPortalDevDiagnosticBanner from '../components/family-portal/FamilyPortalDevDiagnosticBanner';
import { clearProgramPortalContext, readActivePortalRole } from '../config/portalContext';
import { FAMILY_HUB_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { clearFamilyPortalSession, readFamilyPortalSession } from '../config/familyPortalAccess';
import { FAMILY_PORTAL_TITLE, PROGRAM_FAMILY_SIDEBAR_NAV } from '../data/familyPortalContent';
import { afterIdle } from '../lib/defer';
import { requestGalleryCountsRefresh } from '../lib/galleryNavCounts';
import {
  resolvePortalPageTitle,
  isMobileFamilyGameplayShellRoute,
} from '../lib/familyPortalNav';
import { isKidFacingPortalRoute } from '../lib/kidFacingPortalRoutes';
import PortalRouteLoader from '../components/portal/PortalRouteLoader';
import { isPortalRoleAllowed } from '../lib/portalSessionGuard';
import { ensureFamilyPortalProgramSync } from '../lib/portalProgramAssignment';
import { prefetchFamilyPortalRoutes } from '../lib/portalRoutePrefetch';
import { useFamilyPortalShell } from '../hooks/useFamilyPortalShell';
import { useFamilyMobileNav } from '../hooks/useFamilyMobileNav';
import { useFamilyPortalRightRail } from '../hooks/useFamilyPortalRightRail';
import '../components/family-portal/inventory-help-rail.css';
import { OPEN_FOCUS_FLAME_JOURNEY_EVENT } from '../lib/focusFlameJourney';
import { familyGoalsPath, familySettingsTabPath } from '../lib/familyPortalPaths';
import { isAdminAdventurePreviewActive } from '../lib/adventureVisibility';
import { OPEN_PROGRAM_GOALS_EVENT } from '../lib/openProgramGoals';
import { ActiveParticipantProvider } from '../context/ActiveParticipantContext';
import ActiveParticipantPickerGate from '../components/family-portal/ActiveParticipantPickerGate';
import KidPlayFamilySoftLockGate from '../components/kid-play-shell/KidPlayFamilySoftLockGate';
import { isKidPlayFamilySoftLocked } from '../lib/kidPlayFamilySoftLock';
import { resolvePwaStandaloneLaunchPath } from '../lib/pwaStandaloneLaunch';

export default function FamilyHubLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeProgram = readActivePilotProgram();
  const hasSession = readFamilyPortalSession();
  const role = readActivePortalRole();
  const pageTitle = resolvePortalPageTitle(location.pathname, FAMILY_HUB_PATH);
  const [programCode, setProgramCode] = useState(
    () => resolveTrackingProgramCode() ?? activeProgram?.programCode ?? '',
  );
  const [familySoftLocked, setFamilySoftLocked] = useState(() => isKidPlayFamilySoftLocked());
  useEffect(() => {
    setFamilySoftLocked(isKidPlayFamilySoftLocked());
  }, [location.pathname]);
  const sessionValid = Boolean(
    activeProgram && hasSession && role === 'family' && isPortalRoleAllowed(location.pathname),
  );
  const adminPreviewAccess = isAdminAdventurePreviewActive(location.search);
  const canAccessShell = sessionValid || adminPreviewAccess;

  const { linkedCampLabel, notifications } = useFamilyPortalShell(programCode);
  const { isMobileNav } = useFamilyMobileNav();
  const isMobileGameRoute =
    isMobileNav && isMobileFamilyGameplayShellRoute(location.pathname, FAMILY_HUB_PATH);
  const familyPortalRightRail = useFamilyPortalRightRail(isMobileGameRoute);
  const kidFacingRoute = isKidFacingPortalRoute(location.pathname, FAMILY_HUB_PATH) || isMobileGameRoute;
  const isPlayPauseRoute = location.pathname.endsWith('/play-pause');

  const sidebarProps = useMemo(
    () => ({
      navItems: PROGRAM_FAMILY_SIDEBAR_NAV,
      programCode,
    }),
    [programCode],
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
      const resolved = ensureFamilyPortalProgramSync();
      setProgramCode(resolved.code ?? resolveTrackingProgramCode() ?? activeProgram?.programCode ?? '');
      prefetchFamilyPortalRoutes();
    }
  }, [activeProgram?.programCode, sessionValid]);

  useEffect(() => {
    if (sessionValid) {
      afterIdle(() => requestGalleryCountsRefresh());
    }
  }, [sessionValid]);

  useEffect(() => {
    const launchPath = resolvePwaStandaloneLaunchPath(location.pathname, sessionValid);
    if (launchPath) {
      navigate(launchPath, { replace: true });
    }
  }, [location.pathname, navigate, sessionValid]);

  useEffect(() => {
    if (!canAccessShell) {
      clearProgramPortalContext();
      clearFamilyPortalSession();
      navigate(PORTAL_PATH, { replace: true, state: { redirect: FAMILY_HUB_PATH } });
    }
  }, [canAccessShell, navigate]);

  if (!activeProgram || !canAccessShell) {
    return null;
  }

  if (isPlayPauseRoute) {
    return (
      <ActiveParticipantProvider programCode={programCode}>
        <Suspense fallback={<PortalRouteLoader message="Loading..." />}>
          <Outlet />
        </Suspense>
      </ActiveParticipantProvider>
    );
  }

  return (
    <ActiveParticipantProvider programCode={programCode}>
      <ActiveParticipantPickerGate />
      <KidPlayFamilySoftLockGate
        open={familySoftLocked && !isPlayPauseRoute}
        onUnlocked={() => setFamilySoftLocked(false)}
      />
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
          rightRail={familyPortalRightRail}
          sidebar={!isMobileNav ? <FamilyDashboardSidebar {...sidebarProps} /> : null}
          topBar={
            isMobileGameRoute
              ? null
              : (
                <FamilyDashboardTopBar
                  pageTitle={pageTitle}
                  linkedCampLabel={linkedCampLabel}
                  notifications={notifications}
                  mobileFamilySimplified={isMobileNav}
                />
              )
          }
          footer={<footer className="family-miniFooter">© 2026 Caiden&apos;s Courage™ Family Portal</footer>}
        >
          <FamilyPortalDevDiagnosticBanner />
          <Suspense fallback={<PortalRouteLoader message="Loading Family Portal..." />}>
            <Outlet />
          </Suspense>
        </AppShell>
      </div>
      {isMobileNav && !isMobileGameRoute ? <FamilyMobileBottomNav /> : null}
    </ActiveParticipantProvider>
  );
}
