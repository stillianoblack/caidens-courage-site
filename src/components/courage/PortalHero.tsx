import React from 'react';
import PortalAccessForm from './PortalAccessForm';
import { getPortalAudienceIdentity, type PortalAudienceTab } from '../../config/portalAudience';

type PortalHeroProps = {
  audience: PortalAudienceTab | null;
  accessCode: string;
  parentEmail?: string;
  parentLastName?: string;
  needsLastNameConfirm?: boolean;
  error: string | null;
  submitting?: boolean;
  onAccessCodeChange: (value: string) => void;
  onParentEmailChange?: (value: string) => void;
  onParentLastNameChange?: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onUseDifferentCode?: () => void;
};

export default function PortalHero({
  audience,
  accessCode,
  parentEmail,
  parentLastName,
  needsLastNameConfirm,
  error,
  submitting = false,
  onAccessCodeChange,
  onParentEmailChange,
  onParentLastNameChange,
  onSubmit,
  onUseDifferentCode,
}: PortalHeroProps) {
  const identity = getPortalAudienceIdentity(audience);

  return (
    <section
      id="portal-hero"
      data-section="header"
      className="cc-section-hero cc-section-hero--courage cc-portal-hero cc-portal-hero--fullscreen relative flex flex-1 flex-col overflow-hidden text-left text-white"
    >
      <div className="cc-section-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="cc-section-hero-noise pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="cc-portal-hero-inner relative z-10 mx-auto flex w-full max-w-[75rem] flex-1 flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="cc-portal-hero-grid grid w-full gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,22rem)] lg:items-center lg:gap-12 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,24rem)] xl:gap-14">
          <div className="cc-portal-hero-copy min-w-0 text-center lg:text-left">
            <p className="cc-section-hero-eyebrow text-[10px] font-semibold uppercase tracking-[0.22em] text-golden-400 sm:text-[11px]">
              {identity.heroEyebrow}
            </p>
            <h1 className="cc-section-hero-title mt-4 font-display font-extrabold leading-[1.06] text-white sm:mt-5">
              Unlock your Caiden&apos;s Courage resources.
            </h1>
            <p className="cc-section-hero-description mx-auto mt-5 max-w-[42rem] text-base leading-relaxed text-white/[0.85] sm:mt-6 sm:text-lg sm:leading-relaxed lg:mx-0 lg:text-xl">
              Enter your access code to open story-powered SEL tools, printable activities, classroom resources,
              and pilot materials.
            </p>
          </div>

          <div className="cc-portal-hero-access mx-auto w-full min-w-0 max-w-md lg:mx-0 lg:max-w-md lg:justify-self-end">
            <PortalAccessForm
              id="portal-access-code"
              variant="hero"
              cardAudienceLabel={identity.cardAudienceLabel}
              accessCode={accessCode}
              parentEmail={parentEmail}
              parentLastName={parentLastName}
              needsLastNameConfirm={needsLastNameConfirm}
              error={error}
              submitting={submitting}
              onAccessCodeChange={onAccessCodeChange}
              onParentEmailChange={onParentEmailChange}
              onParentLastNameChange={onParentLastNameChange}
              onSubmit={onSubmit}
              onUseDifferentCode={onUseDifferentCode}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
