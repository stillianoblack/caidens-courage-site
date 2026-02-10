import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import PageHeaderLockup from '../components/sections/PageHeaderLockup';

const CampCourage: React.FC = () => {
  const [, setIsComingSoonModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleComingSoonClick = useCallback(() => {
    setIsComingSoonModalOpen(true);
  }, []);

  const handleEducatorAccess = () => {
    navigate('/courage-academy#educator-access');
  };

  return (
    <div className="min-h-screen bg-cream font-body">
      <Header onComingSoonClick={handleComingSoonClick} />

      <PageHeaderLockup
        title="Camp Courage"
        description="Guided SEL missions, companion activities, and classroom pilots for educators and caregivers. A calm, welcoming space for kids to practice courage — together with the adults who support them."
        subDescription="Part of Courage Academy. Request educator access to unlock pilot resources."
        cta={{ label: 'Request Educator Access', onClick: handleEducatorAccess }}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-500 mb-4">
              What’s inside
            </h2>
            <ul className="space-y-3 text-navy-600">
              <li className="flex items-start">
                <span className="text-golden-500 mr-2 font-bold">•</span>
                <span>Guided SEL missions for your classroom or group</span>
              </li>
              <li className="flex items-start">
                <span className="text-golden-500 mr-2 font-bold">•</span>
                <span>Printable companion activities and B-4 tools</span>
              </li>
              <li className="flex items-start">
                <span className="text-golden-500 mr-2 font-bold">•</span>
                <span>Classroom pilots and training guides</span>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-500 mb-4">
              Next steps
            </h2>
            <p className="text-navy-600 mb-6">
              Explore classroom pilots and training guides, or request educator access to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="primary" size="md" as={Link} to="/classroom-pilots">
                Classroom Pilots
              </Button>
              <Button variant="secondary" size="md" as={Link} to="/training-guides">
                Training & Guides
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CampCourage;
