export const ADULT_GROWTH_CHECK_NAME = 'Focus Flame Adult Growth Check';

export const ADULT_ASSESSMENT_TOTAL_QUESTIONS = 12;
export const ADULT_UNDERSTANDING_QUESTION_COUNT = 6;
export const ADULT_SUPPORT_QUESTION_COUNT = 6;

export type AdultAssessmentPhase = 'baseline' | 'growth';

export type AdultAssessmentType = 'adult_baseline' | 'adult_growth';

export type AdultRoleOption =
  | 'Parent'
  | 'Teacher'
  | 'Camp Counselor'
  | 'School Administrator'
  | 'Other';

export const ADULT_ROLE_OPTIONS: AdultRoleOption[] = [
  'Parent',
  'Teacher',
  'Camp Counselor',
  'School Administrator',
  'Other',
];

export const ADULT_INFO_HELPER_TEXT =
  'Enter your email to save your certificate, receive new family activities, and access future Focus Flame Academy resources.';

export type AdultMcChoice = {
  id: string;
  label: string;
};

export type AdultMcQuestion = {
  id: string;
  text: string;
  choices: AdultMcChoice[];
  correctId: string;
  domain: 'understanding' | 'support';
};

export const ADULT_GROWTH_CHECK_QUESTIONS: AdultMcQuestion[] = [
  {
    id: 'ag-q1',
    domain: 'understanding',
    text: 'A student forgets materials almost every day.\nWhat is the most helpful first assumption?',
    choices: [
      { id: 'a', label: 'They do not care.' },
      { id: 'b', label: 'They may need support with organization skills.' },
      { id: 'c', label: 'They are being disrespectful.' },
      { id: 'd', label: 'They are lazy.' },
    ],
    correctId: 'b',
  },
  {
    id: 'ag-q2',
    domain: 'understanding',
    text: 'A child avoids eye contact during conversations.\nWhat is the best response?',
    choices: [
      { id: 'a', label: 'Force eye contact.' },
      { id: 'b', label: 'Recognize communication styles vary.' },
      { id: 'c', label: 'Assume they are ignoring you.' },
      { id: 'd', label: 'Punish the behavior.' },
    ],
    correctId: 'b',
  },
  {
    id: 'ag-q3',
    domain: 'understanding',
    text: 'Executive functioning helps children:',
    choices: [
      { id: 'a', label: 'Remember, plan, and organize tasks.' },
      { id: 'b', label: 'Run faster.' },
      { id: 'c', label: 'Draw better.' },
      { id: 'd', label: 'Sleep longer.' },
    ],
    correctId: 'a',
  },
  {
    id: 'ag-q4',
    domain: 'understanding',
    text: 'A child becomes overwhelmed by loud environments.\nWhat should adults consider?',
    choices: [
      { id: 'a', label: 'Sensory sensitivity.' },
      { id: 'b', label: 'Lack of discipline.' },
      { id: 'c', label: 'Defiance.' },
      { id: 'd', label: 'Manipulation.' },
    ],
    correctId: 'a',
  },
  {
    id: 'ag-q5',
    domain: 'understanding',
    text: 'When a student struggles to begin an assignment, adults should first:',
    choices: [
      { id: 'a', label: 'Understand possible barriers.' },
      { id: 'b', label: 'Remove the assignment.' },
      { id: 'c', label: 'Compare them to others.' },
      { id: 'd', label: 'Ignore the problem.' },
    ],
    correctId: 'a',
  },
  {
    id: 'ag-q6',
    domain: 'understanding',
    text: 'Children with ADHD often benefit from:',
    choices: [
      { id: 'a', label: 'Clear routines and reminders.' },
      { id: 'b', label: 'Less support.' },
      { id: 'c', label: 'Constant criticism.' },
      { id: 'd', label: 'Public correction.' },
    ],
    correctId: 'a',
  },
  {
    id: 'ag-q7',
    domain: 'support',
    text: 'A child makes a mistake during homework.\nWhat is the most supportive response?',
    choices: [
      { id: 'a', label: '“Let’s figure it out together.”' },
      { id: 'b', label: '“You should know this already.”' },
      { id: 'c', label: '“Why do you always do this?”' },
      { id: 'd', label: '“Forget it.”' },
    ],
    correctId: 'a',
  },
  {
    id: 'ag-q8',
    domain: 'support',
    text: 'A child feels frustrated and wants to quit.\nWhat helps most?',
    choices: [
      { id: 'a', label: 'Encouragement and a small next step.' },
      { id: 'b', label: 'Pressure.' },
      { id: 'c', label: 'Criticism.' },
      { id: 'd', label: 'Comparison.' },
    ],
    correctId: 'a',
  },
  {
    id: 'ag-q9',
    domain: 'support',
    text: 'A child struggles with focus during a task.\nWhat is often helpful?',
    choices: [
      { id: 'a', label: 'Breaking the task into smaller parts.' },
      { id: 'b', label: 'Making the task harder.' },
      { id: 'c', label: 'Removing all support.' },
      { id: 'd', label: 'Giving multiple new tasks.' },
    ],
    correctId: 'a',
  },
  {
    id: 'ag-q10',
    domain: 'support',
    text: 'A child shares something they are proud of.\nWhat should adults do?',
    choices: [
      { id: 'a', label: 'Celebrate the effort.' },
      { id: 'b', label: 'Ignore it.' },
      { id: 'c', label: 'Point out flaws immediately.' },
      { id: 'd', label: 'Change the topic.' },
    ],
    correctId: 'a',
  },
  {
    id: 'ag-q11',
    domain: 'support',
    text: 'When a child experiences a setback, adults should focus on:',
    choices: [
      { id: 'a', label: 'Growth and learning.' },
      { id: 'b', label: 'Punishment only.' },
      { id: 'c', label: 'Embarrassment.' },
      { id: 'd', label: 'Comparison.' },
    ],
    correctId: 'a',
  },
  {
    id: 'ag-q12',
    domain: 'support',
    text: 'The strongest way to build confidence is:',
    choices: [
      { id: 'a', label: 'Consistent encouragement and opportunities to practice.' },
      { id: 'b', label: 'Constant correction.' },
      { id: 'c', label: 'Avoiding challenges.' },
      { id: 'd', label: 'Lowering expectations.' },
    ],
    correctId: 'a',
  },
];

export const ADULT_BASELINE_RESULTS = {
  title: 'Your Adult Baseline Results',
  badge: 'Focus Flame Learning Starter',
  copy: 'Now complete the training missions to grow your support skills.',
} as const;

export const ADULT_GROWTH_RESULTS = {
  title: 'Your Growth Results',
  badge: 'Focus Flame Family Advocate',
} as const;

export function scoreAdultAssessment(
  answers: Record<string, string>,
): {
  understandingScore: number;
  supportScore: number;
  totalScore: number;
} {
  let understandingScore = 0;
  let supportScore = 0;

  ADULT_GROWTH_CHECK_QUESTIONS.forEach((question) => {
    if (answers[question.id] !== question.correctId) return;
    if (question.domain === 'understanding') {
      understandingScore += 1;
    } else {
      supportScore += 1;
    }
  });

  return {
    understandingScore,
    supportScore,
    totalScore: understandingScore + supportScore,
  };
}
