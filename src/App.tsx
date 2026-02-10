import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import RouteHeroPreload from './components/RouteHeroPreload';
import { ChunkErrorBoundary } from './components/ChunkErrorBoundary';
import { initLaunchDarkly, LaunchDarklyProvider } from './lib/launchdarkly';
import { runAfterPaint } from './lib/safeMode';
import { SAFE_MODE } from './lib/safeMode';
import Home from './pages/Home';

const DISABLE_HEADER_ANIMATIONS = process.env.REACT_APP_DISABLE_HEADER_ANIMATIONS === 'true';

/** Paths that render .circle-accent / .animate-float; only run FloatingAnimationController on these. */
const FLOATING_ANIMATION_PATHS = ['/', '/comicbook', '/b4-tools'];

// Lazy load non-home pages for code splitting (Home is eager above).
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const ThankYou = lazy(() => import('./pages/ThankYou'));
const Cancelled = lazy(() => import('./pages/Cancelled'));
const Resources = lazy(() => import('./pages/Resources'));
const Product = lazy(() => import('./pages/Product'));
const Preview = lazy(() => import('./pages/Preview'));
const Mission = lazy(() => import('./pages/Mission'));
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
    <Route path="/mission" element={<Suspense fallback={null}><Mission /></Suspense>} />
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
    <Route path="/characters" element={<Suspense fallback={null}><Characters /></Suspense>} />
    <Route path="/meet-the-characters" element={<Suspense fallback={null}><Characters /></Suspense>} />
    <Route path="/world" element={<Suspense fallback={null}><World /></Suspense>} />
  </>
);

// Lazy chat widget – not in initial bundle; load only after first paint.
const B4ChatWidget = lazy(() => import('./components/B4ChatWidget'));

// Floating animation controller – dynamic import; not in initial bundle; load only after page is interactive.
const FloatingAnimationController = React.lazy(() => import('./components/FloatingAnimationController'));

const AppContent: React.FC = () => {
  const location = useLocation();
  const [showChat, setShowChat] = useState(false);
  const [showFloatingController, setShowFloatingController] = useState(false);
  const navIdRef = useRef(0);
  const navStartTimeRef = useRef<number | null>(null);
  const navTimerRef = useRef<number | null>(null);

  // Route timing (dev only): log path and time-to-first-render after paint so we can see improvements.
  useEffect(() => {
    const path = location.pathname;
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (typeof window === 'undefined') return;
    const afterPaint = () => {
      const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
      if (process.env.NODE_ENV === 'development' && typeof console !== 'undefined' && console.log) {
        console.log('[routeTiming]', path, `${Math.round(elapsed)}ms`);
      }
    };
    let rafId = 0;
    if (typeof requestAnimationFrame !== 'undefined') {
      rafId = requestAnimationFrame(() => requestAnimationFrame(afterPaint));
    } else {
      rafId = setTimeout(afterPaint, 0) as unknown as number;
    }
    return () => {
      if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(rafId);
      else clearTimeout(rafId);
    };
  }, [location.pathname]);

  // Perf debug (?perf=1): route timings and top resources; no-op when not enabled.
  useEffect(() => {
    (window as unknown as { __PERF_DEBUG_ON_ROUTE__?: (path: string) => void }).__PERF_DEBUG_ON_ROUTE__?.(location.pathname);
  }, [location.pathname]);

  // Dev-only (?debug=1): log active timer/RAF counts on route change to spot cleanup leaks.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') return;
    try {
      if (new URLSearchParams(window.location.search).get('debug') !== '1') return;
      import('./debug/timerDebug').then((m) => {
        m.installTimerDebug();
        const counts = m.getActiveCounts();
        // eslint-disable-next-line no-console
        console.log('[timerDebug] route=', location.pathname, 'active:', counts);
      }).catch(() => {});
    } catch (e) {}
  }, [location.pathname]);

  // Load floating animation controller only after page is interactive (dynamic import; not in initial bundle).
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const enable = () => setShowFloatingController(true);
    let cleanup: (() => void) | undefined;
    const schedule = () => {
      if ('requestIdleCallback' in window) {
        const id = (window as any).requestIdleCallback(enable, { timeout: 2500 });
        cleanup = () => (window as any).cancelIdleCallback?.(id);
      } else {
        const id = setTimeout(enable, 1500);
        cleanup = () => clearTimeout(id);
      }
    };
    if (document.readyState === 'complete') {
      schedule();
      return () => cleanup?.();
    }
    const onLoad = () => schedule();
    window.addEventListener('load', onLoad, { once: true });
    return () => {
      window.removeEventListener('load', onLoad);
      cleanup?.();
    };
  }, []);

  // B-4 chat: mount only after first paint + idle (never block nav or first paint).
  useEffect(() => {
    let id: number;
    const enable = () => setShowChat(true);
    const schedule = () => {
      if (typeof window !== 'undefined' && typeof (window as any).requestIdleCallback === 'function') {
        id = (window as any).requestIdleCallback(enable, { timeout: 1500 });
      } else {
        id = setTimeout(enable, 800) as unknown as number;
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

  // Initialize LaunchDarkly only when explicitly enabled (temporarily disable via env).
  useEffect(() => {
    if (SAFE_MODE || process.env.REACT_APP_ENABLE_LAUNCHDARKLY !== 'true') return;
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

  // Temporary debug: ?debugNav=1 logs location.pathname on every route render to confirm React Router updates.
  if (typeof window !== 'undefined') {
    try {
      if (new URLSearchParams(window.location.search).get('debugNav') === '1') {
        // eslint-disable-next-line no-console
        console.log('[debugNav] location.pathname=', location.pathname);
      }
    } catch (e) {}
  }

  return (
    <>
      <RouteHeroPreload />
      <Suspense fallback={null}>
        {showChat && typeof window !== 'undefined' && !(window as any).__SAFE_MODE__ && <B4ChatWidget />}
      </Suspense>
      <Suspense fallback={null}>
        {showFloatingController &&
          !DISABLE_HEADER_ANIMATIONS &&
          FLOATING_ANIMATION_PATHS.includes(location.pathname) && (
            <FloatingAnimationController pathname={location.pathname} />
          )}
      </Suspense>
      <ChunkErrorBoundary>
        <Suspense fallback={null}>
          <div style={{ position: 'relative' }}>
            <Routes key={location.pathname}>{routeList}</Routes>
          </div>
        </Suspense>
      </ChunkErrorBoundary>
    </>
  );
};

const ENABLE_LAUNCHDARKLY = process.env.REACT_APP_ENABLE_LAUNCHDARKLY === 'true';

const App: React.FC = () => {
  if (ENABLE_LAUNCHDARKLY) {
    return (
      <LaunchDarklyProvider>
        <AppContent />
      </LaunchDarklyProvider>
    );
  }
  return <AppContent />;
};

export default App;

