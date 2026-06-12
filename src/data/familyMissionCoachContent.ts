import type { MissionCoachStep, MissionCoachStepStatus } from '../design-system/components/MissionCoachCard';
import type { FocusFlameJourneyState } from '../hooks/useFocusFlameJourneyOnboarding';

export const FAMILY_MISSION_COACH_COPY = {
  title: "Hi, I'm B-4",
  subtitle: "Let's get started",
  progressLabel: 'Focus Flame Journey',
  mobileCta: 'Continue Setup',
  mobileTitle: 'Finish Your Focus Flame Journey',
} as const;

type BuildFamilyMissionCoachStepsInput = {
  journey: Pick<
    FocusFlameJourneyState,
    | 'step1Complete'
    | 'step2Complete'
    | 'step3Complete'
    | 'step4Complete'
    | 'step5Complete'
    | 'activeStep'
  >;
  childrenSettingsPath: string;
  childrenGradeSettingsPath: string;
  familyGoalsSettingsPath: string;
  baselinePath: string;
  settingsOverviewPath: string;
  continueLearningPath: string;
  onAddChild: () => void;
};

function resolveStepStatus(
  stepNumber: number,
  complete: boolean,
  activeStep: number,
): MissionCoachStepStatus {
  if (complete) return 'complete';
  if (stepNumber === activeStep) return 'current';
  if (stepNumber < activeStep) return 'incomplete';
  return 'locked';
}

export function buildFamilyMissionCoachSteps(
  input: BuildFamilyMissionCoachStepsInput,
): MissionCoachStep[] {
  const {
    journey,
    childrenSettingsPath,
    childrenGradeSettingsPath,
    familyGoalsSettingsPath,
    baselinePath,
    settingsOverviewPath,
    continueLearningPath,
    onAddChild,
  } = input;

  const stepCompletions = [
    journey.step1Complete,
    journey.step2Complete,
    journey.step3Complete,
    journey.step4Complete,
    journey.step5Complete,
  ];

  const configs: Array<{
    id: string;
    label: string;
    description?: string;
    href?: string;
    onClick?: () => void;
  }> = [
    {
      id: 'add-child',
      label: 'Add Your Child',
      description: 'Create your child profile to begin.',
      onClick: onAddChild,
    },
    {
      id: 'configure-grade',
      label: 'Configure Grade Level',
      description: 'Select a grade for personalized activities.',
      href: childrenGradeSettingsPath,
    },
    {
      id: 'family-goals',
      label: 'Set Family Goals',
      description: 'Choose focus areas and strengths.',
      href: familyGoalsSettingsPath,
    },
    {
      id: 'b4-check-in',
      label: 'Complete the B-4 Check-In',
      description: 'Establish your starting baseline.',
      href: baselinePath,
    },
    {
      id: 'choose-path',
      label: 'Choose Your Path',
      description: journey.step5Complete
        ? 'Review guided missions or character adventures.'
        : 'Pick guided weekly missions or character hub.',
      href: journey.step5Complete ? continueLearningPath : settingsOverviewPath,
    },
  ];

  return configs.map((config, index) => {
    const stepNumber = index + 1;
    const complete = stepCompletions[index] ?? false;
    const status = resolveStepStatus(stepNumber, complete, journey.activeStep);

    let href = config.href;
    let onClick = config.onClick;
    let description = config.description;

    if (status === 'locked') {
      href = undefined;
      onClick = undefined;
    }

    if (config.id === 'add-child' && complete) {
      href = childrenSettingsPath;
      onClick = undefined;
    }

    if (config.id === 'choose-path') {
      if (complete) {
        href = continueLearningPath;
        onClick = undefined;
        description = 'Open weekly adventures or the character hub anytime.';
      } else if (status === 'current') {
        href = settingsOverviewPath;
        onClick = undefined;
      }
    }

    return {
      id: config.id,
      label: config.label,
      description,
      status,
      badgeNumber: stepNumber,
      href,
      onClick,
    };
  });
}
