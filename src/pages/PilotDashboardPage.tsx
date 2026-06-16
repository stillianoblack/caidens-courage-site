import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PilotDashboardSidebar from '../components/pilot-dashboard/PilotDashboardSidebar';
import PilotDashboardTopBar from '../components/pilot-dashboard/PilotDashboardTopBar';
import PilotActivitiesPanel from '../components/pilot-dashboard/panels/PilotActivitiesPanel';
import PilotAssessmentsPanel from '../components/pilot-dashboard/panels/PilotAssessmentsPanel';
import PilotCertificatesPanel from '../components/pilot-dashboard/panels/PilotCertificatesPanel';
import PilotFacilitatorPanel from '../components/pilot-dashboard/panels/PilotFacilitatorPanel';
import PilotGalleryPanel from '../components/pilot-dashboard/panels/PilotGalleryPanel';
import PilotOverviewPanel from '../components/pilot-dashboard/panels/PilotOverviewPanel';
import PilotRosterPanel from '../components/pilot-dashboard/panels/PilotRosterPanel';
import PilotResultsPanel from '../components/pilot-dashboard/panels/PilotResultsPanel';
import PilotWeeklyModulesPanel from '../components/pilot-dashboard/panels/PilotWeeklyModulesPanel';
import '../components/pilot-dashboard/pilot-dashboard.css';
import '../components/portal-design-system/portal-design-system.css';
import '../components/portal/portal-shell.css';
import { FACILITATOR_BASELINE_CHECK_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { resolveFacilitatorRosterProgramCode } from '../lib/resolveFacilitatorRosterProgramCode';
import { readPilotDashboardSession } from '../config/pilotDashboardAccess';
import {
  PILOT_DASHBOARD_TITLE,
  PILOT_SIDEBAR_NAV,
  type PilotSidebarNavId,
} from '../data/pilotDashboardContent';
import { usePilotTrackingResults } from '../hooks/usePilotTrackingResults';
import { requestGalleryCountsRefresh } from '../lib/galleryNavCounts';
import { resolvePortalRailBrand } from '../lib/portalGamePaths';
import { B4Assistant } from '../components/portal-design-system';
import FacilitatorPortalMobileChrome, {
  facilitatorMobileNavShellClass,
} from '../components/pilot-dashboard/FacilitatorPortalMobileChrome';
import { useFacilitatorMobileNav } from '../hooks/useFacilitatorMobileNav';
import '../components/pilot-dashboard/facilitator-mobile-nav.css';

const NAV_TITLE: Record<PilotSidebarNavId, string> = Object.fromEntries(
  PILOT_SIDEBAR_NAV.map((item) => [item.id, item.label]),
) as Record<PilotSidebarNavId, string>;

const VALID_NAV_IDS = new Set(PILOT_SIDEBAR_NAV.map((item) => item.id));

type TrackingPanelProps = {
  metrics: ReturnType<typeof usePilotTrackingResults>['metrics'];
  loading: boolean;
  source: ReturnType<typeof usePilotTrackingResults>['source'];
  warning?: string;
  results: ReturnType<typeof usePilotTrackingResults>['legacyResults'];
  moduleResults: ReturnType<typeof usePilotTrackingResults>['moduleResults'];
  assessmentResults: ReturnType<typeof usePilotTrackingResults>['assessmentResults'];
  participantLookup: ReturnType<typeof usePilotTrackingResults>['participantLookup'];
  participants: ReturnType<typeof usePilotTrackingResults>['participants'];
  familyLinks: ReturnType<typeof usePilotTrackingResults>['familyLinks'];
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
          moduleResults={tracking.moduleResults}
          assessmentResults={tracking.assessmentResults}
          participantLookup={tracking.participantLookup}
          participants={tracking.participants}
          familyLinks={tracking.familyLinks}
          metrics={tracking.metrics}
          warning={tracking.warning}
          loading={tracking.loading}
        />
      );
    case 'roster':
      return <PilotRosterPanel programCode={programCode} loading={tracking.loading} />;
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
          moduleResults={tracking.moduleResults}
          assessmentResults={tracking.assessmentResults}
          participantLookup={tracking.participantLookup}
          participants={tracking.participants}
          familyLinks={tracking.familyLinks}
          loading={tracking.loading}
          warning={tracking.warning}
          onSelectNav={tracking.onSelectNav}
          activeProgram={readActivePilotProgram()}
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

  const brand = resolvePortalRailBrand();
  const activeProgram = readActivePilotProgram();
  const programCode = resolveFacilitatorRosterProgramCode(activeProgram?.programCode);

  const activeNav = useMemo<PilotSidebarNavId>(() => {
    const hash = location.hash.replace('#', '') as PilotSidebarNavId;
    return hash && VALID_NAV_IDS.has(hash) ? hash : 'overview';
  }, [location.hash]);

  const pageTitle = NAV_TITLE[activeNav];

  const needsTracking = activeNav === 'overview' || activeNav === 'results';
  const {
    metrics,
    legacyResults: results,
    moduleResults,
    assessmentResults,
    participantLookup,
    participants,
    familyLinks,
    source,
    warning,
    loading,
  } = usePilotTrackingResults(resultsVersion, programCode, needsTracking && Boolean(sessionType));

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
      navigate({ hash: `#${id}` }, { replace: true });
    },
    [navigate],
  );

  const { isMobileNav, moreOpen, openMore, closeMore } = useFacilitatorMobileNav();
  const mobileNavShellClass = facilitatorMobileNavShellClass(true, isMobileNav);

  if (!sessionType) {
    return null;
  }

  const trackingProps: TrackingPanelProps = {
    metrics,
    loading,
    source,
    warning,
    results,
    moduleResults,
    assessmentResults,
    participantLookup,
    participants,
    familyLinks,
    resultsVersion,
    onSelectNav: handleSelectNav,
  };

  return (
    <div className={['pilot-shell portal-shell', mobileNavShellClass].filter(Boolean).join(' ')}>
      {isMobileNav ? null : (
        <PilotDashboardSidebar
          activeId={activeNav}
          onSelect={handleSelectNav}
          brandTitle={brand.title}
          brandSubtitle={brand.subtitle}
          programCode={programCode}
        />
      )}

      <div className="pilot-main">
        <PilotDashboardTopBar
          pageTitle={pageTitle}
          mobileFacilitatorNav={isMobileNav}
        />

        <div className="pilot-content">
          <div className="pilot-tabPanel" role="tabpanel">
            {renderFacilitatorPanel(activeNav, trackingProps, programCode, activeProgram?.groupName)}
          </div>
        </div>

        <footer className="pilot-miniFooter">© 2026 Caiden&apos;s Courage™ Pilot Materials</footer>
      </div>

      <B4Assistant />

      <FacilitatorPortalMobileChrome
        isMobileNav={isMobileNav}
        moreOpen={moreOpen}
        onOpenMore={openMore}
        onCloseMore={closeMore}
        programCode={programCode}
        pricingTier={activeProgram?.pricingTier}
      />
    </div>
  );
}
