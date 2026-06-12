import type { CaidenAdaptiveQuestFile, CaidenGradeContent } from '../../types/caidenAdaptiveQuest';
import { registerCaidenAdaptiveQuest } from './caidenAdaptiveBuilder';

export const CAIDEN_QUEST_2_ID = 'quest-2';

const SKILL = 'Attention Control';

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
            { id: 'a', label: 'Watch videos' },
            { id: 'b', label: 'Turn off the tablet and focus' },
            { id: 'c', label: 'Leave homework' },
            { id: 'd', label: 'Walk away' },
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
            { id: 'd', label: 'A notebook' },
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
            { id: 'a', label: 'Loud TV' },
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
      'Practice attention strategies when phones and screens compete for focus.',
      [
        {
          id: 'cq2-45-q1',
          question: 'Caiden is reading, but his phone keeps buzzing. What is the best choice?',
          scenarioTag: 'PHONE AWAY',
          scenarioAccent: 'distraction',
          options: [
            { id: 'a', label: 'Check every message' },
            { id: 'b', label: 'Put the phone away until finished' },
            { id: 'c', label: 'Ignore reading' },
            { id: 'd', label: 'Open social media' },
          ],
          correctAnswer: 'b',
          explanation: 'Putting the phone away protects reading time from constant interruptions.',
          hint: 'How can Caiden stop the buzzing from breaking his focus?',
          skillTags: [SKILL],
        },
        {
          id: 'cq2-45-q2',
          question: 'Which is a focus strategy?',
          scenarioTag: 'STRATEGY',
          scenarioAccent: 'timer',
          options: [
            { id: 'a', label: 'Working in short chunks' },
            { id: 'b', label: 'Switching tasks every minute' },
            { id: 'c', label: 'Leaving assignments unfinished' },
            { id: 'd', label: 'Multitasking constantly' },
          ],
          correctAnswer: 'a',
          explanation: 'Short focus chunks help the brain stay engaged without burning out.',
          hint: 'Which choice keeps attention on one thing for a manageable stretch?',
          skillTags: [SKILL],
        },
        {
          id: 'cq2-45-q3',
          question: 'What happens when distractions increase?',
          scenarioTag: 'CONSEQUENCES',
          scenarioAccent: 'reflection',
          options: [
            { id: 'a', label: 'Focus improves' },
            { id: 'b', label: 'Tasks take longer' },
            { id: 'c', label: 'Memory improves' },
            { id: 'd', label: 'Nothing changes' },
          ],
          correctAnswer: 'b',
          explanation: 'More distractions mean more time lost switching attention back and forth.',
          hint: 'Think about what happens when you keep getting interrupted.',
          skillTags: [SKILL],
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
