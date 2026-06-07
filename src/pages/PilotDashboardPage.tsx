import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  PORTAL_PATH,
} from '../config/courageRoutes';
import { readPilotDashboardSession } from '../config/pilotDashboardAccess';
import {
  PILOT_DASHBOARD_TITLE,
  PILOT_PAGE_SUBTITLES,
  PILOT_SIDEBAR_NAV,
  type PilotSidebarNavId,
} from '../data/pilotDashboardContent';
import { useAssessmentResults } from '../hooks/useAssessmentResults';

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

/**
 * Focus Flame Academy paid pilot dashboard — Blue Ribbon camp command center.
 */
export default function PilotDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionType = readPilotDashboardSession();
  const [activeNav, setActiveNav] = useState<PilotSidebarNavId>('overview');
  const [resultsVersion, setResultsVersion] = useState(0);

  const isB4Results = useMemo(() => isB4ResultsRoute(location.pathname), [location.pathname]);
  const pageTitle = isB4Results ? 'B-4 Baseline Check Results' : NAV_TITLE[activeNav];
  const pageSubtitle = isB4Results ? undefined : PILOT_PAGE_SUBTITLES[activeNav];

  const { metrics, results, source, warning, loading } = useAssessmentResults(resultsVersion);

  useEffect(() => {
    document.title = `${PILOT_DASHBOARD_TITLE} | Caiden's Courage`;
  }, []);

  useEffect(() => {
    if (!sessionType) {
      navigate(PORTAL_PATH, { replace: true, state: { redirect: location.pathname } });
    }
  }, [location.pathname, navigate, sessionType]);

  useEffect(() => {
    const hash = location.hash.replace('#', '') as PilotSidebarNavId;
    if (hash && VALID_NAV_IDS.has(hash)) {
      setActiveNav(hash);
    }
  }, [location.hash]);

  const handleSelectNav = useCallback(
    (id: PilotSidebarNavId) => {
      setActiveNav(id);
      if (id === 'results' || id === 'overview') {
        setResultsVersion((v) => v + 1);
      }
      if (isB4Results) {
        navigate(FACILITATOR_PORTAL_PATH);
      }
    },
    [isB4Results, navigate],
  );

  if (!sessionType) {
    return null;
  }

  return (
    <div className="pilot-shell">
      <PilotDashboardSidebar
        activeId={isB4Results ? 'results' : activeNav}
        onSelect={handleSelectNav}
      />

      <div className="pilot-main">
        <PilotDashboardTopBar pageTitle={pageTitle} pageSubtitle={pageSubtitle} />

        <div className="pilot-content">
          {isB4Results ? (
            <PilotB4ResultsPanel />
          ) : (
            <>
              <div role="tabpanel" hidden={activeNav !== 'overview'} className="pilot-tabPanel">
                <PilotOverviewPanel
                  metrics={metrics}
                  loading={loading}
                  source={source}
                  warning={warning}
                  onSelectNav={handleSelectNav}
                />
              </div>

              <div role="tabpanel" hidden={activeNav !== 'weekly-modules'} className="pilot-tabPanel">
                <PilotWeeklyModulesPanel />
              </div>

              <div role="tabpanel" hidden={activeNav !== 'activities-library'} className="pilot-tabPanel">
                <PilotActivitiesPanel />
              </div>

              <div role="tabpanel" hidden={activeNav !== 'assessments'} className="pilot-tabPanel">
                <PilotAssessmentsPanel />
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
                <PilotGalleryPanel />
              </div>

              <div role="tabpanel" hidden={activeNav !== 'facilitator-center'} className="pilot-tabPanel">
                <PilotFacilitatorPanel />
              </div>
            </>
          )}
        </div>

        <footer className="pilot-miniFooter">© 2026 Caiden&apos;s Courage™ Pilot Materials</footer>
      </div>
    </div>
  );
}
