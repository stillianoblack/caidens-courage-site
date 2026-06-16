import type { GameFeedbackDetail } from '../../types/gameAssessment';
import { buildDrVictoriaMissionConfig } from './drVictoriaMissionFramework';

export const DR_VICTORIA_MISSION_2_ID = 'mission-2';

const DV2_FEEDBACK_DETAILS: Record<string, GameFeedbackDetail> = {
  'dv2-q1': {
    tryThisLabel: 'Here are a few tips:',
    tryThis: [
      'Break the task into one small step.',
      'Use calm language.',
      'Offer support without taking over.',
    ],
  },
  'dv2-q2': {
    tryThisLabel: 'Here are a few tips:',
    tryThis: [
      'Restate the expectation clearly.',
      'Use a visual or hand signal.',
      'Praise the next attempt to listen.',
    ],
  },
  'dv2-q3': {
    tryThisLabel: 'Here are a few tips:',
    tryThis: [
      'Normalize mistakes.',
      'Focus on the next step.',
      'Praise effort and repair.',
    ],
  },
  'dv2-q4': {
    tryThisLabel: 'Here are a few tips:',
    tryThis: [
      'Offer a short reset.',
      'Give a clear return point.',
      'Use movement as support, not punishment.',
    ],
  },
  'dv2-q5': {
    tryThisLabel: 'Here are a few tips:',
    tryThis: [
      'Check in privately when possible.',
      'Repeat directions calmly.',
      'Ask what part feels unclear.',
    ],
  },
  'dv2-q6': {
    tryThisLabel: 'Here are a few tips:',
    tryThis: [
      'Explain the change briefly.',
      'Tell the child what happens next.',
      'Give them a moment to adjust.',
    ],
  },
  'dv2-q7': {
    tryThisLabel: 'Here are a few tips:',
    tryThis: [
      'Offer a low-pressure entry point.',
      'Give a choice when possible.',
      'Pair them with a supportive peer or adult.',
    ],
  },
  'dv2-q8': {
    tryThisLabel: 'Here are a few tips:',
    tryThis: [
      'Name the effort you saw.',
      'Connect effort to courage.',
      'Encourage the next step.',
    ],
  },
};

export const DR_VICTORIA_MISSION_2_CONFIG = buildDrVictoriaMissionConfig({
  id: DR_VICTORIA_MISSION_2_ID,
  subtitle: 'Responding with Support',
  landingBody:
    'Once we look beyond the behavior, the next step is choosing a response that helps the child feel safe, supported, and ready to try again.',
  completeTitle: 'Supportive Response Badge Earned!',
  completeMessage: 'You practiced calm, helpful responses that support different minds.',
  badges: ['Supportive Response', 'Calm Guide', 'Growth Supporter'],
  scoreMessages: [
    {
      min: 8,
      max: 8,
      message:
        'Support Champion! You practiced calm, helpful responses that support different minds.',
    },
    {
      min: 6,
      max: 7,
      message: 'Strong Support! You are building the habits of a supportive adult guide.',
    },
    {
      min: 4,
      max: 5,
      message: 'Keep Practicing! Support grows through patience, curiosity, and repetition.',
    },
    {
      min: 0,
      max: 3,
      message: 'Great Start! Every adult can learn to respond with more understanding.',
    },
  ],
  questions: [
    {
      id: 'dv2-q1',
      type: 'multiple_choice',
      clueCard: {
        variant: 'reflection_card',
        label: 'REFLECTION CARD',
        tag: 'SUPPORT RESPONSE',
        text: 'A student says, \u201cI can\u2019t do this,\u201d and pushes the paper away.',
        accent: 'behavior-need',
      },
      prompt: 'What is the most supportive response?',
      question: 'What is the most supportive response?',
      options: [
        { id: 'a', label: '\u201cStop complaining.\u201d' },
        { id: 'b', label: '\u201cLet\u2019s try the first step together.\u201d' },
        { id: 'c', label: '\u201cEveryone else can do it.\u201d' },
        { id: 'd', label: '\u201cYou should already know this.\u201d' },
      ],
      correctId: 'b',
      feedbackCorrect: 'A child who feels stuck may need help starting, not criticism.',
      feedbackIncorrect: 'A child who feels stuck may need help starting, not criticism.',
      feedbackDetail: DV2_FEEDBACK_DETAILS['dv2-q1'],
    },
    {
      id: 'dv2-q2',
      type: 'multiple_choice',
      clueCard: {
        variant: 'reflection_card',
        label: 'REFLECTION CARD',
        tag: 'CLASSROOM SCENE',
        text: 'A child keeps interrupting while directions are being given.',
        accent: 'classroom',
      },
      prompt: 'What should an adult try first?',
      question: 'What should an adult try first?',
      options: [
        { id: 'a', label: 'Assume they are being disrespectful.' },
        { id: 'b', label: 'Calmly remind them of the listening expectation.' },
        { id: 'c', label: 'Embarrass them in front of the group.' },
        { id: 'd', label: 'Ignore them all day.' },
      ],
      correctId: 'b',
      feedbackCorrect:
        'Interrupting may be a sign of excitement, impulse control, or confusion.',
      feedbackIncorrect:
        'Interrupting may be a sign of excitement, impulse control, or confusion.',
      feedbackDetail: DV2_FEEDBACK_DETAILS['dv2-q2'],
    },
    {
      id: 'dv2-q3',
      type: 'multiple_choice',
      clueCard: {
        variant: 'reflection_card',
        label: 'REFLECTION CARD',
        tag: 'GROWTH MINDSET',
        text: 'A student shuts down after making a mistake.',
        accent: 'thought-bubble',
      },
      prompt: 'What response supports growth?',
      question: 'What response supports growth?',
      options: [
        { id: 'a', label: '\u201cMistakes help us learn. Let\u2019s look at it together.\u201d' },
        { id: 'b', label: '\u201cYou ruined it.\u201d' },
        { id: 'c', label: '\u201cYou always do this.\u201d' },
        { id: 'd', label: '\u201cJust forget it.\u201d' },
      ],
      correctId: 'a',
      feedbackCorrect: 'Mistakes can feel big to a child. Adults can help make mistakes feel safe.',
      feedbackIncorrect: 'Mistakes can feel big to a child. Adults can help make mistakes feel safe.',
      feedbackDetail: DV2_FEEDBACK_DETAILS['dv2-q3'],
    },
    {
      id: 'dv2-q4',
      type: 'multiple_choice',
      clueCard: {
        variant: 'reflection_card',
        label: 'REFLECTION CARD',
        tag: 'MOVEMENT NEED',
        text: 'A child is moving around during a quiet activity.',
        accent: 'support-strategy',
      },
      prompt: 'What might help before correcting them harshly?',
      question: 'What might help before correcting them harshly?',
      options: [
        { id: 'a', label: 'Offer a small movement break.' },
        { id: 'b', label: 'Tell them they are bad.' },
        { id: 'c', label: 'Remove them immediately.' },
        { id: 'd', label: 'Compare them to a quiet student.' },
      ],
      correctId: 'a',
      feedbackCorrect: 'Some children focus better after movement.',
      feedbackIncorrect: 'Some children focus better after movement.',
      feedbackDetail: DV2_FEEDBACK_DETAILS['dv2-q4'],
    },
    {
      id: 'dv2-q5',
      type: 'multiple_choice',
      clueCard: {
        variant: 'reflection_card',
        label: 'REFLECTION CARD',
        tag: 'ASKING FOR HELP',
        text: 'A student looks confused but does not ask for help.',
        accent: 'clipboard',
      },
      prompt: 'What is a helpful adult response?',
      question: 'What is a helpful adult response?',
      options: [
        { id: 'a', label: '\u201cYou should have listened.\u201d' },
        { id: 'b', label: '\u201cWould you like me to repeat the directions?\u201d' },
        { id: 'c', label: '\u201cFigure it out.\u201d' },
        { id: 'd', label: '\u201cNever mind.\u201d' },
      ],
      correctId: 'b',
      feedbackCorrect:
        'Some children need permission or encouragement to ask for help.',
      feedbackIncorrect:
        'Some children need permission or encouragement to ask for help.',
      feedbackDetail: DV2_FEEDBACK_DETAILS['dv2-q5'],
    },
    {
      id: 'dv2-q6',
      type: 'multiple_choice',
      clueCard: {
        variant: 'reflection_card',
        label: 'REFLECTION CARD',
        tag: 'PLAN CHANGE',
        text: 'A child gets upset when plans change.',
        accent: 'thought-bubble',
      },
      prompt: 'What support can help?',
      question: 'What support can help?',
      options: [
        { id: 'a', label: 'Give a simple explanation and name the next step.' },
        { id: 'b', label: 'Say, \u201cToo bad.\u201d' },
        { id: 'c', label: 'Ignore their reaction.' },
        { id: 'd', label: 'Tell them change is easy.' },
      ],
      correctId: 'a',
      feedbackCorrect: 'Unexpected changes can feel overwhelming.',
      feedbackIncorrect: 'Unexpected changes can feel overwhelming.',
      feedbackDetail: DV2_FEEDBACK_DETAILS['dv2-q6'],
    },
    {
      id: 'dv2-q7',
      type: 'multiple_choice',
      clueCard: {
        variant: 'reflection_card',
        label: 'REFLECTION CARD',
        tag: 'GROUP ACTIVITY',
        text: 'A student avoids joining the group.',
        accent: 'classroom',
      },
      prompt: 'What should an adult do first?',
      question: 'What should an adult do first?',
      options: [
        { id: 'a', label: 'Force them in immediately.' },
        { id: 'b', label: 'Ask what would help them feel ready.' },
        { id: 'c', label: 'Say they are being rude.' },
        { id: 'd', label: 'Leave them out forever.' },
      ],
      correctId: 'b',
      feedbackCorrect:
        'Avoidance can be a sign of anxiety, uncertainty, or sensory overload.',
      feedbackIncorrect:
        'Avoidance can be a sign of anxiety, uncertainty, or sensory overload.',
      feedbackDetail: DV2_FEEDBACK_DETAILS['dv2-q7'],
    },
    {
      id: 'dv2-q8',
      type: 'multiple_choice',
      clueCard: {
        variant: 'reflection_card',
        label: 'REFLECTION CARD',
        tag: 'ENCOURAGEMENT',
        text: 'A child finally tries again after struggling.',
        accent: 'support-strategy',
      },
      prompt: 'What response encourages them?',
      question: 'What response encourages them?',
      options: [
        { id: 'a', label: '\u201cFinally.\u201d' },
        { id: 'b', label: '\u201cI noticed you tried again. That shows courage.\u201d' },
        { id: 'c', label: '\u201cThat took too long.\u201d' },
        { id: 'd', label: '\u201cDon\u2019t mess up again.\u201d' },
      ],
      correctId: 'b',
      feedbackCorrect:
        'Specific encouragement helps children recognize their own growth.',
      feedbackIncorrect:
        'Specific encouragement helps children recognize their own growth.',
      feedbackDetail: DV2_FEEDBACK_DETAILS['dv2-q8'],
    },
  ],
});
