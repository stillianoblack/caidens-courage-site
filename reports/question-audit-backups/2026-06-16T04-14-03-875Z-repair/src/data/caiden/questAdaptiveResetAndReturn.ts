import type { CaidenAdaptiveQuestFile, CaidenGradeContent } from '../../types/caidenAdaptiveQuest';
import { caidenBandMetadata } from './caidenQuestionHelpers';
import { registerCaidenAdaptiveQuest } from './caidenAdaptiveBuilder';

export const CAIDEN_QUEST_4_ID = 'quest-4';

const SKILL = 'Emotional Regulation';
const MODULE_ID = CAIDEN_QUEST_4_ID;

function bandContent(
  dashboardDescription: string,
  questions: CaidenGradeContent['questions'],
): CaidenGradeContent {
  return {
    dashboardTitle: 'Reset and Return',
    dashboardDescription,
    skillTags: [SKILL, 'Self-Regulation', 'Flexible Thinking'],
    questions,
  };
}

export const CAIDEN_QUEST_4_FILE: CaidenAdaptiveQuestFile = {
  id: CAIDEN_QUEST_4_ID,
  title: "Caiden's Focus Quest",
  subtitle: 'Reset and Return',
  character: 'caiden',
  questNumber: 4,
  skillFocus: ['Emotional Regulation', 'Self-Regulation', 'Flexible Thinking'],
  landing: {
    eyebrow: 'QUEST #4',
    title: "Caiden's Focus Quest",
    subtitle: 'Reset and Return',
    body: 'Help Caiden pause, reset emotions, and return to focus when things get hard.',
    cta: 'Start Quest',
  },
  complete: {
    title: 'Focus Recovery Badge Earned!',
    message: 'You helped Caiden reset emotions and return to focus with a growth mindset.',
    badges: ['Focus Recovery', 'Reset Hero', 'Focus Flame Builder'],
  },
  gradeContent: {
    '2-3': bandContent(
      'Practice simple reset moves when frustration shows up.',
      [
        {
          id: 'cq4-23-q1',
          question: 'Caiden gets a question wrong. What should he do next?',
          scenarioTag: 'TRY AGAIN',
          scenarioAccent: 'focus-reset',
          options: [
            { id: 'a', label: 'Take a short break and come back with a plan' },
            { id: 'b', label: 'Take a breath and try again' },
            { id: 'c', label: 'Wait and hope the feeling passes' },
            { id: 'd', label: 'Throw his pencil' },
          ],
          correctAnswer: 'b',
          explanation: 'A breath gives Caiden a moment to calm down before trying again.',
          hint: 'What helps your body calm down before the next try?',
          skillTags: [SKILL],
        },
        {
          id: 'cq4-23-q2',
          question: 'Caiden feels frustrated because his drawing is not perfect. What can help?',
          scenarioTag: 'PAUSE',
          scenarioAccent: 'focus-reset',
          options: [
            { id: 'a', label: 'Rip it up' },
            { id: 'b', label: 'Take a short break' },
            { id: 'c', label: 'Say he is bad at art' },
            { id: 'd', label: 'Set it aside without choosing a next step' },
          ],
          correctAnswer: 'b',
          explanation: 'A short break lets strong feelings settle before Caiden continues.',
          hint: 'What gives frustrated feelings time to cool down?',
          skillTags: [SKILL],
        },
        {
          id: 'cq4-23-q3',
          question: 'What does reset mean?',
          scenarioTag: 'RESET',
          scenarioAccent: 'reflection',
          options: [
            { id: 'a', label: 'Pause and get ready to try again' },
            { id: 'b', label: 'Give up' },
            { id: 'c', label: 'Ignore everyone' },
            { id: 'd', label: 'Make a mess' },
          ],
          correctAnswer: 'a',
          explanation: 'Reset means pausing so you can come back calmer and ready to try again.',
          hint: 'Does reset mean stopping forever or getting ready for another try?',
          skillTags: [SKILL],
        },
      ],
    ),
    '4-5': bandContent(
      'Notice feelings, accept feedback, and recover with flexible thinking.',
      [
        {
          id: 'cq4-45-q1',
          scenarioText:
            'Caiden loses a team challenge and has 10 minutes before the next round. He can review what went wrong (6 min), practice one skill (8 min), or sit quietly and reset (4 min).',
          question: 'Which recovery plan uses his break time best?',
          scenarioTag: 'RESET PLAN',
          scenarioAccent: 'focus-reset',
          options: [
            { id: 'a', label: 'Reset 4 minutes, then review 6 minutes — no time to practice' },
            { id: 'b', label: 'Skip reset and practice the full 8 minutes while still frustrated' },
            { id: 'c', label: 'Argue about the score for the whole break' },
            { id: 'd', label: 'Leave the activity and miss the next round' },
          ],
          correctAnswer: 'a',
          explanation:
            'A short reset clears frustration, then review fits in the remaining time before the next round.',
          hint: 'Add the minutes for each step and compare to the 10-minute break.',
          skillTags: [SKILL, 'Planning', 'Executive Function'],
          metadata: caidenBandMetadata('4-5', 'Planning', MODULE_ID, 'intermediate'),
        },
        {
          id: 'cq4-45-q2',
          question: 'Caiden\'s teacher gives feedback on his comic. What should he do first?',
          scenarioTag: 'FEEDBACK',
          scenarioAccent: 'recover-mistake',
          options: [
            { id: 'a', label: 'Listen and look for one thing to improve' },
            { id: 'b', label: 'Throw it away' },
            { id: 'c', label: 'Say feedback is bad' },
            { id: 'd', label: 'Refuse to change anything' },
          ],
          correctAnswer: 'a',
          explanation: 'Listening for one improvement turns feedback into a next step.',
          hint: 'How can feedback help Caiden grow?',
          skillTags: [SKILL, 'Consequence Evaluation'],
          metadata: caidenBandMetadata('4-5', 'Consequence Evaluation', MODULE_ID, 'intermediate'),
        },
        {
          id: 'cq4-45-q3',
          scenarioText:
            'Caiden\'s comic draft gets tough feedback. He can revise one panel (12 min), start over (30 min), or submit without changes. Camp submissions close in 15 minutes.',
          question: 'Which choice balances improvement with the deadline?',
          scenarioTag: 'DEADLINE TRADEOFF',
          scenarioAccent: 'growth-reflection',
          options: [
            { id: 'a', label: 'Revise one panel and submit on time' },
            { id: 'b', label: 'Start over even though he cannot finish in 15 minutes' },
            { id: 'c', label: 'Submit without changes and ignore the feedback' },
            { id: 'd', label: 'Quit the contest because the feedback felt harsh' },
          ],
          correctAnswer: 'a',
          explanation:
            'One focused revision fits the deadline and still responds to feedback without starting over.',
          hint: 'Compare each option to the 15-minute limit.',
          skillTags: [SKILL, 'Tradeoffs', 'Planning'],
          metadata: caidenBandMetadata('4-5', 'Tradeoffs', MODULE_ID, 'advanced'),
        },
      ],
    ),
    '6-8': bandContent(
      'Respond to critical feedback and strong emotions with regulation and flexible thinking.',
      [
        {
          id: 'cq4-68-q1',
          question:
            'Caiden receives critical feedback on a project he worked hard on. What response shows emotional regulation?',
          scenarioTag: 'REGULATE',
          scenarioAccent: 'focus-reset',
          options: [
            { id: 'a', label: 'He pauses, listens, and chooses one improvement' },
            { id: 'b', label: 'He argues immediately' },
            { id: 'c', label: 'He deletes the whole project' },
            { id: 'd', label: 'He refuses to participate' },
          ],
          correctAnswer: 'a',
          explanation: 'Pausing before responding helps Caiden use feedback productively.',
          hint: 'Which response shows control before action?',
          skillTags: [SKILL],
        },
        {
          id: 'cq4-68-q2',
          question: 'Why is pausing helpful when emotions are strong?',
          scenarioTag: 'PAUSE POWER',
          scenarioAccent: 'reflection',
          options: [
            { id: 'a', label: 'It gives the brain time to choose a better response' },
            { id: 'b', label: 'It makes problems vanish' },
            { id: 'c', label: 'It means feelings are wrong' },
            { id: 'd', label: 'It avoids responsibility' },
          ],
          correctAnswer: 'a',
          explanation: 'A pause creates space between feeling and reacting.',
          hint: 'What does waiting a moment let your brain do?',
          skillTags: [SKILL],
        },
        {
          id: 'cq4-68-q3',
          question: 'Which is an example of flexible thinking?',
          scenarioTag: 'FLEXIBLE',
          scenarioAccent: 'growth-reflection',
          options: [
            { id: 'a', label: 'Trying a new strategy after the first one fails' },
            { id: 'b', label: 'Doing the same thing even when it does not work' },
            { id: 'c', label: 'Refusing help' },
            { id: 'd', label: 'Ignoring directions' },
          ],
          correctAnswer: 'a',
          explanation: 'Flexible thinkers adjust their approach when something is not working.',
          hint: 'What do you do when plan A does not work?',
          skillTags: [SKILL],
        },
      ],
    ),
  },
};

registerCaidenAdaptiveQuest(CAIDEN_QUEST_4_FILE);
