import React, { Suspense, useCallback, useEffect } from 'react';
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
  FAMILY_HUB_PATH,
  PILOT_PROGRAM_SIGNUP_PATH,
  PORTAL_PATH,
  PROGRAM_DASHBOARD_PATH,
} from '../config/courageRoutes';
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
import { resolvePortalRailBrand } from '../lib/portalGamePaths';
import { useProgramDashboardNav } from '../hooks/useProgramDashboardNav';
import { resolvePortalOutletKey } from '../lib/portalOutletKey';
import { isIndependentFamilyProgram } from '../lib/independentFamilyProgram';
import { isPortalRoleAllowed } from '../lib/portalSessionGuard';
import { prefetchFacilitatorPortalRoutes } from '../lib/portalRoutePrefetch';
import { useProgramGoalsOnboarding } from '../hooks/useProgramGoalsOnboarding';
import { OPEN_PROGRAM_GOALS_EVENT } from '../lib/openProgramGoals';

const NAV_TITLE: Record<PilotSidebarNavId, string> = Object.fromEntries(
  PROGRAM_SIDEBAR_NAV.map((item) => [item.id, item.label]),
) as Record<PilotSidebarNavId, string>;

const VALID_NAV_IDS = new Set(PROGRAM_SIDEBAR_NAV.map((item) => item.id));

export default function ProgramDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeProgram = readActivePilotProgram();
  const showWelcome = searchParams.get('welcome') === '1';

  const isKidsRoute = isProgramDashboardKidsPath(location.pathname);
  const activeNav = resolveProgramDashboardTab(location.pathname);
  const brand = resolvePortalRailBrand();
  const programCode = activeProgram?.programCode;
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

  const goalsOnboarding = useProgramGoalsOnboarding({
    programCode: programCode ?? '',
    portalType: 'facilitator',
    enabled: sessionValid && !isKidsRoute,
  });

  useEffect(() => {
    const handleOpenGoals = () => goalsOnboarding.openDrawer();
    window.addEventListener(OPEN_PROGRAM_GOALS_EVENT, handleOpenGoals);
    return () => window.removeEventListener(OPEN_PROGRAM_GOALS_EVENT, handleOpenGoals);
  }, [goalsOnboarding.openDrawer]);

  useEffect(() => {
    if (searchParams.get('openGoals') !== '1') return;
    goalsOnboarding.openDrawer();
    const next = new URLSearchParams(searchParams);
    next.delete('openGoals');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, goalsOnboarding.openDrawer]);

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
    if (!activeProgram) {
      navigate(PILOT_PROGRAM_SIGNUP_PATH, { replace: true });
      return;
    }
    if (isIndependentFamily) {
      navigate(FAMILY_HUB_PATH, { replace: true });
      return;
    }
    if (!sessionValid) {
      clearProgramPortalContext();
      navigate(PORTAL_PATH, { replace: true, state: { redirect: PROGRAM_DASHBOARD_PATH } });
    }
  }, [activeProgram, isIndependentFamily, navigate, sessionValid]);

  const dismissWelcome = useCallback(() => {
    searchParams.delete('welcome');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  if (!activeProgram) {
    return null;
  }

  return (
    <AppShell
      variant="facilitator"
      sidebar={
        <PilotDashboardSidebar
          activeId={activeNav}
          onSelect={handleSelectNav}
          brandTitle={brand.title}
          brandSubtitle={brand.subtitle}
          navItems={PROGRAM_SIDEBAR_NAV}
          programCode={programCode}
          pricingTier={activeProgram.pricingTier}
          showSupportCard={false}
        />
      }
      topBar={
        <PilotDashboardTopBar
          pageTitle={pageTitle}
          onOpenProgramGoals={goalsOnboarding.openDrawer}
        />
      }
      footer={<footer className="pilot-miniFooter">© 2026 Caiden&apos;s Courage™ Pilot Materials</footer>}
    >
      {showWelcome && !isKidsRoute && activeNav === 'overview' ? (
        <PilotProgramWelcomeCard program={activeProgram} onDismiss={dismissWelcome} />
      ) : null}
      <Suspense
        fallback={
          <PortalRouteLoader message={isKidsRoute ? 'Loading game...' : 'Loading dashboard...'} />
        }
      >
        <Outlet key={resolvePortalOutletKey(location.pathname, location.search)} />
      </Suspense>

      <GoalsOnboardingDrawer
        open={goalsOnboarding.open}
        onClose={goalsOnboarding.closeDrawer}
        portalType="facilitator"
        programCode={programCode ?? ''}
        initialRecord={goalsOnboarding.record}
        onSave={goalsOnboarding.saveGoals}
        onRemindLater={goalsOnboarding.remindLater}
        onSkip={goalsOnboarding.skipForNow}
      />
    </AppShell>
  );
}
