import React, { useId, useMemo, useState } from 'react';
import Button from '../ui/Button';
import type { PortalUnlockVariant } from '../../hooks/usePortalUnlock';
import { readLastPilotProgram } from '../../config/lastPilotProgram';
import PortalWelcomeBackCard from './PortalWelcomeBackCard';
import PortalCodeRecovery from './PortalCodeRecovery';

type PortalAccessFormProps = {
  variant: PortalUnlockVariant;
  accessCode: string;
  error: string | null;
  submitting?: boolean;
  onAccessCodeChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onUseDifferentCode?: () => void;
  id?: string;
  cardAudienceLabel?: string;
};

export default function PortalAccessForm({
  variant,
  accessCode,
  error,
  submitting = false,
  onAccessCodeChange,
  onSubmit,
  onUseDifferentCode,
  id,
  cardAudienceLabel,
}: PortalAccessFormProps) {
  const formId = useId();
  const codeInputId = `${formId}-code`;
  const errorId = `${formId}-error`;
  const isHero = variant === 'hero';
  const savedProgram = useMemo(() => readLastPilotProgram(), []);
  const [hideWelcomeBack, setHideWelcomeBack] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  const cardClass = isHero
    ? 'cc-portal-access-card rounded-2xl border border-white/10 bg-white p-6 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.45)] sm:p-7'
    : 'cc-portal-access-form--nav';

  const portalIconSrc = '/images/icons/FocusFlame_Icon.svg';

  const handleUseDifferentCode = () => {
    setHideWelcomeBack(true);
    onAccessCodeChange('');
    onUseDifferentCode?.();
  };

  return (
    <div id={id} className={cardClass}>
      {isHero ? (
        <div className="flex flex-col items-center text-center">
          <img
            src={portalIconSrc}
            alt=""
            className="h-14 w-14 object-contain sm:h-[4.5rem] sm:w-[4.5rem]"
            decoding="async"
            aria-hidden
          />
          {cardAudienceLabel ? (
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-500/70">
              {cardAudienceLabel}
            </p>
          ) : null}
          <h2 className={`font-display text-lg font-extrabold text-navy-500 sm:text-xl ${cardAudienceLabel ? 'mt-2' : 'mt-4'}`}>
            Have a Courage Access Code?
          </h2>
          <p className="mt-1.5 text-sm text-navy-600">Enter your code to unlock your resources.</p>
        </div>
      ) : null}

      <form
        className={isHero ? 'mt-5 space-y-3.5' : 'space-y-3'}
        onSubmit={onSubmit}
        noValidate
        aria-describedby={error ? errorId : undefined}
      >
        <div>
          <label
            htmlFor={codeInputId}
            className={`block font-semibold text-navy-600 ${isHero ? 'text-sm' : 'text-xs'}`}
          >
            Access Code
          </label>
          <input
            id={codeInputId}
            name="accessCode"
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={accessCode}
            onChange={(event) => onAccessCodeChange(event.target.value)}
            placeholder="Enter your code"
            className={`cc-portal-code-input mt-1.5 w-full rounded-xl border border-navy-200/80 bg-[#FAF9F7] font-medium text-navy-600 placeholder:text-navy-400/70 focus:border-golden-500 focus:outline-none focus:ring-2 focus:ring-golden-500/30 ${
              isHero ? 'px-4 py-3.5 text-base' : 'px-3 py-2.5 text-sm'
            }`}
          />
        </div>

        {error ? (
          <p
            id={errorId}
            className={`rounded-xl border border-red-200/80 bg-red-50 font-medium text-red-800 ${
              isHero ? 'px-4 py-3 text-sm' : 'px-3 py-2 text-xs'
            }`}
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size={isHero ? 'lg' : 'md'}
          leftIconSrc={null}
          fullWidth
          className="!w-full"
          disabled={submitting}
        >
          {submitting ? 'Unlocking…' : isHero ? 'Unlock Portal' : 'Unlock'}
        </Button>
      </form>

      {isHero ? (
        <button
          type="button"
          className="portal-forgotCodeLink"
          onClick={() => setShowRecovery((open) => !open)}
        >
          Forgot your code?
        </button>
      ) : null}

      {isHero && showRecovery ? <PortalCodeRecovery onClose={() => setShowRecovery(false)} /> : null}

      {isHero && savedProgram && !hideWelcomeBack ? (
        <PortalWelcomeBackCard saved={savedProgram} onUseDifferentCode={handleUseDifferentCode} />
      ) : null}

      {isHero ? (
        <p className="mt-4 text-xs leading-relaxed text-navy-500/80">
          Current access codes are used for pilot testing. Checkout and secure accounts are coming soon.
        </p>
      ) : null}
    </div>
  );
}
