import type { CaidenAdaptiveQuestFile, CaidenGradeContent } from '../../types/caidenAdaptiveQuest';
import { caidenBandMetadata } from './caidenQuestionHelpers';
import { registerCaidenAdaptiveQuest } from './caidenAdaptiveBuilder';

export const CAIDEN_QUEST_3_ID = 'quest-3';

const SKILL = 'Time Management';
const MODULE_ID = CAIDEN_QUEST_3_ID;

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
            { id: 'a', label: 'Do a one-minute readiness check first' },
            { id: 'b', label: 'Pack the folder and put on shoes' },
            { id: 'c', label: 'Pack one item, then continue prep' },
            { id: 'd', label: 'Delay until someone reminds him' },
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
        {
          id: 'cq3-23-q4',
          question: 'The bus leaves in 20 minutes. Caiden needs 10 minutes to eat and 15 minutes to pack. What should he notice?',
          scenarioTag: 'TIME CHECK',
          scenarioAccent: 'timer',
          options: [
            { id: 'a', label: 'Start packing after the bus leaves' },
            { id: 'b', label: 'Eat slowly and skip packing' },
            { id: 'c', label: 'Pack while eating without looking' },
            { id: 'd', label: 'He needs 25 minutes but only has 20 — eat fast and pack the most important items' },
          ],
          correctAnswer: 'd',
          explanation: '10 + 15 = 25 minutes, which is more than 20. Caiden must adjust by speeding up or choosing essentials.',
          hint: 'Add the minutes for both tasks and compare to 20.',
          skillTags: [SKILL],
        },
        {
          id: 'cq3-23-q5',
          question: 'Caiden sets a timer for 8 minutes to tidy toys before story time. What is the best plan?',
          scenarioTag: 'TIMER PLAN',
          scenarioAccent: 'small-step',
          options: [
            { id: 'a', label: 'Ignore the timer' },
            { id: 'b', label: 'Start a new long game' },
            { id: 'c', label: 'Work until the timer rings, then stop' },
            { id: 'd', label: 'Hide toys under the bed' },
          ],
          correctAnswer: 'c',
          explanation: 'Using the timer helps Caiden finish on time for story time.',
          hint: 'What does a timer help you do?',
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
          skillTags: [SKILL, 'Time Estimation'],
          metadata: caidenBandMetadata('4-5', 'Time Estimation', MODULE_ID, 'intermediate'),
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
          skillTags: [SKILL, 'Time Estimation'],
          metadata: caidenBandMetadata('4-5', 'Time Estimation', MODULE_ID, 'intermediate'),
        },
        {
          id: 'cq3-45-q3',
          scenarioText:
            'Caiden has 40 minutes before camp. Homework needs 25 minutes, packing needs 10, and he wants a 5-minute snack. A friend invites him to play outside for 20 minutes now.',
          question: 'Which schedule keeps him on time for camp without skipping essentials?',
          scenarioTag: 'SCHEDULE TRADEOFF',
          scenarioAccent: 'priority',
          options: [
            { id: 'a', label: 'Play 20 minutes, then rush homework and packing in 20 minutes' },
            { id: 'b', label: 'Snack 5 minutes, homework 25 minutes, then pack 10 minutes' },
            { id: 'c', label: 'Pack first, play outside, and finish homework on the bus' },
            { id: 'd', label: 'Skip packing and hope he remembers everything at camp' },
          ],
          correctAnswer: 'b',
          explanation:
            '5 + 25 + 10 = 40 minutes exactly — all essentials fit without rushing or skipping packing.',
          hint: 'Add each block and compare the total to 40 minutes.',
          skillTags: [SKILL, 'Scheduling', 'Planning'],
          metadata: caidenBandMetadata('4-5', 'Scheduling', MODULE_ID, 'advanced'),
        },
        {
          id: 'cq3-45-q4',
          scenarioText:
            'Camp pickup is at 4:00. It is 3:25 now. Shower takes 15 minutes, homework takes 20 minutes, and packing a snack takes 5 minutes.',
          question: 'Can Caiden finish all three before pickup?',
          scenarioTag: 'PICKUP COUNTDOWN',
          scenarioAccent: 'timer',
          options: [
            { id: 'a', label: 'Yes — 30 minutes total fits in 35' },
            { id: 'b', label: 'No — homework alone takes an hour' },
            { id: 'c', label: 'No — 40 minutes needed, only 35 available' },
            { id: 'd', label: 'Yes — if he skips the shower' },
          ],
          correctAnswer: 'c',
          explanation: '15 + 20 + 5 = 40 minutes needed, but 3:25 to 4:00 is only 35 minutes.',
          hint: 'Add all three tasks and compare to the minutes until 4:00.',
          skillTags: [SKILL, 'Time Estimation'],
          metadata: caidenBandMetadata('4-5', 'Time Estimation', MODULE_ID, 'intermediate'),
        },
        {
          id: 'cq3-45-q5',
          scenarioText:
            'Caiden\'s walk to the bus stop takes 5 minutes. The bus comes at 7:40. He still needs 15 minutes of reading and 10 minutes to pack.',
          question: 'What is the latest he should start so everything fits?',
          scenarioTag: 'BUS MATH',
          scenarioAccent: 'weekly-plan',
          options: [
            { id: 'a', label: '7:35 — only 5 minutes before the bus' },
            { id: 'b', label: '7:00 — way too early' },
            { id: 'c', label: '7:20 — leaves no time to pack' },
            { id: 'd', label: '7:10 — 30 minutes for tasks plus 5 minutes to walk' },
          ],
          correctAnswer: 'd',
          explanation: '15 + 10 + 5 = 30 minutes. Starting at 7:10 gets him to the bus at 7:40.',
          hint: 'Add reading, packing, and walk time. Count back from 7:40.',
          skillTags: [SKILL, 'Scheduling', 'Time Estimation'],
          metadata: caidenBandMetadata('4-5', 'Scheduling', MODULE_ID, 'advanced'),
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
            { id: 'a', label: 'Do a short assignment chunk before the get-ready timer' },
            { id: 'b', label: 'Complete part of the assignment and set a timer to get ready' },
            { id: 'c', label: 'Ignore practice' },
            { id: 'd', label: 'Delay and hope he can rush both later' },
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
        {
          id: 'cq3-68-q4',
          question:
            'Caiden blocks 2 hours for a project. Research takes 50 min, outline 25 min, draft 60 min, and edit 30 min. Can he finish all four in one block?',
          scenarioTag: 'BLOCK CHECK',
          scenarioAccent: 'timer',
          options: [
            { id: 'a', label: 'Yes — exactly 2 hours' },
            { id: 'b', label: 'Yes — with 45 minutes left' },
            { id: 'c', label: 'No — 165 minutes needed, only 120 available' },
            { id: 'd', label: 'No — research alone takes 3 hours' },
          ],
          correctAnswer: 'c',
          explanation: '50 + 25 + 60 + 30 = 165 minutes, which is 45 minutes more than the 120-minute block.',
          hint: 'Add all four task times and compare to 120 minutes.',
          skillTags: [SKILL],
        },
        {
          id: 'cq3-68-q5',
          question:
            'Caiden\'s time log shows he often underestimates by 10 minutes. He has 40 minutes before camp and tasks estimated at 35 minutes. What is the wisest plan?',
          scenarioTag: 'BUFFER PLAN',
          scenarioAccent: 'weekly-plan',
          options: [
            { id: 'a', label: 'Assume the 35-minute estimate is exact' },
            { id: 'b', label: 'Add 10 minutes to every task in the list' },
            { id: 'c', label: 'Skip the buffer and hope he is faster today' },
            { id: 'd', label: 'Plan for 45 minutes needed and shorten or drop one task' },
          ],
          correctAnswer: 'd',
          explanation: 'Real estimates plus a buffer show the plan may not fit — adjusting early beats rushing at the door.',
          hint: 'What happens if his usual underestimate is true again?',
          skillTags: [SKILL],
        },
      ],
    ),
  },
};

registerCaidenAdaptiveQuest(CAIDEN_QUEST_3_FILE);
