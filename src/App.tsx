import React, { Suspense } from 'react';
import { Outlet, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import {
  MissionGamePhaseProvider,
  useMissionGamePhase,
} from './context/MissionGamePhaseContext';
import LegacySchoolRouteRedirect, { LegacyCampCourageRedirect } from './components/schools/LegacySchoolRouteRedirect';
import AnalyticsRouteTracker from './components/analytics/AnalyticsRouteTracker';
import DeferredB4ChatWidget from './components/DeferredB4ChatWidget';
import { ENABLE_B4_CHAT } from './config/featureFlags';
import { shouldMountPortalB4Assistant } from './lib/portalB4Routes';
import CourageToolsPopup from './components/CourageToolsPopup';
import NavigationLoader from './components/NavigationLoader';
import KidPlayShellLoader from './components/kid-play-shell/KidPlayShellLoader';
import PortalRouteLoader from './components/portal/PortalRouteLoader';
import { ChunkErrorBoundary } from './components/ChunkErrorBoundary';
import { resolveAppOutletKey } from './lib/portalOutletKey';
import { resolvePortalRouteLoaderMessage } from './lib/portalRouteLoaderMessage';
import ScrollToTop from './components/ScrollToTop';
import PortalDebugTracker from './components/PortalDebugTracker';
import { ToastProvider } from './components/portal-design-system';
import { PilotAccessProvider } from './components/courage/PilotAccessProvider';
import {
  AboutPage,
  B4ClickerPage,
  B4BaselineCheckPage,
  B4GuidePage,
  B4ToolsLibraryPage,
  B4PortalCheckInPage,
  B4PortalFeelingFinderPage,
  B4PortalMissionPage,
  B4PortalPage,
  B4PortalWeek1Page,
  B4ResultsAdminPage,
  CaidenQuestHubPage,
  CaidenQuestPage,
  CampsPage,
  CancelledPage,
  CharactersPage,
  CharliePortalHubPage,
  CharliePortalMissionPage,
  ZekePortalHubPage,
  ZekePortalMissionPage,
  ChatWithB4Page,
  ClassicHomePage,
  ContactPage,
  FacilitatorAdultGuideHubPage,
  FacilitatorAdultGuideMissionPage,
  FacilitatorBaselineCheckPage,
  FocusFlameLabPage,
  FormSuccessPage,
  HomePage,
  JourneyPage,
  KidsHubPage,
  KidsPortalPage,
  MissionPage,
  MirandaMissionPage,
  MirandaMysteryFilesHubPage,
  MirandaPortalHubPage,
  MirandaPortalMissionPage,
  NotifySuccessPage,
  ParentsPage,
  PilotProgramSignupPage,
  PilotInfoPage,
  PilotTermsPage,
  PreviewPage,
  PrivacyPolicyPage,
  ProductPage,
  ResourcesPage,
  SchoolsPage,
  StoryHubPage,
  StudentGalleryPublicPage,
  StudentGallerySubmitPage,
  SuccessPage,
  TeachersPage,
  TermsPage,
  ThankYouPage,
  ToolkitSuccessPage,
  TrainingGuidesPage,
  Week0AssessmentPage,
  WorldPage,
} from './routes/lazyPages';
import {
  BMC_ACTIVITIES_PATH,
  BMC_COLORING_PATH,
  BMC_RESET_TOOLS_PATH,
  BRAVE_MIND_CLUB_PATH,
  STORY_BOOKS_PATH,
  STORY_CHARACTERS_PATH,
  STORY_PATH,
  B4_GUIDE_PATH,
  B4_BASELINE_CHECK_PATH,
  B4_RESULTS_ADMIN_PATH,
  FACILITATOR_B4_BASELINE_RESULTS_PATH,
  FACILITATOR_B4_RESULTS_PATH,
  FACILITATOR_ADULT_TRAINING_PATH,
  FACILITATOR_PORTAL_PATH,
  FAMILY_DR_VICTORIA_MISSION_BASE,
  FAMILY_DR_VICTORIA_MISSION_1_PATH,
  FAMILY_PARENT_CORNER_PATH,
  WEEK_0_ASSESSMENT_ALIAS_PATH,
  WEEK_0_ASSESSMENT_PATH,
  FOCUS_FLAME_LAB_PATH,
  PILOT_DASHBOARD_PATH,
  BLUE_RIBBON_PILOT_PATH,
  PROGRAM_DASHBOARD_PATH,
  PILOT_PROGRAM_SIGNUP_PATH,
  PILOT_INFO_PATH,
  PILOT_TERMS_PATH,
  ADMIN_PORTAL_PATH,
  FAMILY_PORTAL_PATH,
  FAMILY_CLAIM_PATH,
  FAMILY_HUB_PATH,
  FAMILY_HUB_KIDS_BASE,
  FACILITATOR_BASELINE_CHECK_PATH,
  PROGRAM_BASELINE_CHECK_PATH,
  KIDS_PORTAL_PATH,
  CAIDEN_QUEST_HUB_PATH,
  ACADEMY_DASHBOARD_ALIAS_PATH,
  MIRANDA_MYSTERY_FILES_PATH,
  MIRANDA_FIRST_DAY_PATH,
  STUDENT_GALLERY_SUBMIT_PATH,
  STUDENT_GALLERY_PUBLIC_PATH,
  KID_PLAY_SESSION_PATH,
  STUDENT_PIN_LOGIN_PATH,
} from './config/courageRoutes';
import { kidPlayShellChildRoutes } from './routes/kidPlayShellChildRoutes';

const Portal = React.lazy(() => import('./pages/Portal'));
const PortalDashboard = React.lazy(() => import('./pages/PortalDashboard'));
const AdultAssessmentPage = React.lazy(() => import('./pages/AdultAssessmentPage'));
const PilotDashboardPage = React.lazy(() => import('./pages/PilotDashboardPage'));
const FacilitatorPortalEntry = React.lazy(() => import('./pages/FacilitatorPortalEntry'));
const AdminPortalPage = React.lazy(() => import('./pages/AdminPortalPage'));
const AdminAdventurePreviewPage = React.lazy(() => import('./pages/AdminAdventurePreviewPage'));
const AdminRouteLayout = React.lazy(() => import('./pages/AdminRouteLayout'));
const DesignSystemPage = React.lazy(() => import('./pages/DesignSystemPage'));
const ProgramDashboardPage = React.lazy(() => import('./pages/ProgramDashboardPage'));
const FamilyHubLayout = React.lazy(() => import('./pages/FamilyHubLayout'));
const FamilyPortalLayout = React.lazy(() => import('./pages/FamilyPortalLayout'));
const KidPlaySessionLayout = React.lazy(() => import('./pages/KidPlaySessionLayout'));
const StudentPinLoginPage = React.lazy(() => import('./pages/StudentPinLoginPage'));
const FamilyClaimByCodePage = React.lazy(() => import('./pages/FamilyClaimByCodePage'));
const FamilyClaimRedirect = React.lazy(() => import('./pages/FamilyClaimRedirect'));

const ProgramOverviewTabRoute = React.lazy(() =>
  import('./routes/programDashboardTabRoutes').then((module) => ({
    default: module.ProgramOverviewTabRoute,
  })),
);
const ProgramRosterTabRoute = React.lazy(() =>
  import('./routes/programDashboardTabRoutes').then((module) => ({
    default: module.ProgramRosterTabRoute,
  })),
);
const ProgramWeeklyModulesTabRoute = React.lazy(() =>
  import('./routes/programDashboardTabRoutes').then((module) => ({
    default: module.ProgramWeeklyModulesTabRoute,
  })),
);
const ProgramActivitiesTabRoute = React.lazy(() =>
  import('./routes/programDashboardTabRoutes').then((module) => ({
    default: module.ProgramActivitiesTabRoute,
  })),
);
const ProgramAssessmentsTabRoute = React.lazy(() =>
  import('./routes/programDashboardTabRoutes').then((module) => ({
    default: module.ProgramAssessmentsTabRoute,
  })),
);
const ProgramResultsTabRoute = React.lazy(() =>
  import('./routes/programDashboardTabRoutes').then((module) => ({
    default: module.ProgramResultsTabRoute,
  })),
);
const ProgramCertificatesTabRoute = React.lazy(() =>
  import('./routes/programDashboardTabRoutes').then((module) => ({
    default: module.ProgramCertificatesTabRoute,
  })),
);
const ProgramGalleryTabRoute = React.lazy(() =>
  import('./routes/programDashboardTabRoutes').then((module) => ({
    default: module.ProgramGalleryTabRoute,
  })),
);
const ProgramFacilitatorCenterTabRoute = React.lazy(() =>
  import('./routes/programDashboardTabRoutes').then((module) => ({
    default: module.ProgramFacilitatorCenterTabRoute,
  })),
);
const FamilyOverviewPanel = React.lazy(() =>
  import('./components/family-portal/panels/FamilyOverviewPanel'),
);
const FamilyResultsPanel = React.lazy(() =>
  import('./components/family-portal/panels/FamilyResultsPanel'),
);
const FamilyWeeklyAdventuresLauncher = React.lazy(() =>
  import('./components/family-portal/panels/FamilyWeeklyAdventuresLauncher'),
);
const FamilyInventoryPanel = React.lazy(() =>
  import('./components/family-portal/panels/FamilyInventoryPanel'),
);
const FamilyBaselineCheckPanel = React.lazy(() =>
  import('./components/family-portal/panels/FamilyBaselineCheckPanel'),
);
const FamilyCharactersPanel = React.lazy(() =>
  import('./components/family-portal/panels/FamilyCharactersPanel'),
);
const FamilyCharacterProfilePage = React.lazy(() =>
  import('./components/family-portal/panels/FamilyCharacterProfilePage'),
);
const FamilyDownloadsPanel = React.lazy(() =>
  import('./components/family-portal/panels/FamilyDownloadsPanel'),
);
const FamilyGalleryPanel = React.lazy(() =>
  import('./components/family-portal/panels/FamilyGalleryPanel'),
);
const FamilyCertificatesPanel = React.lazy(() =>
  import('./components/family-portal/panels/FamilyCertificatesPanel'),
);
const FamilyGuidePanel = React.lazy(() =>
  import('./components/family-portal/panels/FamilyGuidePanel'),
);
const FamilyProgramSettingsPanel = React.lazy(() =>
  import('./components/family-portal/panels/FamilyProgramSettingsPanel'),
);
const FamilyPlayPausePage = React.lazy(() =>
  import('./components/family-portal/panels/FamilyPlayPausePage'),
);
const FamilyAdultAssessmentPanel = React.lazy(() =>
  import('./components/family-portal/panels/FamilyAdultAssessmentPanel'),
);
const FamilyAdultGuideHubPage = React.lazy(() => import('./pages/FamilyAdultGuideHubPage'));
const FamilyAdultGuideMissionPage = React.lazy(() =>
  import('./pages/FamilyAdultGuideMissionPage'),
);

/** Vale domains must not render the Courage hub at `/` (client navigations skip Netlify root redirect). */
const isCaidenValeHost = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return host === 'caidenvale.com' || host === 'www.caidenvale.com';
};

const RootRoute: React.FC = () => {
  if (isCaidenValeHost()) {
    return <Navigate to="/classic-home" replace />;
  }
  return <HomePage />;
};

const appRouteChildren = (
  <>
      <Route path="/" element={<RootRoute />} />
      <Route path={FAMILY_CLAIM_PATH} element={<FamilyClaimByCodePage />} />
      <Route path="/inventory" element={<Navigate to={`${FAMILY_HUB_PATH}/collections`} replace />} />

      {/* Story world */}
      <Route path={STORY_PATH} element={<StoryHubPage />} />
      <Route path={STORY_BOOKS_PATH} element={<ProductPage />} />
      <Route path={STORY_CHARACTERS_PATH} element={<CharactersPage />} />

      {/* Brave Mind Club */}
      <Route path={BRAVE_MIND_CLUB_PATH} element={<ResourcesPage />} />
      <Route path={BMC_COLORING_PATH} element={<ResourcesPage />} />
      <Route path={BMC_ACTIVITIES_PATH} element={<ResourcesPage />} />
      <Route path={BMC_RESET_TOOLS_PATH} element={<B4ClickerPage />} />

      {/* Interactive */}
      <Route path={B4_BASELINE_CHECK_PATH} element={<B4BaselineCheckPage />} />
      <Route path={WEEK_0_ASSESSMENT_ALIAS_PATH} element={<Navigate to={B4_BASELINE_CHECK_PATH} replace />} />
      <Route path={WEEK_0_ASSESSMENT_PATH} element={<Week0AssessmentPage />} />
      <Route path={B4_GUIDE_PATH} element={<B4GuidePage />} />
      <Route path="/focus-flame-lab" element={<FocusFlameLabPage />} />

      {/* Facilitator / family kid play shell (no portal chrome) */}
      <Route path={STUDENT_PIN_LOGIN_PATH} element={<StudentPinLoginPage />} />
      <Route path={`${KID_PLAY_SESSION_PATH}/:kidPlaySessionId`} element={<KidPlaySessionLayout />}>
        {kidPlayShellChildRoutes}
      </Route>

      {/* Focus Flame Academy */}
      <Route
        path={`${FACILITATOR_ADULT_TRAINING_PATH}/:guideId`}
        element={<FacilitatorAdultGuideHubPage />}
      />
      <Route
        path={`${FACILITATOR_ADULT_TRAINING_PATH}/:guideId/:missionId`}
        element={<FacilitatorAdultGuideMissionPage />}
      />
      <Route path={FACILITATOR_PORTAL_PATH} element={<FacilitatorPortalEntry />} />
      <Route
        path={FACILITATOR_B4_RESULTS_PATH}
        element={<Navigate to={`${PROGRAM_DASHBOARD_PATH}/results`} replace />}
      />
      <Route
        path={FACILITATOR_B4_BASELINE_RESULTS_PATH}
        element={<Navigate to={`${PROGRAM_DASHBOARD_PATH}/results`} replace />}
      />
      <Route path={PILOT_DASHBOARD_PATH} element={<Navigate to={FACILITATOR_PORTAL_PATH} replace />} />
      <Route path={BLUE_RIBBON_PILOT_PATH} element={<PilotDashboardPage />} />
      <Route path={PROGRAM_DASHBOARD_PATH} element={<ProgramDashboardPage />}>
        <Route index element={<ProgramOverviewTabRoute />} />
        <Route path="roster" element={<ProgramRosterTabRoute />} />
        <Route path="weekly-modules" element={<ProgramWeeklyModulesTabRoute />} />
        <Route path="activities-library" element={<ProgramActivitiesTabRoute />} />
        <Route path="assessments" element={<ProgramAssessmentsTabRoute />} />
        <Route path="results" element={<ProgramResultsTabRoute />} />
        <Route path="certificates" element={<ProgramCertificatesTabRoute />} />
        <Route path="student-gallery" element={<ProgramGalleryTabRoute />} />
        <Route path="facilitator-center" element={<ProgramFacilitatorCenterTabRoute />} />
        <Route path="kids/caiden" element={<CaidenQuestHubPage />} />
        <Route path="kids/caiden/:questId" element={<CaidenQuestPage />} />
        <Route path="kids/miranda" element={<MirandaPortalHubPage />} />
        <Route path="kids/miranda/:missionId" element={<MirandaPortalMissionPage />} />
        <Route path="kids/b4" element={<B4PortalPage />} />
        <Route path="kids/b4/check-in" element={<B4PortalCheckInPage />} />
        <Route path="kids/b4/week-1" element={<B4PortalWeek1Page />} />
        <Route path="kids/b4/feeling-finder" element={<B4PortalFeelingFinderPage />} />
        <Route path="kids/b4/:missionId" element={<B4PortalMissionPage />} />
        <Route path="kids/charlie" element={<CharliePortalHubPage />} />
        <Route path="kids/charlie/:missionId" element={<CharliePortalMissionPage />} />
        <Route path="kids/zeke" element={<ZekePortalHubPage />} />
        <Route path="kids/zeke/:missionId" element={<ZekePortalMissionPage />} />
      </Route>
      <Route
        path={PROGRAM_BASELINE_CHECK_PATH}
        element={<FacilitatorBaselineCheckPage variant="program" />}
      />
      <Route
        path={FACILITATOR_BASELINE_CHECK_PATH}
        element={<FacilitatorBaselineCheckPage variant="blueribbon" />}
      />
      <Route
        path={`${FACILITATOR_PORTAL_PATH}/adult-assessment/:phase`}
        element={<AdultAssessmentPage variant="blueribbon" />}
      />
      <Route
        path={`${PROGRAM_DASHBOARD_PATH}/adult-assessment/:phase`}
        element={<AdultAssessmentPage variant="program" />}
      />
      <Route path={PILOT_PROGRAM_SIGNUP_PATH} element={<PilotProgramSignupPage />} />
      <Route path={PILOT_INFO_PATH} element={<PilotInfoPage />} />
      <Route path={PILOT_TERMS_PATH} element={<PilotTermsPage />} />
      <Route path={ACADEMY_DASHBOARD_ALIAS_PATH} element={<Navigate to={FACILITATOR_PORTAL_PATH} replace />} />
      <Route path={B4_RESULTS_ADMIN_PATH} element={<B4ResultsAdminPage />} />

      {/* Blue Ribbon family portal backup */}
      <Route element={<FamilyPortalLayout />}>
        <Route path={FAMILY_PORTAL_PATH}>
          <Route index element={<FamilyOverviewPanel />} />
          <Route path="results" element={<FamilyResultsPanel />} />
          <Route path="children" element={<Navigate to="characters" replace />} />
          <Route path="continue-learning" element={<FamilyWeeklyAdventuresLauncher />} />
          <Route path="weekly-adventures" element={<FamilyWeeklyAdventuresLauncher />} />
          <Route path="play-pause" element={<FamilyPlayPausePage />} />
          <Route path="collections" element={<FamilyInventoryPanel />} />
          <Route path="inventory" element={<Navigate to="collections" replace />} />
          <Route path="baseline-check" element={<FamilyBaselineCheckPanel />} />
          <Route path="characters">
            <Route index element={<FamilyCharactersPanel />} />
            <Route path=":characterId" element={<FamilyCharacterProfilePage />} />
          </Route>
          <Route path="games" element={<Navigate to="characters" replace />} />
          <Route path="downloads" element={<FamilyDownloadsPanel />} />
          <Route path="gallery" element={<FamilyGalleryPanel />} />
          <Route path="certificates" element={<FamilyCertificatesPanel />} />
          <Route path="guide" element={<FamilyGuidePanel />} />
          <Route path="settings" element={<FamilyProgramSettingsPanel />} />
          <Route path="claim" element={<FamilyClaimRedirect />} />
          <Route path="adult-assessment/:phase" element={<FamilyAdultAssessmentPanel />} />
        </Route>
        <Route
          path={FAMILY_PARENT_CORNER_PATH}
          element={<Navigate to={`${FAMILY_PORTAL_PATH}/guide`} replace />}
        />
        <Route
          path={`${FAMILY_PARENT_CORNER_PATH}/:guideId`}
          element={<FamilyAdultGuideHubPage />}
        />
        <Route
          path={`${FAMILY_PARENT_CORNER_PATH}/:guideId/:missionId`}
          element={<FamilyAdultGuideMissionPage />}
        />
        <Route
          path={`${FAMILY_PORTAL_PATH}/guide/dr-victoria/mission-1`}
          element={<Navigate to={FAMILY_DR_VICTORIA_MISSION_1_PATH} replace />}
        />
        <Route
          path={`${FAMILY_PORTAL_PATH}/guide/dr-victoria/mission-2`}
          element={<Navigate to={`${FAMILY_DR_VICTORIA_MISSION_BASE}/mission-2`} replace />}
        />
        <Route path={CAIDEN_QUEST_HUB_PATH} element={<CaidenQuestHubPage />} />
        <Route path={`${CAIDEN_QUEST_HUB_PATH}/:questId`} element={<CaidenQuestPage />} />
        <Route path={`${KIDS_PORTAL_PATH}/miranda`} element={<MirandaPortalHubPage />} />
        <Route path={`${KIDS_PORTAL_PATH}/miranda/:missionId`} element={<MirandaPortalMissionPage />} />
        <Route path={`${KIDS_PORTAL_PATH}/b4`} element={<B4PortalPage />} />
        <Route path={`${KIDS_PORTAL_PATH}/b4/check-in`} element={<B4PortalCheckInPage />} />
        <Route path={`${KIDS_PORTAL_PATH}/b4/week-1`} element={<B4PortalWeek1Page />} />
        <Route path={`${KIDS_PORTAL_PATH}/b4/feeling-finder`} element={<B4PortalFeelingFinderPage />} />
        <Route path={`${KIDS_PORTAL_PATH}/b4/:missionId`} element={<B4PortalMissionPage />} />
        <Route path={`${KIDS_PORTAL_PATH}/charlie`} element={<CharliePortalHubPage />} />
        <Route path={`${KIDS_PORTAL_PATH}/charlie/:missionId`} element={<CharliePortalMissionPage />} />
        <Route path={`${KIDS_PORTAL_PATH}/zeke`} element={<ZekePortalHubPage />} />
        <Route path={`${KIDS_PORTAL_PATH}/zeke/:missionId`} element={<ZekePortalMissionPage />} />
      </Route>

      {/* Program family hub (/family-hub) */}
      <Route element={<FamilyHubLayout />}>
        <Route path={FAMILY_HUB_PATH}>
          <Route index element={<FamilyOverviewPanel />} />
          <Route path="results" element={<FamilyResultsPanel />} />
          <Route path="children" element={<Navigate to="characters" replace />} />
          <Route path="continue-learning" element={<FamilyWeeklyAdventuresLauncher />} />
          <Route path="collections" element={<FamilyInventoryPanel />} />
          <Route path="inventory" element={<Navigate to="collections" replace />} />
          <Route path="weekly-adventures" element={<FamilyWeeklyAdventuresLauncher />} />
          <Route path="play-pause" element={<FamilyPlayPausePage />} />
          <Route path="baseline-check" element={<FamilyBaselineCheckPanel />} />
          <Route path="characters">
            <Route index element={<FamilyCharactersPanel />} />
            <Route path=":characterId" element={<FamilyCharacterProfilePage />} />
          </Route>
          <Route path="games" element={<Navigate to="characters" replace />} />
          <Route path="downloads" element={<FamilyDownloadsPanel />} />
          <Route path="gallery" element={<FamilyGalleryPanel />} />
          <Route path="certificates" element={<FamilyCertificatesPanel />} />
          <Route path="guide" element={<FamilyGuidePanel />} />
          <Route path="parent-corner" element={<FamilyGuidePanel />} />
          <Route path="settings" element={<FamilyProgramSettingsPanel />} />
          <Route path="claim" element={<FamilyClaimRedirect />} />
          <Route path="adult-assessment/:phase" element={<FamilyAdultAssessmentPanel />} />
        </Route>
        <Route path={`${FAMILY_HUB_PATH}/guide/:guideId`} element={<FamilyAdultGuideHubPage />} />
        <Route
          path={`${FAMILY_HUB_PATH}/guide/:guideId/:missionId`}
          element={<FamilyAdultGuideMissionPage />}
        />
        <Route path={`${FAMILY_HUB_KIDS_BASE}/caiden`} element={<CaidenQuestHubPage />} />
        <Route path={`${FAMILY_HUB_KIDS_BASE}/caiden/:questId`} element={<CaidenQuestPage />} />
        <Route path={`${FAMILY_HUB_KIDS_BASE}/miranda`} element={<MirandaPortalHubPage />} />
        <Route path={`${FAMILY_HUB_KIDS_BASE}/miranda/:missionId`} element={<MirandaPortalMissionPage />} />
        <Route path={`${FAMILY_HUB_KIDS_BASE}/b4`} element={<B4PortalPage />} />
        <Route path={`${FAMILY_HUB_KIDS_BASE}/b4/check-in`} element={<B4PortalCheckInPage />} />
        <Route path={`${FAMILY_HUB_KIDS_BASE}/b4/week-1`} element={<B4PortalWeek1Page />} />
        <Route path={`${FAMILY_HUB_KIDS_BASE}/b4/feeling-finder`} element={<B4PortalFeelingFinderPage />} />
        <Route path={`${FAMILY_HUB_KIDS_BASE}/b4/:missionId`} element={<B4PortalMissionPage />} />
        <Route path={`${FAMILY_HUB_KIDS_BASE}/charlie`} element={<CharliePortalHubPage />} />
        <Route path={`${FAMILY_HUB_KIDS_BASE}/charlie/:missionId`} element={<CharliePortalMissionPage />} />
        <Route path={`${FAMILY_HUB_KIDS_BASE}/zeke`} element={<ZekePortalHubPage />} />
        <Route path={`${FAMILY_HUB_KIDS_BASE}/zeke/:missionId`} element={<ZekePortalMissionPage />} />
      </Route>

      {/* Legacy kids hub (non-portal shell) */}
      <Route path={KIDS_PORTAL_PATH} element={<KidsPortalPage />} />
      <Route path={`${KIDS_PORTAL_PATH}/zeke`} element={<ZekePortalHubPage />} />
      <Route path={`${KIDS_PORTAL_PATH}/zeke/:missionId`} element={<ZekePortalMissionPage />} />

      <Route path={MIRANDA_MYSTERY_FILES_PATH} element={<MirandaMysteryFilesHubPage />} />
      <Route path={`${MIRANDA_MYSTERY_FILES_PATH}/:missionId`} element={<MirandaMissionPage />} />
      <Route
        path={MIRANDA_FIRST_DAY_PATH}
        element={<Navigate to={`${MIRANDA_MYSTERY_FILES_PATH}/miranda-mystery-file-1`} replace />}
      />
      <Route path={STUDENT_GALLERY_SUBMIT_PATH} element={<StudentGallerySubmitPage />} />
      <Route path={STUDENT_GALLERY_PUBLIC_PATH} element={<StudentGalleryPublicPage />} />
      <Route path="/kids" element={<KidsHubPage />} />
      <Route path="/parents" element={<ParentsPage />} />
      <Route path="/teachers" element={<TeachersPage />} />
      <Route path="/camps" element={<CampsPage />} />
      <Route path="/schools" element={<SchoolsPage />} />

      {/* Private admin — not linked in public navigation */}
      <Route path={ADMIN_PORTAL_PATH} element={<AdminRouteLayout />}>
        <Route path="design-system" element={<DesignSystemPage />} />
        <Route path="adventures/:id/preview" element={<AdminAdventurePreviewPage />} />
        <Route index element={<AdminPortalPage />} />
      </Route>

      {/* Portal */}
      <Route path="/portal" element={<Portal />} />
      <Route path="/portal/dashboard" element={<PortalDashboard />} />

      {/* Legacy redirects — preserve bookmarks */}
      <Route path="/braveminds" element={<Navigate to={BRAVE_MIND_CLUB_PATH} replace />} />
      <Route path="/braveminds/notify-success" element={<NotifySuccessPage />} />
      <Route path="/b4-tools" element={<Navigate to={BMC_RESET_TOOLS_PATH} replace />} />
      <Route path="/comicbook" element={<Navigate to={STORY_BOOKS_PATH} replace />} />
      <Route path="/comic-book" element={<Navigate to={STORY_BOOKS_PATH} replace />} />
      <Route path="/product" element={<Navigate to={STORY_BOOKS_PATH} replace />} />
      <Route path="/characters" element={<Navigate to={STORY_CHARACTERS_PATH} replace />} />
      <Route path="/resources" element={<Navigate to={BRAVE_MIND_CLUB_PATH} replace />} />
      <Route path="/resources/coloring-pages" element={<Navigate to={BMC_COLORING_PATH} replace />} />
      <Route path="/resources/wallpapers" element={<Navigate to={`${BRAVE_MIND_CLUB_PATH}?type=wallpaper`} replace />} />
      <Route path="/resources/teachers" element={<Navigate to={`${BRAVE_MIND_CLUB_PATH}?type=teacher-pack`} replace />} />
      <Route path="/resources/b4-tools-library" element={<Navigate to="/braveminds/b4-tools-library" replace />} />
      <Route path="/braveminds/b4-tools-library" element={<B4ToolsLibraryPage />} />

      <Route path="/focus-flame-academy" element={<LegacySchoolRouteRedirect />} />
      <Route path="/classic-home" element={<ClassicHomePage />} />
      <Route path="/camp-courage" element={<LegacyCampCourageRedirect />} />
      <Route path="/camp-courage/toolkit-success" element={<ToolkitSuccessPage />} />
      <Route path="/classroom-pilots" element={<Navigate to="/schools#pilot" replace />} />
      <Route path="/training-guides" element={<TrainingGuidesPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/thank-you" element={<ThankYouPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/cancelled" element={<CancelledPage />} />
      <Route path="/form-success" element={<FormSuccessPage />} />
      <Route path="/preview" element={<PreviewPage />} />
      <Route path="/book/preview" element={<Navigate to="/preview" replace />} />
      <Route path="/mission" element={<MissionPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/world" element={<WorldPage />} />
      <Route path="/journey" element={<JourneyPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/chat" element={<ChatWithB4Page />} />
  </>
);

const AppLayout: React.FC = () => {
  const location = useLocation();
  const missionPhase = useMissionGamePhase();
  const isMirandaExperience =
    location.pathname === MIRANDA_MYSTERY_FILES_PATH ||
    location.pathname.startsWith(`${MIRANDA_MYSTERY_FILES_PATH}/`) ||
    location.pathname === MIRANDA_FIRST_DAY_PATH;
  const isKidPlayShell =
    location.pathname === KID_PLAY_SESSION_PATH ||
    location.pathname.startsWith(`${KID_PLAY_SESSION_PATH}/`);
  const isImmersiveKidsGame =
    isKidPlayShell ||
    location.pathname === FOCUS_FLAME_LAB_PATH ||
    location.pathname.startsWith(`${FOCUS_FLAME_LAB_PATH}/`) ||
    location.pathname === B4_GUIDE_PATH ||
    location.pathname === B4_BASELINE_CHECK_PATH ||
    location.pathname === B4_RESULTS_ADMIN_PATH ||
    isMirandaExperience ||
    location.pathname === PILOT_DASHBOARD_PATH ||
    location.pathname === BLUE_RIBBON_PILOT_PATH ||
    location.pathname === PROGRAM_DASHBOARD_PATH ||
    location.pathname.startsWith(`${PROGRAM_DASHBOARD_PATH}/`) ||
    location.pathname === FAMILY_HUB_PATH ||
    location.pathname.startsWith(`${FAMILY_HUB_PATH}/`) ||
    location.pathname === PILOT_PROGRAM_SIGNUP_PATH ||
    location.pathname === FAMILY_PORTAL_PATH ||
    location.pathname.startsWith(`${FAMILY_PORTAL_PATH}/`) ||
    location.pathname.startsWith(`${CAIDEN_QUEST_HUB_PATH}`) ||
    location.pathname === KIDS_PORTAL_PATH ||
    location.pathname.startsWith(`${KIDS_PORTAL_PATH}/`);
  /** Hide global Ask B-4 during gameplay and on portal shells (AppShell mounts B4Assistant). */
  const hideAskB4Chat =
    isKidPlayShell ||
    !ENABLE_B4_CHAT ||
    missionPhase === 'quiz' ||
    location.pathname === FOCUS_FLAME_LAB_PATH ||
    location.pathname.startsWith(`${FOCUS_FLAME_LAB_PATH}/`) ||
    shouldMountPortalB4Assistant(location.pathname);
  const isPortalShellRoute =
    location.pathname === '/portal' ||
    location.pathname.startsWith(`${FAMILY_HUB_PATH}/`) ||
    location.pathname === FAMILY_HUB_PATH ||
    location.pathname.startsWith(`${PROGRAM_DASHBOARD_PATH}/`) ||
    location.pathname === PROGRAM_DASHBOARD_PATH ||
    location.pathname.startsWith(`${FAMILY_PORTAL_PATH}/`) ||
    location.pathname === FAMILY_PORTAL_PATH;
  const portalLoaderMessage = resolvePortalRouteLoaderMessage(location.pathname);
  const portalLoaderAcademy = portalLoaderMessage.includes('Focus Flame Academy');
  return (
    <>
      <ScrollToTop />
      {process.env.NODE_ENV === 'development' ? <PortalDebugTracker /> : null}
      <AnalyticsRouteTracker />
      <ChunkErrorBoundary>
        <Suspense
          fallback={
            isKidPlayShell ? (
              <KidPlayShellLoader />
            ) : isPortalShellRoute ? (
              <PortalRouteLoader message={portalLoaderMessage} academy={portalLoaderAcademy} />
            ) : (
              <NavigationLoader />
            )
          }
        >
          <Outlet key={resolveAppOutletKey(location.pathname, location.search, location.hash)} />
        </Suspense>
      </ChunkErrorBoundary>
      {!isImmersiveKidsGame ? <CourageToolsPopup /> : null}
      {!hideAskB4Chat ? <DeferredB4ChatWidget /> : null}
    </>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <PilotAccessProvider>
        <MissionGamePhaseProvider>
          <Routes>
            <Route element={<AppLayout />}>{appRouteChildren}</Route>
          </Routes>
        </MissionGamePhaseProvider>
      </PilotAccessProvider>
    </ToastProvider>
  );
};

export default App;
