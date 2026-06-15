import type { CaidenAdaptiveQuestFile, CaidenGradeContent } from '../../types/caidenAdaptiveQuest';
import { caidenBandMetadata } from './caidenQuestionHelpers';
import { registerCaidenAdaptiveQuest } from './caidenAdaptiveBuilder';

export const CAIDEN_QUEST_2_ID = 'quest-2';

const SKILL = 'Attention Control';
const MODULE_ID = CAIDEN_QUEST_2_ID;

function bandContent(
  dashboardDescription: string,
  questions: CaidenGradeContent['questions'],
): CaidenGradeContent {
  return {
    dashboardTitle: 'Focus or Distraction?',
    dashboardDescription,
    skillTags: [SKILL, 'Executive Function', 'Focus'],
    questions,
  };
}

export const CAIDEN_QUEST_2_FILE: CaidenAdaptiveQuestFile = {
  id: CAIDEN_QUEST_2_ID,
  title: "Caiden's Focus Quest",
  subtitle: 'Focus or Distraction?',
  character: 'caiden',
  questNumber: 2,
  skillFocus: ['Attention Control', 'Executive Function', 'Focus'],
  landing: {
    eyebrow: 'QUEST #2',
    title: "Caiden's Focus Quest",
    subtitle: 'Focus or Distraction?',
    body: 'Help Caiden spot distractions and protect his focus when it matters most.',
    cta: 'Start Quest',
  },
  complete: {
    title: 'Focus Navigator Badge Earned!',
    message: 'You helped Caiden recognize distractions and choose focus-friendly moves.',
    badges: ['Focus Navigator', 'Attention Hero', 'Focus Flame Builder'],
  },
  gradeContent: {
    '2-3': bandContent(
      'Learn to spot distractions and protect focus with simple choices.',
      [
        {
          id: 'cq2-23-q1',
          question: 'Caiden is doing homework. His tablet starts playing videos. What should he do?',
          scenarioTag: 'SPOT DISTRACTION',
          scenarioAccent: 'distraction',
          options: [
            { id: 'a', label: 'Pause videos and finish one homework section' },
            { id: 'b', label: 'Turn off the tablet and focus' },
            { id: 'c', label: 'Set homework aside without a plan' },
            { id: 'd', label: 'Switch tasks every few minutes' },
          ],
          correctAnswer: 'b',
          explanation: 'Turning off the tablet removes the distraction so Caiden can focus on homework.',
          hint: 'What is pulling Caiden\'s attention away?',
          skillTags: [SKILL],
        },
        {
          id: 'cq2-23-q2',
          question: 'What is a distraction?',
          scenarioTag: 'DEFINE IT',
          scenarioAccent: 'priority',
          options: [
            { id: 'a', label: 'Something helping you focus' },
            { id: 'b', label: 'Something taking attention away' },
            { id: 'c', label: 'A teacher' },
            { id: 'd', label: 'A task list used at the right time' },
          ],
          correctAnswer: 'b',
          explanation: 'A distraction pulls your attention away from what you are trying to do.',
          hint: 'Does it help you stay on task or pull you away?',
          skillTags: [SKILL],
        },
        {
          id: 'cq2-23-q3',
          question: 'Which helps focus?',
          scenarioTag: 'FOCUS ZONE',
          scenarioAccent: 'small-step',
          options: [
            { id: 'a', label: 'Background music with no lyrics' },
            { id: 'b', label: 'Five games open' },
            { id: 'c', label: 'Quiet workspace' },
            { id: 'd', label: 'Constant texting' },
          ],
          correctAnswer: 'c',
          explanation: 'A quiet workspace helps the brain stay on one task.',
          hint: 'Which environment has fewer things pulling attention away?',
          skillTags: [SKILL],
        },
      ],
    ),
    '4-5': bandContent(
      'Plan focus blocks, compare distractions, and choose study schedules with tradeoffs.',
      [
        {
          id: 'cq2-45-q1',
          scenarioText:
            'Caiden has 25 minutes before dinner. His science test is tomorrow. He can read notes (10 min), practice problems (15 min), or review vocab (8 min). He cannot finish all three before dinner.',
          question: 'Which plan helps him focus on the most urgent work without rushing?',
          scenarioTag: 'STUDY PLAN',
          scenarioAccent: 'weekly-plan',
          options: [
            { id: 'a', label: 'Read notes and review vocab — both fit in 18 minutes' },
            { id: 'b', label: 'Practice problems only — save reading for after dinner' },
            { id: 'c', label: 'Try all three quickly and switch every 5 minutes' },
            { id: 'd', label: 'Wait until after dinner when he has more time for everything' },
          ],
          correctAnswer: 'b',
          explanation:
            'The test is tomorrow, so practice problems matter most. Fifteen minutes fits in 25; the other tasks can wait.',
          hint: 'Compare deadlines, minutes needed, and how many minutes he has right now.',
          skillTags: [SKILL, 'Planning', 'Time Management'],
          metadata: caidenBandMetadata('4-5', 'Planning', MODULE_ID, 'intermediate'),
        },
        {
          id: 'cq2-45-q2',
          scenarioText:
            'Caiden earns 12 focus tokens this week. A 20-minute game costs 4 tokens, a snack break costs 2, and saving 8 tokens unlocks a bonus mission.',
          question: 'Which spending plan protects study time and still leaves room for one reward?',
          scenarioTag: 'TOKEN BUDGET',
          scenarioAccent: 'timer',
          options: [
            { id: 'a', label: 'Play the game twice and skip the bonus mission' },
            { id: 'b', label: 'Take one snack break, save 10 tokens, and skip the game today' },
            { id: 'c', label: 'Spend all tokens on snacks so he stays energized' },
            { id: 'd', label: 'Save every token and skip breaks all week' },
          ],
          correctAnswer: 'b',
          explanation:
            'One snack (2 tokens) plus saving 10 leaves a margin for the bonus mission without spending on a long game.',
          hint: 'Add token costs and see which plan still saves enough for the bonus.',
          skillTags: [SKILL, 'Budgeting', 'Executive Function'],
          metadata: caidenBandMetadata('4-5', 'Budgeting', MODULE_ID, 'intermediate'),
        },
        {
          id: 'cq2-45-q3',
          scenarioText:
            'Caiden must finish a reading log (20 min) and pack his camp bag (10 min) before a 7:30 bus. It is 7:00 now.',
          question: 'What is the best sequence so he is not rushing at the end?',
          scenarioTag: 'SEQUENCE',
          scenarioAccent: 'priority',
          options: [
            { id: 'a', label: 'Pack first, then read on the bus if time runs out' },
            { id: 'b', label: 'Start reading, then pack with whatever time remains' },
            { id: 'c', label: 'Pack the bag first, then read until 7:25' },
            { id: 'd', label: 'Text friends until 7:20, then try to do both tasks' },
          ],
          correctAnswer: 'c',
          explanation:
            'Packing is fixed at 10 minutes. Reading next uses the remaining 20 minutes without risking the bus.',
          hint: 'Total time is 30 minutes. Which order guarantees both tasks finish?',
          skillTags: [SKILL, 'Sequencing', 'Planning'],
          metadata: caidenBandMetadata('4-5', 'Sequencing', MODULE_ID, 'advanced'),
        },
      ],
    ),
    '6-8': bandContent(
      'Understand attention control and why task switching slows you down.',
      [
        {
          id: 'cq2-68-q1',
          question: 'Caiden needs to study for a test. Which environment supports focus?',
          scenarioTag: 'STUDY SPACE',
          scenarioAccent: 'small-step',
          options: [
            { id: 'a', label: 'TV playing' },
            { id: 'b', label: 'Group chat open' },
            { id: 'c', label: 'Organized workspace' },
            { id: 'd', label: 'Gaming stream' },
          ],
          correctAnswer: 'c',
          explanation: 'An organized workspace reduces visual and mental clutter.',
          hint: 'Which space has the fewest attention pullers?',
          skillTags: [SKILL],
        },
        {
          id: 'cq2-68-q2',
          question: 'Why is task switching difficult?',
          scenarioTag: 'BRAIN SCIENCE',
          scenarioAccent: 'priority',
          options: [
            { id: 'a', label: 'The brain loses momentum' },
            { id: 'b', label: 'It makes learning easier' },
            { id: 'c', label: 'It improves memory' },
            { id: 'd', label: 'It reduces mistakes' },
          ],
          correctAnswer: 'a',
          explanation: 'Each switch costs mental energy — the brain has to restart its focus.',
          hint: 'What happens to your momentum when you jump between tasks?',
          skillTags: [SKILL],
        },
        {
          id: 'cq2-68-q3',
          question: 'What is attention control?',
          scenarioTag: 'DEFINITION',
          scenarioAccent: 'reflection',
          options: [
            { id: 'a', label: 'Choosing where focus goes' },
            { id: 'b', label: 'Doing many tasks at once' },
            { id: 'c', label: 'Avoiding all work' },
            { id: 'd', label: 'Working faster without thinking' },
          ],
          correctAnswer: 'a',
          explanation: 'Attention control means directing your focus on purpose.',
          hint: 'Who decides where your attention goes — you or the distractions?',
          skillTags: [SKILL],
        },
      ],
    ),
  },
};

registerCaidenAdaptiveQuest(CAIDEN_QUEST_2_FILE);
