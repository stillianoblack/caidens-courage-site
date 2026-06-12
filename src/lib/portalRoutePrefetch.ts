let familyPrefetchStarted = false;
let facilitatorPrefetchStarted = false;

function schedulePrefetch(fn: () => void): void {
  if (typeof window === 'undefined') return;
  const run = () => {
    try {
      fn();
    } catch {
      /* prefetch is best-effort */
    }
  };

  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout?: number }) => number })
      .requestIdleCallback(run, { timeout: 500 });
  } else {
    globalThis.setTimeout(run, 100);
  }
}

export function prefetchFamilyPortalRoutes(): void {
  if (familyPrefetchStarted) return;
  familyPrefetchStarted = true;

  schedulePrefetch(() => {
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
    void import('../pages/FamilyAdultGuideHubPage');
    void import('../pages/FamilyAdultGuideMissionPage');
  });
}

export function prefetchFacilitatorPortalRoutes(): void {
  if (facilitatorPrefetchStarted) return;
  facilitatorPrefetchStarted = true;

  schedulePrefetch(() => {
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
