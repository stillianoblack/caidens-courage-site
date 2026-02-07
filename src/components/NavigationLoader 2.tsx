import React from 'react';

const NavigationLoader: React.FC = () => (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm"
    aria-live="polite"
    aria-label="Loading"
  >
    <div className="w-4 h-4 rounded-full bg-[#E6C068] animate-pulse" />
  </div>
);

export default NavigationLoader;
