export const B4_BASELINE_ASSESSMENT_NAME = 'B-4 Check-In';

export const B4_BASELINE_FAMILY_LANDING = {
  eyebrow: 'FOCUS FLAME STARTER',
  title: 'B-4 Check-In',
  subtitle: 'Unlock your Weekly Adventures.',
  body: 'This is a friendly check-in — not a test. Your answers help B-4 understand how you focus, read, and grow.',
  cta: 'Start B-4 Check-In',
} as const;

export const B4_BASELINE_LANDING = {
  eyebrow: 'B-4 GUIDE',
  title: B4_BASELINE_ASSESSMENT_NAME,
  subtitle: 'Let\u2019s see where your Focus Flame starts.',
  body: 'This is not a test. There are no bad answers. Your answers help B-4 understand how you focus, read, and handle big feelings.',
  cta: 'Start Check',
} as const;

export type BaselineModuleId = 'feelings' | 'reading' | 'focus-moves';

export type BaselineMcChoice = { id: string; label: string };

export type BaselineMcQuestion = {
  id: string;
  text: string;
  choices: BaselineMcChoice[];
  correctId: string;
};

export const B4_BASELINE_PRIVACY_NOTE =
  'We only need a first name or nickname. Do not enter full names.';

export const B4_BASELINE_STUDENT_HINT = 'Use first name or nickname only.';

export const REQUIRED_BASELINE_MODULE_IDS: BaselineModuleId[] = [
  'feelings',
  'reading',
  'focus-moves',
];

export function hasAllBaselineModules(completedModules: BaselineModuleId[]): boolean {
  return REQUIRED_BASELINE_MODULE_IDS.every((moduleId) => completedModules.includes(moduleId));
}

export function getNextBaselineModule(completedModules: BaselineModuleId[]): BaselineModuleId | null {
  return REQUIRED_BASELINE_MODULE_IDS.find((moduleId) => !completedModules.includes(moduleId)) ?? null;
}

export const B4_BASELINE_MODULES = [
  {
    id: 'feelings' as const,
    title: 'Feelings Check',
    description: 'How do you handle focus, confidence, and emotions?',
    questionCount: 10,
  },
  {
    id: 'reading' as const,
    title: 'Reading Check',
    description: 'Read a short story and answer what happened.',
    questionCount: 5,
  },
  {
    id: 'focus-moves' as const,
    title: 'Focus Moves',
    description: 'Choose what you would do in everyday focus moments.',
    questionCount: 5,
  },
];

export const B4_BASELINE_SCALE = [
  { value: 1, label: 'Not yet' },
  { value: 2, label: 'A little' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Usually' },
  { value: 5, label: 'Strongly' },
] as const;

export const B4_BASELINE_FEELINGS_QUESTIONS = [
  { id: 'f1', text: 'I can stay focused when something is difficult.' },
  { id: 'f2', text: 'I know what helps me calm down when I feel frustrated.' },
  { id: 'f3', text: 'I can ask for help when I need it.' },
  { id: 'f4', text: 'I feel confident sharing my ideas.' },
  { id: 'f5', text: 'I can work well with others.' },
  { id: 'f6', text: 'I keep trying when something feels hard.' },
  { id: 'f7', text: 'I understand how my feelings affect my choices.' },
  { id: 'f8', text: 'I know what helps me focus.' },
  { id: 'f9', text: 'I feel proud of my strengths.' },
  { id: 'f10', text: 'I believe my differences can be a strength.' },
];

export const B4_BASELINE_FEELINGS_FEEDBACK = 'Thanks for sharing. B-4 saved your answer.';

export const B4_BASELINE_READING_PASSAGE =
  'Caiden stood at the edge of the trail and looked into the dark trees. The wind moved through the branches, and B-4 floated beside him. Caiden wanted to turn back, but he remembered what Uncle T said: \u201cOne brave step can light the way.\u201d Caiden took a breath, held his backpack straps, and stepped forward.';

export const B4_BASELINE_READING_QUESTIONS: BaselineMcQuestion[] = [
  {
    id: 'r1',
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
    id: 'r2',
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
    id: 'r3',
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
    id: 'r4',
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
    id: 'r5',
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

export const B4_BASELINE_FOCUS_MOVES_QUESTIONS: BaselineMcQuestion[] = [
  {
    id: 'm1',
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
    id: 'm2',
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
    id: 'm3',
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
    id: 'm4',
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
    id: 'm5',
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

export const B4_BASELINE_MODULE_COMPLETE = {
  title: 'Nice work!',
  copy: 'B-4 saved your check-in. Your Focus Flame is getting ready for the adventure.',
  cta: 'Back to Hub',
} as const;

export const B4_BASELINE_FINAL = {
  title: 'Baseline Complete',
  copy: 'B-4 saved your starting point. At the end of the program, you\u2019ll take this again to see how your Focus Flame has grown.',
  cta: 'Back to Hub',
} as const;

export function getBaselineModuleQuestionCount(moduleId: BaselineModuleId): number {
  if (moduleId === 'feelings') return B4_BASELINE_FEELINGS_QUESTIONS.length;
  if (moduleId === 'reading') return B4_BASELINE_READING_QUESTIONS.length;
  return B4_BASELINE_FOCUS_MOVES_QUESTIONS.length;
}

export function scoreBaselineMc(questions: BaselineMcQuestion[], answers: Record<string, string>): number {
  return questions.reduce((sum, q) => sum + (answers[q.id] === q.correctId ? 1 : 0), 0);
}

export function scoreBaselineFeelings(answers: Record<string, number>): number {
  return Object.values(answers).reduce((sum, v) => sum + v, 0);
}
