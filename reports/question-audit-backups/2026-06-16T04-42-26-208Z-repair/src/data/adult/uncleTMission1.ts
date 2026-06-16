import type { GameFeedbackDetail } from '../../types/gameAssessment';
import { buildUncleTMissionConfig } from './uncleTMissionFramework';

export const UNCLE_T_MISSION_1_ID = 'mission-1';

const UT_FEEDBACK_DETAILS: Record<string, GameFeedbackDetail> = {
  'ut-q1': {
    tryThisLabel: 'Tips:',
    tryThis: [
      'Name the mistake without shame.',
      'Remind the child they can try again.',
      'Focus on progress, not perfection.',
    ],
  },
  'ut-q2': {
    tryThisLabel: 'Tips:',
    tryThis: [
      'Name the feeling.',
      'Keep your tone steady.',
      'Help them rejoin when ready.',
    ],
  },
  'ut-q3': {
    tryThisLabel: 'Tips:',
    tryThis: [
      'Make the next step tiny.',
      'Stay nearby.',
      'Praise the attempt.',
    ],
  },
  'ut-q4': {
    tryThisLabel: 'Tips:',
    tryThis: [
      'Compare the child to their own progress.',
      'Notice effort.',
      'Avoid ranking kids against each other.',
    ],
  },
  'ut-q5': {
    tryThisLabel: 'Tips:',
    tryThis: [
      'Correct privately when possible.',
      'Keep dignity intact.',
      'Invite repair, not humiliation.',
    ],
  },
  'ut-q6': {
    tryThisLabel: 'Tips:',
    tryThis: [
      'Ask supportive questions.',
      'Offer partnership.',
      'Keep the focus on one move forward.',
    ],
  },
  'ut-q7': {
    tryThisLabel: 'Tips:',
    tryThis: [
      'Be specific.',
      'Celebrate effort.',
      'Reinforce the brave choice.',
    ],
  },
  'ut-q8': {
    tryThisLabel: 'Tips:',
    tryThis: [
      'Talk about your own learning moments.',
      'Use calm repair language.',
      'Keep trying visible.',
    ],
  },
};

export const UNCLE_T_MISSION_1_CONFIG = buildUncleTMissionConfig({
  id: UNCLE_T_MISSION_1_ID,
  subtitle: 'Coaching Through Mistakes',
  landingBody:
    'Mistakes don\u2019t mean a kid is failing. Sometimes a mistake is the moment they need a coach the most. Let\u2019s practice turning mistakes into courage.',
  completeTitle: 'Courage Coach Badge Earned!',
  completeMessage: 'You practiced turning mistakes into moments of growth.',
  badges: ['Courage Coach', 'Retry Builder', 'Growth Encourager'],
  scoreMessages: [
    {
      min: 8,
      max: 8,
      message: 'Courage Coach! You practiced turning mistakes into moments of growth.',
    },
    {
      min: 6,
      max: 7,
      message: 'Strong Coach! You\u2019re learning how to encourage kids through hard moments.',
    },
    {
      min: 4,
      max: 5,
      message: 'Keep Coaching! Every supportive response helps kids build courage.',
    },
    {
      min: 0,
      max: 3,
      message: 'Great Start! Coaching takes practice. Keep learning how to support brave tries.',
    },
  ],
  questions: [
    {
      id: 'ut-q1',
      type: 'multiple_choice',
      clueCard: {
        variant: 'coaching_card',
        label: 'COACHING SCENARIO',
        tag: 'MISTAKE MOMENT',
        text: 'A child misses an answer and says, \u201cI\u2019m bad at this.\u201d',
        accent: 'mistake-learn',
      },
      prompt: 'What is the best coaching response?',
      question: 'What is the best coaching response?',
      options: [
        { id: 'a', label: '\u201cYeah, that was bad.\u201d' },
        { id: 'b', label: '\u201cYou made a mistake, but mistakes help us learn.\u201d' },
        { id: 'c', label: '\u201cStop being dramatic.\u201d' },
        { id: 'd', label: '\u201cYou should quit.\u201d' },
      ],
      correctId: 'b',
      feedbackCorrect:
        'A mistake can become a learning moment when the adult responds with encouragement.',
      feedbackIncorrect:
        'A mistake can become a learning moment when the adult responds with encouragement.',
      feedbackDetail: UT_FEEDBACK_DETAILS['ut-q1'],
    },
    {
      id: 'ut-q2',
      type: 'multiple_choice',
      clueCard: {
        variant: 'coaching_card',
        label: 'COACHING SCENARIO',
        tag: 'DISAPPOINTMENT',
        text: 'A student loses a game and gets embarrassed.',
        accent: 'feel-seen',
      },
      prompt: 'What should an adult say first?',
      question: 'What should an adult say first?',
      options: [
        { id: 'a', label: '\u201cIt\u2019s just a game. Get over it.\u201d' },
        { id: 'b', label: '\u201cI can see that felt disappointing.\u201d' },
        { id: 'c', label: '\u201cYou always overreact.\u201d' },
        { id: 'd', label: '\u201cDon\u2019t play next time.\u201d' },
      ],
      correctId: 'b',
      feedbackCorrect: 'Feeling seen helps kids calm down before they can learn from the moment.',
      feedbackIncorrect: 'Feeling seen helps kids calm down before they can learn from the moment.',
      feedbackDetail: UT_FEEDBACK_DETAILS['ut-q2'],
    },
    {
      id: 'ut-q3',
      type: 'multiple_choice',
      clueCard: {
        variant: 'coaching_card',
        label: 'COACHING SCENARIO',
        tag: 'SHUTDOWN',
        text: 'A child refuses to try again after messing up.',
        accent: 'small-retry',
      },
      prompt: 'What is the best next move?',
      question: 'What is the best next move?',
      options: [
        { id: 'a', label: 'Offer one small retry step.' },
        { id: 'b', label: 'Force the whole task immediately.' },
        { id: 'c', label: 'Tell them they failed.' },
        { id: 'd', label: 'Walk away forever.' },
      ],
      correctId: 'a',
      feedbackCorrect: 'A small retry step lowers the pressure and helps rebuild confidence.',
      feedbackIncorrect: 'A small retry step lowers the pressure and helps rebuild confidence.',
      feedbackDetail: UT_FEEDBACK_DETAILS['ut-q3'],
    },
    {
      id: 'ut-q4',
      type: 'multiple_choice',
      clueCard: {
        variant: 'coaching_card',
        label: 'COACHING SCENARIO',
        tag: 'COMPARISON',
        text: 'A student says, \u201cEveryone is better than me.\u201d',
        accent: 'growth-focus',
      },
      prompt: 'What should an adult emphasize?',
      question: 'What should an adult emphasize?',
      options: [
        { id: 'a', label: 'Comparison' },
        { id: 'b', label: 'Growth' },
        { id: 'c', label: 'Shame' },
        { id: 'd', label: 'Speed' },
      ],
      correctId: 'b',
      feedbackCorrect: 'Kids need reminders that growth is personal.',
      feedbackIncorrect: 'Kids need reminders that growth is personal.',
      feedbackDetail: UT_FEEDBACK_DETAILS['ut-q4'],
    },
    {
      id: 'ut-q5',
      type: 'multiple_choice',
      clueCard: {
        variant: 'coaching_card',
        label: 'COACHING SCENARIO',
        tag: 'GROUP MISTAKE',
        text: 'A child makes a mistake in front of the group.',
        accent: 'dignity',
      },
      prompt: 'What should the adult avoid?',
      question: 'What should the adult avoid?',
      options: [
        { id: 'a', label: 'Protecting their dignity' },
        { id: 'b', label: 'Public shaming' },
        { id: 'c', label: 'Calm support' },
        { id: 'd', label: 'Private coaching' },
      ],
      correctId: 'b',
      feedbackCorrect: 'Public shame can make kids afraid to try again.',
      feedbackIncorrect: 'Public shame can make kids afraid to try again.',
      feedbackDetail: UT_FEEDBACK_DETAILS['ut-q5'],
    },
    {
      id: 'ut-q6',
      type: 'multiple_choice',
      clueCard: {
        variant: 'coaching_card',
        label: 'COACHING SCENARIO',
        tag: 'FRUSTRATION',
        text: 'A student gets frustrated and says, \u201cI\u2019m done.\u201d',
        accent: 'shutdown-coach',
      },
      prompt: 'What coaching question helps?',
      question: 'What coaching question helps?',
      options: [
        { id: 'a', label: '\u201cWhat\u2019s one part we can try together?\u201d' },
        { id: 'b', label: '\u201cWhy are you like this?\u201d' },
        { id: 'c', label: '\u201cDo you want to fail?\u201d' },
        { id: 'd', label: '\u201cShould I give up on you?\u201d' },
      ],
      correctId: 'a',
      feedbackCorrect: 'Good coaching turns shutdown into a next step.',
      feedbackIncorrect: 'Good coaching turns shutdown into a next step.',
      feedbackDetail: UT_FEEDBACK_DETAILS['ut-q6'],
    },
    {
      id: 'ut-q7',
      type: 'multiple_choice',
      clueCard: {
        variant: 'coaching_card',
        label: 'COACHING SCENARIO',
        tag: 'BRAVE RETRY',
        text: 'A child finally tries again after encouragement.',
        accent: 'courage-try',
      },
      prompt: 'What should the adult do?',
      question: 'What should the adult do?',
      options: [
        { id: 'a', label: 'Ignore it.' },
        { id: 'b', label: '\u201cThat\u2019s what you should have done earlier.\u201d' },
        { id: 'c', label: 'Acknowledge the courage it took.' },
        { id: 'd', label: 'Make fun of the first mistake.' },
      ],
      correctId: 'c',
      feedbackCorrect: 'When kids try again, name the courage.',
      feedbackIncorrect: 'When kids try again, name the courage.',
      feedbackDetail: UT_FEEDBACK_DETAILS['ut-q7'],
    },
    {
      id: 'ut-q8',
      type: 'multiple_choice',
      clueCard: {
        variant: 'coaching_card',
        label: 'COACHING SCENARIO',
        tag: 'MINDSET',
        text: 'A child learns that mistakes are part of growing.',
        accent: 'model-learning',
      },
      prompt: 'What mindset should adults model?',
      question: 'What mindset should adults model?',
      options: [
        { id: 'a', label: 'Mistakes mean failure.' },
        { id: 'b', label: 'Mistakes are chances to learn.' },
        { id: 'c', label: 'Mistakes should be hidden.' },
        { id: 'd', label: 'Mistakes only matter if someone sees them.' },
      ],
      correctId: 'b',
      feedbackCorrect: 'Adults model how kids learn to treat mistakes.',
      feedbackIncorrect: 'Adults model how kids learn to treat mistakes.',
      feedbackDetail: UT_FEEDBACK_DETAILS['ut-q8'],
    },
  ],
});
