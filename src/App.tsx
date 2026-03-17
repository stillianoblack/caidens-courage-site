import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import DeferredB4ChatWidget from './components/DeferredB4ChatWidget';

// Route-based code splitting: only load page chunks when navigated to
const Home = lazy(() => import('./pages/Home'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const ThankYou = lazy(() => import('./pages/ThankYou'));
const Success = lazy(() => import('./pages/Success'));
const NotifySuccess = lazy(() => import('./pages/NotifySuccess'));
const ToolkitSuccess = lazy(() => import('./pages/ToolkitSuccess'));
const FormSuccess = lazy(() => import('./pages/FormSuccess'));
const Cancelled = lazy(() => import('./pages/Cancelled'));
const Resources = lazy(() => import('./pages/Resources'));
const Product = lazy(() => import('./pages/Product'));
const Preview = lazy(() => import('./pages/Preview'));
const Mission = lazy(() => import('./pages/Mission'));
const About = lazy(() => import('./pages/About'));
const World = lazy(() => import('./pages/World'));
const Characters = lazy(() => import('./pages/Characters'));
const B4Clicker = lazy(() => import('./pages/B4Clicker'));
const B4ToolsLibrary = lazy(() => import('./pages/ResourcesB4ToolsLibrary'));
const ChatWithB4 = lazy(() => import('./pages/ChatWithB4'));
const CampCourage = lazy(() => import('./pages/CampCourage'));
const ClassroomPilots = lazy(() => import('./pages/ClassroomPilots'));
const TrainingGuides = lazy(() => import('./pages/TrainingGuides'));
const Journey = lazy(() => import('./pages/Journey'));

const PageFallback = () => (
  <div className="min-h-screen bg-cream flex items-center justify-center" aria-label="Loading">
    <div className="w-10 h-10 border-2 border-navy-300 border-t-navy-600 rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <>
        <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/camp-courage" element={<CampCourage />} />
          <Route path="/camp-courage/toolkit-success" element={<ToolkitSuccess />} />
          <Route path="/classroom-pilots" element={<ClassroomPilots />} />
          <Route path="/training-guides" element={<TrainingGuides />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancelled" element={<Cancelled />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/notify-success" element={<NotifySuccess />} />
          <Route path="/form-success" element={<FormSuccess />} />
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
          <Route path="/world" element={<World />} />
          <Route path="/characters" element={<Characters />} />
          <Route path="/b4-tools" element={<B4Clicker />} />
          <Route path="/resources/b4-tools-library" element={<B4ToolsLibrary />} />
          <Route path="/chat" element={<ChatWithB4 />} />
          <Route path="/journey" element={<Journey />} />
        </Routes>
        </Suspense>
        <DeferredB4ChatWidget />
      </>
    </Router>
  );
}

export default App;

