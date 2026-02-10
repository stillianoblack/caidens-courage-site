import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import PageHeaderLockup from '../components/sections/PageHeaderLockup';

const ClassroomPilots: React.FC = () => {
  const [, setIsComingSoonModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleComingSoonClick = useCallback(() => {
    setIsComingSoonModalOpen(true);
  }, []);

  const handleContactClick = () => {
    navigate('/contact?subject=Classroom%20Pilot');
  };

  return (
    <div className="min-h-screen bg-cream font-body">
      <Header onComingSoonClick={handleComingSoonClick} />

      <PageHeaderLockup
        title="Classroom Pilots"
        description="Bring Caiden's Courage tools into real classrooms — and help shape what we build next."
        subDescription="For teachers, counselors, and after-school programs. Neurodivergent-friendly."
        cta={{ label: 'Request a Pilot', onClick: handleContactClick }}
      />

      {/* Section 1: What a pilot includes */}
      <div className="py-16 sm:py-20 px-4 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-4">
              What a pilot includes
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <ul className="space-y-4 text-base sm:text-lg text-navy-600">
              <li className="flex items-start">
                <span className="text-golden-500 mr-3 font-bold">•</span>
                <span>Guided SEL missions for your classroom</span>
              </li>
              <li className="flex items-start">
                <span className="text-golden-500 mr-3 font-bold">•</span>
                <span>Printable companion activities and resources</span>
              </li>
              <li className="flex items-start">
                <span className="text-golden-500 mr-3 font-bold">•</span>
                <span>Simple feedback loop to help us improve</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 2: Who it's for */}
      <div className="py-16 sm:py-20 px-4" style={{ backgroundColor: '#F3F8FF' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-4">
              Who it's for
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <ul className="space-y-4 text-base sm:text-lg text-navy-600">
              <li className="flex items-start">
                <span className="text-golden-500 mr-3 font-bold">•</span>
                <span>Teachers, counselors, and after-school programs</span>
              </li>
              <li className="flex items-start">
                <span className="text-golden-500 mr-3 font-bold">•</span>
                <span>Grades 1–6 (flexible)</span>
              </li>
              <li className="flex items-start">
                <span className="text-golden-500 mr-3 font-bold">•</span>
                <span>Neurodivergent-friendly classrooms</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 3: How to request */}
      <div className="py-16 sm:py-20 px-4 bg-cream">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-4">
            How to request
          </h2>
          <p className="text-lg sm:text-xl text-navy-600 max-w-2xl mx-auto mb-8">
            Ready to bring Caiden's Courage to your classroom? Contact us to learn more about pilot opportunities.
          </p>
          <Button variant="primary" size="lg" onClick={handleContactClick} className="w-full sm:w-auto">
            Request a Pilot
          </Button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ClassroomPilots;
