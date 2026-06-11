export const FAMILY_CHILD_GOALS_COPY = {
  title: 'Tell B-4 What Your Child Needs Most',
  subtitle:
    'Choose up to 3 focus areas so B-4 can recommend better adventures and activities.',
  strengthsTitle: 'Child Strengths',
  strengthsSubtitle: 'Pick at least one strength B-4 can celebrate and build on.',
  maxGoals: 3,
  minStrengths: 1,
  maxStrengths: 3,
} as const;

export const FAMILY_CHILD_CHALLENGE_OPTIONS = [
  'Focus & Attention',
  'Confidence',
  'Reading',
  'Listening',
  'Organization',
  'Emotional Regulation',
  'Self-Advocacy',
  'Friendships',
  'Responsibility',
  'Healthy Choices',
  'Money Skills',
  'Communication',
] as const;

export const FAMILY_CHILD_STRENGTH_OPTIONS = [
  'Creative',
  'Kind',
  'Curious',
  'Leader',
  'Funny',
  'Problem Solver',
  'Helpful',
  'Brave',
  'Imaginative',
  'Determined',
] as const;

export type FamilyChildChallenge = (typeof FAMILY_CHILD_CHALLENGE_OPTIONS)[number];
export type FamilyChildStrength = (typeof FAMILY_CHILD_STRENGTH_OPTIONS)[number];
