import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import { getWaitlistUrl, openExternalUrl } from '../config/externalLinks';

interface ComingSoonProps {
  title: string;
  description?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => {
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);

  const handleWaitlistClick = () => {
    const waitlistUrl = getWaitlistUrl();
    if (waitlistUrl) {
      openExternalUrl(waitlistUrl);
    }
  };

  const handleComingSoonClick = () => {
    setIsComingSoonModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-cream font-body">
      <Header onComingSoonClick={handleComingSoonClick} />

      {/* Hero Section */}
      <div className="bg-cream px-4 py-16 sm:py-20" style={{ marginTop: '100px' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-500 mb-6">
            {title}
          </h1>
          {description && (
            <p className="text-lg sm:text-xl text-navy-600 mb-8">
              {description}
            </p>
          )}
          <p className="text-base sm:text-lg text-navy-600 mb-8">
            We're building this next. Join the Courage Community to get early access when it launches.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleWaitlistClick}
              className="w-full sm:w-auto"
            >
              Join Waitlist
            </Button>
            <Button
              variant="secondary"
              size="lg"
              as={Link}
              to="/contact"
              className="w-full sm:w-auto"
            >
              Contact
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ComingSoon;
