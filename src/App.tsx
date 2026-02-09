import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import RouteHeroPreload from './components/RouteHeroPreload';
import { ChunkErrorBoundary } from './components/ChunkErrorBoundary';
import { initLaunchDarkly, LaunchDarklyProvider } from './lib/launchdarkly';
import { runAfterPaint } from './lib/safeMode';
import { SAFE_MODE } from './lib/safeMode';

const ROUTE_TRANSITION = { duration: 0.12 };

/** Minimal hero skeleton so Lighthouse always sees painted content while route chunks load. */
const RouteFallbackHeroSkeleton: React.FC = () => (
  <div className="min-h-screen bg-cream font-body" aria-label="Loading">
    <header className="h-16 sm:h-20 w-full bg-navy-500 shrink-0" />
    <section
      className="relative flex flex-col justify-center px-4 sm:px-6 pt-12 pb-16"
      style={{ minHeight: '60vh' }}
    >
      <div className="max-w-4xl mx-auto w-full space-y-4">
        <div className="h-8 sm:h-10 bg-navy-200/40 rounded w-3/4 max-w-md animate-pulse" />
        <div className="h-4 bg-navy-200/30 rounded w-full max-w-xl animate-pulse" />
        <div className="h-4 bg-navy-200/30 rounded w-5/6 max-w-lg animate-pulse" />
        <div className="pt-4">
          <span className="inline-block h-12 w-40 bg-golden-500/50 rounded-lg animate-pulse" />
        </div>
      </div>
    </section>
  </div>
);

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

// Lazy chat widget – not in initial bundle; load only after first paint.
const B4ChatWidget = lazy(() => import('./components/B4ChatWidget'));

const AppContent: React.FC = () => {
  const location = useLocation();
  const prevLocationRef = useRef(location);
  const [exitingLocation, setExitingLocation] = useState<typeof location | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [enableMotion, setEnableMotion] = useState(false);
  const navIdRef = useRef(0);
  const navStartTimeRef = useRef<number | null>(null);
  const navTimerRef = useRef<number | null>(null);

  // Route change log for debugging navigation
  useEffect(() => {
    if (typeof console !== 'undefined' && console.log) {
      console.log('[ROUTE]', location.pathname);
    }
  }, [location.pathname]);

  // Animations: enable only after first paint so they never block nav.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setEnableMotion(true);
      setExitingLocation(null); // avoid showing stale exiting route when motion turns on
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // B-4 chat: mount only after first paint + idle (never block nav or first paint).
  useEffect(() => {
    let id: number;
    const enable = () => setShowChat(true);
    const schedule = () => {
      if (typeof window !== 'undefined' && typeof (window as any).requestIdleCallback === 'function') {
        id = (window as any).requestIdleCallback(enable, { timeout: 1500 });
      } else {
        id = window.setTimeout(enable, 800) as unknown as number;
      }
    };
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(schedule);
    } else {
      schedule();
    }
    return () => {
      if (typeof (window as any).cancelIdleCallback === 'function' && typeof id === 'number') {
        (window as any).cancelIdleCallback(id);
      } else {
        clearTimeout(id);
      }
    };
  }, []);

  // Initialize LaunchDarkly lazily after first paint / idle when SAFE_MODE is off.
  // In SAFE_MODE, we skip flags entirely and rely on defaultFlags.
  useEffect(() => {
    if (SAFE_MODE) return;
    runAfterPaint(() => {
      initLaunchDarkly();
    });
  }, []);

  // Route-change instrumentation for debugging navigation freezes.
  useEffect(() => {
    const debugEnabled =
      typeof window !== 'undefined' && (window as any).__NAV_DEBUG__ === true;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const navId = ++navIdRef.current;
    navStartTimeRef.current = now;

    if (debugEnabled) {
      // eslint-disable-next-line no-console
      console.log('[navTrace] NAV_START', {
        id: navId,
        path: location.pathname,
        t: now,
      });
    }

    if (navTimerRef.current != null && typeof window !== 'undefined') {
      window.clearTimeout(navTimerRef.current);
    }

    if (typeof window !== 'undefined') {
      navTimerRef.current = window.setTimeout(() => {
        if (navIdRef.current !== navId) return; // a newer nav started
        if (!debugEnabled) return;

        const flagsRunning = !!(window as any).__INIT_FLAGS_RUNNING__;
        const chatRunning = !!(window as any).__INIT_CHAT_RUNNING__;

        // eslint-disable-next-line no-console
        console.warn('[navTrace] NAV_STALL', {
          id: navId,
          path: location.pathname,
          elapsedMs: 2000,
          initializers: {
            flagsRunning,
            chatRunning,
          },
        });
      }, 2000);
    }
  }, [location.pathname]);

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
      <Suspense fallback={null}>
        {showChat && typeof window !== 'undefined' && !(window as any).__SAFE_MODE__ && <B4ChatWidget />}
      </Suspense>
      <ChunkErrorBoundary>
        <Suspense fallback={<RouteFallbackHeroSkeleton />}>
          <div style={{ position: 'relative' }}>
            {enableMotion ? (
              /* @ts-expect-error framer-motion AnimatePresence return type is Element | undefined in strict TS */
              <AnimatePresence
                mode="wait"
                onExitComplete={() => {
                  setExitingLocation(null);
                  const debugEnabled =
                    typeof window !== 'undefined' && (window as any).__NAV_DEBUG__ === true;
                  const now =
                    typeof performance !== 'undefined' ? performance.now() : Date.now();
                  const start = navStartTimeRef.current;
                  const id = navIdRef.current;

                  if (typeof window !== 'undefined' && navTimerRef.current != null) {
                    window.clearTimeout(navTimerRef.current);
                    navTimerRef.current = null;
                  }

                  if (debugEnabled && start != null) {
                    const elapsed = now - start;
                    // eslint-disable-next-line no-console
                    console.log('[navTrace] NAV_END', {
                      id,
                      path: location.pathname,
                      ms: Math.round(elapsed),
                    });
                  }

                  navStartTimeRef.current = null;
                }}
              >
                {exitingLocation != null && (
                  <motion.div
                    key={exitingLocation.pathname}
                    {...routeTransitionProps}
                    style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                  >
                    <Routes location={exitingLocation}>{routeList}</Routes>
                  </motion.div>
                )}
                <motion.div key={location.pathname} {...routeTransitionProps}>
                  <Routes location={location}>{routeList}</Routes>
                </motion.div>
              </AnimatePresence>
            ) : (
              <Routes location={location}>{routeList}</Routes>
            )}
          </div>
        </Suspense>
      </ChunkErrorBoundary>
    </>
  );
};

const App: React.FC = () => {
  return (
    <LaunchDarklyProvider>
      <AppContent />
    </LaunchDarklyProvider>
  );
}

export default App;

