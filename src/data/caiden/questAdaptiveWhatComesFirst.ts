import type { CaidenAdaptiveQuestFile, CaidenGradeContent } from '../../types/caidenAdaptiveQuest';
import { registerCaidenAdaptiveQuest } from './caidenAdaptiveBuilder';

export const CAIDEN_QUEST_1_ID = 'quest-1';

const SKILL = 'Prioritization';

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
            { id: 'd', label: 'Nothing' },
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
            { id: 'a', label: 'Watch TV' },
            { id: 'b', label: 'Pack his camp bag' },
            { id: 'c', label: 'Take a nap' },
            { id: 'd', label: 'Play a game' },
          ],
          correctAnswer: 'b',
          explanation: 'With only 10 minutes, Caiden should handle the urgent task first.',
          hint: 'What must happen before he can leave?',
          skillTags: [SKILL],
        },
      ],
    ),
    '4-5': bandContent(
      'Practice prioritizing homework and tasks with competing deadlines.',
      [
        {
          id: 'cq1-45-q1',
          scenarioText:
            'Caiden has math homework due tomorrow and a comic sketch due next week.',
          question: 'What should he do first?',
          scenarioTag: 'DEADLINES',
          scenarioAccent: 'priority',
          options: [
            { id: 'a', label: 'Comic sketch' },
            { id: 'b', label: 'Math homework' },
            { id: 'c', label: 'Video games' },
            { id: 'd', label: 'Neither' },
          ],
          correctAnswer: 'b',
          explanation: 'Tomorrow\'s homework is more urgent than next week\'s project.',
          hint: 'Which task has the sooner deadline?',
          skillTags: [SKILL],
        },
        {
          id: 'cq1-45-q2',
          question:
            'Caiden wants to charge his tablet, finish homework, and pack his bag. What should happen first?',
          scenarioTag: 'FIRST STEP',
          scenarioAccent: 'camp-pack',
          options: [
            { id: 'a', label: 'Charge tablet' },
            { id: 'b', label: 'Finish homework' },
            { id: 'c', label: 'Draw' },
            { id: 'd', label: 'Play outside' },
          ],
          correctAnswer: 'b',
          explanation: 'Homework is the most time-sensitive task on his list.',
          hint: 'Which task has a deadline coming up soonest?',
          skillTags: [SKILL],
        },
        {
          id: 'cq1-45-q3',
          question:
            'A quiz takes 10 minutes to study for and is tomorrow. A project takes 30 minutes and is due next week. What should Caiden prioritize?',
          scenarioTag: 'URGENT VS LATER',
          scenarioAccent: 'timer',
          options: [
            { id: 'a', label: 'Project' },
            { id: 'b', label: 'Quiz' },
            { id: 'c', label: 'Drawing' },
            { id: 'd', label: 'Snack' },
          ],
          correctAnswer: 'b',
          explanation: 'The quiz is due sooner, so it should come first.',
          hint: 'Compare the deadlines, not just the time each task takes.',
          skillTags: [SKILL],
        },
      ],
    ),
    '6-8': bandContent(
      'Use prioritization strategies when multiple assignments compete for time.',
      [
        {
          id: 'cq1-68-q1',
          question:
            'Caiden has a science project due tomorrow, a reading log due Friday, and a comic design due next week. What should he start first?',
          scenarioTag: 'MULTIPLE DEADLINES',
          scenarioAccent: 'priority',
          options: [
            { id: 'a', label: 'Comic design' },
            { id: 'b', label: 'Reading log' },
            { id: 'c', label: 'Science project' },
            { id: 'd', label: 'Free time' },
          ],
          correctAnswer: 'c',
          explanation: 'The science project is due tomorrow — the most urgent deadline.',
          hint: 'Start with the task due soonest.',
          skillTags: [SKILL],
        },
        {
          id: 'cq1-68-q2',
          question: 'Which strategy shows strong prioritization?',
          scenarioTag: 'STRATEGY',
          scenarioAccent: 'weekly-plan',
          options: [
            { id: 'a', label: 'Doing easiest work only' },
            { id: 'b', label: 'Starting with urgent tasks' },
            { id: 'c', label: 'Ignoring deadlines' },
            { id: 'd', label: 'Waiting until everything is late' },
          ],
          correctAnswer: 'b',
          explanation: 'Strong prioritizers tackle urgent tasks before less time-sensitive work.',
          hint: 'Think about how deadlines guide smart choices.',
          skillTags: [SKILL],
        },
        {
          id: 'cq1-68-q3',
          question: 'What is the biggest risk of poor prioritization?',
          scenarioTag: 'CONSEQUENCES',
          scenarioAccent: 'reflection',
          options: [
            { id: 'a', label: 'Better grades' },
            { id: 'b', label: 'More free time' },
            { id: 'c', label: 'Missed deadlines' },
            { id: 'd', label: 'Faster learning' },
          ],
          correctAnswer: 'c',
          explanation: 'When tasks are not prioritized, important deadlines get missed.',
          hint: 'What happens when urgent work gets pushed aside?',
          skillTags: [SKILL],
        },
      ],
    ),
  },
};

registerCaidenAdaptiveQuest(CAIDEN_QUEST_1_FILE);
