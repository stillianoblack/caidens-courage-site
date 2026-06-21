import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import { readActiveAccessCode } from '../../config/portalContext';
import { useActiveParticipant } from '../../hooks/useActiveParticipant';
import {
  dismissParentOnboardingLater,
  PARENT_ONBOARDING_GOAL_OPTIONS,
} from '../../lib/parentOnboardingState';
import { familyPortalPath } from '../../lib/familyPortalPaths';
import { submitParentOnboarding } from '../../lib/parentOnboardingSubmit';
import './parent-first-login-wizard.css';

type ParentFirstLoginWizardProps = {
  open: boolean;
  initialEmail?: string;
  campProgramCode?: string | null;
  onFinished: () => void | Promise<void>;
};

type WizardStep = 1 | 2 | 3 | 4 | 5;

export default function ParentFirstLoginWizard({
  open,
  initialEmail = '',
  campProgramCode = null,
  onFinished,
}: ParentFirstLoginWizardProps) {
  const navigate = useNavigate();
  const program = readActivePilotProgram();
  const { participant: activeChild } = useActiveParticipant();
  const [step, setStep] = useState<WizardStep>(1);
  const [email, setEmail] = useState(initialEmail);
  const [parentFirstName, setParentFirstName] = useState('');
  const [parentLastName, setParentLastName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const childProgramLabel = useMemo(() => {
    const parts = [program?.programName, program?.groupName].filter(Boolean);
    return parts.join(' · ') || program?.programCode || 'Your program';
  }, [program]);

  const childDisplayName = activeChild?.displayName?.trim() || 'Your child';

  const toggleGoal = useCallback((goal: string) => {
    setSelectedGoals((current) => {
      if (current.includes(goal)) return current.filter((row) => row !== goal);
      if (current.length >= 3) return current;
      return [...current, goal];
    });
  }, []);

  const handleFinishLater = useCallback(() => {
    if (program?.programCode && email.trim()) {
      dismissParentOnboardingLater({
        programCode: program.programCode,
        parentEmail: email.trim(),
      });
    }
    void onFinished();
  }, [email, onFinished, program?.programCode]);

  const handleComplete = useCallback(async () => {
    if (!program?.programCode || !activeChild?.participantId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitParentOnboarding({
        programCode: program.programCode,
        campProgramCode,
        parentEmail: email.trim() || initialEmail.trim(),
        childParticipantId: activeChild.participantId,
        childDisplayName,
        parentFirstName: parentFirstName.trim() || undefined,
        parentLastName: parentLastName.trim() || undefined,
        parentPhone: parentPhone.trim() || undefined,
        selectedGoals,
        accessCode: readActiveAccessCode(),
      });

      if (!result.success) {
        setSubmitError(result.message);
        return;
      }

      setSaved(true);
      await onFinished();
      navigate(familyPortalPath('', window.location.pathname));
    } finally {
      setSubmitting(false);
    }
  }, [
    activeChild?.participantId,
    campProgramCode,
    childDisplayName,
    email,
    initialEmail,
    navigate,
    onFinished,
    parentFirstName,
    parentLastName,
    parentPhone,
    program?.programCode,
    selectedGoals,
  ]);

  if (!open) return null;

  return (
    <div className="parentOnboardingOverlay" role="presentation">
      <div
        className="parentOnboardingCard"
        role="dialog"
        aria-modal="true"
        aria-labelledby="parent-onboarding-title"
      >
        {step === 1 ? (
          <>
            <h2 id="parent-onboarding-title" className="parentOnboardingTitle">
              Welcome to Caiden&apos;s Courage
            </h2>
            <p className="parentOnboardingBody">
              Let&apos;s connect your family account and help your child keep their Focus Flame going.
            </p>
            <button type="button" className="parentOnboardingPrimary" onClick={() => setStep(2)}>
              Get started
            </button>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h2 className="parentOnboardingTitle">Parent / Guardian Email</h2>
            <p className="parentOnboardingBody">{childProgramLabel}</p>
            <label className="parentOnboardingField">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
            <div className="parentOnboardingActions">
              <button type="button" className="parentOnboardingSecondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                className="parentOnboardingPrimary"
                disabled={!email.trim()}
                onClick={() => setStep(3)}
              >
                Continue
              </button>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <h2 className="parentOnboardingTitle">Parent / Guardian Contact</h2>
            <p className="parentOnboardingBody">
              Optional details for {childDisplayName}&apos;s family profile.
            </p>
            <label className="parentOnboardingField">
              <span>First name</span>
              <input
                type="text"
                value={parentFirstName}
                onChange={(event) => setParentFirstName(event.target.value)}
                autoComplete="given-name"
              />
            </label>
            <label className="parentOnboardingField">
              <span>Last name</span>
              <input
                type="text"
                value={parentLastName}
                onChange={(event) => setParentLastName(event.target.value)}
                autoComplete="family-name"
              />
            </label>
            <label className="parentOnboardingField">
              <span>Phone (optional)</span>
              <input
                type="tel"
                value={parentPhone}
                onChange={(event) => setParentPhone(event.target.value)}
                autoComplete="tel"
              />
            </label>
            <div className="parentOnboardingActions">
              <button type="button" className="parentOnboardingSecondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button type="button" className="parentOnboardingPrimary" onClick={() => setStep(4)}>
                Continue
              </button>
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <h2 className="parentOnboardingTitle">Family Goals</h2>
            <p className="parentOnboardingBody">Choose 1–3 goals for your family.</p>
            <div className="parentOnboardingGoals">
              {PARENT_ONBOARDING_GOAL_OPTIONS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  className={[
                    'parentOnboardingGoalChip',
                    selectedGoals.includes(goal) ? 'parentOnboardingGoalChip--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => toggleGoal(goal)}
                >
                  {goal}
                </button>
              ))}
            </div>
            <div className="parentOnboardingActions">
              <button type="button" className="parentOnboardingSecondary" onClick={() => setStep(3)}>
                Back
              </button>
              <button
                type="button"
                className="parentOnboardingPrimary"
                disabled={selectedGoals.length === 0}
                onClick={() => setStep(5)}
              >
                Continue
              </button>
            </div>
          </>
        ) : null}

        {step === 5 ? (
          <>
            {saved ? (
              <>
                <h2 className="parentOnboardingTitle">You&apos;re all set</h2>
                <p className="parentOnboardingBody">
                  Your child can keep playing with their Student PIN, and you can track progress here.
                </p>
              </>
            ) : (
              <>
                <h2 className="parentOnboardingTitle">Finish your family setup</h2>
                <p className="parentOnboardingBody">
                  We&apos;ll save your parent email and family goals for {childDisplayName} in{' '}
                  {childProgramLabel}.
                </p>
                {submitError ? (
                  <p className="parentOnboardingError" role="alert">
                    {submitError}
                  </p>
                ) : null}
              </>
            )}
            <div className="parentOnboardingActions">
              <button
                type="button"
                className="parentOnboardingPrimary"
                disabled={submitting || saved}
                onClick={() => void handleComplete()}
              >
                {saved ? 'Saved' : submitting ? 'Saving…' : 'Go to Family Overview'}
              </button>
            </div>
          </>
        ) : null}

        <button type="button" className="parentOnboardingLater" onClick={handleFinishLater}>
          Finish later
        </button>
      </div>
    </div>
  );
}
