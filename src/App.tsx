import React, { Suspense } from 'react';
import { Outlet, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import {
  MissionGamePhaseProvider,
  useMissionGamePhase,
} from './context/MissionGamePhaseContext';
import Home from './pages/Home';
import ClassicHome from './pages/ClassicHome';
import KidsHub from './pages/KidsHub';
import Schools from './pages/Schools';
import ParentsPage from './pages/ParentsPage';
import TeachersPage from './pages/TeachersPage';
import CampsPage from './pages/CampsPage';
import StoryHub from './pages/StoryHub';
import LegacySchoolRouteRedirect, { LegacyCampCourageRedirect } from './components/schools/LegacySchoolRouteRedirect';
import Portal from './pages/Portal';
import PortalDashboard from './pages/PortalDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import ThankYou from './pages/ThankYou';
import Success from './pages/Success';
import NotifySuccess from './pages/NotifySuccess';
import ToolkitSuccess from './pages/ToolkitSuccess';
import FormSuccess from './pages/FormSuccess';
import Cancelled from './pages/Cancelled';
import Resources from './pages/Resources';
import Product from './pages/Product';
import Preview from './pages/Preview';
import Mission from './pages/Mission';
import About from './pages/About';
import World from './pages/World';
import Characters from './pages/Characters';
import B4Clicker from './pages/B4Clicker';
import B4ToolsLibrary from './pages/ResourcesB4ToolsLibrary';
import ChatWithB4 from './pages/ChatWithB4';
import TrainingGuides from './pages/TrainingGuides';
import Journey from './pages/Journey';
import Contact from './pages/Contact';
import PilotProgramSignupPage from './pages/PilotProgramSignupPage';
import AdultAssessmentPage from './pages/AdultAssessmentPage';
import PilotDashboardPage from './pages/PilotDashboardPage';
import AnalyticsRouteTracker from './components/analytics/AnalyticsRouteTracker';
import DeferredB4ChatWidget from './components/DeferredB4ChatWidget';
import CourageToolsPopup from './components/CourageToolsPopup';
import NavigationLoader from './components/NavigationLoader';
import PortalRouteLoader from './components/portal/PortalRouteLoader';
import { ChunkErrorBoundary } from './components/ChunkErrorBoundary';
import { resolveAppOutletKey } from './lib/portalOutletKey';
import { resolvePortalRouteLoaderMessage } from './lib/portalRouteLoaderMessage';
import ScrollToTop from './components/ScrollToTop';
import PortalDebugTracker from './components/PortalDebugTracker';
import {
  B4BaselineCheckPage,
  B4GuidePage,
  B4PortalCheckInPage,
  B4PortalFeelingFinderPage,
  B4PortalPage,
  B4PortalWeek1Page,
  B4ResultsAdminPage,
  CaidenQuestHubPage,
  CaidenQuestPage,
  CharliePortalHubPage,
  CharliePortalMissionPage,
  FacilitatorAdultGuideHubPage,
  FacilitatorAdultGuideMissionPage,
  FacilitatorBaselineCheckPage,
  FocusFlameLabPage,
  KidsCharacterPage,
  KidsPortalPage,
  MirandaMissionPage,
  MirandaMysteryFilesHubPage,
  MirandaPortalHubPage,
  MirandaPortalMissionPage,
  PilotTermsPage,
  StudentGalleryPublicPage,
  StudentGallerySubmitPage,
  Week0AssessmentPage,
} from './routes/lazyPages';
import {
  FamilyAdultAssessmentPanel,
  FamilyBaselineCheckPanel,
  FamilyCertificatesPanel,
  FamilyCharacterProfilePage,
  FamilyCharactersPanel,
  FamilyContinueLearningPanel,
  FamilyDownloadsPanel,
  FamilyGalleryPanel,
  FamilyGuidePanel,
  FamilyOverviewPanel,
} from './routes/familyPanels';
import {
  FamilyAdultGuideHubPage,
  FamilyAdultGuideMissionPage,
} from './routes/familyLazyPanels';
import FacilitatorPortalEntry from './pages/FacilitatorPortalEntry';
import ProgramDashboardPage from './pages/ProgramDashboardPage';
import FamilyHubLayout from './pages/FamilyHubLayout';
import FamilyPortalLayout from './pages/FamilyPortalLayout';
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
  PILOT_TERMS_PATH,
  FAMILY_PORTAL_PATH,
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
} from './config/courageRoutes';

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
  return <Home />;
};

const appRouteChildren = (
  <>
      <Route path="/" element={<RootRoute />} />

      {/* Story world */}
      <Route path={STORY_PATH} element={<StoryHub />} />
      <Route path={STORY_BOOKS_PATH} element={<Product />} />
      <Route path={STORY_CHARACTERS_PATH} element={<Characters />} />

      {/* Brave Mind Club */}
      <Route path={BRAVE_MIND_CLUB_PATH} element={<Resources />} />
      <Route path={BMC_COLORING_PATH} element={<Resources />} />
      <Route path={BMC_ACTIVITIES_PATH} element={<Resources />} />
      <Route path={BMC_RESET_TOOLS_PATH} element={<B4Clicker />} />

      {/* Interactive */}
      <Route path={B4_BASELINE_CHECK_PATH} element={<B4BaselineCheckPage />} />
      <Route path={WEEK_0_ASSESSMENT_ALIAS_PATH} element={<Navigate to={B4_BASELINE_CHECK_PATH} replace />} />
      <Route path={WEEK_0_ASSESSMENT_PATH} element={<Week0AssessmentPage />} />
      <Route path={B4_GUIDE_PATH} element={<B4GuidePage />} />
      <Route path="/focus-flame-lab" element={<FocusFlameLabPage />} />

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
      <Route path={FACILITATOR_B4_RESULTS_PATH} element={<PilotDashboardPage />} />
      <Route
        path={FACILITATOR_B4_BASELINE_RESULTS_PATH}
        element={<Navigate to={FACILITATOR_B4_RESULTS_PATH} replace />}
      />
      <Route path={PILOT_DASHBOARD_PATH} element={<Navigate to={FACILITATOR_PORTAL_PATH} replace />} />
      <Route path={BLUE_RIBBON_PILOT_PATH} element={<PilotDashboardPage />} />
      <Route path={PROGRAM_DASHBOARD_PATH} element={<ProgramDashboardPage />}>
        <Route path="kids/caiden" element={<CaidenQuestHubPage />} />
        <Route path="kids/caiden/:questId" element={<CaidenQuestPage />} />
        <Route path="kids/miranda" element={<MirandaPortalHubPage />} />
        <Route path="kids/miranda/:missionId" element={<MirandaPortalMissionPage />} />
        <Route path="kids/b4" element={<B4PortalPage />} />
        <Route path="kids/b4/check-in" element={<B4PortalCheckInPage />} />
        <Route path="kids/b4/week-1" element={<B4PortalWeek1Page />} />
        <Route path="kids/b4/feeling-finder" element={<B4PortalFeelingFinderPage />} />
        <Route path="kids/charlie" element={<CharliePortalHubPage />} />
        <Route path="kids/charlie/:missionId" element={<CharliePortalMissionPage />} />
        <Route path="kids/zeke" element={<KidsCharacterPage character="zeke" />} />
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
      <Route path={PILOT_TERMS_PATH} element={<PilotTermsPage />} />
      <Route path={ACADEMY_DASHBOARD_ALIAS_PATH} element={<Navigate to={FACILITATOR_PORTAL_PATH} replace />} />
      <Route path={B4_RESULTS_ADMIN_PATH} element={<B4ResultsAdminPage />} />

      {/* Blue Ribbon family portal backup */}
      <Route element={<FamilyPortalLayout />}>
        <Route path={FAMILY_PORTAL_PATH}>
          <Route index element={<FamilyOverviewPanel />} />
          <Route path="children" element={<Navigate to="characters" replace />} />
          <Route path="continue-learning" element={<FamilyContinueLearningPanel />} />
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
        <Route path={`${KIDS_PORTAL_PATH}/charlie`} element={<CharliePortalHubPage />} />
        <Route path={`${KIDS_PORTAL_PATH}/charlie/:missionId`} element={<CharliePortalMissionPage />} />
      </Route>

      {/* Program family hub (/family-hub) */}
      <Route element={<FamilyHubLayout />}>
        <Route path={FAMILY_HUB_PATH}>
          <Route index element={<FamilyOverviewPanel />} />
          <Route path="children" element={<Navigate to="characters" replace />} />
          <Route path="continue-learning" element={<FamilyContinueLearningPanel />} />
          <Route path="weekly-adventures" element={<FamilyContinueLearningPanel />} />
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
        <Route path={`${FAMILY_HUB_KIDS_BASE}/charlie`} element={<CharliePortalHubPage />} />
        <Route path={`${FAMILY_HUB_KIDS_BASE}/charlie/:missionId`} element={<CharliePortalMissionPage />} />
        <Route path={`${FAMILY_HUB_KIDS_BASE}/zeke`} element={<KidsCharacterPage character="zeke" />} />
      </Route>

      {/* Legacy kids hub (non-portal shell) */}
      <Route path={KIDS_PORTAL_PATH} element={<KidsPortalPage />} />
      <Route path={`${KIDS_PORTAL_PATH}/zeke`} element={<KidsCharacterPage character="zeke" />} />

      <Route path={MIRANDA_MYSTERY_FILES_PATH} element={<MirandaMysteryFilesHubPage />} />
      <Route path={`${MIRANDA_MYSTERY_FILES_PATH}/:missionId`} element={<MirandaMissionPage />} />
      <Route
        path={MIRANDA_FIRST_DAY_PATH}
        element={<Navigate to={`${MIRANDA_MYSTERY_FILES_PATH}/the-missing-student`} replace />}
      />
      <Route path={STUDENT_GALLERY_SUBMIT_PATH} element={<StudentGallerySubmitPage />} />
      <Route path={STUDENT_GALLERY_PUBLIC_PATH} element={<StudentGalleryPublicPage />} />
      <Route path="/kids" element={<KidsHub />} />
      <Route path="/parents" element={<ParentsPage />} />
      <Route path="/teachers" element={<TeachersPage />} />
      <Route path="/camps" element={<CampsPage />} />
      <Route path="/schools" element={<Schools />} />

      {/* Portal */}
      <Route path="/portal" element={<Portal />} />
      <Route path="/portal/dashboard" element={<PortalDashboard />} />

      {/* Legacy redirects — preserve bookmarks */}
      <Route path="/braveminds" element={<Navigate to={BRAVE_MIND_CLUB_PATH} replace />} />
      <Route path="/braveminds/notify-success" element={<NotifySuccess />} />
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
      <Route path="/braveminds/b4-tools-library" element={<B4ToolsLibrary />} />

      <Route path="/focus-flame-academy" element={<LegacySchoolRouteRedirect />} />
      <Route path="/classic-home" element={<ClassicHome />} />
      <Route path="/camp-courage" element={<LegacyCampCourageRedirect />} />
      <Route path="/camp-courage/toolkit-success" element={<ToolkitSuccess />} />
      <Route path="/classroom-pilots" element={<Navigate to="/schools#pilot" replace />} />
      <Route path="/training-guides" element={<TrainingGuides />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/success" element={<Success />} />
      <Route path="/cancelled" element={<Cancelled />} />
      <Route path="/form-success" element={<FormSuccess />} />
      <Route path="/preview" element={<Preview />} />
      <Route path="/book/preview" element={<Navigate to="/preview" replace />} />
      <Route path="/mission" element={<Mission />} />
      <Route path="/about" element={<About />} />
      <Route path="/world" element={<World />} />
      <Route path="/journey" element={<Journey />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/chat" element={<ChatWithB4 />} />
  </>
);

const AppLayout: React.FC = () => {
  const location = useLocation();
  const missionPhase = useMissionGamePhase();
  const isMirandaExperience =
    location.pathname === MIRANDA_MYSTERY_FILES_PATH ||
    location.pathname.startsWith(`${MIRANDA_MYSTERY_FILES_PATH}/`) ||
    location.pathname === MIRANDA_FIRST_DAY_PATH;
  const isImmersiveKidsGame =
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
  /** Hide Ask B-4 during active gameplay; intro, portals, and completion keep the button. */
  const hideAskB4Chat =
    missionPhase === 'quiz' ||
    location.pathname === FOCUS_FLAME_LAB_PATH ||
    location.pathname.startsWith(`${FOCUS_FLAME_LAB_PATH}/`);
  const isPortalShellRoute =
    location.pathname === '/portal' ||
    location.pathname.startsWith(`${FAMILY_HUB_PATH}/`) ||
    location.pathname === FAMILY_HUB_PATH ||
    location.pathname.startsWith(`${PROGRAM_DASHBOARD_PATH}/`) ||
    location.pathname === PROGRAM_DASHBOARD_PATH ||
    location.pathname.startsWith(`${FAMILY_PORTAL_PATH}/`) ||
    location.pathname === FAMILY_PORTAL_PATH;
  return (
    <>
      <ScrollToTop />
      {process.env.NODE_ENV === 'development' ? <PortalDebugTracker /> : null}
      <AnalyticsRouteTracker />
      <ChunkErrorBoundary>
        <Suspense
          fallback={
            isPortalShellRoute ? (
              <PortalRouteLoader message={resolvePortalRouteLoaderMessage(location.pathname)} />
            ) : (
              <NavigationLoader />
            )
          }
        >
          <Outlet
            key={resolveAppOutletKey(location.pathname, location.search, location.hash)}
          />
        </Suspense>
      </ChunkErrorBoundary>
      {!isImmersiveKidsGame ? <CourageToolsPopup /> : null}
      {!hideAskB4Chat ? <DeferredB4ChatWidget /> : null}
    </>
  );
};

const App: React.FC = () => {
  return (
    <MissionGamePhaseProvider>
      <Routes>
        <Route element={<AppLayout />}>{appRouteChildren}</Route>
      </Routes>
    </MissionGamePhaseProvider>
  );
};

export default App;
