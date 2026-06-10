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
import { clearProgramPortalContext, readActivePortalRole } from '../config/portalContext';
import { FAMILY_HUB_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { clearFamilyPortalSession, readFamilyPortalSession } from '../config/familyPortalAccess';
import { FAMILY_PORTAL_TITLE, PROGRAM_FAMILY_SIDEBAR_NAV } from '../data/familyPortalContent';
import { afterIdle } from '../lib/defer';
import { resolvePortalRailBrand } from '../lib/portalGamePaths';
import { requestGalleryCountsRefresh } from '../lib/galleryNavCounts';
import { resolvePortalPageTitle } from '../lib/familyPortalNav';
import PortalRouteLoader from '../components/portal/PortalRouteLoader';
import { resolvePortalOutletKey } from '../lib/portalOutletKey';
import { isPortalRoleAllowed } from '../lib/portalSessionGuard';
import { ensureFamilyPortalProgramSync } from '../lib/portalProgramAssignment';
import { prefetchFamilyPortalRoutes } from '../lib/portalRoutePrefetch';
import { useProgramGoalsOnboarding } from '../hooks/useProgramGoalsOnboarding';
import { OPEN_PROGRAM_GOALS_EVENT } from '../lib/openProgramGoals';

export default function FamilyHubLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeProgram = readActivePilotProgram();
  const hasSession = readFamilyPortalSession();
  const role = readActivePortalRole();
  const brand = resolvePortalRailBrand();
  const pageTitle = resolvePortalPageTitle(location.pathname, FAMILY_HUB_PATH);
  const programCode = activeProgram?.programCode ?? '';
  const sessionValid = Boolean(
    activeProgram && hasSession && role === 'family' && isPortalRoleAllowed(location.pathname),
  );

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
    enabled: sessionValid,
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
  }, []);

  useEffect(() => {
    if (sessionValid) {
      ensureFamilyPortalProgramSync();
      prefetchFamilyPortalRoutes();
    }
  }, [sessionValid]);

  useEffect(() => {
    if (sessionValid) {
      afterIdle(() => requestGalleryCountsRefresh());
    }
  }, [sessionValid]);

  useEffect(() => {
    if (!sessionValid) {
      clearProgramPortalContext();
      clearFamilyPortalSession();
      navigate(PORTAL_PATH, { replace: true, state: { redirect: FAMILY_HUB_PATH } });
    }
  }, [navigate, sessionValid]);

  if (!activeProgram) {
    return null;
  }

  return (
    <AppShell
      variant="family"
      sidebar={
        <FamilyDashboardSidebar
          navItems={PROGRAM_FAMILY_SIDEBAR_NAV}
          brandTitle={brand.title}
          brandSubtitle={brand.subtitle}
          programCode={activeProgram.programCode}
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
      footer={<footer className="family-miniFooter">© 2026 Caiden&apos;s Courage™ Family Portal</footer>}
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
