import type { CaidenAdaptiveQuestFile, CaidenGradeContent } from '../../types/caidenAdaptiveQuest';
import { caidenBandMetadata } from './caidenQuestionHelpers';
import { registerCaidenAdaptiveQuest } from './caidenAdaptiveBuilder';

export const CAIDEN_QUEST_1_ID = 'quest-1';

const SKILL = 'Prioritization';
const MODULE_ID = CAIDEN_QUEST_1_ID;

function bandContent(
  dashboardDescription: string,
  questions: CaidenGradeContent['questions'],
): CaidenGradeContent {
  return {
    dashboardTitle: 'What Comes First?',
    dashboardDescription,
    skillTags: [SKILL, 'Executive Function', 'Planning'],
    questions,
  };
}

export const CAIDEN_QUEST_1_FILE: CaidenAdaptiveQuestFile = {
  id: CAIDEN_QUEST_1_ID,
  title: "Caiden's Focus Quest",
  subtitle: 'What Comes First?',
  character: 'caiden',
  questNumber: 1,
  skillFocus: ['Prioritization', 'Executive Function', 'Planning'],
  landing: {
    eyebrow: 'QUEST #1',
    title: "Caiden's Focus Quest",
    subtitle: 'What Comes First?',
    body: 'Help Caiden choose what to do first when tasks compete for his attention.',
    cta: 'Start Quest',
  },
  complete: {
    title: 'Focus Starter Badge Earned!',
    message: 'You helped Caiden prioritize smart first steps. Great focus flame work!',
    badges: ['Focus Starter', 'Priority Pro', 'Focus Flame Builder'],
  },
  gradeContent: {
    '2-3': bandContent(
      'Help Caiden pick what to do first with simple everyday choices.',
      [
        {
          id: 'cq1-23-q1',
          question: 'Caiden wants to draw a superhero before camp starts. What should he do first?',
          scenarioTag: 'GET READY',
          scenarioAccent: 'camp-pack',
          options: [
            { id: 'a', label: 'Start coloring' },
            { id: 'b', label: 'Find paper and pencils' },
            { id: 'c', label: 'Show his friend' },
            { id: 'd', label: 'Hang it on the wall' },
          ],
          correctAnswer: 'b',
          explanation: 'Caiden needs supplies before he can start drawing.',
          hint: 'What does Caiden need before he can draw?',
          skillTags: [SKILL],
        },
        {
          id: 'cq1-23-q2',
          question: 'Caiden needs his backpack, water bottle, and homework. What should he pack?',
          scenarioTag: 'PACK SMART',
          scenarioAccent: 'priority',
          options: [
            { id: 'a', label: 'Only homework' },
            { id: 'b', label: 'Only backpack' },
            { id: 'c', label: 'All three important items' },
            { id: 'd', label: 'Only one item and hope for the best' },
          ],
          correctAnswer: 'c',
          explanation: 'All three items matter — packing everything he needs avoids last-minute scrambling.',
          hint: 'Think about everything Caiden needs for the day.',
          skillTags: [SKILL],
        },
        {
          id: 'cq1-23-q3',
          question: 'Caiden has 10 minutes before leaving. What should happen first?',
          scenarioTag: 'TIME FIRST',
          scenarioAccent: 'timer',
          options: [
            { id: 'a', label: 'Start with a short ready-to-leave checklist' },
            { id: 'b', label: 'Pack his camp bag' },
            { id: 'c', label: 'Finish one quick prep step first' },
            { id: 'd', label: 'Delay until the last minute' },
          ],
          correctAnswer: 'b',
          explanation: 'With only 10 minutes, Caiden should handle the urgent task first.',
          hint: 'What must happen before he can leave?',
          skillTags: [SKILL],
        },
      ],
    ),
    '4-5': bandContent(
      'Use numbers and deadlines to decide what Caiden should do first.',
      [
        {
          id: 'cq1-45-q1',
          scenarioText:
            'Caiden has $8. A notebook costs $3 and markers cost $6. He needs both for art class tomorrow.',
          question: 'Can he afford both items today?',
          scenarioTag: 'BUDGET MATH',
          scenarioAccent: 'priority',
          options: [
            { id: 'a', label: 'No — together they cost $9' },
            { id: 'b', label: 'Yes — $8 is enough for both' },
            { id: 'c', label: 'Yes — $3 and $6 equal $8 exactly' },
            { id: 'd', label: 'No — he can only afford the markers' },
          ],
          correctAnswer: 'a',
          explanation: '$3 + $6 = $9, which is more than the $8 he has. He needs to choose one or earn more.',
          hint: 'Add both prices and compare to $8.',
          skillTags: [SKILL, 'Math', 'Money'],
          metadata: caidenBandMetadata('4-5', 'Budgeting', MODULE_ID, 'intermediate'),
        },
        {
          id: 'cq1-45-q2',
          scenarioText:
            'Math homework takes 25 minutes. Caiden has 40 minutes before dinner.',
          question: 'After homework, how many minutes does he have left?',
          scenarioTag: 'TIME MATH',
          scenarioAccent: 'timer',
          options: [
            { id: 'a', label: '15 minutes' },
            { id: 'b', label: '25 minutes' },
            { id: 'c', label: '65 minutes' },
            { id: 'd', label: '5 minutes' },
          ],
          correctAnswer: 'a',
          explanation: '40 − 25 = 15 minutes left after homework.',
          hint: 'Subtract the homework time from 40.',
          skillTags: [SKILL, 'Math', 'Time'],
          metadata: caidenBandMetadata('4-5', 'Time Estimation', MODULE_ID, 'intermediate'),
        },
        {
          id: 'cq1-45-q3',
          scenarioText:
            'A quiz needs 20 minutes of study tonight. A project due in 5 days needs 45 minutes. Caiden has 30 free minutes tonight.',
          question: 'Which priority order uses his 30 minutes best?',
          scenarioTag: 'URGENT VS LATER',
          scenarioAccent: 'weekly-plan',
          options: [
            { id: 'a', label: 'Study for the quiz — it is more urgent and fits tonight' },
            { id: 'b', label: 'Start the full project — it takes longer' },
            { id: 'c', label: 'Split 15 minutes on each and hope that is enough' },
            { id: 'd', label: 'Start a small quiz review after science if time remains' },
          ],
          correctAnswer: 'a',
          explanation: 'The quiz is sooner. Twenty minutes fits in 30; the 45-minute project cannot be finished tonight anyway.',
          hint: 'Compare deadlines and whether each task fits in 30 minutes.',
          skillTags: [SKILL, 'Planning', 'Prioritization'],
          metadata: caidenBandMetadata('4-5', 'Prioritization', MODULE_ID, 'advanced'),
        },
      ],
    ),
    '6-8': bandContent(
      'Solve multi-step math to prioritize assignments and camp spending.',
      [
        {
          id: 'cq1-68-q1',
          scenarioText:
            'Caiden has 90 minutes after school. Math takes 35 minutes, reading takes 25, and packing takes 20.',
          question: 'How many minutes will he have left if he completes all three?',
          scenarioTag: 'SCHEDULE MATH',
          scenarioAccent: 'timer',
          options: [
            { id: 'a', label: '10 minutes' },
            { id: 'b', label: '80 minutes' },
            { id: 'c', label: '0 minutes — he is 10 minutes short' },
            { id: 'd', label: '25 minutes' },
          ],
          correctAnswer: 'a',
          explanation: '35 + 25 + 20 = 80 minutes used. 90 − 80 = 10 minutes left.',
          hint: 'Add all three tasks, then subtract from 90.',
          skillTags: [SKILL, 'Math', 'Time'],
        },
        {
          id: 'cq1-68-q2',
          scenarioText:
            'Camp tokens: trail mix 7, drink 5, sticker 4. Caiden has 12 tokens and must buy food first.',
          question: 'What is the best spending plan?',
          scenarioTag: 'BUDGET MATH',
          scenarioAccent: 'weekly-plan',
          options: [
            { id: 'a', label: 'Trail mix and drink — costs 12, no tokens left' },
            { id: 'b', label: 'All three items — costs 16 tokens' },
            { id: 'c', label: 'Sticker and drink only — saves the most tokens' },
            { id: 'd', label: 'Trail mix only — leaves 5 tokens unused' },
          ],
          correctAnswer: 'a',
          explanation: '7 + 5 = 12 exactly. Food first, and he uses his full budget wisely.',
          hint: 'Add prices. Which plan fits 12 tokens and covers food?',
          skillTags: [SKILL, 'Math', 'Money'],
        },
        {
          id: 'cq1-68-q3',
          scenarioText:
            'Science project due tomorrow (needs 50 min). Reading log due Friday (needs 30 min). Comic due next week (needs 40 min). Caiden has 60 minutes tonight.',
          question: 'Which plan uses his time best?',
          scenarioTag: 'MULTIPLE DEADLINES',
          scenarioAccent: 'priority',
          options: [
            { id: 'a', label: 'Full science project tonight — most urgent' },
            { id: 'b', label: 'Comic first — it is the most fun' },
            { id: 'c', label: '30 min science + 30 min reading — ignores that science needs 50' },
            { id: 'd', label: 'Reading log first — due before the comic only' },
          ],
          correctAnswer: 'a',
          explanation: 'Science is due tomorrow and needs 50 minutes — it should get most of tonight. Reading can start Friday prep later.',
          hint: 'Which deadline is soonest, and does the time required fit?',
          skillTags: [SKILL, 'Math', 'Planning'],
        },
      ],
    ),
  },
};

registerCaidenAdaptiveQuest(CAIDEN_QUEST_1_FILE);
