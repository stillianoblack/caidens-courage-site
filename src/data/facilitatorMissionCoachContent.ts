import type { MissionCoachStep } from '../design-system/components/MissionCoachCard';

/** Example facilitator Mission Coach steps for future Facilitator Portal reuse. */
export const FACILITATOR_MISSION_COACH_COPY = {
  title: "Hi, I'm B-4",
  subtitle: 'Let’s set up your program',
  progressLabel: 'Program Launch Checklist',
} as const;

export const FACILITATOR_MISSION_COACH_STEPS: MissionCoachStep[] = [
  {
    id: 'create-program',
    label: 'Create Program',
    description: 'Set up your pilot program details.',
    status: 'incomplete',
    badgeNumber: 1,
  },
  {
    id: 'add-participants',
    label: 'Add Participants',
    description: 'Invite students and facilitators.',
    status: 'locked',
    badgeNumber: 2,
  },
  {
    id: 'complete-baseline',
    label: 'Complete Baseline',
    description: 'Run the opening B-4 Check-In.',
    status: 'locked',
    badgeNumber: 3,
  },
  {
    id: 'review-results',
    label: 'Review Results',
    description: 'Check baseline and module progress.',
    status: 'locked',
    badgeNumber: 4,
  },
  {
    id: 'download-certificates',
    label: 'Download Certificates',
    description: 'Share earned certificates with families.',
    status: 'locked',
    badgeNumber: 5,
  },
];
