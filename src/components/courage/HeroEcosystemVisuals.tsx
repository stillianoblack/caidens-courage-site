import React from 'react';

const HERO_FEATURE_IMAGE = '/images/camp-courage/stackworksheets.webp';

export default function HeroEcosystemVisuals() {
  return (
    <div className="pointer-events-none hidden shrink-0 select-none md:block" aria-hidden="true">
      <img
        src={HERO_FEATURE_IMAGE}
        alt="SEL worksheets and classroom tools"
        className="h-auto max-w-full w-[min(18.9rem,46vw)] max-h-[min(27.5rem,38vh)] object-contain drop-shadow-[0_16px_36px_rgba(0,0,0,0.32)] md:w-[min(21.45rem,32vw)] lg:w-[min(23.1rem,25vw)] lg:max-h-[min(30.8rem,50vh)] xl:w-[24.9rem]"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
