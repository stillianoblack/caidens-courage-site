import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PilotDashboardSidebar from '../components/pilot-dashboard/PilotDashboardSidebar';
import PilotDashboardTopBar from '../components/pilot-dashboard/PilotDashboardTopBar';
import PilotActivitiesPanel from '../components/pilot-dashboard/panels/PilotActivitiesPanel';
import PilotAssessmentsPanel from '../components/pilot-dashboard/panels/PilotAssessmentsPanel';
import PilotB4ResultsPanel from '../components/pilot-dashboard/panels/PilotB4ResultsPanel';
import PilotCertificatesPanel from '../components/pilot-dashboard/panels/PilotCertificatesPanel';
import PilotFacilitatorPanel from '../components/pilot-dashboard/panels/PilotFacilitatorPanel';
import PilotGalleryPanel from '../components/pilot-dashboard/panels/PilotGalleryPanel';
import PilotOverviewPanel from '../components/pilot-dashboard/panels/PilotOverviewPanel';
import PilotResultsPanel from '../components/pilot-dashboard/panels/PilotResultsPanel';
import PilotWeeklyModulesPanel from '../components/pilot-dashboard/panels/PilotWeeklyModulesPanel';
import '../components/pilot-dashboard/pilot-dashboard.css';
import {
  FACILITATOR_B4_BASELINE_RESULTS_PATH,
  FACILITATOR_B4_RESULTS_PATH,
  FACILITATOR_PORTAL_PATH,
  FACILITATOR_BASELINE_CHECK_PATH,
  PORTAL_PATH,
} from '../config/courageRoutes';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { readPilotDashboardSession } from '../config/pilotDashboardAccess';
import {
  PILOT_DASHBOARD_TITLE,
  PILOT_SIDEBAR_NAV,
  type PilotSidebarNavId,
} from '../data/pilotDashboardContent';
import { usePilotTrackingResults } from '../hooks/usePilotTrackingResults';
import { requestGalleryCountsRefresh } from '../lib/galleryNavCounts';
import { resolvePortalRailBrand } from '../lib/portalGamePaths';

const NAV_TITLE: Record<PilotSidebarNavId, string> = Object.fromEntries(
  PILOT_SIDEBAR_NAV.map((item) => [item.id, item.label]),
) as Record<PilotSidebarNavId, string>;

const VALID_NAV_IDS = new Set(PILOT_SIDEBAR_NAV.map((item) => item.id));

function isB4ResultsRoute(pathname: string): boolean {
  return (
    pathname.startsWith(FACILITATOR_B4_RESULTS_PATH) ||
    pathname.startsWith(FACILITATOR_B4_BASELINE_RESULTS_PATH)
  );
}

type TrackingPanelProps = {
  metrics: ReturnType<typeof usePilotTrackingResults>['metrics'];
  loading: boolean;
  source: ReturnType<typeof usePilotTrackingResults>['source'];
  warning?: string;
  results: ReturnType<typeof usePilotTrackingResults>['legacyResults'];
  resultsVersion: number;
  onSelectNav: (id: PilotSidebarNavId) => void;
};

function renderFacilitatorPanel(
  activeNav: PilotSidebarNavId,
  tracking: TrackingPanelProps,
  programCode: string | undefined,
  groupName?: string,
): React.ReactNode {
  switch (activeNav) {
    case 'weekly-modules':
      return <PilotWeeklyModulesPanel />;
    case 'activities-library':
      return <PilotActivitiesPanel />;
    case 'assessments':
      return <PilotAssessmentsPanel baselineHref={FACILITATOR_BASELINE_CHECK_PATH} />;
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
      return <PilotGalleryPanel programCode={programCode} groupName={groupName} />;
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
        />
      );
  }
}

/**
 * Focus Flame Academy paid pilot dashboard — Blue Ribbon camp command center.
 */
export default function PilotDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionType = readPilotDashboardSession();
  const [resultsVersion, setResultsVersion] = useState(0);

  const isB4Results = useMemo(() => isB4ResultsRoute(location.pathname), [location.pathname]);
  const brand = resolvePortalRailBrand();
  const activeProgram = readActivePilotProgram();
  const programCode = activeProgram?.programCode;

  const activeNav = useMemo<PilotSidebarNavId>(() => {
    const hash = location.hash.replace('#', '') as PilotSidebarNavId;
    return hash && VALID_NAV_IDS.has(hash) ? hash : 'overview';
  }, [location.hash]);

  const pageTitle = isB4Results ? 'B-4 Baseline Check Results' : NAV_TITLE[activeNav];

  const needsTracking = activeNav === 'overview' || activeNav === 'results';
  const { metrics, legacyResults: results, source, warning, loading } = usePilotTrackingResults(
    resultsVersion,
    programCode,
    needsTracking && Boolean(sessionType),
  );

  useEffect(() => {
    document.title = `${PILOT_DASHBOARD_TITLE} | Caiden's Courage`;
  }, []);

  useEffect(() => {
    requestGalleryCountsRefresh();
  }, []);

  useEffect(() => {
    if (!sessionType) {
      navigate(PORTAL_PATH, { replace: true, state: { redirect: location.pathname } });
    }
  }, [location.pathname, navigate, sessionType]);

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

  const handleSelectNav = useCallback(
    (id: PilotSidebarNavId) => {
      if (isB4Results) {
        navigate(`${FACILITATOR_PORTAL_PATH}#${id}`);
        return;
      }
      navigate({ hash: `#${id}` }, { replace: true });
    },
    [isB4Results, navigate],
  );

  if (!sessionType) {
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
  };

  return (
    <div className="pilot-shell">
      <PilotDashboardSidebar
        activeId={isB4Results ? 'results' : activeNav}
        onSelect={handleSelectNav}
        brandTitle={brand.title}
        brandSubtitle={brand.subtitle}
        programCode={programCode}
      />

      <div className="pilot-main">
        <PilotDashboardTopBar
          pageTitle={pageTitle}
          contextTitle={brand.title}
          contextSubtitle="Facilitator Portal"
        />

        <div className="pilot-content">
          {isB4Results ? (
            <PilotB4ResultsPanel />
          ) : (
            <div className="pilot-tabPanel" role="tabpanel" key={location.hash || '#overview'}>
              {renderFacilitatorPanel(activeNav, trackingProps, programCode, activeProgram?.groupName)}
            </div>
          )}
        </div>

        <footer className="pilot-miniFooter">© 2026 Caiden&apos;s Courage™ Pilot Materials</footer>
      </div>
    </div>
  );
}
