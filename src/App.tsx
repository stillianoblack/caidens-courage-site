import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import B4ChatWidget from './components/B4ChatWidget';
import RouteHeroPreload from './components/RouteHeroPreload';
// import { initLaunchDarkly, LaunchDarklyProvider } from './lib/launchdarkly'; // Temporarily disabled for LaunchDarkly debugging.

const ROUTE_TRANSITION = { duration: 0.12 };

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const ThankYou = lazy(() => import('./pages/ThankYou'));
const Cancelled = lazy(() => import('./pages/Cancelled'));
const Resources = lazy(() => import('./pages/Resources'));
const Product = lazy(() => import('./pages/Product'));
const Preview = lazy(() => import('./pages/Preview'));
const Mission = React.lazy(() => import("./pages/Mission"));
const About = lazy(() => import('./pages/About'));
const B4Clicker = lazy(() => import('./pages/B4Clicker'));
const CourageAcademy = lazy(() => import('./pages/CourageAcademy'));
const ClassroomPilots = lazy(() => import('./pages/ClassroomPilots'));
const TrainingGuides = lazy(() => import('./pages/TrainingGuides'));
const ResourcesB4ToolsLibrary = lazy(() => import('./pages/ResourcesB4ToolsLibrary'));
const ResourcesDownloads = lazy(() => import('./pages/ResourcesDownloads'));
const Contact = lazy(() => import('./pages/Contact'));
const Characters = lazy(() => import('./pages/Characters'));
const World = lazy(() => import('./pages/World'));

const routeList = (
  <>
    <Route path="/" element={<Home />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/thank-you" element={<ThankYou />} />
    <Route path="/cancelled" element={<Cancelled />} />
    <Route path="/resources" element={<Resources />} />
    <Route path="/resources/coloring-pages" element={<Navigate to="/resources?type=coloring" replace />} />
    <Route path="/resources/wallpapers" element={<Navigate to="/resources?type=wallpaper" replace />} />
    <Route path="/resources/teachers" element={<Navigate to="/resources?type=teacher-pack" replace />} />
    <Route path="/comicbook" element={<Product />} />
    <Route path="/comic-book" element={<Navigate to="/comicbook" replace />} />
    <Route path="/product" element={<Navigate to="/comicbook" replace />} />
    <Route path="/preview" element={<Preview />} />
    <Route path="/book/preview" element={<Navigate to="/preview" replace />} />
    <Route path="/mission" element={<Mission />} />
    <Route path="/about" element={<About />} />
    <Route path="/b4-clicker" element={<Navigate to="/b4-tools" replace />} />
    <Route path="/b4-tools" element={<B4Clicker />} />
    <Route path="/camp-courage" element={<CourageAcademy />} />
    <Route path="/courage-academy" element={<Navigate to="/camp-courage" replace />} />
    <Route path="/classroom-pilots" element={<ClassroomPilots />} />
    <Route path="/training-guides" element={<TrainingGuides />} />
    <Route path="/courage-academy/classroom-pilots" element={<Navigate to="/classroom-pilots" replace />} />
    <Route path="/courage-academy/training-guides" element={<Navigate to="/training-guides" replace />} />
    <Route path="/resources/b4-tools-library" element={<ResourcesB4ToolsLibrary />} />
    <Route path="/resources/downloads" element={<ResourcesDownloads />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/characters" element={<Characters />} />
    <Route path="/meet-the-characters" element={<Characters />} />
    <Route path="/world" element={<World />} />
  </>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const prevLocationRef = useRef(location);
  const [exitingLocation, setExitingLocation] = useState<typeof location | null>(null);

  // NOTE: LaunchDarkly initialization is temporarily disabled for debugging navigation stalls.
  // The app now renders immediately without attempting to load or evaluate any flags.
  // useEffect(() => {
  //   const schedule = (fn: () => void) => {
  //     if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  //       (window as any).requestIdleCallback(fn, { timeout: 2000 });
  //     } else {
  //       setTimeout(fn, 1500);
  //     }
  //   };
  //
  //   schedule(() => {
  //     initLaunchDarkly();
  //   });
  // }, []);

  useEffect(() => {
    if (location.pathname !== prevLocationRef.current.pathname) {
      setExitingLocation(prevLocationRef.current);
      prevLocationRef.current = location;
    }
  }, [location]);

  const routeTransitionProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: ROUTE_TRANSITION,
  };

  return (
    <>
      <RouteHeroPreload />
      <B4ChatWidget />
      <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}>Loading...</div>}>
        <div style={{ position: 'relative' }}>
          {/* @ts-expect-error framer-motion AnimatePresence return type is Element | undefined in strict TS */}
          <AnimatePresence mode="wait" onExitComplete={() => setExitingLocation(null)}>
            {exitingLocation != null && (
              <motion.div key={exitingLocation.pathname} {...routeTransitionProps} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <Routes location={exitingLocation}>{routeList}</Routes>
              </motion.div>
            )}
            <motion.div key={location.pathname} {...routeTransitionProps}>
              <Routes location={location}>{routeList}</Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </Suspense>
    </>
  );
};

const App: React.FC = () => {
  // LaunchDarklyProvider is temporarily disabled so no feature flag initialization
  // can affect navigation or perceived responsiveness during debugging.
  // return (
  //   <LaunchDarklyProvider>
  //     <AppContent />
  //   </LaunchDarklyProvider>
  // );
  return <AppContent />;
}

export default App;

