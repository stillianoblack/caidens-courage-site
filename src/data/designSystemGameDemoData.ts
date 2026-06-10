import type { GameChoiceOption } from '../types/gameAssessment';
import { getB4LockInTip } from '../design-system/game/getB4LockInTip';
import { CAIDEN_QUEST_1_CONFIG } from './caiden/quest1WhatComesFirst';

const QUEST_Q1 = CAIDEN_QUEST_1_CONFIG.questions[0];
const QUEST_Q2 = CAIDEN_QUEST_1_CONFIG.questions[1];

export const DEMO_GAME_QUESTION = {
  sceneLabel: 'Mission Card',
  tag: 'GETTING STARTED',
  storyPrompt:
    'Caiden has homework, a drawing idea, and a camp bag to pack. The Camp Challenge starts soon.',
  prompt: 'What should Caiden do first?',
};

export const DEMO_GAME_OPTIONS: GameChoiceOption[] = [
  { id: 'draw', label: 'Start a new drawing' },
  { id: 'pack', label: 'Pack the items he needs for camp' },
  { id: 'snack', label: 'Look for a snack' },
  { id: 'wait', label: 'Wait until later' },
];

export const DEMO_LOCK_IN_TIP = getB4LockInTip({
  portalType: 'kid',
  gameId: 'quest-1',
  moduleId: 'quest-1',
  questionId: QUEST_Q1.id,
  selectedAnswer: 'pack',
  isCorrect: true,
  skillArea: 'focus',
  characterId: 'caiden',
  learningGoal: QUEST_Q1.clueCard?.tag,
  question: QUEST_Q1,
});

export const DEMO_B4_FEEDBACK_EXAMPLES = {
  correctKid: DEMO_LOCK_IN_TIP,
  incorrectKid: getB4LockInTip({
    portalType: 'kid',
    gameId: 'quest-1',
    questionId: QUEST_Q2.id,
    selectedAnswer: 'whole',
    isCorrect: false,
    skillArea: 'focus',
    characterId: 'caiden',
    learningGoal: QUEST_Q2.clueCard?.tag,
    question: QUEST_Q2,
  }),
  correctFamily: getB4LockInTip({
    portalType: 'family',
    gameId: 'quest-1',
    questionId: QUEST_Q2.id,
    selectedAnswer: 'clothes',
    isCorrect: true,
    skillArea: 'focus',
    characterId: 'caiden',
    question: QUEST_Q2,
  }),
  incorrectFamily: getB4LockInTip({
    portalType: 'family',
    gameId: 'quest-1',
    questionId: QUEST_Q2.id,
    selectedAnswer: 'whole',
    isCorrect: false,
    skillArea: 'focus',
    characterId: 'caiden',
    question: QUEST_Q2,
  }),
  facilitatorFocus: getB4LockInTip({
    portalType: 'facilitator',
    gameId: 'quest-1',
    questionId: QUEST_Q1.id,
    selectedAnswer: 'pack',
    isCorrect: true,
    skillArea: 'focus',
    characterId: 'caiden',
    question: QUEST_Q1,
  }),
  emotionalRegulation: getB4LockInTip({
    portalType: 'kid',
    gameId: 'feeling-finder',
    questionId: 'demo-feelings',
    selectedAnswer: 'breathe',
    isCorrect: true,
    skillArea: 'emotional_regulation',
    characterId: 'b4',
  }),
  readingConfidence: getB4LockInTip({
    portalType: 'kid',
    gameId: 'the-missing-clue',
    questionId: 'demo-reading',
    selectedAnswer: 'clue',
    isCorrect: false,
    skillArea: 'reading_confidence',
    characterId: 'miranda',
  }),
};

export const DEMO_FAMILY_LOCK_IN = {
  message: 'Great choice. This helps your child practice calming their body before reacting.',
  tips: [
    'Try this together: ask your child what they noticed first.',
    'Name one small next step out loud.',
    'Celebrate the effort, not perfection.',
  ],
  label: 'B-4 Lock-In Tips',
};

export const DEMO_EXPERT_INSIGHT = {
  characterId: 'dr-victoria',
  insight: 'When a student shuts down, connection often comes before correction.',
  whyItMatters:
    'Kids need to feel safe before they can access problem-solving skills. Rushing to fix the behavior can deepen withdrawal.',
  tryThis: [
    'Get on their eye level and validate the feeling first.',
    'Offer one small choice to rebuild agency.',
    'Return to the skill after the nervous system settles.',
  ],
  tryThisLabel: 'Try this',
  watchFor: 'Watch for rushed reassurance that skips the feeling underneath.',
};

export const DEMO_B4_PARENT_COACH = {
  headline: 'Your child may need a pause before they can hear coaching.',
  whyItMatters:
    'Regulation opens the door to learning. Coaching during peak frustration often bounces off.',
  tryThis: [
    'Breathe together for three counts before suggesting a fix.',
    'Ask what felt hardest while emotions are still high.',
    'Return to the task after shoulders drop and voice softens.',
  ],
  watchFor: 'Stacking too many instructions while emotions are still elevated.',
};

export const DEMO_CHARACTER_SAMPLES = [
  'b4',
  'caiden',
  'miranda',
  'ollie',
  'genesis',
  'dr-victoria',
] as const;
