import React, { Suspense, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import FamilyDashboardSidebar from '../components/family-portal/FamilyDashboardSidebar';
import FamilyDashboardTopBar from '../components/family-portal/FamilyDashboardTopBar';
import { AppShell, GoalsOnboardingDrawer } from '../components/portal-design-system';
import '../components/portal-design-system/portal-design-system.css';
import '../components/portal/portal-header.css';
import '../components/family-portal/family-dashboard.css';
import '../components/portal/portal-shell.css';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { FAMILY_PORTAL_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { requestGalleryCountsRefresh } from '../lib/galleryNavCounts';
import { readLegacyFamilyPortalSession } from '../config/familyPortalAccess';
import { afterIdle } from '../lib/defer';
import { FAMILY_PORTAL_TITLE, FAMILY_SIDEBAR_NAV } from '../data/familyPortalContent';
import { resolvePortalRailBrand } from '../lib/portalGamePaths';
import { resolvePortalPageTitle } from '../lib/familyPortalNav';
import PortalRouteLoader from '../components/portal/PortalRouteLoader';
import { resolvePortalOutletKey } from '../lib/portalOutletKey';
import { prefetchFamilyPortalRoutes } from '../lib/portalRoutePrefetch';
import { ensureFamilyPortalProgramSync } from '../lib/portalProgramAssignment';
import { useProgramGoalsOnboarding } from '../hooks/useProgramGoalsOnboarding';
import { OPEN_PROGRAM_GOALS_EVENT } from '../lib/openProgramGoals';

export default function FamilyPortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasSession = readLegacyFamilyPortalSession();
  const brand = resolvePortalRailBrand();
  const pageTitle = resolvePortalPageTitle(location.pathname);
  const activeProgram = readActivePilotProgram();
  const programCode = activeProgram?.programCode ?? '';

  const {
    open: goalsOpen,
    openDrawer: openGoalsDrawer,
    closeDrawer: closeGoalsDrawer,
    record: goalsRecord,
    saveGoals,
    remindLater: remindGoalsLater,
    skipForNow: skipGoalsForNow,
  } = useProgramGoalsOnboarding({
    programCode,
    portalType: 'family',
    enabled: hasSession && Boolean(programCode),
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

  useEffect(() => {
    document.title = `${FAMILY_PORTAL_TITLE} | Caiden's Courage`;
    if (hasSession) {
      ensureFamilyPortalProgramSync();
    }
    prefetchFamilyPortalRoutes();
  }, [hasSession]);

  useEffect(() => {
    afterIdle(() => requestGalleryCountsRefresh());
  }, []);

  useEffect(() => {
    if (!hasSession) {
      navigate(PORTAL_PATH, { replace: true, state: { redirect: FAMILY_PORTAL_PATH } });
    }
  }, [hasSession, navigate]);

  if (!hasSession) {
    return null;
  }

  return (
    <AppShell
      variant="family"
      sidebar={
        <FamilyDashboardSidebar
          navItems={FAMILY_SIDEBAR_NAV}
          brandTitle={brand.title}
          brandSubtitle={brand.subtitle}
          programCode={programCode}
        />
      }
      topBar={
        <FamilyDashboardTopBar
          pageTitle={pageTitle}
          contextTitle={brand.title}
          contextSubtitle="Family Portal"
          onOpenProgramGoals={openGoalsDrawer}
        />
      }
      footer={
        <footer className="family-miniFooter">© 2026 Caiden&apos;s Courage™ Family Portal</footer>
      }
    >
      <Suspense fallback={<PortalRouteLoader message="Loading Family Portal..." />}>
        <Outlet key={resolvePortalOutletKey(location.pathname, location.search)} />
      </Suspense>

      <GoalsOnboardingDrawer
        open={goalsOpen}
        onClose={closeGoalsDrawer}
        portalType="family"
        programCode={programCode}
        initialRecord={goalsRecord}
        onSave={saveGoals}
        onRemindLater={remindGoalsLater}
        onSkip={skipGoalsForNow}
      />
    </AppShell>
  );
}
