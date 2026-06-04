import React from 'react';
import PortalAccessForm from './PortalAccessForm';

type PortalHeroProps = {
  accessCode: string;
  error: string | null;
  onAccessCodeChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function PortalHero({ accessCode, error, onAccessCodeChange, onSubmit }: PortalHeroProps) {
  return (
    <section
      id="portal-hero"
      data-section="header"
      className="cc-section-hero cc-section-hero--courage cc-portal-hero relative overflow-hidden text-left text-white"
    >
      <div className="cc-section-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="cc-section-hero-noise pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="cc-section-hero-inner cc-portal-hero-inner relative z-10 mx-auto max-w-[75rem] px-4 sm:px-6 lg:px-8">
        <div className="cc-portal-hero-grid grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,22rem)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,24rem)] xl:gap-12">
          <div className="cc-portal-hero-copy min-w-0">
            <p className="cc-section-hero-eyebrow text-[10px] font-semibold uppercase tracking-[0.22em] text-golden-400 sm:text-[11px]">
              Courage Portal
            </p>
            <h1 className="cc-section-hero-title mt-4 font-display font-extrabold leading-[1.06] text-white sm:mt-5">
              Unlock your Caiden&apos;s Courage resources.
            </h1>
            <p className="cc-section-hero-description mt-5 max-w-[42rem] text-base leading-relaxed text-white/[0.85] sm:mt-6 sm:text-lg sm:leading-relaxed lg:text-xl">
              Enter your access code to open story-powered SEL tools, printable activities, classroom resources,
              and pilot materials.
            </p>
          </div>

          <div className="cc-portal-hero-access w-full min-w-0 lg:max-w-md lg:justify-self-end">
            <PortalAccessForm
              id="portal-access-code"
              variant="hero"
              accessCode={accessCode}
              error={error}
              onAccessCodeChange={onAccessCodeChange}
              onSubmit={onSubmit}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
