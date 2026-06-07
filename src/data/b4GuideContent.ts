export type B4GuideResultType = 'focus-builder' | 'feeling-finder' | 'brave-starter';

export type B4GuideChoice = {
  id: string;
  label: string;
};

export type B4GuideAssessmentQuestion = {
  id: string;
  prompt: string;
  choices: [B4GuideChoice, B4GuideChoice, B4GuideChoice];
};

export type B4GuideResult = {
  type: B4GuideResultType;
  title: string;
  b4Message: string;
  recommendedMoves: [string, string];
};

export type B4GuideModuleStep =
  | {
      id: string;
      kind: 'choice';
      title: string;
      prompt: string;
      b4Intro?: string;
      choices: B4GuideChoice[];
    }
  | {
      id: string;
      kind: 'focus-move';
      title: string;
      prompt: string;
      b4Intro?: string;
      choices: B4GuideChoice[];
      instructions: Record<string, string>;
    };

export const B4_GUIDE_PAGE_TITLE = 'B-4 Guide';
export const B4_GUIDE_SUBTITLE =
  'Let B-4 help you check in, learn your focus style, and practice brave choices.';

export const B4_GUIDE_MODE_OPTIONS = [
  {
    id: 'assessment',
    title: 'Start My B-4 Check-In',
    description: 'Answer a few questions so B-4 can learn how you focus.',
    cta: 'Start Check-In',
  },
  {
    id: 'module',
    title: 'Week 1: Find Your Focus Flame',
    description: 'Practice focus, emotion, and brave choice skills with B-4.',
    cta: 'Start Week 1',
  },
] as const;

export const B4_ASSESSMENT_QUESTIONS: B4GuideAssessmentQuestion[] = [
  {
    id: 'q1',
    prompt: 'When something feels hard, what do you usually do?',
    choices: [
      { id: 'a', label: 'I keep trying' },
      { id: 'b', label: 'I ask for help' },
      { id: 'c', label: 'I want to stop' },
    ],
  },
  {
    id: 'q2',
    prompt: 'When I get distracted, I usually:',
    choices: [
      { id: 'a', label: 'Notice it and come back' },
      { id: 'b', label: 'Need a reminder' },
      { id: 'c', label: 'Forget what I was doing' },
    ],
  },
  {
    id: 'q3',
    prompt: 'When I feel nervous, I feel it most in my:',
    choices: [
      { id: 'a', label: 'Head' },
      { id: 'b', label: 'Chest or stomach' },
      { id: 'c', label: 'Hands or body' },
    ],
  },
  {
    id: 'q4',
    prompt: 'When someone corrects me, I usually:',
    choices: [
      { id: 'a', label: 'Try again' },
      { id: 'b', label: 'Feel embarrassed' },
      { id: 'c', label: 'Get upset or shut down' },
    ],
  },
  {
    id: 'q5',
    prompt: 'When I have a big feeling, I can:',
    choices: [
      { id: 'a', label: 'Name the feeling' },
      { id: 'b', label: 'Feel it but not explain it' },
      { id: 'c', label: 'Hide it or ignore it' },
    ],
  },
  {
    id: 'q6',
    prompt: 'When I need to focus, what helps most?',
    choices: [
      { id: 'a', label: 'A quiet space' },
      { id: 'b', label: 'A reminder or timer' },
      { id: 'c', label: 'Moving my body first' },
    ],
  },
  {
    id: 'q7',
    prompt: 'When I make a mistake, I usually think:',
    choices: [
      { id: 'a', label: 'I can learn from this' },
      { id: 'b', label: 'I messed up' },
      { id: 'c', label: 'I do not want to try again' },
    ],
  },
  {
    id: 'q8',
    prompt: 'What kind of helper do you need today?',
    choices: [
      { id: 'a', label: 'Focus helper' },
      { id: 'b', label: 'Feeling helper' },
      { id: 'c', label: 'Brave choice helper' },
    ],
  },
];

/** Maps each question's choice id to a result bucket for scoring. */
const ASSESSMENT_SCORING: Record<B4GuideResultType, string[]> = {
  'focus-builder': ['q2:a', 'q2:b', 'q6:a', 'q6:b', 'q6:c', 'q7:a', 'q8:a'],
  'feeling-finder': ['q1:b', 'q3:a', 'q3:b', 'q3:c', 'q4:b', 'q5:a', 'q5:b', 'q7:b', 'q8:b'],
  'brave-starter': ['q1:a', 'q1:c', 'q4:a', 'q4:c', 'q5:c', 'q7:c', 'q8:c'],
};

export const B4_GUIDE_RESULTS: Record<B4GuideResultType, B4GuideResult> = {
  'focus-builder': {
    type: 'focus-builder',
    title: 'Focus Builder',
    b4Message: 'Your brain has big ideas. Let\u2019s help those ideas land one at a time.',
    recommendedMoves: ['B-4 Pause', 'Anchor Step'],
  },
  'feeling-finder': {
    type: 'feeling-finder',
    title: 'Feeling Finder',
    b4Message: 'You notice big feelings fast. Let\u2019s name them and give them a calm reset.',
    recommendedMoves: ['Spark Breath', 'B-4 Pause'],
  },
  'brave-starter': {
    type: 'brave-starter',
    title: 'Brave Starter',
    b4Message: 'You\u2019ve got brave in you already. Let\u2019s practice one small brave choice at a time.',
    recommendedMoves: ['Anchor Step', 'Flame Draw'],
  },
};

export function calculateAssessmentResult(
  answers: Record<string, string>,
): B4GuideResultType {
  const q8 = answers.q8;
  if (q8 === 'a') return 'focus-builder';
  if (q8 === 'b') return 'feeling-finder';
  if (q8 === 'c') return 'brave-starter';

  const scores: Record<B4GuideResultType, number> = {
    'focus-builder': 0,
    'feeling-finder': 0,
    'brave-starter': 0,
  };

  for (const [resultType, keys] of Object.entries(ASSESSMENT_SCORING) as [B4GuideResultType, string[]][]) {
    for (const key of keys) {
      const [qId, choiceId] = key.split(':');
      if (answers[qId] === choiceId) scores[resultType] += 1;
    }
  }

  const ranked = (Object.keys(scores) as B4GuideResultType[]).sort((a, b) => scores[b] - scores[a]);
  return ranked[0] ?? 'focus-builder';
}

export const B4_MODULE_STEPS: B4GuideModuleStep[] = [
  {
    id: 'story',
    kind: 'choice',
    title: 'Story Moment',
    b4Intro: 'Caiden sometimes feels like his brain is moving faster than the room. Have you ever felt that?',
    prompt: '',
    choices: [
      { id: 'yes', label: 'Yes' },
      { id: 'sometimes', label: 'Sometimes' },
      { id: 'not-really', label: 'Not really' },
    ],
  },
  {
    id: 'feeling',
    kind: 'choice',
    title: 'Feeling Check',
    prompt: 'What feeling shows up when focus gets hard?',
    choices: [
      { id: 'frustrated', label: 'Frustrated' },
      { id: 'nervous', label: 'Nervous' },
      { id: 'bored', label: 'Bored' },
      { id: 'confused', label: 'Confused' },
    ],
  },
  {
    id: 'body',
    kind: 'choice',
    title: 'Body Signal',
    prompt: 'Where do you feel that feeling in your body?',
    choices: [
      { id: 'head', label: 'Head' },
      { id: 'chest', label: 'Chest' },
      { id: 'stomach', label: 'Stomach' },
      { id: 'hands', label: 'Hands' },
      { id: 'whole-body', label: 'Whole body' },
    ],
  },
  {
    id: 'focus-move',
    kind: 'focus-move',
    title: 'Focus Move',
    prompt: 'Pick one move to try with B-4.',
    choices: [
      { id: 'spark-breath', label: 'Spark Breath: Take 3 slow breaths' },
      { id: 'anchor-step', label: 'Anchor Step: Press feet into the floor' },
      { id: 'b4-pause', label: 'B-4 Pause: Stop, notice, choose' },
      { id: 'flame-draw', label: 'Flame Draw: Trace a flame with your finger' },
    ],
    instructions: {
      'spark-breath':
        'Take 3 slow breaths. B-4 says: In through your nose\u2026 out like you\u2019re cooling a tiny flame.',
      'anchor-step':
        'Press your feet into the floor. Notice the ground holding you up. Hold for 5\u2026 4\u2026 3\u2026 2\u2026 1.',
      'b4-pause': 'Stop. Notice what you feel. Name it if you can. Choose your next brave move.',
      'flame-draw':
        'Trace a small flame in the air with your finger. Slow and steady. Let your focus follow the flame.',
    },
  },
  {
    id: 'brave-choice',
    kind: 'choice',
    title: 'Brave Choice',
    prompt: 'What brave choice can you make next?',
    choices: [
      { id: 'try-again', label: 'Try one more time' },
      { id: 'ask-help', label: 'Ask for help' },
      { id: 'reset', label: 'Take a short reset' },
      { id: 'focus-move', label: 'Use my focus move' },
    ],
  },
];

export const B4_MODULE_TITLE = 'Week 1: Find Your Focus Flame';

export const B4_COMPLETION = {
  title: 'Your Focus Flame is warming up.',
  b4Message:
    'You checked in. You noticed your feeling. You picked a focus move. That is brave work.',
  badge: 'Week 1 Focus Starter',
};
