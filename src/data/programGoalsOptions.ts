export type ProgramGoalsPortalType = 'facilitator' | 'family';

export type ProgramGoalsCopy = {
  title: string;
  subtext: string;
  maxGoals: number;
};

export const FACILITATOR_GOALS_COPY: ProgramGoalsCopy = {
  title: 'Tell us what you want to improve',
  subtext:
    'Choose up to 5 goals so Caiden\u2019s Courage can better support your students, families, and facilitators.',
  maxGoals: 5,
};

export const FAMILY_GOALS_COPY: ProgramGoalsCopy = {
  title: 'Tell us how you\u2019d like to support your child',
  subtext:
    'Choose up to 5 goals so Caiden\u2019s Courage can recommend activities, tools, and resources for your child.',
  maxGoals: 5,
};

export const FACILITATOR_GOAL_OPTIONS = [
  'Improve Focus',
  'Build Reading Confidence',
  'Strengthen Communication',
  'Improve Listening',
  'Emotional Regulation',
  'Positive Peer Relationships',
  'Leadership Development',
  'Self-Advocacy',
  'Confidence Building',
  'Organization Skills',
  'Reduce Behavioral Incidents',
  'Attendance & Participation',
  'Drug & Alcohol Prevention',
  'Conflict Resolution',
  'Teamwork',
  'Creativity & Self-Expression',
] as const;

export const FAMILY_GOAL_OPTIONS = [
  'Improve Focus',
  'Build Reading Confidence',
  'Manage Big Feelings',
  'Build Confidence',
  'Improve Listening',
  'Strengthen Communication',
  'Create Calm-Down Habits',
  'Encourage Positive Choices',
  'Support Homework Routine',
  'Practice Self-Advocacy',
  'Build Friendships',
  'Celebrate Creativity',
] as const;

export function getProgramGoalsCopy(portalType: ProgramGoalsPortalType): ProgramGoalsCopy {
  return portalType === 'family' ? FAMILY_GOALS_COPY : FACILITATOR_GOALS_COPY;
}

export function getProgramGoalOptions(portalType: ProgramGoalsPortalType): readonly string[] {
  return portalType === 'family' ? FAMILY_GOAL_OPTIONS : FACILITATOR_GOAL_OPTIONS;
}
