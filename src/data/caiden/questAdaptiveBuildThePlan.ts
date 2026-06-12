import type { CaidenAdaptiveQuestFile, CaidenGradeContent } from '../../types/caidenAdaptiveQuest';
import { registerCaidenAdaptiveQuest } from './caidenAdaptiveBuilder';

export const CAIDEN_QUEST_5_ID = 'quest-5';

const SKILL = 'Planning & Organization';

function bandContent(
  dashboardDescription: string,
  questions: CaidenGradeContent['questions'],
): CaidenGradeContent {
  return {
    dashboardTitle: 'Build the Plan',
    dashboardDescription,
    skillTags: [SKILL, 'Executive Function', 'Organization'],
    questions,
  };
}

export const CAIDEN_QUEST_5_FILE: CaidenAdaptiveQuestFile = {
  id: CAIDEN_QUEST_5_ID,
  title: "Caiden's Focus Quest",
  subtitle: 'Build the Plan',
  character: 'caiden',
  questNumber: 5,
  skillFocus: ['Planning & Organization', 'Executive Function', 'Organization'],
  landing: {
    eyebrow: 'QUEST #5',
    title: "Caiden's Focus Quest",
    subtitle: 'Build the Plan',
    body: 'Help Caiden break big tasks into steps, make lists, and organize projects.',
    cta: 'Start Quest',
  },
  complete: {
    title: 'Master Planner Badge Earned!',
    message: 'You helped Caiden build strong plans and organize tasks into clear steps.',
    badges: ['Master Planner', 'Step Builder', 'Focus Flame Builder'],
  },
  gradeContent: {
    '2-3': bandContent(
      'Make simple lists and checklists for everyday tasks.',
      [
        {
          id: 'cq5-23-q1',
          question: 'Caiden needs to pack for camp. What should he do first?',
          scenarioTag: 'PLAN FIRST',
          scenarioAccent: 'camp-pack',
          options: [
            { id: 'a', label: 'Make a list' },
            { id: 'b', label: 'Hide his backpack' },
            { id: 'c', label: 'Watch TV' },
            { id: 'd', label: 'Forget everything' },
          ],
          correctAnswer: 'a',
          explanation: 'A list helps Caiden remember everything he needs to pack.',
          hint: 'What tool helps you remember all the steps?',
          skillTags: [SKILL],
        },
        {
          id: 'cq5-23-q2',
          question: 'Which item belongs in a camp bag?',
          scenarioTag: 'PACK SMART',
          scenarioAccent: 'priority',
          options: [
            { id: 'a', label: 'Water bottle' },
            { id: 'b', label: 'Pillow from bed' },
            { id: 'c', label: 'TV remote' },
            { id: 'd', label: 'Dirty sock only' },
          ],
          correctAnswer: 'a',
          explanation: 'A water bottle is a practical camp essential.',
          hint: 'Which item helps Caiden stay hydrated at camp?',
          skillTags: [SKILL],
        },
        {
          id: 'cq5-23-q3',
          question: 'What helps Caiden remember steps?',
          scenarioTag: 'CHECKLIST',
          scenarioAccent: 'weekly-plan',
          options: [
            { id: 'a', label: 'A checklist' },
            { id: 'b', label: 'A loud noise' },
            { id: 'c', label: 'A messy room' },
            { id: 'd', label: 'A broken pencil' },
          ],
          correctAnswer: 'a',
          explanation: 'Checklists break tasks into steps you can track and check off.',
          hint: 'What tool shows each step so nothing gets forgotten?',
          skillTags: [SKILL],
        },
      ],
    ),
    '4-5': bandContent(
      'Order project steps and understand why planning helps big tasks feel manageable.',
      [
        {
          id: 'cq5-45-q1',
          question: 'Caiden is making a comic. What should happen first?',
          scenarioTag: 'FIRST STEP',
          scenarioAccent: 'weekly-plan',
          options: [
            { id: 'a', label: 'Print copies' },
            { id: 'b', label: 'Write the story idea' },
            { id: 'c', label: 'Sell it' },
            { id: 'd', label: 'Color the final page first' },
          ],
          correctAnswer: 'b',
          explanation: 'Every comic starts with a story idea before art or printing.',
          hint: 'What must exist before panels, color, or copies?',
          skillTags: [SKILL],
        },
        {
          id: 'cq5-45-q2',
          question: 'Caiden has three tasks: outline story, sketch panels, add color. What is the best order?',
          scenarioTag: 'STEP ORDER',
          scenarioAccent: 'priority',
          options: [
            { id: 'a', label: 'Color, sketch, outline' },
            { id: 'b', label: 'Outline, sketch, color' },
            { id: 'c', label: 'Sketch, color, outline' },
            { id: 'd', label: 'Sell, color, outline' },
          ],
          correctAnswer: 'b',
          explanation: 'Outline first, then sketch, then color — each step builds on the last.',
          hint: 'Which order moves from planning to finishing?',
          skillTags: [SKILL],
        },
        {
          id: 'cq5-45-q3',
          question: 'Why does a plan help?',
          scenarioTag: 'WHY PLAN',
          scenarioAccent: 'reflection',
          options: [
            { id: 'a', label: 'It breaks a big task into steps' },
            { id: 'b', label: 'It makes work disappear' },
            { id: 'c', label: 'It means mistakes never happen' },
            { id: 'd', label: 'It lets you skip everything' },
          ],
          correctAnswer: 'a',
          explanation: 'Plans turn overwhelming tasks into smaller, doable steps.',
          hint: 'What does breaking a task into steps do for your brain?',
          skillTags: [SKILL],
        },
      ],
    ),
    '6-8': bandContent(
      'Build multi-step project plans for presentations, designs, and long assignments.',
      [
        {
          id: 'cq5-68-q1',
          question: 'Caiden is preparing a presentation. Which plan is strongest?',
          scenarioTag: 'PRESENTATION',
          scenarioAccent: 'weekly-plan',
          options: [
            { id: 'a', label: 'Research, outline, create slides, practice' },
            { id: 'b', label: 'Create slides, guess facts, present' },
            { id: 'c', label: 'Practice before knowing the topic' },
            { id: 'd', label: 'Wait until the morning it is due' },
          ],
          correctAnswer: 'a',
          explanation: 'Research and outline come before slides and practice.',
          hint: 'Which order builds knowledge before performance?',
          skillTags: [SKILL],
        },
        {
          id: 'cq5-68-q2',
          question: 'Caiden is designing a game idea. What should happen first?',
          scenarioTag: 'DESIGN',
          scenarioAccent: 'priority',
          options: [
            { id: 'a', label: 'Launch the final game' },
            { id: 'b', label: 'Create a plan or wireframe' },
            { id: 'c', label: 'Sell merchandise' },
            { id: 'd', label: 'Ignore feedback' },
          ],
          correctAnswer: 'b',
          explanation: 'A plan or wireframe maps the idea before building or selling.',
          hint: 'What comes before launching or selling?',
          skillTags: [SKILL],
        },
        {
          id: 'cq5-68-q3',
          question: 'What is the purpose of organizing a project into steps?',
          scenarioTag: 'ORGANIZE',
          scenarioAccent: 'reflection',
          options: [
            { id: 'a', label: 'To reduce confusion and track progress' },
            { id: 'b', label: 'To make it harder' },
            { id: 'c', label: 'To avoid finishing' },
            { id: 'd', label: 'To skip planning' },
          ],
          correctAnswer: 'a',
          explanation: 'Steps reduce confusion and let you see how far you have come.',
          hint: 'How does a step-by-step plan help you stay on track?',
          skillTags: [SKILL],
        },
      ],
    ),
  },
};

registerCaidenAdaptiveQuest(CAIDEN_QUEST_5_FILE);
