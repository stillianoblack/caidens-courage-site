import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import { useActiveParticipant } from '../../hooks/useActiveParticipant';
import { familyPortalPath } from '../../lib/familyPortalPaths';
import {
  dismissParentOnboardingLater,
  markParentOnboardingComplete,
  PARENT_ONBOARDING_GOAL_OPTIONS,
} from '../../lib/parentOnboardingState';
import { saveProgramGoals } from '../../lib/programGoalsService';
import './parent-first-login-wizard.css';

type ParentFirstLoginWizardProps = {
  open: boolean;
  initialEmail?: string;
  onFinished: () => void;
};

type WizardStep = 1 | 2 | 3 | 4 | 5;

export default function ParentFirstLoginWizard({
  open,
  initialEmail = '',
  onFinished,
}: ParentFirstLoginWizardProps) {
  const navigate = useNavigate();
  const program = readActivePilotProgram();
  const { participant: activeChild, roster } = useActiveParticipant();
  const [step, setStep] = useState<WizardStep>(1);
  const [email, setEmail] = useState(initialEmail);
  const [childName, setChildName] = useState(activeChild?.displayName ?? '');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const childProgramLabel = useMemo(() => {
    const parts = [program?.programName, program?.groupName].filter(Boolean);
    return parts.join(' · ') || program?.programCode || 'Your program';
  }, [program]);

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
    onFinished();
  }, [email, onFinished, program?.programCode]);

  const handleComplete = useCallback(async () => {
    if (!program?.programCode) return;
    setSubmitting(true);
    try {
      if (selectedGoals.length) {
        await saveProgramGoals({
          program_code: program.programCode,
          portal_type: 'family',
          selected_goals: selectedGoals,
          completed_at: new Date().toISOString(),
        });
      }
      markParentOnboardingComplete({
        programCode: program.programCode,
        parentEmail: email.trim() || initialEmail.trim() || 'parent@family.local',
        familyGoals: selectedGoals,
        childParticipantId: activeChild?.participantId,
        childDisplayName: childName.trim() || activeChild?.displayName,
      });
      onFinished();
      navigate(familyPortalPath('', window.location.pathname));
    } finally {
      setSubmitting(false);
    }
  }, [
    activeChild?.displayName,
    activeChild?.participantId,
    childName,
    email,
    initialEmail,
    navigate,
    onFinished,
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
            <h2 className="parentOnboardingTitle">Confirm Parent / Guardian Email</h2>
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
            <h2 className="parentOnboardingTitle">Confirm Child</h2>
            <p className="parentOnboardingBody">{childProgramLabel}</p>
            <label className="parentOnboardingField">
              <span>Child name</span>
              <input
                type="text"
                value={childName}
                onChange={(event) => setChildName(event.target.value)}
                placeholder={roster[0]?.displayName || 'Your child'}
              />
            </label>
            <div className="parentOnboardingActions">
              <button type="button" className="parentOnboardingSecondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button
                type="button"
                className="parentOnboardingPrimary"
                disabled={!childName.trim()}
                onClick={() => setStep(4)}
              >
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
            <h2 className="parentOnboardingTitle">You&apos;re all set</h2>
            <p className="parentOnboardingBody">
              Your child can keep playing with their Student PIN, and you can track progress here.
            </p>
            <div className="parentOnboardingActions">
              <button
                type="button"
                className="parentOnboardingPrimary"
                disabled={submitting}
                onClick={() => void handleComplete()}
              >
                {submitting ? 'Saving…' : 'Go to Family Overview'}
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
