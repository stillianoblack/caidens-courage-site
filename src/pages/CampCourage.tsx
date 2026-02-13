import React, { useState, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BluePageHeader from '../components/sections/BluePageHeader';
import ParentsEducatorsToolkitSection from '../components/camp-courage/ParentsEducatorsToolkitSection';
import ExploreInsideCampCourageSection from '../components/camp-courage/ExploreInsideCampCourageSection';
import ResourcesRecommendationsSection from '../components/resources/ResourcesRecommendationsSection';

const CampCourage: React.FC = () => {
  const [, setIsComingSoonModalOpen] = useState(false);

  const handleComingSoonClick = useCallback(() => {
    setIsComingSoonModalOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-cream font-body">
      <Header onComingSoonClick={handleComingSoonClick} />

      <BluePageHeader
        title="Camp Courage"
        description="A Courage Academy experience with guided SEL missions, companion activities, and classroom pilots for educators and caregivers."
        subtitle="A calm, welcoming space for kids to practice courage — together with the adults who support them."
      />

      <ParentsEducatorsToolkitSection />

      <ExploreInsideCampCourageSection />

      {/* Section: What is Camp Courage */}
      <div className="py-16 sm:py-20 px-4 bg-cream" style={{ marginTop: '70px' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-4">
              What is Camp Courage?
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <p className="text-base sm:text-lg text-navy-600 text-center leading-relaxed">
              Camp Courage is a Courage Academy experience with guided SEL missions, companion activities, and classroom pilots for educators and caregivers. It&apos;s a calm, welcoming space for kids to practice courage — together with the adults who support them.
            </p>
          </div>
        </div>
      </div>

      <ResourcesRecommendationsSection />

      <Footer />
    </div>
  );
};

export default CampCourage;
