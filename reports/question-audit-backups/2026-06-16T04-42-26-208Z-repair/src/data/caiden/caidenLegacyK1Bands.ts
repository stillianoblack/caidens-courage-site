/**
 * K-1 grade-band content derived from preserved legacy Caiden quests.
 * Legacy full configs live in ./legacy/*.legacy.ts (24 questions preserved).
 */
import type { CaidenGradeContent } from '../../types/caidenAdaptiveQuest';
import type { GradeBandQuestionMetadata } from '../../types/gradeBandContentMetadata';
import { CAIDEN_QUEST_1_ID } from './questAdaptiveWhatComesFirst';
import { CAIDEN_QUEST_2_ID } from './questAdaptiveFocusOrDistraction';
import { CAIDEN_QUEST_3_ID } from './questAdaptiveTimeTracker';
import { CAIDEN_QUEST_4_ID } from './questAdaptiveResetAndReturn';
import { CAIDEN_QUEST_5_ID } from './questAdaptiveBuildThePlan';

function legacyMeta(
  sourceId: string,
  sourceFile: string,
  skillTags: string[],
): GradeBandQuestionMetadata {
  return {
    audience: 'kid',
    gradeBand: 'K-1',
    difficulty: 'beginner',
    character: 'caiden',
    skillTags,
    contentVersion: 'legacy_reclassified',
    sourceId,
    sourceFile,
  };
}

export const CAIDEN_QUEST_1_K1: CaidenGradeContent = {
  dashboardTitle: 'What Comes First?',
  dashboardDescription: 'Pick one simple first step with Caiden.',
  skillTags: ['Prioritization', 'Executive Function'],
  questions: [
    {
      id: 'cq1-k1-q1',
      question: 'What should Caiden do first?',
      scenarioText: 'Caiden has homework, a drawing idea, and a camp bag to pack. Camp starts soon.',
      scenarioTag: 'GET READY',
      scenarioAccent: 'camp-pack',
      options: [
        { id: 'draw', label: 'Start a new drawing' },
        { id: 'pack', label: 'Pack the items he needs for camp' },
        { id: 'snack', label: 'Look for a snack' },
        { id: 'wait', label: 'Wait until later' },
      ],
      correctAnswer: 'pack',
      explanation: 'Camp starts soon, so packing what he needs comes first.',
      hint: 'What helps Caiden get ready?',
      skillTags: ['Prioritization'],
      metadata: legacyMeta('cq1-q1', 'legacy/quest1WhatComesFirst.legacy.ts', ['Prioritization']),
    },
    {
      id: 'cq1-k1-q2',
      question: 'What is the best first step?',
      scenarioText: 'Caiden feels overwhelmed because his room is messy. B-4 says to pick one small step.',
      scenarioTag: 'SMALL STEP',
      scenarioAccent: 'small-step',
      options: [
        { id: 'whole', label: 'Clean the whole room at once' },
        { id: 'bed', label: 'Throw everything under the bed' },
        { id: 'clothes', label: 'Pick up the clothes first' },
        { id: 'giveup', label: 'Give up' },
      ],
      correctAnswer: 'clothes',
      explanation: 'One small step makes a big task easier.',
      hint: 'Pick the smallest step you can finish.',
      skillTags: ['Prioritization'],
      metadata: legacyMeta('cq1-q2', 'legacy/quest1WhatComesFirst.legacy.ts', ['Prioritization']),
    },
    {
      id: 'cq1-k1-q3',
      question: 'What should Caiden focus on first?',
      scenarioText: 'The teacher is explaining the challenge. Caiden also wants to sharpen his pencil and tell a joke.',
      scenarioTag: 'LISTEN FIRST',
      scenarioAccent: 'priority',
      options: [
        { id: 'listen', label: 'Listening to directions' },
        { id: 'joke', label: 'Telling the joke' },
        { id: 'pencil', label: 'Sharpening his pencil loudly' },
        { id: 'look', label: 'Looking around the room' },
      ],
      correctAnswer: 'listen',
      explanation: 'Directions help Caiden know what to do next.',
      hint: 'What is the main task right now?',
      skillTags: ['Prioritization'],
      metadata: legacyMeta('cq1-q7', 'legacy/quest1WhatComesFirst.legacy.ts', ['Prioritization']),
    },
  ],
};

export const CAIDEN_QUEST_2_K1: CaidenGradeContent = {
  dashboardTitle: 'Focus or Distraction?',
  dashboardDescription: 'Spot what pulls attention away and choose focus.',
  skillTags: ['Attention Control', 'Focus'],
  questions: [
    {
      id: 'cq2-k1-q1',
      question: 'What should Caiden do?',
      scenarioText: 'Caiden is writing in his journal. His tablet keeps lighting up beside him.',
      scenarioTag: 'DISTRACTION',
      scenarioAccent: 'distraction',
      options: [
        { id: 'check', label: 'Check every notification' },
        { id: 'move', label: 'Move the tablet away until he finishes' },
        { id: 'stop', label: 'Stop writing' },
        { id: 'game', label: 'Open a game' },
      ],
      correctAnswer: 'move',
      explanation: 'Moving the tablet away protects focus.',
      hint: 'What is pulling attention away?',
      skillTags: ['Attention Control'],
      metadata: legacyMeta('cq1-q3', 'legacy/quest1WhatComesFirst.legacy.ts', ['Attention Control']),
    },
    {
      id: 'cq2-k1-q2',
      question: 'What is the best choice?',
      scenarioText: 'Caiden wants to finish homework, but a game is open on his screen.',
      scenarioTag: 'FOCUS CHOICE',
      scenarioAccent: 'distraction',
      options: [
        { id: 'game', label: 'Play the game first' },
        { id: 'homework', label: 'Close the game and finish homework' },
        { id: 'both', label: 'Do both at the same time' },
        { id: 'quit', label: 'Quit homework' },
      ],
      correctAnswer: 'homework',
      explanation: 'Closing the game helps Caiden finish one task at a time.',
      hint: 'Which choice protects homework time?',
      skillTags: ['Attention Control'],
      metadata: legacyMeta('cq2-q3', 'legacy/quest2ChooseYourNextMove.legacy.ts', ['Attention Control']),
    },
    {
      id: 'cq2-k1-q3',
      question: 'What is a healthy focus move?',
      scenarioText: 'Caiden feels wiggly during quiet reading time.',
      scenarioTag: 'BODY FOCUS',
      scenarioAccent: 'small-step',
      options: [
        { id: 'run', label: 'Run around the room' },
        { id: 'breath', label: 'Take a quiet breath and look back at the page' },
        { id: 'talk', label: 'Talk to a friend' },
        { id: 'hide', label: 'Hide the book' },
      ],
      correctAnswer: 'breath',
      explanation: 'A quiet breath helps the body settle so focus can return.',
      hint: 'What helps your body calm without leaving the task?',
      skillTags: ['Attention Control'],
      metadata: legacyMeta('cq2-q4', 'legacy/quest2ChooseYourNextMove.legacy.ts', ['Attention Control']),
    },
  ],
};

export const CAIDEN_QUEST_3_K1: CaidenGradeContent = {
  dashboardTitle: 'Time Tracker',
  dashboardDescription: 'Use the clock to get ready on time.',
  skillTags: ['Time Management'],
  questions: [
    {
      id: 'cq3-k1-q1',
      question: 'What should he do?',
      scenarioText: 'Caiden has 10 minutes before the group leaves. He needs his water bottle, pencil, and notebook.',
      scenarioTag: 'TIME LEFT',
      scenarioAccent: 'timer',
      options: [
        { id: 'grab', label: 'Grab the three things he needs' },
        { id: 'color', label: 'Start coloring a new page' },
        { id: 'talk', label: 'Talk for 20 minutes' },
        { id: 'sit', label: 'Sit down and wait' },
      ],
      correctAnswer: 'grab',
      explanation: 'With only 10 minutes, Caiden should grab what he needs first.',
      hint: 'What fits in 10 minutes?',
      skillTags: ['Time Management'],
      metadata: legacyMeta('cq1-q4', 'legacy/quest1WhatComesFirst.legacy.ts', ['Time Management']),
    },
    {
      id: 'cq3-k1-q2',
      question: 'What helps Caiden know when to leave?',
      scenarioTag: 'CLOCK',
      scenarioAccent: 'timer',
      options: [
        { id: 'clock', label: 'A clock' },
        { id: 'snack', label: 'A snack' },
        { id: 'pillow', label: 'A pillow' },
        { id: 'comic', label: 'A comic book' },
      ],
      correctAnswer: 'clock',
      explanation: 'A clock shows how much time is left.',
      hint: 'What tool tells time?',
      skillTags: ['Time Management'],
      metadata: legacyMeta('cq3-23-q3', 'questAdaptiveTimeTracker.ts', ['Time Management']),
    },
    {
      id: 'cq3-k1-q3',
      question: 'Camp starts in 15 minutes. What should Caiden do first?',
      scenarioText: 'Caiden still needs to put on shoes and pack his folder.',
      scenarioTag: 'GET READY',
      scenarioAccent: 'camp-pack',
      options: [
        { id: 'cartoon', label: 'Start a cartoon' },
        { id: 'ready', label: 'Put on shoes and pack his folder' },
        { id: 'nap', label: 'Take a nap' },
        { id: 'draw', label: 'Draw a new picture' },
      ],
      correctAnswer: 'ready',
      explanation: 'Getting ready comes before fun when time is short.',
      hint: 'What must happen before camp?',
      skillTags: ['Time Management'],
      metadata: legacyMeta('cq3-23-q1', 'questAdaptiveTimeTracker.ts', ['Time Management']),
    },
  ],
};

export const CAIDEN_QUEST_4_K1: CaidenGradeContent = {
  dashboardTitle: 'Reset and Return',
  dashboardDescription: 'Pause, breathe, and try again when feelings get big.',
  skillTags: ['Emotional Regulation', 'Self-Regulation'],
  questions: [
    {
      id: 'cq4-k1-q1',
      question: 'What is a strong focus move?',
      scenarioText: 'Caiden gets frustrated when his answer is wrong. His face feels hot.',
      scenarioTag: 'RESET',
      scenarioAccent: 'focus-reset',
      options: [
        { id: 'rip', label: 'Rip the paper' },
        { id: 'blame', label: 'Blame someone else' },
        { id: 'breath', label: 'Take a breath and try again' },
        { id: 'quit', label: 'Quit the activity forever' },
      ],
      correctAnswer: 'breath',
      explanation: 'A breath gives Caiden a moment to reset.',
      hint: 'What helps calm your body?',
      skillTags: ['Emotional Regulation'],
      metadata: legacyMeta('cq1-q5', 'legacy/quest1WhatComesFirst.legacy.ts', ['Emotional Regulation']),
    },
    {
      id: 'cq4-k1-q2',
      question: 'What is the best focus reset?',
      scenarioText: 'Caiden notices his attention drifting during reading.',
      scenarioTag: 'RETURN',
      scenarioAccent: 'focus-reset',
      options: [
        { id: 'a', label: 'Take one breath and return to the sentence' },
        { id: 'b', label: 'Close the book forever' },
        { id: 'c', label: 'Talk loudly' },
        { id: 'd', label: 'Hide the book' },
      ],
      correctAnswer: 'a',
      explanation: 'One breath, then return to the sentence.',
      hint: 'What is a small reset move?',
      skillTags: ['Emotional Regulation'],
      metadata: legacyMeta('cq3-q2', 'legacy/quest3ResetAndReturn.legacy.ts', ['Emotional Regulation']),
    },
    {
      id: 'cq4-k1-q3',
      question: 'What should he do next?',
      scenarioText: 'Caiden starts drawing during directions and misses the first step.',
      scenarioTag: 'ASK AGAIN',
      scenarioAccent: 'ask-help',
      options: [
        { id: 'a', label: 'Pretend he heard everything' },
        { id: 'b', label: 'Ask for the direction again' },
        { id: 'c', label: 'Blame someone else' },
        { id: 'd', label: 'Stop participating' },
      ],
      correctAnswer: 'b',
      explanation: 'Asking again is a brave reset move.',
      hint: 'How can Caiden get back on track?',
      skillTags: ['Emotional Regulation'],
      metadata: legacyMeta('cq3-q1', 'legacy/quest3ResetAndReturn.legacy.ts', ['Emotional Regulation']),
    },
  ],
};

export const CAIDEN_QUEST_5_K1: CaidenGradeContent = {
  dashboardTitle: 'Build the Plan',
  dashboardDescription: 'Make a simple list and pack what you need.',
  skillTags: ['Planning & Organization'],
  questions: [
    {
      id: 'cq5-k1-q1',
      question: 'What is the best first step?',
      scenarioText: 'Caiden feels overwhelmed because his room is messy.',
      scenarioTag: 'ONE STEP',
      scenarioAccent: 'small-step',
      options: [
        { id: 'whole', label: 'Clean the whole room at once' },
        { id: 'clothes', label: 'Pick up the clothes first' },
        { id: 'bed', label: 'Throw everything under the bed' },
        { id: 'giveup', label: 'Give up' },
      ],
      correctAnswer: 'clothes',
      explanation: 'Plans start with one small step.',
      hint: 'What is the smallest step?',
      skillTags: ['Planning & Organization'],
      metadata: legacyMeta('cq1-q2', 'legacy/quest1WhatComesFirst.legacy.ts', ['Planning']),
    },
    {
      id: 'cq5-k1-q2',
      question: 'What should he do?',
      scenarioText: 'Caiden wants to finish a project before Friday. Today is Monday.',
      scenarioTag: 'WEEKLY PLAN',
      scenarioAccent: 'weekly-plan',
      options: [
        { id: 'friday', label: 'Wait until Friday morning' },
        { id: 'plan', label: 'Make a small plan for each day' },
        { id: 'forget', label: 'Forget about it' },
        { id: 'fun', label: 'Do only the fun parts' },
      ],
      correctAnswer: 'plan',
      explanation: 'Small steps across the week make big projects easier.',
      hint: 'How can Caiden spread the work out?',
      skillTags: ['Planning & Organization'],
      metadata: legacyMeta('cq1-q6', 'legacy/quest1WhatComesFirst.legacy.ts', ['Planning']),
    },
    {
      id: 'cq5-k1-q3',
      question: 'Caiden needs to pack for camp. What should he do first?',
      scenarioTag: 'CHECKLIST',
      scenarioAccent: 'camp-pack',
      options: [
        { id: 'list', label: 'Make a list' },
        { id: 'hide', label: 'Hide his backpack' },
        { id: 'tv', label: 'Watch TV' },
        { id: 'forget', label: 'Forget everything' },
      ],
      correctAnswer: 'list',
      explanation: 'A list helps remember each packing step.',
      hint: 'What tool shows all the steps?',
      skillTags: ['Planning & Organization'],
      metadata: legacyMeta('cq5-23-q1', 'questAdaptiveBuildThePlan.ts', ['Planning']),
    },
  ],
};

export const CAIDEN_K1_GRADE_BANDS: Record<string, CaidenGradeContent> = {
  [CAIDEN_QUEST_1_ID]: CAIDEN_QUEST_1_K1,
  [CAIDEN_QUEST_2_ID]: CAIDEN_QUEST_2_K1,
  [CAIDEN_QUEST_3_ID]: CAIDEN_QUEST_3_K1,
  [CAIDEN_QUEST_4_ID]: CAIDEN_QUEST_4_K1,
  [CAIDEN_QUEST_5_ID]: CAIDEN_QUEST_5_K1,
};

/** Re-export preserved legacy configs for audit/reference */
export { CAIDEN_LEGACY_QUEST_1_CONFIG } from './legacy/quest1WhatComesFirst.legacy';
export { CAIDEN_LEGACY_QUEST_2_CONFIG } from './legacy/quest2ChooseYourNextMove.legacy';
export { CAIDEN_LEGACY_QUEST_3_CONFIG } from './legacy/quest3ResetAndReturn.legacy';
