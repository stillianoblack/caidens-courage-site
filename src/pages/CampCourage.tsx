import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BluePageHeader from '../components/sections/BluePageHeader';
import ParentsEducatorsToolkitSection from '../components/camp-courage/ParentsEducatorsToolkitSection';
import ExploreInsideCampCourageSection from '../components/camp-courage/ExploreInsideCampCourageSection';
import CampPilotPartnershipsSection from '../components/camp-courage/CampPilotPartnershipsSection';
import ResourcesRecommendationsSection from '../components/resources/ResourcesRecommendationsSection';

const CampCourage: React.FC = () => {
  const location = useLocation();
  const [, setIsComingSoonModalOpen] = useState(false);

  const handleComingSoonClick = useCallback(() => {
    setIsComingSoonModalOpen(true);
  }, []);

  useEffect(() => {
    if (!location.hash) return;

    const sectionId = location.hash.replace('#', '');
    const scrollToHash = () => {
      const target = document.getElementById(sectionId);
      if (!target) return;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    };

    const timeoutId = window.setTimeout(scrollToHash, 150);
    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen bg-cream font-body">
      <Header onComingSoonClick={handleComingSoonClick} />

      <BluePageHeader
        title="Camp Courage"
        description="The educational home of the Caiden Vale universe — interactive SEL experiences, guided missions, and the Camp Courage Toolkit for schools, camps, and youth programs."
        subtitle="A calm, story-driven space where kids practice courage with the adults who support them."
      />

      <ParentsEducatorsToolkitSection />

      <ExploreInsideCampCourageSection />

      <CampPilotPartnershipsSection />

      <section className="py-16 sm:py-20 px-4 bg-cream" aria-labelledby="what-is-camp-courage">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-navy-400 mb-3">
              THE COURAGE ACADEMY
            </p>
            <h2
              id="what-is-camp-courage"
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-4"
            >
              What is Camp Courage?
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-base sm:text-lg text-navy-600 text-center leading-relaxed">
              Camp Courage is the interactive SEL extension of Caiden&apos;s Courage — a Courage Academy
              experience built around comic storytelling, guided missions, and practical tools for real
              classrooms, camps, and counseling spaces.
            </p>
            <p className="text-base sm:text-lg text-navy-600 text-center leading-relaxed">
              Educators, counselors, and caregivers get a calm implementation hub: printable SEL supports,
              team-building activities, read-aloud experiences, and pilot partnerships that help kids ages
              7–12 build focus, confidence, and emotional courage.
            </p>
          </div>
        </div>
      </section>

      <ResourcesRecommendationsSection />

      <Footer />
    </div>
  );
};

export default CampCourage;
