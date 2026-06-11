import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { B4_AVATAR_SRC } from '../../data/b4/avatar';
import type { FocusFlameJourneyStep } from '../../hooks/useFocusFlameJourneyOnboarding';
import FamilyChildGoalsChecklist from './FamilyChildGoalsChecklist';
import type { FamilyChildGoalsRecord } from '../../lib/familyChildGoalsService';

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
  step4Complete: boolean;
  completedCount: number;
  totalSteps: number;
  isComplete: boolean;
  baselinePath: string;
  continueLearningPath: string;
  charactersPath: string;
  programCode: string;
  childId?: string | null;
  childName?: string | null;
  childGoalsRecord?: FamilyChildGoalsRecord | null;
  onAddChild: () => void;
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

export default function FocusFlameJourneyOnboarding({
  activeStep,
  step1Complete,
  step2Complete,
  step3Complete,
  step4Complete,
  completedCount,
  totalSteps,
  isComplete,
  baselinePath,
  continueLearningPath,
  charactersPath,
  programCode,
  childId,
  childName,
  childGoalsRecord,
  onAddChild,
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
      title: 'Set Family Goals',
      body: 'Choose focus areas and strengths so B-4 can recommend better activities.',
      cta: step2Complete ? 'Edit Family Goals' : 'Set Family Goals',
      onAction: openGoals,
    },
    {
      id: 3,
      title: 'Complete the B-4 Check-In',
      body: 'Help B-4 understand your child\u2019s focus, reading, and confidence starting point.',
      cta: 'Start B-4 Check-In',
      href: baselinePath,
    },
    {
      id: 4,
      title: 'Choose Your Path',
      body: 'Follow B-4\u2019s guided weekly path or explore character adventures.',
      cta: 'Choose a Path',
    },
  ];

  const moduleClass = variant === 'drawer' ? 'ffj-module ffj-module--drawer' : 'ffj-module';

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
              </>
            )}
          </p>
        </div>
      </div>

      <ol className="ffj-steps">
        {steps.map((step) => {
          const complete =
            step.id === 1
              ? step1Complete
              : step.id === 2
                ? step2Complete
                : step.id === 3
                  ? step3Complete
                  : step4Complete;
          const active = activeStep === step.id && !complete;
          const showGoalsEditor =
            embedGoalsEditor &&
            step.id === 2 &&
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

              {step.id === 4 && active ? (
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

              {!showGoalsEditor && (active || (step.id === 2 && complete && !editingGoals)) ? (
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
