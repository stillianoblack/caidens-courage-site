import React from 'react';
import PortalAccessForm from './PortalAccessForm';
import { getPortalAudienceIdentity, type PortalAudienceTab } from '../../config/portalAudience';
import type { PortalLoginIntent } from '../../config/portalLoginIntent';

type PortalHeroProps = {
  audience: PortalAudienceTab | null;
  accessCode: string;
  parentEmail?: string;
  parentLastName?: string;
  needsLastNameConfirm?: boolean;
  portalIntent?: PortalLoginIntent;
  rememberDevice?: boolean;
  hasRememberedProgram?: boolean;
  rememberedSession?: import('../../lib/rememberedDeviceSession').RememberedDeviceSession | null;
  error: string | null;
  submitting?: boolean;
  onAccessCodeChange: (value: string) => void;
  onPortalIntentChange?: (intent: PortalLoginIntent) => void;
  onParentEmailChange?: (value: string) => void;
  onParentLastNameChange?: (value: string) => void;
  onRememberDeviceChange?: (value: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onUseDifferentCode?: () => void;
};

export default function PortalHero({
  audience,
  accessCode,
  parentEmail,
  parentLastName,
  needsLastNameConfirm,
  portalIntent,
  rememberDevice,
  hasRememberedProgram,
  rememberedSession,
  error,
  submitting = false,
  onAccessCodeChange,
  onPortalIntentChange,
  onParentEmailChange,
  onParentLastNameChange,
  onRememberDeviceChange,
  onSubmit,
  onUseDifferentCode,
}: PortalHeroProps) {
  const identity = getPortalAudienceIdentity(audience);

  return (
    <section
      id="portal-hero"
      data-section="header"
      className="cc-section-hero cc-section-hero--courage cc-portal-hero cc-portal-hero--gateway cc-portal-hero--fullscreen relative flex flex-1 flex-col overflow-hidden text-left text-white"
    >
      <div className="cc-section-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="cc-section-hero-noise pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="cc-portal-ambientMist pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="cc-portal-b4Pass pointer-events-none absolute" aria-hidden="true">
        <img src="/images/Choose-Your-Guide/B-4student.webp" alt="" width="108" height="61" />
      </div>

      <div className="cc-portal-hero-inner relative z-10 mx-auto flex w-full max-w-[75rem] flex-1 flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="cc-portal-guide-stage w-full">
          <div className="cc-portal-hero-copy min-w-0 text-center">
            <h1 className="cc-section-hero-title font-display font-extrabold leading-[1.06] text-white">
              Choose your guide.
            </h1>
            <p className="cc-portal-hero-atmosphere">Your adventure begins here.</p>
          </div>

          <div className="cc-portal-hero-access mx-auto mt-7 w-full min-w-0 max-w-[61rem]">
            <PortalAccessForm
              id="portal-access-code"
              variant="hero"
              cardAudienceLabel={identity.cardAudienceLabel}
              accessCode={accessCode}
              parentEmail={parentEmail}
              parentLastName={parentLastName}
              needsLastNameConfirm={needsLastNameConfirm}
              portalIntent={portalIntent}
              rememberDevice={rememberDevice}
              hasRememberedProgram={hasRememberedProgram}
              rememberedSession={rememberedSession}
              error={error}
              submitting={submitting}
              onAccessCodeChange={onAccessCodeChange}
              onPortalIntentChange={onPortalIntentChange}
              onParentEmailChange={onParentEmailChange}
              onParentLastNameChange={onParentLastNameChange}
              onRememberDeviceChange={onRememberDeviceChange}
              onSubmit={onSubmit}
              onUseDifferentCode={onUseDifferentCode}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
