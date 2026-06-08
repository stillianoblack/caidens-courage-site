import {
  FACILITATOR_ADULT_BASELINE_PATH,
  FACILITATOR_ADULT_GROWTH_PATH,
  FACILITATOR_DR_VICTORIA_MISSION_BASE,
  FACILITATOR_UNCLE_T_MISSION_BASE,
  FAMILY_DR_VICTORIA_MISSION_BASE,
  FAMILY_HUB_PATH,
  FAMILY_UNCLE_T_MISSION_BASE,
  PROGRAM_ADULT_BASELINE_PATH,
  PROGRAM_ADULT_GROWTH_PATH,
} from '../config/courageRoutes';
import { getPortalRoute } from './portalGamePaths';
import {
  isAdultBaselineComplete,
  isAdultGrowthComplete,
  isDrVictoriaTrainingComplete,
  isUncleTTrainingComplete,
} from './adultAssessmentStorage';

export type AdultLearningFlowCardId =
  | 'baseline'
  | 'dr-victoria'
  | 'uncle-t'
  | 'growth';

export type AdultLearningFlowCard = {
  id: AdultLearningFlowCardId;
  title: string;
  status: string;
  statusTone: 'available' | 'locked' | 'complete' | 'review';
  description: string;
  lockedDescription?: string;
  lockedFooter?: string;
  cta: string;
  href: string;
  locked: boolean;
};

export type AdultLearningBannerVariant =
  | 'unlock'
  | 'unlocked'
  | 'ready-for-growth'
  | 'complete';

export const ADULT_BASELINE_LOCKED_DESCRIPTION = 'Complete your Adult Check-In first.';
export const ADULT_BASELINE_LOCKED_FOOTER = 'Complete Adult Check-In to unlock.';
export const ADULT_GROWTH_TRAINING_LOCKED_DESCRIPTION =
  'Complete both learning modules to continue.';

export const ADULT_LEARNING_FLOW_SECTION = {
  title: 'Family & Facilitator Learning',
  subtitle:
    'Take a baseline check, complete adult training, then retake the assessment to measure growth.',
} as const;

function resolveTrainingPaths(pathname: string): {
  drVictoriaHref: string;
  uncleTHref: string;
} {
  if (
    pathname.startsWith('/program-dashboard') ||
    pathname.startsWith('/portal/facilitator')
  ) {
    return {
      drVictoriaHref: FACILITATOR_DR_VICTORIA_MISSION_BASE,
      uncleTHref: FACILITATOR_UNCLE_T_MISSION_BASE,
    };
  }

  if (pathname.startsWith(FAMILY_HUB_PATH)) {
    return {
      drVictoriaHref: `${FAMILY_HUB_PATH}/guide/dr-victoria`,
      uncleTHref: `${FAMILY_HUB_PATH}/guide/uncle-t`,
    };
  }

  return {
    drVictoriaHref: FAMILY_DR_VICTORIA_MISSION_BASE,
    uncleTHref: FAMILY_UNCLE_T_MISSION_BASE,
  };
}

function resolveAssessmentPaths(pathname: string): {
  baselineHref: string;
  growthHref: string;
} {
  if (pathname.startsWith('/program-dashboard')) {
    return {
      baselineHref: PROGRAM_ADULT_BASELINE_PATH,
      growthHref: PROGRAM_ADULT_GROWTH_PATH,
    };
  }

  if (pathname.startsWith('/portal/facilitator')) {
    return {
      baselineHref: FACILITATOR_ADULT_BASELINE_PATH,
      growthHref: FACILITATOR_ADULT_GROWTH_PATH,
    };
  }

  return {
    baselineHref: getPortalRoute('adult-assessment/baseline', pathname),
    growthHref: getPortalRoute('adult-assessment/growth', pathname),
  };
}

export function buildAdultLearningFlowCards(pathname: string): AdultLearningFlowCard[] {
  const baselineComplete = isAdultBaselineComplete();
  const drVictoriaComplete = isDrVictoriaTrainingComplete();
  const uncleTComplete = isUncleTTrainingComplete();
  const growthComplete = isAdultGrowthComplete();
  const trainingComplete = drVictoriaComplete && uncleTComplete;

  const { baselineHref, growthHref } = resolveAssessmentPaths(pathname);
  const { drVictoriaHref, uncleTHref } = resolveTrainingPaths(pathname);

  const trainingLocked = !baselineComplete;
  const growthLocked = !trainingComplete;

  return [
    {
      id: 'baseline',
      title: 'Adult Baseline Assessment',
      status: baselineComplete ? 'Complete' : 'Available',
      statusTone: baselineComplete ? 'complete' : 'available',
      description:
        'Start with a quick reflection check so we can understand your current support strengths.',
      cta: baselineComplete ? 'Review Assessment' : 'Start Assessment',
      href: baselineHref,
      locked: false,
    },
    {
      id: 'dr-victoria',
      title: 'Dr. Victoria: Understanding Different Minds',
      status: trainingLocked ? '🔒 Locked' : drVictoriaComplete ? 'Complete' : 'Available',
      statusTone: trainingLocked ? 'locked' : drVictoriaComplete ? 'complete' : 'available',
      description:
        'Learn how ADHD, autism, executive functioning, sensory needs, and learning differences can shape behavior.',
      lockedDescription: ADULT_BASELINE_LOCKED_DESCRIPTION,
      lockedFooter: ADULT_BASELINE_LOCKED_FOOTER,
      cta: 'Start Training',
      href: drVictoriaHref,
      locked: trainingLocked,
    },
    {
      id: 'uncle-t',
      title: 'Uncle T: Supporting Growth & Confidence',
      status: trainingLocked ? '🔒 Locked' : uncleTComplete ? 'Complete' : 'Available',
      statusTone: trainingLocked ? 'locked' : uncleTComplete ? 'complete' : 'available',
      description:
        'Practice encouragement, communication, confidence-building, and small next-step strategies.',
      lockedDescription: ADULT_BASELINE_LOCKED_DESCRIPTION,
      lockedFooter: ADULT_BASELINE_LOCKED_FOOTER,
      cta: 'Start Training',
      href: uncleTHref,
      locked: trainingLocked,
    },
    {
      id: 'growth',
      title: 'Adult Growth Assessment',
      status: growthLocked
        ? '🔒 Locked'
        : growthComplete
          ? 'Complete'
          : 'Available',
      statusTone: growthLocked ? 'locked' : growthComplete ? 'complete' : 'available',
      description: 'Retake the reflection check after training to see your growth.',
      lockedDescription: trainingLocked
        ? ADULT_BASELINE_LOCKED_DESCRIPTION
        : ADULT_GROWTH_TRAINING_LOCKED_DESCRIPTION,
      lockedFooter: trainingLocked
        ? ADULT_BASELINE_LOCKED_FOOTER
        : ADULT_GROWTH_TRAINING_LOCKED_DESCRIPTION,
      cta: growthComplete ? 'Review Growth Check' : 'Start Growth Check',
      href: growthHref,
      locked: growthLocked,
    },
  ];
}

export function resolveAdultLearningBannerVariant(): AdultLearningBannerVariant {
  const baselineComplete = isAdultBaselineComplete();
  const trainingComplete =
    isDrVictoriaTrainingComplete() && isUncleTTrainingComplete();
  const growthComplete = isAdultGrowthComplete();

  if (growthComplete) return 'complete';
  if (trainingComplete) return 'ready-for-growth';
  if (baselineComplete) return 'unlocked';
  return 'unlock';
}

export function resolveAdultAssessmentPaths(pathname: string) {
  return resolveAssessmentPaths(pathname);
}

export function resolveAdultTrainingPaths(pathname: string) {
  return resolveTrainingPaths(pathname);
}
