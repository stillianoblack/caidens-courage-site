import React, { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import B4ChatWidget from './components/B4ChatWidget';
import { initLaunchDarkly, LaunchDarklyProvider } from './lib/launchdarkly';

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

const AppContent: React.FC = () => {
  // LaunchDarkly: init only after first paint (non-blocking). Prevents NO_FCP; no await, no gating.
  useEffect(() => {
    initLaunchDarkly();
  }, []);

  return (
    <>
      <B4ChatWidget />
      {/* Route-based code splitting: each page loads on demand. Fallback shown while chunk loads. */}
      <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}>Loading...</div>}>
        <Routes>
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
        </Routes>
      </Suspense>
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

