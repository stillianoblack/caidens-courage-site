import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import ThankYou from './pages/ThankYou';
import Cancelled from './pages/Cancelled';
import Resources from './pages/Resources';
import Product from './pages/Product';
import Preview from './pages/Preview';
import Mission from './pages/Mission';
import About from './pages/About';

const App: React.FC = () => {
  return (
    <Router>
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
      </Routes>
    </Router>
  );
}

export default App;

