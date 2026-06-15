import type { StagingQuestionOverride } from '../types';

type CaidenMathEnhancement = {
  scenarioText: string;
  questionText: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  hint: string;
  skillTags: string[];
};

const CAIDEN_MATH_ENHANCEMENTS: Record<string, CaidenMathEnhancement> = {
  'cq9-23-q1': {
    scenarioText:
      'Caiden and Mia share leader jobs: timer (5 min), supplies (8 min), and cheer (3 min). They have 12 minutes before the next activity.',
    questionText: 'Which job should they finish first to stay on schedule?',
    choices: [
      'Supplies — it takes the longest',
      'Cheer — it is shortest',
      'Timer — it blocks other tasks',
      'Skip planning and start randomly',
    ],
    correctIndex: 0,
    hint: 'Compare minutes each job needs with the 12-minute limit.',
    skillTags: ['Leadership', 'Time Management', 'Planning', 'Math'],
  },
  'cq9-23-q2': {
    scenarioText:
      'The team needs red and blue flag tape. Red costs 4 tokens, blue costs 3 tokens. They have 6 tokens total.',
    questionText: 'Can they buy both rolls today?',
    choices: [
      'No — together they cost 7 tokens',
      'Yes — 6 tokens is enough',
      'Yes — pick only blue',
      'No — they need 10 tokens',
    ],
    correctIndex: 0,
    hint: 'Add 4 + 3 and compare to 6.',
    skillTags: ['Leadership', 'Budgeting', 'Math'],
  },
  'cq9-23-q3': {
    scenarioText:
      'Instructions take 2 minutes. Teammate A interrupts every 30 seconds. Caiden needs 4 uninterrupted minutes to explain.',
    questionText: 'What should Caiden do first to protect listening time?',
    choices: [
      'Set a 4-minute quiet window before questions',
      'Skip instructions entirely',
      'Talk louder over interruptions',
      'Let everyone talk at once',
    ],
    correctIndex: 0,
    hint: 'Estimate how long full directions need.',
    skillTags: ['Leadership', 'Time Management', 'Planning'],
  },
  'cq9-23-q4': {
    scenarioText:
      'Drawing takes 10 min, measuring takes 6 min, gluing takes 4 min. Caiden has 15 minutes left.',
    questionText: 'Which two tasks can finish in time if done in order?',
    choices: [
      'Measuring then gluing (10 min total)',
      'Drawing then gluing (14 min)',
      'Drawing then measuring (16 min)',
      'All three tasks fit',
    ],
    correctIndex: 0,
    hint: 'Add pairs of times and compare to 15.',
    skillTags: ['Leadership', 'Sequencing', 'Math', 'Planning'],
  },
  'cq9-23-q5': {
    scenarioText:
      'The team is 8 minutes behind. Step 1 takes 3 min, step 2 takes 4 min, step 3 takes 2 min.',
    questionText: 'What is the smartest first move?',
    choices: [
      'Assign step 1 and step 3 to different teammates now',
      'Redo step 1 three times',
      'Wait and hope time appears',
      'Skip to step 3 only',
    ],
    correctIndex: 0,
    hint: 'Which steps add to 5 minutes or less and catch up?',
    skillTags: ['Leadership', 'Prioritization', 'Time Management'],
  },
  'cq9-23-q6': {
    scenarioText:
      'A teammate says they cannot finish a 12-minute task. Caiden can spare 5 minutes to help.',
    questionText: 'What is the best planning step?',
    choices: [
      'Split the task into one 5-minute part together, then a 7-minute solo part',
      'Do the whole task for them',
      'Tell them to work faster with no plan',
      'Remove them from the team',
    ],
    correctIndex: 0,
    hint: 'Divide 12 minutes into chunks that match 5 minutes of help.',
    skillTags: ['Leadership', 'Planning', 'Executive Function'],
  },
  'cq9-45-q1': {
    scenarioText:
      'The water jug walk is 6 minutes each way. Caiden and Jordan will switch every 4 minutes.',
    questionText: 'After 12 minutes, how many switches should have happened?',
    choices: ['Two switches', 'One switch', 'Three switches', 'None'],
    correctIndex: 0,
    hint: 'Divide 12 by the 4-minute switch interval.',
    skillTags: ['Leadership', 'Time Management', 'Math'],
  },
  'cq9-45-q2': {
    scenarioText:
      'Raft build: tape idea needs 20 min, rope idea needs 15 min. They have 18 minutes before testing.',
    questionText: 'What is the best leadership plan?',
    choices: [
      'Build a small rope model first (15 min), then add tape details if time remains',
      'Start full tape build (20 min) and skip testing',
      'Argue for all 18 minutes',
      'Build both full models at once',
    ],
    correctIndex: 0,
    hint: 'Compare each design time to the 18-minute limit.',
    skillTags: ['Leadership', 'Estimation', 'Planning'],
  },
  'cq9-45-q3': {
    scenarioText:
      'A mistake cost the team 5 minutes. Fixing it takes 8 minutes. Next round starts in 10 minutes.',
    questionText: 'What should Caiden prioritize?',
    choices: [
      'Start the 8-minute fix now and alert the team about timing',
      'Hide the mistake',
      'Blame one person publicly',
      'Ignore it until next week',
    ],
    correctIndex: 0,
    hint: 'Compare 8 minutes of repair to the 10-minute deadline.',
    skillTags: ['Leadership', 'Prioritization', 'Time Management'],
  },
  'cq9-45-q4': {
    scenarioText:
      'Roles: navigator (5 min briefing), builder (12 min), timekeeper (checks every 3 min).',
    questionText: 'When should the timekeeper make the first check?',
    choices: ['After 3 minutes', 'After 12 minutes', 'Never', 'Before briefing'],
    correctIndex: 0,
    hint: 'Use the 3-minute check interval from the start.',
    skillTags: ['Leadership', 'Sequencing', 'Executive Function'],
  },
  'cq9-45-q5': {
    scenarioText:
      'Team lost round 1. Caiden lists one strength (2 min talk) and one next step (3 min plan).',
    questionText: 'How long will the morale reset take?',
    choices: ['5 minutes', '2 minutes', '3 minutes', '10 minutes'],
    correctIndex: 0,
    hint: 'Add the talk time and plan time.',
    skillTags: ['Leadership', 'Math', 'Planning'],
  },
  'cq9-45-q6': {
    scenarioText:
      'Safety check adds 4 minutes. Shortcut saves 4 minutes but skips the check.',
    questionText: 'What tradeoff should Caiden choose?',
    choices: [
      'Take the 4-minute safety check — time cost is worth the risk reduction',
      'Skip safety to win',
      'Let teammates decide without context',
      'Hide the shortcut from adults',
    ],
    correctIndex: 0,
    hint: 'Compare time saved versus safety responsibility.',
    skillTags: ['Leadership', 'Executive Function', 'Planning'],
  },
  'cq9-45-q7': {
    scenarioText:
      'Round-robin: 4 quiet teammates, 2 minutes each to share one idea = 8 minutes total.',
    questionText: 'If they have 10 minutes, how much time remains for a group vote?',
    choices: ['2 minutes', '8 minutes', '4 minutes', '0 minutes'],
    correctIndex: 0,
    hint: 'Subtract 8 from 10.',
    skillTags: ['Leadership', 'Math', 'Planning'],
  },
};

export function enhanceCaidenMathOverride(override: StagingQuestionOverride): StagingQuestionOverride {
  const enhancement = CAIDEN_MATH_ENHANCEMENTS[override.questionId];
  if (!enhancement) return override;

  return {
    ...override,
    scenarioText: enhancement.scenarioText,
    questionText: enhancement.questionText,
    choices: enhancement.choices,
    correctIndex: enhancement.correctIndex,
    hint: enhancement.hint,
    skillTags: enhancement.skillTags,
    scenarioTag: override.scenarioTag ?? 'PLAN MATH',
    scenarioAccent: override.scenarioAccent ?? 'timer',
    contentVersion: 'adaptive_staging_v3_final',
    rewriteNotes: `${override.rewriteNotes}; v3 Caiden math/EF pass`,
  };
}

export const CAIDEN_MATH_QUESTION_IDS = new Set(Object.keys(CAIDEN_MATH_ENHANCEMENTS));
