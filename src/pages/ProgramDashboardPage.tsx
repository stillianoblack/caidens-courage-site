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
import PortalAccessRequired from '../components/portal/PortalAccessRequired';
import { readActivePortalRole } from '../config/portalContext';
import {
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
import { requestGalleryCountsRefresh } from '../lib/galleryNavCounts';
import { resolvePortalPageTitle } from '../lib/familyPortalNav';
import { resolveActivePilotProgram } from '../lib/portalProgramRestore';
import { resetPortalScroll } from '../lib/portalScroll';
import { PORTAL_ROLE_MISMATCH_MESSAGE } from '../lib/portalSessionGuard';
import { resolvePortalRailBrand } from '../lib/portalGamePaths';

const NAV_TITLE: Record<PilotSidebarNavId, string> = Object.fromEntries(
  PROGRAM_SIDEBAR_NAV.map((item) => [item.id, item.label]),
) as Record<PilotSidebarNavId, string>;

const VALID_NAV_IDS = new Set(PROGRAM_SIDEBAR_NAV.map((item) => item.id));

export default function ProgramDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeProgram = resolveActivePilotProgram();
  const activeRole = readActivePortalRole();
  const sessionOk = activeRole === 'facilitator' && Boolean(activeProgram);
  const [resultsVersion, setResultsVersion] = useState(0);
  const showWelcome = searchParams.get('welcome') === '1';

  const isKidsRoute = location.pathname.startsWith(`${PROGRAM_DASHBOARD_KIDS_BASE}/`);
  const brand = resolvePortalRailBrand();
  const programCode = activeProgram?.programCode;
  const activeNav = useMemo<PilotSidebarNavId>(() => {
    const hash = location.hash.replace('#', '') as PilotSidebarNavId;
    return hash && VALID_NAV_IDS.has(hash) ? hash : 'overview';
  }, [location.hash]);
  const pageTitle = isKidsRoute
    ? resolvePortalPageTitle(location.pathname, PROGRAM_DASHBOARD_PATH)
    : NAV_TITLE[activeNav];

  const { metrics, legacyResults: results, source, warning, loading } = usePilotTrackingResults(
    resultsVersion,
    programCode,
  );

  useEffect(() => {
    document.title = `${PILOT_DASHBOARD_TITLE} | Caiden's Courage`;
  }, []);

  useEffect(() => {
    requestGalleryCountsRefresh();
  }, []);

  const didMountRef = useRef(false);
  useEffect(() => {
    // Refresh results when user switches to overview/results tab.
    // Skip the initial mount (resultsVersion starts at 0).
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (activeNav === 'results' || activeNav === 'overview') {
      setResultsVersion((v) => v + 1);
    }
  }, [activeNav]);

  useEffect(() => {
    if (sessionOk) {
      resetPortalScroll();
    }
  }, [location.pathname, sessionOk]);

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

  if (activeRole === 'family') {
    return <PortalAccessRequired message={PORTAL_ROLE_MISMATCH_MESSAGE} />;
  }

  if (!sessionOk || !activeProgram) {
    return <PortalAccessRequired />;
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
      {isKidsRoute ? (
        <Outlet />
      ) : (
        <>
          {showWelcome ? (
            <PilotProgramWelcomeCard program={activeProgram} onDismiss={dismissWelcome} />
          ) : null}

          <div role="tabpanel" hidden={activeNav !== 'overview'} className="pilot-tabPanel">
            <PilotOverviewPanel
              metrics={metrics}
              loading={loading}
              source={source}
              warning={warning}
              onSelectNav={handleSelectNav}
              activeProgram={activeProgram}
            />
          </div>

          <div role="tabpanel" hidden={activeNav !== 'weekly-modules'} className="pilot-tabPanel">
            <PilotWeeklyModulesPanel />
          </div>

          <div role="tabpanel" hidden={activeNav !== 'activities-library'} className="pilot-tabPanel">
            <PilotActivitiesPanel />
          </div>

          <div role="tabpanel" hidden={activeNav !== 'assessments'} className="pilot-tabPanel">
            <PilotAssessmentsPanel baselineHref={PROGRAM_BASELINE_CHECK_PATH} />
          </div>

          <div role="tabpanel" hidden={activeNav !== 'results'} className="pilot-tabPanel">
            <PilotResultsPanel
              refreshKey={resultsVersion}
              results={results}
              metrics={metrics}
              source={source}
              warning={warning}
              loading={loading}
            />
          </div>

          <div role="tabpanel" hidden={activeNav !== 'certificates'} className="pilot-tabPanel">
            <PilotCertificatesPanel />
          </div>

          <div role="tabpanel" hidden={activeNav !== 'student-gallery'} className="pilot-tabPanel">
            <PilotGalleryPanel programCode={programCode} groupName={activeProgram.groupName} />
          </div>

          <div role="tabpanel" hidden={activeNav !== 'facilitator-center'} className="pilot-tabPanel">
            <PilotFacilitatorPanel />
          </div>
        </>
      )}
    </PortalShell>
  );
}
