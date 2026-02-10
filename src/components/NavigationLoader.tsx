import React from 'react';

/**
 * Loading skeleton shown during route transitions (Suspense fallback).
 * Matches site layout so the transition feels instant instead of a hang.
 */
const NavigationLoader: React.FC = () => (
  <div
    className="fixed inset-0 z-[9999] flex flex-col bg-white"
    aria-live="polite"
    aria-label="Loading"
  >
    {/* Skeleton header (matches site header height) */}
    <div className="h-16 sm:h-20 w-full bg-navy-100/30 shrink-0" />
    {/* Skeleton content */}
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-4">
        <div className="h-8 bg-navy-100/40 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-navy-100/30 rounded animate-pulse w-full" />
        <div className="h-4 bg-navy-100/30 rounded animate-pulse w-5/6" />
        <div className="h-4 bg-navy-100/30 rounded animate-pulse w-4/5 mt-6" />
      </div>
    </div>
  </div>
);

export default NavigationLoader;
