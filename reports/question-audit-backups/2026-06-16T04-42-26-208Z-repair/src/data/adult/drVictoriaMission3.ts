import type { GameFeedbackDetail } from '../../types/gameAssessment';
import { buildDrVictoriaMissionConfig } from './drVictoriaMissionFramework';

export const DR_VICTORIA_MISSION_3_ID = 'mission-3';

const DV3_FEEDBACK: Record<string, GameFeedbackDetail> = {
  'dv3-q1': {
    tryThisLabel: 'Here are a few tips:',
    tryThis: [
      'Use pictures or simple words when possible.',
      'Keep the checklist visible.',
      'Review it together before the activity starts.',
    ],
  },
  'dv3-q2': {
    tryThisLabel: 'Here are a few tips:',
    tryThis: [
      'Break the project into small parts.',
      'Show what “done” looks like.',
      'Celebrate progress along the way.',
    ],
  },
  'dv3-q3': {
    tryThisLabel: 'Here are a few tips:',
    tryThis: [
      'Try short focus intervals.',
      'Add a planned break.',
      'Let the child see how much time is left.',
    ],
  },
  'dv3-q4': {
    tryThisLabel: 'Here are a few tips:',
    tryThis: [
      'Use colors or labels.',
      'Keep categories simple.',
      'Practice the system before expecting independence.',
    ],
  },
  'dv3-q5': {
    tryThisLabel: 'Here are a few tips:',
    tryThis: [
      'Lower unnecessary noise when possible.',
      'Offer a quieter spot.',
      'Use headphones or calm background sound if appropriate.',
    ],
  },
  'dv3-q6': {
    tryThisLabel: 'Here are a few tips:',
    tryThis: [
      'Keep the routine chart in the same place.',
      'Use checkboxes or icons.',
      'Review it at the same time each day.',
    ],
  },
  'dv3-q7': {
    tryThisLabel: 'Here are a few tips:',
    tryThis: [
      'Give a five-minute and one-minute warning.',
      'Name what is ending and what comes next.',
      'Use the same transition routine when possible.',
    ],
  },
  'dv3-q8': {
    tryThisLabel: 'Here are a few tips:',
    tryThis: [
      'Teach the system step by step.',
      'Practice before fading support.',
      'Notice effort, not just independence.',
    ],
  },
};

export const DR_VICTORIA_MISSION_3_CONFIG = buildDrVictoriaMissionConfig({
  id: DR_VICTORIA_MISSION_3_ID,
  subtitle: 'Building Focus-Friendly Environments',
  presentationStyle: 'focus_lab',
  decorVariant: 'victoria-focus-lab',
  shellClassName: 'victoria-game victoria-game--focusLab',
  landingCta: 'Start Mission',
  landingBody:
    'Sometimes children do not need more pressure. They need better systems. Let\u2019s practice creating environments that make focus, routines, and follow-through easier.',
  completeTitle: 'Focus Builder Badge Earned!',
  completeMessage:
    'You practiced creating environments that help children start, focus, and follow through.',
  badges: ['Focus Builder', 'System Designer', 'Environment Supporter'],
  scoreMessages: [
    {
      min: 8,
      max: 8,
      message:
        'Focus Architect! You understand how systems and environments support different minds.',
    },
    {
      min: 6,
      max: 7,
      message: 'Strong Builder! You\u2019re learning how to set children up for success.',
    },
    {
      min: 4,
      max: 5,
      message: 'Growing Skills! Small changes can create big improvements.',
    },
    {
      min: 0,
      max: 3,
      message: 'Great Start! Supporting focus begins with understanding the environment.',
    },
  ],
  questions: [
    {
      id: 'dv3-q1',
      type: 'multiple_choice',
      clueCard: {
        variant: 'focus_lab',
        label: 'FOCUS MOMENT',
        tag: 'VISUAL CHECKLIST',
        text: 'A child forgets materials almost every day.',
        accent: 'visual-checklist',
      },
      prompt: 'What support is most likely to help?',
      question: 'What support is most likely to help?',
      options: [
        { id: 'a', label: 'More reminders after mistakes' },
        { id: 'b', label: 'Create a visual checklist' },
        { id: 'c', label: 'Take away privileges immediately' },
        { id: 'd', label: 'Ignore it' },
      ],
      correctId: 'b',
      feedbackCorrect: 'Visual systems help reduce memory load and support executive functioning.',
      feedbackIncorrect: 'Visual systems help reduce memory load and support executive functioning.',
      feedbackDetail: DV3_FEEDBACK['dv3-q1'],
    },
    {
      id: 'dv3-q2',
      type: 'multiple_choice',
      clueCard: {
        variant: 'focus_lab',
        label: 'FOCUS MOMENT',
        tag: 'BREAK IT DOWN',
        text: 'A student feels overwhelmed by a large project.',
        accent: 'break-it-down',
      },
      prompt: 'What environment support helps most?',
      question: 'What environment support helps most?',
      options: [
        { id: 'a', label: 'Give the entire project at once' },
        { id: 'b', label: 'Break it into smaller steps' },
        { id: 'c', label: 'Tell them to work harder' },
        { id: 'd', label: 'Reduce all expectations' },
      ],
      correctId: 'b',
      feedbackCorrect: 'Big tasks can feel impossible when children cannot see the steps.',
      feedbackIncorrect: 'Big tasks can feel impossible when children cannot see the steps.',
      feedbackDetail: DV3_FEEDBACK['dv3-q2'],
    },
    {
      id: 'dv3-q3',
      type: 'multiple_choice',
      clueCard: {
        variant: 'focus_lab',
        label: 'FOCUS MOMENT',
        tag: 'WORK TIMER',
        text: 'A child loses focus during homework.',
        accent: 'work-timer',
      },
      prompt: 'What may help?',
      question: 'What may help?',
      options: [
        { id: 'a', label: 'A short work timer' },
        { id: 'b', label: 'More distractions' },
        { id: 'c', label: 'A louder room' },
        { id: 'd', label: 'More pressure' },
      ],
      correctId: 'a',
      feedbackCorrect: 'Timers can make work feel more predictable and less endless.',
      feedbackIncorrect: 'Timers can make work feel more predictable and less endless.',
      feedbackDetail: DV3_FEEDBACK['dv3-q3'],
    },
    {
      id: 'dv3-q4',
      type: 'multiple_choice',
      clueCard: {
        variant: 'focus_lab',
        label: 'FOCUS MOMENT',
        tag: 'ORGANIZED FOLDERS',
        text: 'A student struggles to organize papers.',
        accent: 'organized-folders',
      },
      prompt: 'What support helps?',
      question: 'What support helps?',
      options: [
        { id: 'a', label: 'Color-coded folders' },
        { id: 'b', label: 'More worksheets' },
        { id: 'c', label: 'Less structure' },
        { id: 'd', label: 'Random storage' },
      ],
      correctId: 'a',
      feedbackCorrect: 'Organization is easier when materials have a clear home.',
      feedbackIncorrect: 'Organization is easier when materials have a clear home.',
      feedbackDetail: DV3_FEEDBACK['dv3-q4'],
    },
    {
      id: 'dv3-q5',
      type: 'multiple_choice',
      clueCard: {
        variant: 'focus_lab',
        label: 'FOCUS MOMENT',
        tag: 'QUIET WORKSPACE',
        text: 'A child gets distracted by noise.',
        accent: 'quiet-workspace',
      },
      prompt: 'What could help?',
      question: 'What could help?',
      options: [
        { id: 'a', label: 'Quiet workspace' },
        { id: 'b', label: 'Extra noise' },
        { id: 'c', label: 'More interruptions' },
        { id: 'd', label: 'No support' },
      ],
      correctId: 'a',
      feedbackCorrect:
        'Reducing distractions can help children use their attention more effectively.',
      feedbackIncorrect:
        'Reducing distractions can help children use their attention more effectively.',
      feedbackDetail: DV3_FEEDBACK['dv3-q5'],
    },
    {
      id: 'dv3-q6',
      type: 'multiple_choice',
      clueCard: {
        variant: 'focus_lab',
        label: 'FOCUS MOMENT',
        tag: 'ROUTINE CHART',
        text: 'A student forgets the morning routine.',
        accent: 'routine-chart',
      },
      prompt: 'What support helps?',
      question: 'What support helps?',
      options: [
        { id: 'a', label: 'Visual routine chart' },
        { id: 'b', label: 'Daily lectures' },
        { id: 'c', label: 'Punishment' },
        { id: 'd', label: 'Guessing' },
      ],
      correctId: 'a',
      feedbackCorrect: 'Routines become easier when children can see the sequence.',
      feedbackIncorrect: 'Routines become easier when children can see the sequence.',
      feedbackDetail: DV3_FEEDBACK['dv3-q6'],
    },
    {
      id: 'dv3-q7',
      type: 'multiple_choice',
      clueCard: {
        variant: 'focus_lab',
        label: 'FOCUS MOMENT',
        tag: 'TRANSITION COUNTDOWN',
        text: 'A child has trouble transitioning activities.',
        accent: 'transition-countdown',
      },
      prompt: 'What may help?',
      question: 'What may help?',
      options: [
        { id: 'a', label: 'Countdown warnings' },
        { id: 'b', label: 'Sudden changes' },
        { id: 'c', label: 'Surprises' },
        { id: 'd', label: 'Criticism' },
      ],
      correctId: 'a',
      feedbackCorrect: 'Transitions are easier when children have time to prepare.',
      feedbackIncorrect: 'Transitions are easier when children have time to prepare.',
      feedbackDetail: DV3_FEEDBACK['dv3-q7'],
    },
    {
      id: 'dv3-q8',
      type: 'multiple_choice',
      clueCard: {
        variant: 'focus_lab',
        label: 'FOCUS MOMENT',
        tag: 'BUILD SYSTEMS FIRST',
        text: 'A student wants to succeed but struggles with organization.',
        accent: 'build-systems',
      },
      prompt: 'What mindset should adults adopt?',
      question: 'What mindset should adults adopt?',
      options: [
        { id: 'a', label: 'Build systems before expecting consistency' },
        { id: 'b', label: 'They simply do not care' },
        { id: 'c', label: 'They are lazy' },
        { id: 'd', label: 'They should figure it out alone' },
      ],
      correctId: 'a',
      feedbackCorrect:
        'Consistency often grows after the right supports are in place.',
      feedbackIncorrect:
        'Consistency often grows after the right supports are in place.',
      feedbackDetail: DV3_FEEDBACK['dv3-q8'],
    },
  ],
});
