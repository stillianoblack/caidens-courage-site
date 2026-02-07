import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';

const TrainingGuides: React.FC = () => {
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);

  const handleComingSoonClick = () => {
    setIsComingSoonModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-cream font-body">
      <Header onComingSoonClick={handleComingSoonClick} />

      {/* Hero Section */}
      <div className="bg-cream px-4 py-16 sm:py-20" style={{ marginTop: '100px' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-500 mb-5">
            Training & Guides
          </h1>
          <p className="text-lg sm:text-xl text-navy-600 max-w-2xl mx-auto">
            Simple guidance for using B-4 tools at home and in the classroom.
          </p>
        </div>
      </div>

      {/* Section 1: Getting started */}
      <div className="py-16 sm:py-20 px-4 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-4">
              Getting started
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <ol className="space-y-4 text-base sm:text-lg text-navy-600 list-decimal list-inside">
              <li>Introduce B-4 tools in a calm, predictable moment</li>
              <li>Let kids explore at their own pace — no pressure</li>
              <li>Use the tools when emotions are high, but keep it simple</li>
              <li>Follow up with gentle questions, not demands</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Section 2: Tips for different learners */}
      <div className="py-16 sm:py-20 px-4" style={{ backgroundColor: '#F3F8FF' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-4">
              Tips for different learners
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <ul className="space-y-4 text-base sm:text-lg text-navy-600">
              <li className="flex items-start">
                <span className="text-golden-500 mr-3 font-bold">•</span>
                <span>Keep instructions short and visual</span>
              </li>
              <li className="flex items-start">
                <span className="text-golden-500 mr-3 font-bold">•</span>
                <span>Allow breaks and movement</span>
              </li>
              <li className="flex items-start">
                <span className="text-golden-500 mr-3 font-bold">•</span>
                <span>Use tools before emotions escalate</span>
              </li>
              <li className="flex items-start">
                <span className="text-golden-500 mr-3 font-bold">•</span>
                <span>Respect when a child says "not right now"</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 3: Downloadables */}
      <div className="py-16 sm:py-20 px-4 bg-cream">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-4">
            Downloadables
          </h2>
          <p className="text-lg sm:text-xl text-navy-600 max-w-2xl mx-auto mb-8">
            Download guides, worksheets, and classroom tools to support your implementation.
          </p>
          <Link to="/resources">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Browse resources
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TrainingGuides;
