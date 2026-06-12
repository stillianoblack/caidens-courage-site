let familyPrefetchStarted = false;
let facilitatorPrefetchStarted = false;

/** Wait for shell paint + core portal data before downloading route chunks. */
const PORTAL_PREFETCH_INITIAL_DELAY_MS = 2000;
const PORTAL_PREFETCH_IDLE_TIMEOUT_MS = 4000;

function schedulePortalRoutePrefetch(fn: () => void): void {
  if (typeof window === 'undefined') return;

  const run = () => {
    try {
      fn();
    } catch {
      /* prefetch is best-effort */
    }
  };

  globalThis.setTimeout(() => {
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout?: number }) => number })
        .requestIdleCallback(run, { timeout: PORTAL_PREFETCH_IDLE_TIMEOUT_MS });
    } else {
      run();
    }
  }, PORTAL_PREFETCH_INITIAL_DELAY_MS);
}

/** High-traffic family nav destinations only (Weekly Adventures, Character Hub, Gallery, B-4). */
export function prefetchFamilyPortalRoutes(): void {
  if (familyPrefetchStarted) return;
  familyPrefetchStarted = true;

  schedulePortalRoutePrefetch(() => {
    void import('../components/family-portal/panels/FamilyContinueLearningPanel');
    void import('../components/family-portal/panels/FamilyCharactersPanel');
    void import('../components/family-portal/panels/FamilyGalleryPanel');
    void import('../pages/B4PortalPage');
    void import('../pages/CaidenQuestHubPage');
  });
}

export function prefetchFacilitatorPortalRoutes(): void {
  if (facilitatorPrefetchStarted) return;
  facilitatorPrefetchStarted = true;

  schedulePortalRoutePrefetch(() => {
    void import('../pages/CaidenQuestHubPage');
    void import('../pages/CaidenQuestPage');
    void import('../pages/MirandaPortalHubPage');
    void import('../pages/MirandaPortalMissionPage');
    void import('../pages/B4PortalPage');
    void import('../pages/B4PortalCheckInPage');
    void import('../pages/B4PortalWeek1Page');
    void import('../pages/B4PortalFeelingFinderPage');
    void import('../pages/B4PortalMissionPage');
    void import('../pages/CharliePortalHubPage');
    void import('../pages/CharliePortalMissionPage');
    void import('../pages/ZekePortalHubPage');
    void import('../pages/ZekePortalMissionPage');
    void import('../pages/KidsCharacterPage');
    void import('../pages/FacilitatorAdultGuideHubPage');
    void import('../pages/FacilitatorAdultGuideMissionPage');
    void import('../pages/StudentGallerySubmitPage');
  });
}
