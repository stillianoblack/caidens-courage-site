import React from 'react';

const HERO_FEATURE_IMAGE = '/images/camp-courage/stackworksheets.webp';

export default function HeroEcosystemVisuals() {
  return (
    <div className="cc-hero-pamphlet pointer-events-none shrink-0 select-none" aria-hidden="true">
      <img
        src={HERO_FEATURE_IMAGE}
        alt="SEL worksheets and classroom tools"
        className="cc-hero-pamphlet-img h-auto max-w-full object-contain drop-shadow-[0_16px_36px_rgba(0,0,0,0.32)]"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
