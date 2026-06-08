import { lazy } from 'react';

export const FamilyOverviewPanel = lazy(
  () => import('../components/family-portal/panels/FamilyOverviewPanel'),
);
export const FamilyContinueLearningPanel = lazy(
  () => import('../components/family-portal/panels/FamilyContinueLearningPanel'),
);
export const FamilyCharactersPanel = lazy(
  () => import('../components/family-portal/panels/FamilyCharactersPanel'),
);
export const FamilyCharacterProfilePage = lazy(
  () => import('../components/family-portal/panels/FamilyCharacterProfilePage'),
);
export const FamilyDownloadsPanel = lazy(
  () => import('../components/family-portal/panels/FamilyDownloadsPanel'),
);
export const FamilyGalleryPanel = lazy(
  () => import('../components/family-portal/panels/FamilyGalleryPanel'),
);
export const FamilyCertificatesPanel = lazy(
  () => import('../components/family-portal/panels/FamilyCertificatesPanel'),
);
export const FamilyGuidePanel = lazy(
  () => import('../components/family-portal/panels/FamilyGuidePanel'),
);
export const FamilyBaselineCheckPanel = lazy(
  () => import('../components/family-portal/panels/FamilyBaselineCheckPanel'),
);
export const FamilyAdultAssessmentPanel = lazy(
  () => import('../components/family-portal/panels/FamilyAdultAssessmentPanel'),
);
export const FamilyAdultGuideHubPage = lazy(() => import('../pages/FamilyAdultGuideHubPage'));
export const FamilyAdultGuideMissionPage = lazy(
  () => import('../pages/FamilyAdultGuideMissionPage'),
);
