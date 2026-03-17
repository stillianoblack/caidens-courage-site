import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
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
import CampCourage from './pages/CampCourage';
import ClassroomPilots from './pages/ClassroomPilots';
import TrainingGuides from './pages/TrainingGuides';
import Journey from './pages/Journey';
import DeferredB4ChatWidget from './components/DeferredB4ChatWidget';

const App: React.FC = () => {
  return (
    <Router>
      <>
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
        <DeferredB4ChatWidget />
      </>
    </Router>
  );
}

export default App;

