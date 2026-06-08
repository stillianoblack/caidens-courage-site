import './lazyRouteStyles';
import { lazy } from 'react';

/* Heavy routes — loaded on demand to shrink the initial bundle. */

export const PilotDashboardPage = lazy(() => import('../pages/PilotDashboardPage'));
export const ProgramDashboardPage = lazy(() => import('../pages/ProgramDashboardPage'));
export const PilotTermsPage = lazy(() => import('../pages/PilotTermsPage'));

export const FamilyPortalLayout = lazy(() => import('../pages/FamilyPortalLayout'));
export const FamilyHubLayout = lazy(() => import('../pages/FamilyHubLayout'));

export const FacilitatorBaselineCheckPage = lazy(
  () => import('../pages/FacilitatorBaselineCheckPage'),
);
export const AdultAssessmentPage = lazy(() => import('../pages/AdultAssessmentPage'));
export const B4BaselineCheckPage = lazy(() => import('../pages/B4BaselineCheckPage'));
export const B4ResultsAdminPage = lazy(() => import('../pages/B4ResultsAdminPage'));
export const Week0AssessmentPage = lazy(() => import('../pages/Week0AssessmentPage'));
export const FocusFlameLabPage = lazy(() => import('../pages/FocusFlameLab'));
export const B4GuidePage = lazy(() => import('../pages/B4GuidePage'));

export const CaidenQuestHubPage = lazy(() => import('../pages/CaidenQuestHubPage'));
export const CaidenQuestPage = lazy(() => import('../pages/CaidenQuestPage'));
export const B4PortalPage = lazy(() => import('../pages/B4PortalPage'));
export const B4PortalCheckInPage = lazy(() => import('../pages/B4PortalCheckInPage'));
export const B4PortalWeek1Page = lazy(() => import('../pages/B4PortalWeek1Page'));
export const B4PortalFeelingFinderPage = lazy(() => import('../pages/B4PortalFeelingFinderPage'));
export const CharliePortalHubPage = lazy(() => import('../pages/CharliePortalHubPage'));
export const CharliePortalMissionPage = lazy(() => import('../pages/CharliePortalMissionPage'));
export const MirandaPortalHubPage = lazy(() => import('../pages/MirandaPortalHubPage'));
export const MirandaPortalMissionPage = lazy(() => import('../pages/MirandaPortalMissionPage'));
export const MirandaMysteryFilesHubPage = lazy(() => import('../pages/MirandaMysteryFilesHubPage'));
export const MirandaMissionPage = lazy(() => import('../pages/MirandaMissionPage'));
export const KidsPortalPage = lazy(() => import('../pages/KidsPortalPage'));
export const KidsCharacterPage = lazy(() => import('../pages/KidsCharacterPage'));

export const FacilitatorAdultGuideHubPage = lazy(
  () => import('../pages/FacilitatorAdultGuideHubPage'),
);
export const FacilitatorAdultGuideMissionPage = lazy(
  () => import('../pages/FacilitatorAdultGuideMissionPage'),
);
export const StudentGallerySubmitPage = lazy(() => import('../pages/StudentGallerySubmitPage'));
export const StudentGalleryPublicPage = lazy(() => import('../pages/StudentGalleryPublicPage'));
