import { lazy } from 'react';

/** Lazy adult training routes only — main family nav panels load eagerly. */
export const FamilyAdultGuideHubPage = lazy(() => import('../pages/FamilyAdultGuideHubPage'));
export const FamilyAdultGuideMissionPage = lazy(
  () => import('../pages/FamilyAdultGuideMissionPage'),
);
