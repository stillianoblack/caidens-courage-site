import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import PilotDashboardSidebar from '../components/pilot-dashboard/PilotDashboardSidebar';
import PilotDashboardTopBar from '../components/pilot-dashboard/PilotDashboardTopBar';
import PortalShell from '../components/portal/PortalShell';
import PilotActivitiesPanel from '../components/pilot-dashboard/panels/PilotActivitiesPanel';
import PilotAssessmentsPanel from '../components/pilot-dashboard/panels/PilotAssessmentsPanel';
import PilotCertificatesPanel from '../components/pilot-dashboard/panels/PilotCertificatesPanel';
import PilotFacilitatorPanel from '../components/pilot-dashboard/panels/PilotFacilitatorPanel';
import PilotGalleryPanel from '../components/pilot-dashboard/panels/PilotGalleryPanel';
import PilotOverviewPanel from '../components/pilot-dashboard/panels/PilotOverviewPanel';
import PilotResultsPanel from '../components/pilot-dashboard/panels/PilotResultsPanel';
import PilotWeeklyModulesPanel from '../components/pilot-dashboard/panels/PilotWeeklyModulesPanel';
import PilotProgramWelcomeCard from '../components/pilot-program/PilotProgramWelcomeCard';
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
  PROGRAM_BASELINE_CHECK_PATH,
  PROGRAM_DASHBOARD_KIDS_BASE,
  PROGRAM_DASHBOARD_PATH,
} from '../config/courageRoutes';
import {
  PILOT_DASHBOARD_TITLE,
  PROGRAM_SIDEBAR_NAV,
  type PilotSidebarNavId,
} from '../data/pilotDashboardContent';
import { usePilotTrackingResults } from '../hooks/usePilotTrackingResults';
import { afterIdle } from '../lib/defer';
import { requestGalleryCountsRefresh } from '../lib/galleryNavCounts';
import { resolvePortalPageTitle } from '../lib/familyPortalNav';
import { resetPortalScroll } from '../lib/portalScroll';
import { resolvePortalRailBrand } from '../lib/portalGamePaths';

const NAV_TITLE: Record<PilotSidebarNavId, string> = Object.fromEntries(
  PROGRAM_SIDEBAR_NAV.map((item) => [item.id, item.label]),
) as Record<PilotSidebarNavId, string>;

const VALID_NAV_IDS = new Set(PROGRAM_SIDEBAR_NAV.map((item) => item.id));

type TrackingPanelProps = {
  metrics: ReturnType<typeof usePilotTrackingResults>['metrics'];
  loading: boolean;
  source: ReturnType<typeof usePilotTrackingResults>['source'];
  warning?: string;
  results: ReturnType<typeof usePilotTrackingResults>['legacyResults'];
  resultsVersion: number;
  onSelectNav: (id: PilotSidebarNavId) => void;
  activeProgram: NonNullable<ReturnType<typeof readActivePilotProgram>>;
};

function renderFacilitatorPanel(
  activeNav: PilotSidebarNavId,
  tracking: TrackingPanelProps,
  programCode: string | undefined,
): React.ReactNode {
  switch (activeNav) {
    case 'weekly-modules':
      return <PilotWeeklyModulesPanel />;
    case 'activities-library':
      return <PilotActivitiesPanel />;
    case 'assessments':
      return <PilotAssessmentsPanel baselineHref={PROGRAM_BASELINE_CHECK_PATH} />;
    case 'results':
      return (
        <PilotResultsPanel
          refreshKey={tracking.resultsVersion}
          results={tracking.results}
          metrics={tracking.metrics}
          source={tracking.source}
          warning={tracking.warning}
          loading={tracking.loading}
        />
      );
    case 'certificates':
      return <PilotCertificatesPanel />;
    case 'student-gallery':
      return (
        <PilotGalleryPanel programCode={programCode} groupName={tracking.activeProgram.groupName} />
      );
    case 'facilitator-center':
      return <PilotFacilitatorPanel />;
    case 'overview':
    default:
      return (
        <PilotOverviewPanel
          metrics={tracking.metrics}
          loading={tracking.loading}
          source={tracking.source}
          warning={tracking.warning}
          onSelectNav={tracking.onSelectNav}
          activeProgram={tracking.activeProgram}
        />
      );
  }
}

export default function ProgramDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeProgram = readActivePilotProgram();
  const [resultsVersion, setResultsVersion] = useState(0);
  const showWelcome = searchParams.get('welcome') === '1';

  const isKidsRoute = location.pathname.startsWith(`${PROGRAM_DASHBOARD_KIDS_BASE}/`);
  const brand = resolvePortalRailBrand();
  const programCode = activeProgram?.programCode;
  const role = readActivePortalRole();
  const hasUnlock = readPortalSessionUnlock();
  const sessionValid = Boolean(
    activeProgram && role === 'facilitator' && hasUnlock,
  );

  const activeNav = useMemo<PilotSidebarNavId>(() => {
    const hash = location.hash.replace('#', '') as PilotSidebarNavId;
    return hash && VALID_NAV_IDS.has(hash) ? hash : 'overview';
  }, [location.hash]);
  const pageTitle = isKidsRoute
    ? resolvePortalPageTitle(location.pathname, PROGRAM_DASHBOARD_PATH)
    : NAV_TITLE[activeNav];

  const needsTracking = activeNav === 'overview' || activeNav === 'results';
  const { metrics, legacyResults: results, source, warning, loading } = usePilotTrackingResults(
    resultsVersion,
    programCode,
    needsTracking && sessionValid,
  );

  useEffect(() => {
    document.title = `${PILOT_DASHBOARD_TITLE} | Caiden's Courage`;
  }, []);

  useEffect(() => {
    if (sessionValid) {
      afterIdle(() => requestGalleryCountsRefresh());
    }
  }, [sessionValid]);

  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (activeNav === 'results' || activeNav === 'overview') {
      setResultsVersion((v) => v + 1);
    }
  }, [activeNav]);

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

  const handleSelectNav = useCallback(
    (id: PilotSidebarNavId) => {
      resetPortalScroll();
      if (isKidsRoute) {
        navigate(`${PROGRAM_DASHBOARD_PATH}#${id}`);
        return;
      }
      navigate({ hash: `#${id}` }, { replace: true });
    },
    [isKidsRoute, navigate],
  );

  const dismissWelcome = useCallback(() => {
    searchParams.delete('welcome');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  if (!activeProgram) {
    return null;
  }

  const trackingProps: TrackingPanelProps = {
    metrics,
    loading,
    source,
    warning,
    results,
    resultsVersion,
    onSelectNav: handleSelectNav,
    activeProgram,
  };

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
      {isKidsRoute ? (
        <Outlet />
      ) : (
        <div className="pilot-tabPanel" role="tabpanel">
          {showWelcome ? (
            <PilotProgramWelcomeCard program={activeProgram} onDismiss={dismissWelcome} />
          ) : null}
          {renderFacilitatorPanel(activeNav, trackingProps, programCode)}
        </div>
      )}
    </PortalShell>
  );
}
