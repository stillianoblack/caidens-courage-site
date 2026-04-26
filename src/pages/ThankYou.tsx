import React from 'react';
import { Link } from 'react-router-dom';

const ThankYou: React.FC = () => {
  return (
    <div className="min-h-screen cv-cinematic-section flex items-center justify-center px-6 relative overflow-hidden">
      <div className="w-full max-w-2xl rounded-2xl bg-white/10 border border-white/20 p-8 sm:p-12 backdrop-blur">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: '#FFFFFF' }}>Thank you for your purchase!</h1>
        <p className="mt-4 text-base sm:text-lg" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
          Your support means a lot. You&apos;ll receive a confirmation from Stripe shortly.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-[#1B2A44]"
          >
            Back to Home
          </Link>
          <a
            href="mailto:stills@caidenscourage.com"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold shadow-lg border border-white/20 text-[#1B2A44]"
            style={{ backgroundColor: '#E5C06A' }}
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;


