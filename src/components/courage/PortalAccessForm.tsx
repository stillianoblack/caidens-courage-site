import React, { useId } from 'react';
import Button from '../ui/Button';
import type { PortalUnlockVariant } from '../../hooks/usePortalUnlock';

type PortalAccessFormProps = {
  variant: PortalUnlockVariant;
  accessCode: string;
  error: string | null;
  onAccessCodeChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  /** Optional id for scroll anchors on the hero card */
  id?: string;
};

export default function PortalAccessForm({
  variant,
  accessCode,
  error,
  onAccessCodeChange,
  onSubmit,
  id,
}: PortalAccessFormProps) {
  const formId = useId();
  const codeInputId = `${formId}-code`;
  const errorId = `${formId}-error`;
  const isHero = variant === 'hero';

  const cardClass = isHero
    ? 'cc-portal-access-card rounded-2xl border border-white/10 bg-white p-5 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.45)] sm:p-6'
    : 'cc-portal-access-form--nav';

  return (
    <div id={id} className={cardClass}>
      {isHero ? (
        <>
          <h2 className="font-display text-lg font-extrabold text-navy-500 sm:text-xl">
            Have a Courage Access Code?
          </h2>
          <p className="mt-1.5 text-sm text-navy-600">Enter your code to unlock your resources.</p>
        </>
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
        >
          {isHero ? 'Unlock Portal' : 'Unlock'}
        </Button>
      </form>

      {isHero ? (
        <p className="mt-4 text-xs leading-relaxed text-navy-500/80">
          Current access codes are used for pilot testing. Checkout and secure accounts are coming soon.
        </p>
      ) : null}
    </div>
  );
}
