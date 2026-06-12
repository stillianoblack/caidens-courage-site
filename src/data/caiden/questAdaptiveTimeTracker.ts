import type { CaidenAdaptiveQuestFile, CaidenGradeContent } from '../../types/caidenAdaptiveQuest';
import { registerCaidenAdaptiveQuest } from './caidenAdaptiveBuilder';

export const CAIDEN_QUEST_3_ID = 'quest-3';

const SKILL = 'Time Management';

function bandContent(
  dashboardDescription: string,
  questions: CaidenGradeContent['questions'],
): CaidenGradeContent {
  return {
    dashboardTitle: 'Time Tracker',
    dashboardDescription,
    skillTags: [SKILL, 'Executive Function', 'Planning'],
    questions,
  };
}

export const CAIDEN_QUEST_3_FILE: CaidenAdaptiveQuestFile = {
  id: CAIDEN_QUEST_3_ID,
  title: "Caiden's Focus Quest",
  subtitle: 'Time Tracker',
  character: 'caiden',
  questNumber: 3,
  skillFocus: ['Time Management', 'Executive Function', 'Planning'],
  landing: {
    eyebrow: 'QUEST #3',
    title: "Caiden's Focus Quest",
    subtitle: 'Time Tracker',
    body: 'Help Caiden estimate time, plan tasks, and leave on schedule.',
    cta: 'Start Quest',
  },
  complete: {
    title: 'Time Tracker Badge Earned!',
    message: 'You helped Caiden use time wisely and plan before the clock runs out.',
    badges: ['Time Tracker', 'Schedule Smart', 'Focus Flame Builder'],
  },
  gradeContent: {
    '2-3': bandContent(
      'Practice simple time choices before camp or school starts.',
      [
        {
          id: 'cq3-23-q1',
          question:
            'Camp starts in 15 minutes. Caiden still needs to put on shoes and pack his folder. What should he do first?',
          scenarioTag: 'COUNTDOWN',
          scenarioAccent: 'timer',
          options: [
            { id: 'a', label: 'Start a cartoon' },
            { id: 'b', label: 'Pack the folder and put on shoes' },
            { id: 'c', label: 'Take a nap' },
            { id: 'd', label: 'Draw a new picture' },
          ],
          correctAnswer: 'b',
          explanation: 'With 15 minutes left, Caiden should handle what he needs before leaving.',
          hint: 'What must happen before camp starts?',
          skillTags: [SKILL],
        },
        {
          id: 'cq3-23-q2',
          question: 'Caiden has 5 minutes before leaving. Which task fits best?',
          scenarioTag: 'QUICK TASK',
          scenarioAccent: 'camp-pack',
          options: [
            { id: 'a', label: 'Clean his whole room' },
            { id: 'b', label: 'Start a long movie' },
            { id: 'c', label: 'Fill his water bottle' },
            { id: 'd', label: 'Build a toy city' },
          ],
          correctAnswer: 'c',
          explanation: 'Filling a water bottle is a quick task that fits in 5 minutes.',
          hint: 'Which task is small enough to finish before leaving?',
          skillTags: [SKILL],
        },
        {
          id: 'cq3-23-q3',
          question: 'What helps Caiden know when to leave?',
          scenarioTag: 'TIME TOOL',
          scenarioAccent: 'priority',
          options: [
            { id: 'a', label: 'A clock' },
            { id: 'b', label: 'A snack' },
            { id: 'c', label: 'A pillow' },
            { id: 'd', label: 'A comic book' },
          ],
          correctAnswer: 'a',
          explanation: 'A clock shows how much time is left before he needs to go.',
          hint: 'What tool tells you how much time you have?',
          skillTags: [SKILL],
        },
      ],
    ),
    '4-5': bandContent(
      'Estimate whether tasks fit in the time you have before the bus arrives.',
      [
        {
          id: 'cq3-45-q1',
          question:
            'Homework takes 20 minutes. Packing takes 5 minutes. The bus comes in 30 minutes. Can Caiden finish both?',
          scenarioTag: 'ADD IT UP',
          scenarioAccent: 'timer',
          options: [
            { id: 'a', label: 'Yes, because 25 minutes is less than 30' },
            { id: 'b', label: 'No, because 25 minutes is more than 30' },
            { id: 'c', label: 'No, because homework takes all day' },
            { id: 'd', label: 'Yes, because time does not matter' },
          ],
          correctAnswer: 'a',
          explanation: '20 + 5 = 25 minutes, which fits inside the 30 minutes before the bus.',
          hint: 'Add the task times together and compare to 30.',
          skillTags: [SKILL],
        },
        {
          id: 'cq3-45-q2',
          question:
            'Caiden has 30 minutes. Reading takes 15 minutes and cleaning takes 20 minutes. What should he notice?',
          scenarioTag: 'TOO MUCH',
          scenarioAccent: 'weekly-plan',
          options: [
            { id: 'a', label: 'He has enough time for both' },
            { id: 'b', label: 'He needs 35 minutes for both' },
            { id: 'c', label: 'Reading takes 30 minutes' },
            { id: 'd', label: 'Cleaning takes 5 minutes' },
          ],
          correctAnswer: 'b',
          explanation: '15 + 20 = 35 minutes, which is more than the 30 he has.',
          hint: 'Add the minutes for both tasks.',
          skillTags: [SKILL],
        },
        {
          id: 'cq3-45-q3',
          question: 'Which is the best time plan?',
          scenarioTag: 'PLAN AHEAD',
          scenarioAccent: 'priority',
          options: [
            { id: 'a', label: 'Start with the most urgent task' },
            { id: 'b', label: 'Wait until the last second' },
            { id: 'c', label: 'Do nothing' },
            { id: 'd', label: 'Start five things at once' },
          ],
          correctAnswer: 'a',
          explanation: 'Starting with the most urgent task uses limited time wisely.',
          hint: 'Which plan respects the clock?',
          skillTags: [SKILL],
        },
      ],
    ),
    '6-8': bandContent(
      'Plan multi-task schedules and estimate whether everything fits in the time available.',
      [
        {
          id: 'cq3-68-q1',
          question:
            'Caiden has 90 minutes. Science takes 45, math takes 20, and reading takes 25. Can he complete all three?',
          scenarioTag: 'SCHEDULE CHECK',
          scenarioAccent: 'timer',
          options: [
            { id: 'a', label: 'Yes, exactly 90 minutes' },
            { id: 'b', label: 'No, it takes 100 minutes' },
            { id: 'c', label: 'No, it takes 60 minutes' },
            { id: 'd', label: 'Yes, with 30 minutes left' },
          ],
          correctAnswer: 'a',
          explanation: '45 + 20 + 25 = 90 minutes — it fits exactly.',
          hint: 'Add all three task times together.',
          skillTags: [SKILL],
        },
        {
          id: 'cq3-68-q2',
          question:
            'Caiden has 40 minutes before practice. He has a 30-minute assignment and needs 15 minutes to get ready. What should he do?',
          scenarioTag: 'TRADE-OFF',
          scenarioAccent: 'weekly-plan',
          options: [
            { id: 'a', label: 'Start both without planning' },
            { id: 'b', label: 'Complete part of the assignment and set a timer to get ready' },
            { id: 'c', label: 'Ignore practice' },
            { id: 'd', label: 'Play a game first' },
          ],
          correctAnswer: 'b',
          explanation: '45 minutes of work won\'t fit in 40 — he needs a plan with a timer for practice.',
          hint: '30 + 15 is more than 40. How can he adjust?',
          skillTags: [SKILL],
        },
        {
          id: 'cq3-68-q3',
          question: 'Why is estimating time useful?',
          scenarioTag: 'WHY IT MATTERS',
          scenarioAccent: 'reflection',
          options: [
            { id: 'a', label: 'It helps plan tasks realistically' },
            { id: 'b', label: 'It makes tasks disappear' },
            { id: 'c', label: 'It means deadlines do not matter' },
            { id: 'd', label: 'It helps avoid all work' },
          ],
          correctAnswer: 'a',
          explanation: 'Realistic time estimates help you build plans that actually work.',
          hint: 'What does knowing how long tasks take help you do?',
          skillTags: [SKILL],
        },
      ],
    ),
  },
};

registerCaidenAdaptiveQuest(CAIDEN_QUEST_3_FILE);
