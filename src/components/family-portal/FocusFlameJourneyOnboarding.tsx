import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { B4_AVATAR_SRC } from '../../data/b4/avatar';
import type { FocusFlameJourneyStep } from '../../hooks/useFocusFlameJourneyOnboarding';
import FamilyChildGoalsChecklist from './FamilyChildGoalsChecklist';
import FocusFlameProfileReadyCard from './FocusFlameProfileReadyCard';
import type { FamilyChildGoalsRecord } from '../../lib/familyChildGoalsService';
import type { StudentParticipantRecord } from '../../lib/pilotTrackingService';

type JourneyStepConfig = {
  id: FocusFlameJourneyStep;
  title: string;
  body: string;
  cta: string;
  href?: string;
  onAction?: () => void;
};

type FocusFlameJourneyOnboardingProps = {
  activeStep: FocusFlameJourneyStep;
  step1Complete: boolean;
  step2Complete: boolean;
  step3Complete: boolean;
  b4CheckInComplete: boolean;
  step5Complete: boolean;
  b4CheckInAggregateLabel?: string | null;
  completedCount: number;
  totalSteps: number;
  isComplete: boolean;
  baselinePath: string;
  continueLearningPath: string;
  charactersPath: string;
  childrenSettingsPath: string;
  programCode: string;
  childId?: string | null;
  childName?: string | null;
  childGoalsRecord?: FamilyChildGoalsRecord | null;
  profileReadyAvatarSrc?: string | null;
  adventuresCompletedCount?: number;
  activeParticipantRecord?: StudentParticipantRecord | null;
  onAddChild: () => void;
  onConfigureGrade?: () => void;
  onSetGoals?: () => void;
  onPathChosen: () => void;
  onGoalsSaved: () => void;
  variant?: 'inline' | 'drawer';
  embedGoalsEditor?: boolean;
};

function StepStatus({ complete, active }: { complete: boolean; active: boolean }) {
  if (complete) {
    return (
      <span className="ffj-stepStatus ffj-stepStatus--complete" aria-label="Complete">
        ✓
      </span>
    );
  }
  if (active) {
    return <span className="ffj-stepStatus ffj-stepStatus--active">Now</span>;
  }
  return <span className="ffj-stepStatus ffj-stepStatus--pending" aria-hidden="true" />;
}

function resolveStepComplete(
  stepId: FocusFlameJourneyStep,
  flags: {
    step1Complete: boolean;
    step2Complete: boolean;
    step3Complete: boolean;
    b4CheckInComplete: boolean;
    step5Complete: boolean;
  },
): boolean {
  if (stepId === 1) return flags.step1Complete;
  if (stepId === 2) return flags.step2Complete;
  if (stepId === 3) return flags.step3Complete;
  if (stepId === 4) return flags.b4CheckInComplete;
  return flags.step5Complete;
}

export default function FocusFlameJourneyOnboarding({
  activeStep,
  step1Complete,
  step2Complete,
  step3Complete,
  b4CheckInComplete,
  step5Complete,
  b4CheckInAggregateLabel = null,
  completedCount,
  totalSteps,
  isComplete,
  baselinePath,
  continueLearningPath,
  charactersPath,
  childrenSettingsPath,
  programCode,
  childId,
  childName,
  childGoalsRecord,
  profileReadyAvatarSrc = null,
  adventuresCompletedCount = 0,
  activeParticipantRecord = null,
  onAddChild,
  onConfigureGrade,
  onSetGoals,
  onPathChosen,
  onGoalsSaved,
  variant = 'inline',
  embedGoalsEditor = true,
}: FocusFlameJourneyOnboardingProps) {
  const [editingGoals, setEditingGoals] = useState(false);

  const openGoals = () => {
    if (onSetGoals) {
      onSetGoals();
      return;
    }
    setEditingGoals(true);
  };

  const configureGrade = () => {
    if (onConfigureGrade) {
      onConfigureGrade();
    }
  };

  const steps: JourneyStepConfig[] = [
    {
      id: 1,
      title: 'Add Your Child',
      body: 'Create your child\u2019s profile so B-4 can track their progress.',
      cta: 'Add Child',
      onAction: onAddChild,
    },
    {
      id: 2,
      title: 'Configure Grade Level',
      body: 'Select a grade so B-4 can personalize activities.',
      cta: step2Complete ? 'Edit Grade Level' : 'Configure Grade',
      href: childrenSettingsPath,
      onAction: configureGrade,
    },
    {
      id: 3,
      title: 'Set Family Goals',
      body: 'Choose focus areas and strengths so B-4 can recommend better activities.',
      cta: step3Complete ? 'Edit Family Goals' : 'Set Family Goals',
      onAction: openGoals,
    },
    {
      id: 4,
      title: 'Complete the B-4 Check-In',
      body: b4CheckInAggregateLabel
        ? `${b4CheckInAggregateLabel}. Select a child to view their individual check-in status.`
        : 'Help B-4 understand your child\u2019s focus, reading, and confidence starting point.',
      cta: b4CheckInComplete ? 'Review B-4 Check-In' : 'Start B-4 Check-In',
      href: baselinePath,
    },
    {
      id: 5,
      title: 'Choose Your Path',
      body: 'Follow B-4\u2019s guided weekly path or explore character adventures.',
      cta: 'Choose a Path',
    },
  ];

  const moduleClass = variant === 'drawer' ? 'ffj-module ffj-module--drawer' : 'ffj-module';
  const stepFlags = {
    step1Complete,
    step2Complete,
    step3Complete,
    b4CheckInComplete,
    step5Complete,
  };

  if (isComplete && childName) {
    return (
      <FocusFlameProfileReadyCard
        childName={childName}
        avatarSrc={profileReadyAvatarSrc}
        participant={activeParticipantRecord}
        adventuresCompletedCount={adventuresCompletedCount}
        continueLearningPath={continueLearningPath}
        variant={variant === 'drawer' ? 'compact' : 'inline'}
      />
    );
  }

  return (
    <section className={moduleClass} aria-labelledby="ffj-module-title">
      <div className="ffj-moduleHeader">
        <img className="ffj-b4Avatar" src={B4_AVATAR_SRC} alt="" decoding="async" />
        <div className="ffj-moduleHeaderText">
          <p className="ffj-eyebrow">Parent/Guardian Onboarding</p>
          <h2 id="ffj-module-title" className="ffj-title">
            Begin Your Focus Flame Journey
          </h2>
          <p className="ffj-subtitle">
            B-4 will help your family get started with goals, a quick check-in, guided adventures,
            and character-based learning missions.
          </p>
          <p className="ffj-progress" role="status">
            {isComplete ? (
              <span className="ffj-progressActive">Focus Flame Journey Active</span>
            ) : (
              <>
                <span className="ffj-progressCount">
                  {completedCount} of {totalSteps} steps completed
                </span>
                {b4CheckInAggregateLabel ? (
                  <span className="ffj-progressAggregate">{b4CheckInAggregateLabel}</span>
                ) : null}
              </>
            )}
          </p>
        </div>
      </div>

      <ol className="ffj-steps">
        {steps.map((step) => {
          const complete = resolveStepComplete(step.id, stepFlags);
          const active = activeStep === step.id && !complete;
          const showGoalsEditor =
            embedGoalsEditor &&
            step.id === 3 &&
            (active || editingGoals || (isComplete && editingGoals));
          const cardClass = [
            'ffj-stepCard',
            complete ? 'ffj-stepCard--complete' : '',
            active ? 'ffj-stepCard--active' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <li key={step.id} className={cardClass}>
              <div className="ffj-stepCardTop">
                <span className="ffj-stepNum">Step {step.id}</span>
                <StepStatus complete={complete} active={active} />
              </div>
              <h3 className="ffj-stepTitle">{step.title}</h3>
              <p className="ffj-stepBody">{step.body}</p>

              {step.id === 5 && active ? (
                <div className="ffj-pathOptions">
                  <Link
                    to={continueLearningPath}
                    className="ffj-pathCard"
                    onClick={onPathChosen}
                  >
                    <strong>Guided Path</strong>
                    <span>Follow B-4&apos;s recommended weekly missions.</span>
                  </Link>
                  <Link to={charactersPath} className="ffj-pathCard" onClick={onPathChosen}>
                    <strong>Character Adventures</strong>
                    <span>
                      Choose Caiden, Miranda, Charlie Perk, Zeke, Uncle T, or B-4.
                    </span>
                  </Link>
                </div>
              ) : null}

              {showGoalsEditor ? (
                <div className="ffj-stepGoals">
                  <FamilyChildGoalsChecklist
                    programCode={programCode}
                    childId={childId}
                    childName={childName}
                    initialRecord={childGoalsRecord}
                    compact
                    onSaved={(record) => {
                      onGoalsSaved();
                      if (record.goals.length > 0) {
                        setEditingGoals(false);
                      }
                    }}
                  />
                </div>
              ) : null}

              {!showGoalsEditor &&
              (active ||
                (step.id === 3 && complete && !editingGoals) ||
                (step.id === 4 && b4CheckInComplete)) ? (
                step.href ? (
                  <Link to={step.href} className="ffj-stepCta">
                    {step.cta}
                  </Link>
                ) : (
                  <button type="button" className="ffj-stepCta" onClick={step.onAction}>
                    {step.cta}
                  </button>
                )
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
