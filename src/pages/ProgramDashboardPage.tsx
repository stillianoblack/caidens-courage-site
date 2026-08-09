import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import PilotDashboardSidebar from '../components/pilot-dashboard/PilotDashboardSidebar';
import PilotDashboardTopBar from '../components/pilot-dashboard/PilotDashboardTopBar';
import { AppShell } from '../components/portal-design-system';
import PilotProgramWelcomeCard from '../components/pilot-program/PilotProgramWelcomeCard';
import PortalRouteLoader from '../components/portal/PortalRouteLoader';
import FacilitatorPortalBootScreen from '../components/portal/FacilitatorPortalBootScreen';
import PortalAccessRequired from '../components/portal/PortalAccessRequired';
import { GoalsOnboardingDrawer } from '../components/portal-design-system';
import '../components/portal-design-system/portal-design-system.css';
import '../components/portal/portal-header.css';
import '../components/pilot-dashboard/pilot-dashboard.css';
import '../components/pilot-program/pilot-program.css';
import '../components/portal/portal-shell.css';
import { readActivePortalRole } from '../config/portalContext';
import { readPortalSessionUnlock } from '../config/portalAccess';
import { PROGRAM_DASHBOARD_PATH } from '../config/courageRoutes';
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
import FacilitatorAdventureSnapshot, {
  type FacilitatorAdventureSnapshotData,
} from '../components/pilot-dashboard/FacilitatorAdventureSnapshot';
import {
  FACILITATOR_BOOT_EXIT_MS,
  useFacilitatorPortalBoot,
} from '../hooks/useFacilitatorPortalBoot';

const FacilitatorOverviewCoachRail = lazy(
  () => import('../components/pilot-dashboard/coach/FacilitatorOverviewCoachRail'),
);

const NAV_TITLE: Record<PilotSidebarNavId, string> = Object.fromEntries(
  PROGRAM_SIDEBAR_NAV.map((item) => [item.id, item.label]),
) as Record<PilotSidebarNavId, string>;
NAV_TITLE['weekly-modules'] = 'Weekly Modules';
NAV_TITLE.results = 'Training + Results';
NAV_TITLE.certificates = 'Library';

const VALID_NAV_IDS = new Set(PROGRAM_SIDEBAR_NAV.map((item) => item.id));

export default function ProgramDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state: bootState, program: activeProgram, retry: retryBoot } = useFacilitatorPortalBoot();
  const [bootVisible, setBootVisible] = useState(true);
  const showWelcome = searchParams.get('welcome') === '1';
  const [rosterSnapshot, setRosterSnapshot] = useState<FacilitatorAdventureSnapshotData | null>(null);

  useEffect(() => {
    if (bootState !== 'ready') {
      setBootVisible(true);
      return;
    }
    const timer = window.setTimeout(() => setBootVisible(false), FACILITATOR_BOOT_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [bootState]);

  const isKidsRoute = isProgramDashboardKidsPath(location.pathname);
  const activeNav = resolveProgramDashboardTab(location.pathname);
  const showOverviewCoach = !isKidsRoute && activeNav === 'overview';
  const programCode = activeProgram?.programCode;
  const role = readActivePortalRole();
  const hasUnlock = readPortalSessionUnlock();
  const isIndependentFamily = isIndependentFamilyProgram(activeProgram);
  const sessionValid = bootState === 'ready' && Boolean(
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
  const dashboardShellClass = [
    mobileNavShellClass,
    activeNav === 'roster' && rosterSnapshot ? 'pilot-shell--rosterRail' : '',
  ].filter(Boolean).join(' ');

  useEffect(() => {
    clearPageTransitionOverlay();
  }, []);

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
    if (isIndependentFamily) {
      navigate(resolveFamilyKidDefaultLandingPath(), { replace: true });
    }
  }, [isIndependentFamily, navigate]);

  const dismissWelcome = useCallback(() => {
    searchParams.delete('welcome');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  if (bootVisible && (bootState === 'booting' || bootState === 'ready' || bootState === 'recoverable_error')) {
    return (
      <FacilitatorPortalBootScreen
        state={bootState}
        exiting={bootState === 'ready'}
        onRetry={retryBoot}
      />
    );
  }

  if (!activeProgram || !sessionValid) {
    return (
      <PortalAccessRequired
        message="We couldn’t restore your facilitator session. Retry, or return to Enter the World to sign in again."
        showRetry
        linkLabel="Return to Enter the World"
      />
    );
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
      shellClassName={dashboardShellClass}
      rightRail={
        activeNav === 'roster' && rosterSnapshot ? (
          <FacilitatorAdventureSnapshot data={rosterSnapshot} placement="rail" />
        ) : showOverviewCoach ? (
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
      <Suspense fallback={<PortalRouteLoader message="Loading Focus Flame Academy..." academy fullScreen />}>
        <Outlet
          key={resolvePortalOutletKey(location.pathname, location.search)}
          context={{ setRosterSnapshot }}
        />
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
