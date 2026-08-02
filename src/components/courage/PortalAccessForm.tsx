import React, { useEffect, useId, useRef, useState } from 'react';
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
  const [pendingIntent, setPendingIntent] = useState<PortalLoginIntent | null>(null);
  const accessCodeInputRef = useRef<HTMLInputElement>(null);
  const selectionTimerRef = useRef<number | null>(null);
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
  type CharacterGuide = {
    name: string;
    label: string;
    pillLabel: string;
    description: string;
    imageSrc: string;
    hoverImageSrc: string;
    imageAlt: string;
    selectedImageSrc?: string;
  };
  const guideDisplayOrder: PortalLoginIntent[] = ['student', 'facilitator', 'parent'];
  const roleCopy: Record<PortalLoginIntent, { title: string; description: string; optionDescription: string; cta: string; guide: CharacterGuide }> = {
    student: {
      title: 'Continue Students',
      description: 'Enter your access information to continue your quests and adventures.',
      optionDescription: 'Continue the Adventure',
      cta: 'Enter the World',
      guide: {
        name: 'Caiden',
        label: 'Continue the Adventure',
        pillLabel: 'Students',
        description: 'Continue Your Quests, Games, And Weekly Adventures.',
        imageSrc: '/images/Choose-Your-Guide/B-4student.webp',
        hoverImageSrc: '/images/Choose-Your-Guide/B-4student-hover-bkgrd.webp',
        imageAlt: 'Student B-4 guide',
      },
    },
    parent: {
      title: 'Continue as Parent / Guardian',
      description: 'Access the connected family experience and support your child’s journey.',
      optionDescription: 'Support the Journey',
      cta: 'Continue to Family Portal',
      guide: {
        name: 'Dr. Victoria',
        label: 'Support the Journey',
        pillLabel: 'Parents / Guardians',
        description: 'Access Family Tools And View Your Child’s Experience.',
        imageSrc: '/images/Choose-Your-Guide/b-4facilitator.webp',
        hoverImageSrc: '/images/Choose-Your-Guide/b-4facilitator-hover-bkgrd.webp',
        imageAlt: 'Parent and guardian B-4 guide',
      },
    },
    facilitator: {
      title: 'Continue as Facilitator',
      description: 'Access your program tools, students, and learning resources.',
      optionDescription: 'Guide the Program',
      cta: 'Open Facilitator Portal',
      guide: {
        name: 'Uncle T',
        label: 'Guide the Program',
        pillLabel: 'Facilitator',
        description: 'Students, Activities, And Program Progress.',
        imageSrc: '/images/Choose-Your-Guide/B-4orange.webp',
        hoverImageSrc: '/images/Choose-Your-Guide/B-4orange-hover-bkgrd.webp',
        imageAlt: 'Facilitator B-4 guide',
      },
    },
  };

  useEffect(() => () => {
    if (selectionTimerRef.current !== null) window.clearTimeout(selectionTimerRef.current);
  }, []);

  const chooseGuide = (intent: PortalLoginIntent) => {
    if (selectionTimerRef.current !== null) window.clearTimeout(selectionTimerRef.current);
    setPendingIntent(intent);
    setShowRecovery(false);
    onPortalIntentChange?.(intent);
    selectionTimerRef.current = window.setTimeout(() => {
      setSelectedIntent(intent);
      setPendingIntent(null);
      selectionTimerRef.current = null;
    }, 260);
  };

  const cardClass = isHero
    ? `cc-portal-access-card ${!selectedIntent ? 'cc-portal-access-card--selector' : 'cc-portal-access-card--form'} rounded-2xl border border-white/10 bg-white p-6 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.45)] sm:p-7`
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
        <div className="cc-portal-gateway" data-testid="portal-character-gateway">
          {cardAudienceLabel ? <p className="cc-portal-gatewayEyebrow">{cardAudienceLabel}</p> : null}
          <div className="cc-portal-characterOptions" role="group" aria-label="Choose your guide">
            {guideDisplayOrder.map((intentId) => {
              const item = PORTAL_LOGIN_INTENTS.find((candidate) => candidate.id === intentId)!;
              const hoverLabel = intentId === 'student'
                ? 'Continue Your Adventure'
                : intentId === 'facilitator'
                  ? 'Teach the Academy'
                  : 'Help Young Heroes';
              return (
              <button
                key={item.id}
                type="button"
                className={`cc-portal-characterOption ${pendingIntent === item.id ? 'is-selected' : ''}`}
                aria-pressed={pendingIntent === item.id}
                aria-label={`${roleCopy[item.id].guide.name}: ${roleCopy[item.id].guide.label}`}
                onClick={() => chooseGuide(item.id)}
              >
                <span className={`cc-portal-characterPortrait cc-portal-characterPortrait--${item.id}`}>
                  <img
                    className="cc-portal-characterImage cc-portal-characterImage--default"
                    src={roleCopy[item.id].guide.imageSrc}
                    alt={roleCopy[item.id].guide.imageAlt}
                    width="320"
                    height="360"
                    loading={item.id === 'student' ? 'eager' : 'lazy'}
                  />
                  <img
                    className="cc-portal-characterImage cc-portal-characterImage--hover"
                    src={roleCopy[item.id].guide.hoverImageSrc}
                    alt=""
                    width="320"
                    height="360"
                    loading="lazy"
                    aria-hidden="true"
                  />
                  <span className={`cc-portal-characterPill cc-portal-characterPill--${item.id}`}>
                    <span className="cc-portal-characterPillDefault">{roleCopy[item.id].guide.pillLabel}</span>
                    <span className="cc-portal-characterPillHover">{hoverLabel}</span>
                  </span>
                </span>
                <span className="cc-portal-characterText">
                  <small>{roleCopy[item.id].guide.description}</small>
                </span>
              </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {isHero && showManualEntry && selectedIntent ? (
        <div className="cc-portal-selectedIntro cc-portal-guideIntro" aria-live="polite">
          <button
            type="button"
            className="cc-portal-back"
            onClick={() => {
              if (selectionTimerRef.current !== null) window.clearTimeout(selectionTimerRef.current);
              onPortalIntentChange?.(selectedIntent);
              setSelectedIntent(null);
              setPendingIntent(null);
              setShowRecovery(false);
            }}
          >
            <span aria-hidden="true">←</span> Choose another guide
          </button>
          <img
            className="cc-portal-guideIntroImage"
            src={roleCopy[selectedIntent].guide.selectedImageSrc ?? roleCopy[selectedIntent].guide.hoverImageSrc}
            alt=""
            width="320"
            height="360"
          />
          <p className="cc-portal-guideIntroCaption">{roleCopy[selectedIntent].guide.description}</p>
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
          {isHero && selectedIntent ? (
            <div className="cc-portal-formIntro">
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
