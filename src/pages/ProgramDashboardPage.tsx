import React, { Suspense, lazy, useCallback, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import PilotDashboardSidebar from '../components/pilot-dashboard/PilotDashboardSidebar';
import PilotDashboardTopBar from '../components/pilot-dashboard/PilotDashboardTopBar';
import { AppShell } from '../components/portal-design-system';
import PilotProgramWelcomeCard from '../components/pilot-program/PilotProgramWelcomeCard';
import PortalRouteLoader from '../components/portal/PortalRouteLoader';
import { GoalsOnboardingDrawer } from '../components/portal-design-system';
import '../components/portal-design-system/portal-design-system.css';
import '../components/portal/portal-header.css';
import '../components/pilot-dashboard/pilot-dashboard.css';
import '../components/pilot-program/pilot-program.css';
import '../components/portal/portal-shell.css';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { clearProgramPortalContext, readActivePortalRole } from '../config/portalContext';
import { readPortalSessionUnlock } from '../config/portalAccess';
import {
  PORTAL_PATH,
  PROGRAM_DASHBOARD_PATH,
} from '../config/courageRoutes';
import { resolveFamilyKidDefaultLandingPath } from '../lib/familyKidLanding';
import {
  PILOT_DASHBOARD_TITLE,
  PROGRAM_SIDEBAR_NAV,
  type PilotSidebarNavId,
} from '../data/pilotDashboardContent';
import { afterIdle } from '../lib/defer';
import { requestGalleryCountsRefresh } from '../lib/galleryNavCounts';
import { resolvePortalPageTitle } from '../lib/familyPortalNav';
import {
  isProgramDashboardKidsPath,
  programDashboardTabPath,
  resolveProgramDashboardTab,
} from '../lib/programDashboardNav';
import { useProgramDashboardNav } from '../hooks/useProgramDashboardNav';
import { resolvePortalOutletKey } from '../lib/portalOutletKey';
import { isIndependentFamilyProgram } from '../lib/independentFamilyProgram';
import { isPortalRoleAllowed } from '../lib/portalSessionGuard';
import { prefetchFacilitatorPortalRoutes } from '../lib/portalRoutePrefetch';
import { useProgramGoalsOnboarding } from '../hooks/useProgramGoalsOnboarding';
import { OPEN_PROGRAM_GOALS_EVENT } from '../lib/openProgramGoals';
import { clearPageTransitionOverlay } from '../lib/pageTransition';
import { FacilitatorOverviewCoachProvider } from '../components/pilot-dashboard/coach/FacilitatorOverviewCoachProvider';
import FacilitatorPortalMobileChrome, {
  facilitatorMobileNavShellClass,
} from '../components/pilot-dashboard/FacilitatorPortalMobileChrome';
import { useFacilitatorMobileNav } from '../hooks/useFacilitatorMobileNav';

const FacilitatorOverviewCoachRail = lazy(
  () => import('../components/pilot-dashboard/coach/FacilitatorOverviewCoachRail'),
);

const NAV_TITLE: Record<PilotSidebarNavId, string> = Object.fromEntries(
  PROGRAM_SIDEBAR_NAV.map((item) => [item.id, item.label]),
) as Record<PilotSidebarNavId, string>;

const VALID_NAV_IDS = new Set(PROGRAM_SIDEBAR_NAV.map((item) => item.id));

function logProgramDashboardHydration(
  step: string,
  detail: Record<string, unknown>,
): void {
  console.info('[PROGRAM_DASHBOARD_HYDRATION]', {
    step,
    ...detail,
  });
}

export default function ProgramDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeProgram = readActivePilotProgram();
  const showWelcome = searchParams.get('welcome') === '1';

  const isKidsRoute = isProgramDashboardKidsPath(location.pathname);
  const activeNav = resolveProgramDashboardTab(location.pathname);
  const showOverviewCoach = !isKidsRoute && activeNav === 'overview';
  const programCode = activeProgram?.programCode;
  const hasActiveProgram = Boolean(activeProgram);
  const role = readActivePortalRole();
  const hasUnlock = readPortalSessionUnlock();
  const isIndependentFamily = isIndependentFamilyProgram(activeProgram);
  const sessionValid = Boolean(
    activeProgram &&
      !isIndependentFamily &&
      role === 'facilitator' &&
      hasUnlock &&
      isPortalRoleAllowed(location.pathname),
  );
  const handleSelectNav = useProgramDashboardNav();
  const { isMobileNav, moreOpen, openMore, closeMore } = useFacilitatorMobileNav();
  const showMobileNav = sessionValid && !isKidsRoute;
  const mobileNavShellClass = facilitatorMobileNavShellClass(showMobileNav, isMobileNav);

  useEffect(() => {
    clearPageTransitionOverlay();
  }, []);

  useEffect(() => {
    logProgramDashboardHydration('session_restore', {
      path: location.pathname,
      has_active_program: hasActiveProgram,
      program_code: programCode ?? null,
      role,
      has_unlock: Boolean(hasUnlock),
      is_independent_family: isIndependentFamily,
      route_allowed: isPortalRoleAllowed(location.pathname),
      session_valid: sessionValid,
    });
  }, [
    hasActiveProgram,
    hasUnlock,
    isIndependentFamily,
    location.pathname,
    programCode,
    role,
    sessionValid,
  ]);

  const {
    open: goalsOpen,
    openDrawer: openGoalsDrawer,
    closeDrawer: closeGoalsDrawer,
    record: goalsRecord,
    saveGoals,
    remindLater: remindGoalsLater,
    skipForNow: skipGoalsForNow,
  } = useProgramGoalsOnboarding({
    programCode: programCode ?? '',
    portalType: 'facilitator',
    enabled: sessionValid && !isKidsRoute,
  });

  useEffect(() => {
    const handleOpenGoals = () => openGoalsDrawer();
    window.addEventListener(OPEN_PROGRAM_GOALS_EVENT, handleOpenGoals);
    return () => window.removeEventListener(OPEN_PROGRAM_GOALS_EVENT, handleOpenGoals);
  }, [openGoalsDrawer]);

  useEffect(() => {
    if (searchParams.get('openGoals') !== '1') return;
    openGoalsDrawer();
    const next = new URLSearchParams(searchParams);
    next.delete('openGoals');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, openGoalsDrawer]);

  const pageTitle = isKidsRoute
    ? resolvePortalPageTitle(location.pathname, PROGRAM_DASHBOARD_PATH)
    : NAV_TITLE[activeNav];

  useEffect(() => {
    document.title = `${PILOT_DASHBOARD_TITLE} | Caiden's Courage`;
    if (sessionValid) {
      prefetchFacilitatorPortalRoutes();
    }
  }, [sessionValid]);

  useEffect(() => {
    if (sessionValid) {
      afterIdle(() => requestGalleryCountsRefresh());
    }
  }, [sessionValid]);

  useEffect(() => {
    const hash = location.hash.replace('#', '') as PilotSidebarNavId;
    if (!hash || !VALID_NAV_IDS.has(hash)) {
      return;
    }
    navigate(programDashboardTabPath(hash), { replace: true });
  }, [location.hash, navigate]);

  useEffect(() => {
    if (!hasActiveProgram) {
      logProgramDashboardHydration('redirect_to_portal', {
        reason: 'missing_active_program',
        path: location.pathname,
      });
      navigate(PORTAL_PATH, {
        replace: true,
        state: {
          redirect: location.pathname,
          message: 'Open your facilitator portal again to restore this dashboard.',
          reason: 'missing_active_program',
        },
      });
      return;
    }
    if (isIndependentFamily) {
      logProgramDashboardHydration('redirect_to_family', {
        reason: 'independent_family_program',
        program_code: programCode ?? null,
      });
      navigate(resolveFamilyKidDefaultLandingPath(), { replace: true });
      return;
    }
    if (!sessionValid) {
      logProgramDashboardHydration('redirect_to_portal', {
        reason: 'invalid_facilitator_session',
        path: location.pathname,
        program_code: programCode ?? null,
        role,
        has_unlock: Boolean(hasUnlock),
        route_allowed: isPortalRoleAllowed(location.pathname),
      });
      clearProgramPortalContext();
      navigate(PORTAL_PATH, {
        replace: true,
        state: {
          redirect: location.pathname,
          message: 'Your facilitator session needs to be reopened.',
          reason: 'invalid_facilitator_session',
        },
      });
    }
  }, [hasActiveProgram, hasUnlock, isIndependentFamily, location.pathname, navigate, programCode, role, sessionValid]);

  const dismissWelcome = useCallback(() => {
    searchParams.delete('welcome');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  if (!activeProgram) {
    return null;
  }

  return (
    <FacilitatorOverviewCoachProvider
      enabled={showOverviewCoach}
      programCode={programCode}
      activeProgram={activeProgram}
      sharedProgramGoals={goalsRecord}
    >
    <AppShell
      variant="facilitator"
      shellClassName={mobileNavShellClass}
      rightRail={
        showOverviewCoach ? (
          <Suspense fallback={null}>
            <FacilitatorOverviewCoachRail />
          </Suspense>
        ) : undefined
      }
      sidebar={
        showMobileNav && isMobileNav ? null : (
          <PilotDashboardSidebar
            activeId={activeNav}
            onSelect={handleSelectNav}
            navItems={PROGRAM_SIDEBAR_NAV}
            programCode={programCode}
            pricingTier={activeProgram.pricingTier}
            showSupportCard={false}
          />
        )
      }
      topBar={
        <PilotDashboardTopBar
          pageTitle={pageTitle}
          onOpenProgramGoals={openGoalsDrawer}
          mobileFacilitatorNav={showMobileNav && isMobileNav}
        />
      }
      footer={<footer className="pilot-miniFooter">© 2026 Caiden&apos;s Courage™ Pilot Materials</footer>}
    >
      {showWelcome && !isKidsRoute && activeNav === 'overview' ? (
        <PilotProgramWelcomeCard program={activeProgram} onDismiss={dismissWelcome} />
      ) : null}
      <Suspense
        fallback={
          <PortalRouteLoader
            message={isKidsRoute ? 'Loading game...' : 'Loading dashboard...'}
            academy={isKidsRoute}
          />
        }
      >
        <Outlet key={resolvePortalOutletKey(location.pathname, location.search)} />
      </Suspense>

      <GoalsOnboardingDrawer
        open={goalsOpen}
        onClose={closeGoalsDrawer}
        portalType="facilitator"
        programCode={programCode ?? ''}
        initialRecord={goalsRecord}
        onSave={saveGoals}
        onRemindLater={remindGoalsLater}
        onSkip={skipGoalsForNow}
      />

      <FacilitatorPortalMobileChrome
        isMobileNav={showMobileNav && isMobileNav}
        moreOpen={moreOpen}
        onOpenMore={openMore}
        onCloseMore={closeMore}
        programCode={programCode}
        pricingTier={activeProgram.pricingTier}
      />
    </AppShell>
    </FacilitatorOverviewCoachProvider>
  );
}
