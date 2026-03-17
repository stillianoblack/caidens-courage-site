import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BluePageHeader from '../components/sections/BluePageHeader';
import Button from '../components/ui/Button';

const JOURNEY_ENTRIES = [
  {
    title: "The Story Expanded",
    date: "March 2026",
    body: "Caiden's Courage began as a 54-page story, but as the world grew, so did the journey. The book has now expanded into a full 120-page hardcover graphic novel.",
  },
  {
    title: "Founder's Edition Sold Out",
    date: "March 2026",
    body: "The first 45 Founder's Edition copies are officially sold out. These early supporters will receive the first hardcover printing and helped bring this story to life.",
  },
  {
    title: "The Courage Companion",
    date: "March 2026",
    body: "Alongside the main story, we introduced the Courage Companion — an activity workbook designed to help kids explore focus, creativity, and storytelling in their own way.",
  },
];

const Journey: React.FC = () => {
  const [, setIsComingSoonModalOpen] = useState(false);

  const handleComingSoonClick = useCallback(() => {
    setIsComingSoonModalOpen(true);
  }, []);

  useEffect(() => {
    document.title = "The First Print Journey | Caiden's Courage";
  }, []);

  return (
    <div className="min-h-screen bg-cream font-body">
      <Header onComingSoonClick={handleComingSoonClick} />

      <BluePageHeader
        eyebrow="THE FIRST PRINT"
        title="The First Print Journey"
        description="Follow the journey of bringing Caiden's Courage to life — from early sketches to the first hardcover release."
        badge="First Edition Launch"
      />

      {/* Timeline / Feed */}
      <div className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8" style={{ marginTop: '70px' }}>
        <div className="max-w-3xl mx-auto space-y-8 sm:space-y-10">
          {JOURNEY_ENTRIES.map((entry, index) => (
            <article
              key={index}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-navy-100"
            >
              <p className="text-xs sm:text-sm font-semibold text-navy-400 uppercase tracking-wide mb-2">
                {entry.date}
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-navy-500 mb-4">
                {entry.title}
              </h2>
              <p className="text-base sm:text-lg text-navy-600 leading-relaxed">
                {entry.body}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-cream">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg sm:text-xl text-navy-600 mb-6">
            Pre-orders for the first print are now open.
          </p>
          <Link to="/comicbook">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Pre-order Now
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Journey;
