import './lazyRouteStyles';
import { lazy } from 'react';

/* Heavy routes — loaded on demand to shrink the initial bundle. */

export const HomePage = lazy(() => import('../pages/Home'));
export const ClassicHomePage = lazy(() => import('../pages/ClassicHome'));
export const KidsHubPage = lazy(() => import('../pages/KidsHub'));
export const SchoolsPage = lazy(() => import('../pages/Schools'));
export const ParentsPage = lazy(() => import('../pages/ParentsPage'));
export const TeachersPage = lazy(() => import('../pages/TeachersPage'));
export const CampsPage = lazy(() => import('../pages/CampsPage'));
export const StoryHubPage = lazy(() => import('../pages/StoryHub'));
export const StoryModePage = lazy(() => import('../pages/StoryModePage'));
export const ResourcesPage = lazy(() => import('../pages/Resources'));
export const ProductPage = lazy(() => import('../pages/Product'));
export const PreviewPage = lazy(() => import('../pages/Preview'));
export const MissionPage = lazy(() => import('../pages/Mission'));
export const AboutPage = lazy(() => import('../pages/About'));
export const WorldPage = lazy(() => import('../pages/World'));
export const CharactersPage = lazy(() => import('../pages/Characters'));
export const B4ClickerPage = lazy(() => import('../pages/B4Clicker'));
export const B4ToolsLibraryPage = lazy(() => import('../pages/ResourcesB4ToolsLibrary'));
export const ChatWithB4Page = lazy(() => import('../pages/ChatWithB4'));
export const TrainingGuidesPage = lazy(() => import('../pages/TrainingGuides'));
export const JourneyPage = lazy(() => import('../pages/Journey'));
export const ContactPage = lazy(() => import('../pages/Contact'));
export const PilotProgramSignupPage = lazy(() => import('../pages/PilotProgramSignupPage'));
export const PilotInfoPage = lazy(() => import('../pages/PilotInfoPage'));
export const PrivacyPolicyPage = lazy(() => import('../pages/PrivacyPolicy'));
export const TermsPage = lazy(() => import('../pages/Terms'));
export const ThankYouPage = lazy(() => import('../pages/ThankYou'));
export const SuccessPage = lazy(() => import('../pages/Success'));
export const NotifySuccessPage = lazy(() => import('../pages/NotifySuccess'));
export const ToolkitSuccessPage = lazy(() => import('../pages/ToolkitSuccess'));
export const FormSuccessPage = lazy(() => import('../pages/FormSuccess'));
export const CancelledPage = lazy(() => import('../pages/Cancelled'));
export const PilotTermsPage = lazy(() => import('../pages/PilotTermsPage'));

export const FacilitatorBaselineCheckPage = lazy(
  () => import('../pages/FacilitatorBaselineCheckPage'),
);
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
export const B4PortalMissionPage = lazy(() => import('../pages/B4PortalMissionPage'));
export const CharliePortalHubPage = lazy(() => import('../pages/CharliePortalHubPage'));
export const CharliePortalMissionPage = lazy(() => import('../pages/CharliePortalMissionPage'));
export const ZekePortalHubPage = lazy(() => import('../pages/ZekePortalHubPage'));
export const ZekePortalMissionPage = lazy(() => import('../pages/ZekePortalMissionPage'));
export const MirandaPortalHubPage = lazy(() => import('../pages/MirandaPortalHubPage'));
export const MirandaPortalMissionPage = lazy(() => import('../pages/MirandaPortalMissionPage'));
export const MirandaMysteryFilesHubPage = lazy(() => import('../pages/MirandaMysteryFilesHubPage'));
export const MirandaMissionPage = lazy(() => import('../pages/MirandaMissionPage'));
export const KidsPortalPage = lazy(() => import('../pages/KidsPortalPage'));
export const KidsCharacterPage = lazy(() => import('../pages/KidsCharacterPage'));
export const B4FocusFlightPage = lazy(
  () => import('../games/b4-focus-flight/B4FocusFlightPage'),
);

export const FacilitatorAdultGuideHubPage = lazy(
  () => import('../pages/FacilitatorAdultGuideHubPage'),
);
export const FacilitatorAdultGuideMissionPage = lazy(
  () => import('../pages/FacilitatorAdultGuideMissionPage'),
);
export const StudentGallerySubmitPage = lazy(() => import('../pages/StudentGallerySubmitPage'));
export const StudentGalleryPublicPage = lazy(() => import('../pages/StudentGalleryPublicPage'));
