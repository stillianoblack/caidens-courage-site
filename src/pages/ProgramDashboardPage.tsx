import React, { Suspense, useCallback, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import PilotDashboardSidebar from '../components/pilot-dashboard/PilotDashboardSidebar';
import PilotDashboardTopBar from '../components/pilot-dashboard/PilotDashboardTopBar';
import PortalShell from '../components/portal/PortalShell';
import PilotProgramWelcomeCard from '../components/pilot-program/PilotProgramWelcomeCard';
import PortalRouteLoader from '../components/portal/PortalRouteLoader';
import '../components/portal/portal-header.css';
import '../components/pilot-dashboard/pilot-dashboard.css';
import '../components/pilot-program/pilot-program.css';
import '../components/portal/portal-shell.css';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { clearProgramPortalContext, readActivePortalRole } from '../config/portalContext';
import { readPortalSessionUnlock } from '../config/portalAccess';
import {
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
  const sessionValid = Boolean(activeProgram && role === 'facilitator' && hasUnlock);
  const handleSelectNav = useProgramDashboardNav();

  const pageTitle = isKidsRoute
    ? resolvePortalPageTitle(location.pathname, PROGRAM_DASHBOARD_PATH)
    : NAV_TITLE[activeNav];

  useEffect(() => {
    document.title = `${PILOT_DASHBOARD_TITLE} | Caiden's Courage`;
  }, []);

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
    if (!sessionValid) {
      clearProgramPortalContext();
      navigate(PORTAL_PATH, { replace: true, state: { redirect: PROGRAM_DASHBOARD_PATH } });
    }
  }, [activeProgram, navigate, sessionValid]);

  const dismissWelcome = useCallback(() => {
    searchParams.delete('welcome');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  if (!activeProgram) {
    return null;
  }

  return (
    <PortalShell
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
          showSupportCard
        />
      }
      topBar={
        <PilotDashboardTopBar
          pageTitle={pageTitle}
          contextTitle={brand.title}
          contextSubtitle="Facilitator Portal"
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
    </PortalShell>
  );
}
