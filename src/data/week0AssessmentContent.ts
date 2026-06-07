/** Canonical Week 0 / Week Final assessment route — Focus Flame Lab baseline hub. */
export const WEEK_0_ASSESSMENT_PATH = '/focus-flame-lab/week-0';

/**
 * Future: Week Final Growth Check reuses the same module content and scoring.
 * Set phase to `'growth'` and pass baselineSnapshot for before/after comparison.
 */
export type Week0AssessmentPhase = 'baseline' | 'growth';

export type Week0ModuleId = 'sel' | 'reading' | 'focus-strategy';

export type Week0AssessmentResult = {
  studentName?: string;
  week: 0;
  phase: Week0AssessmentPhase;
  selScore: number;
  readingScore: number;
  focusStrategyScore: number;
  completedAt: string;
  /** Populated on growth phase — baseline taken at Week 0 start. */
  baselineSnapshot?: Omit<Week0AssessmentResult, 'baselineSnapshot'>;
};

export type Week0HubPersistedState = {
  studentName?: string;
  completedModules: Week0ModuleId[];
  result: Week0AssessmentResult | null;
};

export type Week0SelQuestion = {
  id: string;
  text: string;
};

export type Week0McChoice = {
  id: string;
  label: string;
};

export type Week0McQuestion = {
  id: string;
  text: string;
  choices: Week0McChoice[];
  correctId: string;
};

export const WEEK_0_HUB = {
  eyebrow: 'B-4 GUIDE',
  title: 'Week 0: Focus Check',
  subtitle:
    'Before the adventure begins, B-4 wants to learn how you focus, read, and handle big feelings.',
  intro:
    'This is not a test. There are no bad answers. Your answers help your guide understand where your Focus Flame starts.',
  tagline: 'Let\u2019s see where your Focus Flame starts.',
  allComplete: 'All done! Your Focus Flame baseline is saved.',
} as const;

export const WEEK_0_MODULES = [
  {
    id: 'sel' as const,
    title: 'SEL Check-In',
    description: 'Answer how you feel about focus, confidence, and emotions.',
    questionCount: 10,
    typeLabel: '1–5 scale',
  },
  {
    id: 'reading' as const,
    title: 'Reading Check',
    description: 'Read a short passage and answer questions about what happened.',
    questionCount: 5,
    typeLabel: 'multiple choice',
  },
  {
    id: 'focus-strategy' as const,
    title: 'Focus Strategy Check',
    description: 'Choose what you would do in everyday focus moments.',
    questionCount: 5,
    typeLabel: 'scenario choice',
  },
];

export const WEEK_0_SCALE_LABELS: Record<number, string> = {
  1: 'Not yet',
  2: 'A little',
  3: 'Sometimes',
  4: 'Usually',
  5: 'Strongly',
};

export const WEEK_0_SEL_QUESTIONS: Week0SelQuestion[] = [
  { id: 'sel-1', text: 'I can stay focused when something is difficult.' },
  { id: 'sel-2', text: 'I know what helps me calm down when I feel frustrated.' },
  { id: 'sel-3', text: 'I can ask for help when I need it.' },
  { id: 'sel-4', text: 'I feel confident sharing my ideas.' },
  { id: 'sel-5', text: 'I can work well with others.' },
  { id: 'sel-6', text: 'I keep trying when something feels hard.' },
  { id: 'sel-7', text: 'I understand how my feelings affect my choices.' },
  { id: 'sel-8', text: 'I know what helps me focus.' },
  { id: 'sel-9', text: 'I feel proud of my strengths.' },
  { id: 'sel-10', text: 'I believe my differences can be a strength.' },
];

export const WEEK_0_READING_PASSAGE =
  'Caiden stood at the edge of the trail and looked into the dark trees. The wind moved through the branches, and B-4 floated beside him. Caiden wanted to turn back, but he remembered what Uncle T said: \u201cOne brave step can light the way.\u201d Caiden took a breath, held his backpack straps, and stepped forward.';

export const WEEK_0_READING_QUESTIONS: Week0McQuestion[] = [
  {
    id: 'read-1',
    text: 'Where was Caiden standing?',
    choices: [
      { id: 'a', label: 'At school' },
      { id: 'b', label: 'At the edge of a trail' },
      { id: 'c', label: 'In his bedroom' },
      { id: 'd', label: 'At a playground' },
    ],
    correctId: 'b',
  },
  {
    id: 'read-2',
    text: 'Who was with Caiden?',
    choices: [
      { id: 'a', label: 'B-4' },
      { id: 'b', label: 'Marina' },
      { id: 'c', label: 'His teacher' },
      { id: 'd', label: 'Ollie Buck' },
    ],
    correctId: 'a',
  },
  {
    id: 'read-3',
    text: 'How did Caiden feel at first?',
    choices: [
      { id: 'a', label: 'Excited' },
      { id: 'b', label: 'Angry' },
      { id: 'c', label: 'Unsure' },
      { id: 'd', label: 'Silly' },
    ],
    correctId: 'c',
  },
  {
    id: 'read-4',
    text: 'What did Caiden remember?',
    choices: [
      { id: 'a', label: 'A joke' },
      { id: 'b', label: 'A song' },
      { id: 'c', label: 'Uncle T\u2019s words' },
      { id: 'd', label: 'His homework' },
    ],
    correctId: 'c',
  },
  {
    id: 'read-5',
    text: 'What did Caiden do at the end?',
    choices: [
      { id: 'a', label: 'Ran away' },
      { id: 'b', label: 'Took one brave step' },
      { id: 'c', label: 'Called for help' },
      { id: 'd', label: 'Went to sleep' },
    ],
    correctId: 'b',
  },
];

export const WEEK_0_FOCUS_STRATEGY_QUESTIONS: Week0McQuestion[] = [
  {
    id: 'focus-1',
    text: 'You feel frustrated because something is hard. What could help?',
    choices: [
      { id: 'a', label: 'Give up right away' },
      { id: 'b', label: 'Take a breath and try one small step' },
      { id: 'c', label: 'Yell at someone' },
      { id: 'd', label: 'Hide your work' },
    ],
    correctId: 'b',
  },
  {
    id: 'focus-2',
    text: 'You don\u2019t understand the directions. What could you do?',
    choices: [
      { id: 'a', label: 'Pretend you understand' },
      { id: 'b', label: 'Ask a question' },
      { id: 'c', label: 'Walk away' },
      { id: 'd', label: 'Laugh' },
    ],
    correctId: 'b',
  },
  {
    id: 'focus-3',
    text: 'Your body feels restless. What could help you reset?',
    choices: [
      { id: 'a', label: 'Pause and notice your body' },
      { id: 'b', label: 'Push someone' },
      { id: 'c', label: 'Ignore it forever' },
      { id: 'd', label: 'Quit the activity' },
    ],
    correctId: 'a',
  },
  {
    id: 'focus-4',
    text: 'A teammate feels left out. What could you do?',
    choices: [
      { id: 'a', label: 'Invite them to join' },
      { id: 'b', label: 'Ignore them' },
      { id: 'c', label: 'Make fun of them' },
      { id: 'd', label: 'Tell them to leave' },
    ],
    correctId: 'a',
  },
  {
    id: 'focus-5',
    text: 'You make a mistake. What is a brave next step?',
    choices: [
      { id: 'a', label: 'Try again' },
      { id: 'b', label: 'Blame someone' },
      { id: 'c', label: 'Stop learning' },
      { id: 'd', label: 'Tear up the paper' },
    ],
    correctId: 'a',
  },
];

export const WEEK_0_MODULE_RESULT = {
  title: 'Nice work!',
  copy: 'B-4 saved your check-in. Your Focus Flame is getting ready for the adventure.',
  cta: 'Back to Week 0 Hub',
} as const;

export const WEEK_0_FINAL_COMPLETE = {
  title: 'Your Focus Flame Baseline is Complete',
  copy: 'You\u2019re ready to begin Caiden\u2019s Courage. At the end, you\u2019ll take this check again to see how your Focus Flame has grown.',
  cta: 'Start Week 1',
} as const;

export function getWeek0ModuleQuestionCount(moduleId: Week0ModuleId): number {
  if (moduleId === 'sel') return WEEK_0_SEL_QUESTIONS.length;
  if (moduleId === 'reading') return WEEK_0_READING_QUESTIONS.length;
  return WEEK_0_FOCUS_STRATEGY_QUESTIONS.length;
}

export function scoreWeek0McAnswers(
  questions: Week0McQuestion[],
  answers: Record<string, string>,
): number {
  return questions.reduce((sum, q) => sum + (answers[q.id] === q.correctId ? 1 : 0), 0);
}

export function scoreWeek0SelAnswers(answers: Record<string, number>): number {
  return Object.values(answers).reduce((sum, v) => sum + v, 0);
}

/**
 * Future Week Final: Growth Check — compare baseline vs growth scores.
 * Returns deltas for SEL, reading, and focus strategy modules.
 */
export function compareWeek0Growth(
  baseline: Week0AssessmentResult,
  growth: Week0AssessmentResult,
): {
  selDelta: number;
  readingDelta: number;
  focusStrategyDelta: number;
} {
  return {
    selDelta: growth.selScore - baseline.selScore,
    readingDelta: growth.readingScore - baseline.readingScore,
    focusStrategyDelta: growth.focusStrategyScore - baseline.focusStrategyScore,
  };
}
