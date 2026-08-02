import React, { useId, useRef, useState } from 'react';
import Button from '../ui/Button';
import type { PortalUnlockVariant } from '../../hooks/usePortalUnlock';
import type { PortalLoginIntent } from '../../config/portalLoginIntent';
import { PORTAL_LOGIN_INTENTS } from '../../config/portalLoginIntent';
import { readLastPilotProgram, type LastPilotProgram } from '../../config/lastPilotProgram';
import {
  dismissPortalWelcomeBack,
  hasActivePortalProgramSession,
  hasSavedPortalReturnSession,
  restoreSavedPortalReturnSession,
} from '../../lib/portalReturnRestore';
import { switchRememberedProgram } from '../../lib/rememberedProgramAccess';
import type { RememberedDeviceSession } from '../../lib/rememberedDeviceSession';
import PortalWelcomeBackCard from './PortalWelcomeBackCard';
import RememberedDeviceResumeCard from './RememberedDeviceResumeCard';
import PortalCodeRecovery from './PortalCodeRecovery';

type PortalAccessFormProps = {
  variant: PortalUnlockVariant;
  accessCode: string;
  parentEmail?: string;
  parentLastName?: string;
  needsLastNameConfirm?: boolean;
  rememberDevice?: boolean;
  hasRememberedProgram?: boolean;
  rememberedSession?: RememberedDeviceSession | null;
  error: string | null;
  submitting?: boolean;
  onAccessCodeChange: (value: string) => void;
  onParentEmailChange?: (value: string) => void;
  onParentLastNameChange?: (value: string) => void;
  onRememberDeviceChange?: (value: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onUseDifferentCode?: () => void;
  portalIntent?: PortalLoginIntent;
  onPortalIntentChange?: (intent: PortalLoginIntent) => void;
  id?: string;
  cardAudienceLabel?: string;
};

export default function PortalAccessForm({
  variant,
  accessCode,
  parentEmail = '',
  parentLastName = '',
  needsLastNameConfirm = false,
  rememberDevice = true,
  hasRememberedProgram = false,
  rememberedSession = null,
  error,
  submitting = false,
  onAccessCodeChange,
  onParentEmailChange,
  onParentLastNameChange,
  onRememberDeviceChange,
  onSubmit,
  onUseDifferentCode,
  portalIntent = 'student',
  onPortalIntentChange,
  id,
  cardAudienceLabel,
}: PortalAccessFormProps) {
  const formId = useId();
  const codeInputId = `${formId}-code`;
  const errorId = `${formId}-error`;
  const isHero = variant === 'hero';
  const [returnSession, setReturnSession] = useState<LastPilotProgram | null>(() =>
    readLastPilotProgram(),
  );
  const [hideWelcomeBack, setHideWelcomeBack] = useState(false);
  const [hideRememberedResume, setHideRememberedResume] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<PortalLoginIntent | null>(null);
  const accessCodeInputRef = useRef<HTMLInputElement>(null);
  const showRememberedResume =
    isHero &&
    Boolean(rememberedSession?.program) &&
    !hideRememberedResume &&
    !hasActivePortalProgramSession();
  const showWelcomeBack =
    isHero && Boolean(returnSession) && !hideWelcomeBack && !showRememberedResume;
  const showManualEntry = !isHero || (!showWelcomeBack && !showRememberedResume);
  const showRestoreSavedProgram =
    isHero &&
    showManualEntry &&
    hideWelcomeBack &&
    hasSavedPortalReturnSession() &&
    !hasActivePortalProgramSession();
  const hideAccessCodeField = hasRememberedProgram;
  const isStudentPinEntry = /^\d{4,8}$/.test(parentEmail.trim());
  const showRememberCheckbox = !isStudentPinEntry && portalIntent !== 'student';
  const intentConfig =
    PORTAL_LOGIN_INTENTS.find((item) => item.id === portalIntent) ?? PORTAL_LOGIN_INTENTS[0];
  const credentialAutoComplete =
    portalIntent === 'student' ? 'off' : portalIntent === 'facilitator' ? 'email' : 'email';
  const roleCopy: Record<PortalLoginIntent, { title: string; description: string; optionDescription: string; cta: string }> = {
    student: {
      title: 'Student Access',
      description: 'Enter your program code and student PIN to continue your adventure.',
      optionDescription: 'Continue your quests, games, and Weekly Adventures.',
      cta: 'Enter the World',
    },
    parent: {
      title: 'Parent / Guardian Access',
      description: 'Sign in to family tools and your child’s connected experience.',
      optionDescription: 'Access family tools and view your child’s experience.',
      cta: 'Continue to Family Portal',
    },
    facilitator: {
      title: 'Facilitator Access',
      description: 'Manage students, activities, and program progress.',
      optionDescription: 'Manage students, activities, and program progress.',
      cta: 'Open Facilitator Portal',
    },
  };

  const cardClass = isHero
    ? 'cc-portal-access-card rounded-2xl border border-white/10 bg-white p-6 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.45)] sm:p-7'
    : 'cc-portal-access-form--nav';

  const handleUseDifferentCode = () => {
    dismissPortalWelcomeBack();
    switchRememberedProgram(true);
    setHideWelcomeBack(true);
    setHideRememberedResume(true);
    setShowRecovery(false);
    onAccessCodeChange('');
    onUseDifferentCode?.();
    requestAnimationFrame(() => {
      accessCodeInputRef.current?.focus({ preventScroll: false });
      accessCodeInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const handleRestoreSavedProgram = () => {
    const restored = restoreSavedPortalReturnSession();
    if (!restored) return;
    setReturnSession(restored);
    setHideWelcomeBack(false);
    setShowRecovery(false);
    onAccessCodeChange('');
  };

  return (
    <div id={id} className={cardClass}>
      {isHero && showManualEntry && !selectedIntent && onPortalIntentChange ? (
        <div className="cc-portal-gateway" data-testid="portal-role-gateway">
          {cardAudienceLabel ? <p className="cc-portal-gatewayEyebrow">{cardAudienceLabel}</p> : null}
          <h2 className="cc-portal-gatewayTitle">How are you entering the world?</h2>
          <p className="cc-portal-gatewayCopy">Choose the experience that belongs to you.</p>
          <div className="cc-portal-roleOptions" aria-label="Choose how you are entering the world">
            {PORTAL_LOGIN_INTENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="cc-portal-roleOption"
                onClick={() => {
                  onPortalIntentChange(item.id);
                  setSelectedIntent(item.id);
                  setShowRecovery(false);
                }}
              >
                <span className={`cc-portal-roleIcon cc-portal-roleIcon--${item.id}`} aria-hidden="true">
                  {item.id === 'student' ? (
                    <svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Zm16 0A2.5 2.5 0 0 0 17.5 3H12v16h5.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" /></svg>
                  ) : item.id === 'parent' ? (
                    <svg viewBox="0 0 24 24"><path d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8.5 2a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM1.5 21a6.5 6.5 0 0 1 13 0h-13Zm12.5 0a7.9 7.9 0 0 0-1.6-4.8A5.5 5.5 0 0 1 22 20v1h-8Z" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24"><path d="M12 2 3 6v6c0 5.3 3.8 9.7 9 10 5.2-.3 9-4.7 9-10V6l-9-4Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 11.5a7 7 0 0 1-4.7-1.8A5 5 0 0 1 12 14a5 5 0 0 1 4.7 2.7 7 7 0 0 1-4.7 1.8Z" /></svg>
                  )}
                </span>
                <span className="cc-portal-roleText">
                  <strong>{item.label}</strong>
                  <small>{roleCopy[item.id].optionDescription}</small>
                </span>
                <span className="cc-portal-roleArrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {isHero && showManualEntry && selectedIntent ? (
        <div className="cc-portal-selectedIntro" aria-live="polite">
          <button
            type="button"
            className="cc-portal-back"
            onClick={() => {
              onPortalIntentChange?.(selectedIntent);
              setSelectedIntent(null);
              setShowRecovery(false);
            }}
          >
            <span aria-hidden="true">←</span> Choose another path
          </button>
          <h2>{hasRememberedProgram ? 'Welcome back' : roleCopy[selectedIntent].title}</h2>
          <p>
            {hasRememberedProgram
              ? selectedIntent === 'student'
                ? 'Enter your student PIN to continue.'
                : 'Enter your email to continue.'
              : roleCopy[selectedIntent].description}
          </p>
        </div>
      ) : null}

      {showRememberedResume && rememberedSession ? (
        <RememberedDeviceResumeCard
          session={rememberedSession}
          onSwitchAccount={() => {
            setHideRememberedResume(true);
            onAccessCodeChange('');
          }}
        />
      ) : null}

      {showWelcomeBack && returnSession ? (
        <PortalWelcomeBackCard
          saved={returnSession}
          onUseDifferentCode={handleUseDifferentCode}
          onForgotCode={() => setShowRecovery(true)}
        />
      ) : null}

      {showManualEntry && (!isHero || selectedIntent) ? (
        <form
          className={isHero ? 'mt-5 space-y-3.5' : 'space-y-3'}
          onSubmit={onSubmit}
          noValidate
          aria-describedby={error ? errorId : undefined}
        >
          {!hideAccessCodeField ? (
            <div>
              <label
                htmlFor={codeInputId}
                className={`block font-semibold text-navy-600 ${isHero ? 'text-sm' : 'text-xs'}`}
              >
                Access Code
              </label>
              <input
                ref={accessCodeInputRef}
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
          ) : null}

          <div>
            <label
              htmlFor={`${formId}-parent-email`}
              className={`block font-semibold text-navy-600 ${isHero ? 'text-sm' : 'text-xs'}`}
            >
              {intentConfig.credentialLabel}
            </label>
            <input
              id={`${formId}-parent-email`}
              name="parentEmail"
              type="text"
              autoComplete={credentialAutoComplete}
              value={parentEmail}
              onChange={(event) => onParentEmailChange?.(event.target.value)}
              placeholder={intentConfig.credentialPlaceholder}
              className={`cc-portal-code-input mt-1.5 w-full rounded-xl border border-navy-200/80 bg-[#FAF9F7] font-medium text-navy-600 placeholder:text-navy-400/70 focus:border-golden-500 focus:outline-none focus:ring-2 focus:ring-golden-500/30 ${
                isHero ? 'px-4 py-3.5 text-base' : 'px-3 py-2.5 text-sm'
              }`}
            />
            <p className="mt-1 text-xs text-navy-500/80">{intentConfig.credentialHint}</p>
          </div>

          {needsLastNameConfirm ? (
            <div>
              <label
                htmlFor={`${formId}-parent-last-name`}
                className={`block font-semibold text-navy-600 ${isHero ? 'text-sm' : 'text-xs'}`}
              >
                Parent/Guardian last name
              </label>
              <input
                id={`${formId}-parent-last-name`}
                name="parentLastName"
                type="text"
                autoComplete="family-name"
                value={parentLastName}
                onChange={(event) => onParentLastNameChange?.(event.target.value)}
                placeholder="Confirm your last name"
                className={`cc-portal-code-input mt-1.5 w-full rounded-xl border border-navy-200/80 bg-[#FAF9F7] font-medium text-navy-600 placeholder:text-navy-400/70 focus:border-golden-500 focus:outline-none focus:ring-2 focus:ring-golden-500/30 ${
                  isHero ? 'px-4 py-3.5 text-base' : 'px-3 py-2.5 text-sm'
                }`}
              />
            </div>
          ) : null}

          {showRememberCheckbox ? (
            <label className="flex items-start gap-2 text-sm text-navy-600">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={rememberDevice}
                onChange={(event) => onRememberDeviceChange?.(event.target.checked)}
              />
              <span>Remember this device</span>
            </label>
          ) : null}

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
            {submitting ? 'Unlocking…' : isHero && selectedIntent ? roleCopy[selectedIntent].cta : 'Unlock'}
          </Button>

          {hasRememberedProgram ? (
            <button type="button" className="portal-welcomeBackLink w-full text-center" onClick={handleUseDifferentCode}>
              Not your program? Switch program
            </button>
          ) : null}
        </form>
      ) : null}

      {isHero && showManualEntry && selectedIntent && !hasRememberedProgram ? (
        <button
          type="button"
          className="portal-forgotCodeLink"
          onClick={() => setShowRecovery((open) => !open)}
        >
          Forgot your code?
        </button>
      ) : null}

      {showRestoreSavedProgram ? (
        <div className="portal-restoreSaved">
          <p className="portal-restoreSavedLead">Returning user?</p>
          <button type="button" className="portal-restoreSavedLink" onClick={handleRestoreSavedProgram}>
            Restore your saved program
          </button>
        </div>
      ) : null}

      {isHero && showRecovery ? <PortalCodeRecovery onClose={() => setShowRecovery(false)} /> : null}

      {isHero && showManualEntry && selectedIntent ? (
        <p className="mt-4 text-xs leading-relaxed text-navy-500/80">
          Current access codes are used for pilot testing. Checkout and secure accounts are coming soon.
        </p>
      ) : null}
    </div>
  );
}
