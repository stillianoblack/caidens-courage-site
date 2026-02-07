import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import B4ChatWidget from './components/B4ChatWidget';
import NavigationLoader from './components/NavigationLoader';
import { scheduleNonBlockingSDK } from './lib/initNonBlockingSDK';

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
  // Prefetch main menu + CTA routes so transitions feel instant (no blocking overlay)
  useEffect(() => void import("./pages/Mission"), []);
  useEffect(() => void import("./pages/Resources"), []);
  useEffect(() => void import("./pages/About"), []);
  useEffect(() => void import("./pages/World"), []);
  useEffect(() => void import("./pages/Characters"), []);
  useEffect(() => void import("./pages/Contact"), []);
  useEffect(() => void import("./pages/Product"), []);

  // Run analytics/SDKs (e.g. LaunchDarkly) only when idle so they never block navigation or cause canceled eventsource during route transitions
  useEffect(() => scheduleNonBlockingSDK(), []);

  return (
    <>
      <B4ChatWidget />
      {/* Root-level Suspense: shows NavigationLoader (skeleton) immediately on link click while route chunk loads. No layout.tsx/loading.tsx – this is the single loading boundary. */}
      <Suspense fallback={<NavigationLoader />}>
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
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

