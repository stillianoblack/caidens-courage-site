import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { ChunkErrorBoundary } from './components/ChunkErrorBoundary';
import { initLaunchDarkly, LaunchDarklyProvider } from './lib/launchdarkly';
import { runAfterPaint } from './lib/safeMode';
import { SAFE_MODE } from './lib/safeMode';
import Home from './pages/Home';

/** Minimal fallback when a lazy route chunk is loading; avoids blank "stuck" screen. */
const RouteFallback = () => (
  <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
    Loading…
  </div>
);

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
const Journey = lazy(() => import('./pages/Journey'));

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
    <Route path="/journey" element={<Journey />} />
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

/**
 * Renders Routes with a key from the current path so the route tree always remounts on navigation.
 * This lives inside BrowserRouter so useLocation() sees the updated URL when you click a link.
 */
const RouterContent: React.FC = () => {
  const location = useLocation();
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        <Routes key={location.pathname}>{routeList}</Routes>
      </Suspense>
    </ChunkErrorBoundary>
  );
};

const AppContent: React.FC = () => {
  const [showChat, setShowChat] = useState(false);

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

  // Initialize LaunchDarkly only when explicitly enabled.
  useEffect(() => {
    if (SAFE_MODE || process.env.REACT_APP_ENABLE_LAUNCHDARKLY !== 'true') return;
    runAfterPaint(() => {
      initLaunchDarkly();
    });
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        {showChat && typeof window !== 'undefined' && !(window as any).__SAFE_MODE__ && <B4ChatWidget />}
      </Suspense>
      <RouterContent />
    </>
  );
};

const ENABLE_LAUNCHDARKLY = process.env.REACT_APP_ENABLE_LAUNCHDARKLY === 'true';

const App: React.FC = () => (
  <BrowserRouter>
    {ENABLE_LAUNCHDARKLY ? (
      <LaunchDarklyProvider>
        <AppContent />
      </LaunchDarklyProvider>
    ) : (
      <AppContent />
    )}
  </BrowserRouter>
);

export default App;

