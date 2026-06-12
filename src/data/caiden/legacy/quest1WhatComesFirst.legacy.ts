import type { GameAssessmentConfig } from '../../../types/gameAssessment';
import { CAIDEN_MISSION_AVATAR } from '../sharedAssets';

export const CAIDEN_LEGACY_QUEST_1_ID = 'quest-1-legacy';

export const CAIDEN_LEGACY_QUEST_1_CONFIG: GameAssessmentConfig = {
  id: CAIDEN_LEGACY_QUEST_1_ID,
  fileNumber: 1,
  decorVariant: 'caiden',
  presentationStyle: 'focus_quest',
  ...CAIDEN_MISSION_AVATAR,
  landing: {
    eyebrow: 'QUEST #1',
    title: "Caiden's Focus Quest",
    subtitle: 'What Comes First?',
    body: 'Help Caiden choose what to do first, break down big tasks, spot distractions, and bring his attention back.',
    cta: 'Start Quest',
  },
  complete: {
    title: 'Focus Starter Badge Earned!',
    message:
      'You helped Caiden choose first steps, spot distractions, reset emotions, and bring his attention back.',
    badges: ['Focus Starter', 'First Step Hero', 'Focus Flame Builder'],
  },
  questions: [
    {
      id: 'cq1-q1',
      type: 'multiple_choice',
      clueCard: {
        variant: 'focus_quest',
        label: 'MISSION CARD',
        tag: 'GETTING STARTED',
        text: 'Camp bag, homework, drawing idea, and a clock — the Camp Challenge starts soon.',
        accent: 'camp-pack',
      },
      story:
        'Caiden has homework, a drawing idea, and a camp bag to pack. The Camp Challenge starts soon.',
      question: 'What should Caiden do first?',
      prompt: 'What should Caiden do first?',
      options: [
        { id: 'draw', label: 'Start a new drawing' },
        { id: 'pack', label: 'Pack the items he needs for camp' },
        { id: 'snack', label: 'Look for a snack' },
        { id: 'wait', label: 'Wait until later' },
      ],
      correctId: 'pack',
      feedbackCorrect: 'Great choice. Caiden focused on what needed to happen first.',
      feedbackIncorrect:
        'Try again. The Camp Challenge starts soon, so Caiden should prepare what he needs.',
      lockInTipsCorrect: [
        'Say the first step out loud before starting.',
        'Clear one small area so packing feels easier.',
        'Set a short timer for the prep burst.',
      ],
      lockInTipsIncorrect: [
        'Ask: what has a deadline coming up first?',
        'Pick the task tied to the Camp Challenge.',
        'Try one small prep step and check again.',
      ],
    },
    {
      id: 'cq1-q2',
      type: 'multiple_choice',
      clueCard: {
        variant: 'focus_quest',
        label: 'SMALL STEP CARD',
        tag: 'BREAKING IT DOWN',
        text: 'A messy room with clothes, books, and a glowing first-step marker.',
        accent: 'small-step',
      },
      story:
        'Caiden feels overwhelmed because his room is messy. B-4 tells him to choose one small step.',
      question: 'What is the best first step?',
      prompt: 'What is the best first step?',
      options: [
        { id: 'whole', label: 'Clean the whole room at once' },
        { id: 'bed', label: 'Throw everything under the bed' },
        { id: 'clothes', label: 'Pick up the clothes first' },
        { id: 'giveup', label: 'Give up' },
      ],
      correctId: 'clothes',
      feedbackCorrect: 'Yes. One small step makes a big task easier.',
      feedbackIncorrect: 'Think smaller. Caiden does not need to fix everything at once.',
      lockInTipsCorrect: [
        'Name one category to tackle first (clothes, books, trash).',
        'Celebrate finishing that slice before the next.',
        'Use a 5-minute burst so the step stays small.',
      ],
      lockInTipsIncorrect: [
        'Shrink the goal until it feels doable in one sitting.',
        'Pick the easiest visible pile first.',
        'Breathe once, then choose one item to move.',
      ],
    },
    {
      id: 'cq1-q3',
      type: 'multiple_choice',
      clueCard: {
        variant: 'focus_quest',
        label: 'DISTRACTION ALERT',
        tag: 'SPOT THE DISTRACTION',
        text: 'Caiden writes in his journal while a tablet lights up nearby.',
        accent: 'distraction',
      },
      story:
        'Caiden is trying to finish his reflection journal. His tablet keeps lighting up beside him.',
      question: 'What should Caiden do?',
      prompt: 'What should Caiden do?',
      options: [
        { id: 'check', label: 'Check every notification' },
        { id: 'move', label: 'Move the tablet away until he finishes' },
        { id: 'stop', label: 'Stop writing' },
        { id: 'game', label: 'Open a game' },
      ],
      correctId: 'move',
      feedbackCorrect: 'Correct. Moving the distraction away helps Caiden protect his focus.',
      feedbackIncorrect: "The tablet is pulling Caiden's attention away. What would help him focus?",
      lockInTipsCorrect: [
        'Move distractions out of arm\'s reach before deep work.',
        'Silence non-essential notifications for this block.',
        'Tell a grown-up your focus plan so they can cheer you on.',
      ],
      lockInTipsIncorrect: [
        'Notice what is pulling attention away from the journal.',
        'Try face-down, another room, or a focus timer.',
        'Return to one sentence in the journal after resetting.',
      ],
    },
    {
      id: 'cq1-q4',
      type: 'multiple_choice',
      clueCard: {
        variant: 'focus_quest',
        label: 'QUICK PACK CHALLENGE',
        tag: 'TIME AWARENESS',
        text: '10 minutes left — water bottle, pencil, notebook, snack, toy, coloring page.',
        accent: 'timer',
      },
      story:
        'Caiden has 10 minutes before the group leaves. He still needs his water bottle, pencil, and notebook.',
      question: 'What should he do?',
      prompt: 'What should he do?',
      options: [
        { id: 'grab', label: 'Grab the three things he needs' },
        { id: 'color', label: 'Start coloring a new page' },
        { id: 'talk', label: 'Talk for 20 minutes' },
        { id: 'sit', label: 'Sit down and wait' },
      ],
      correctId: 'grab',
      feedbackCorrect: 'Right. Caiden used his time to get what he needed.',
      feedbackIncorrect: 'He only has 10 minutes. Which choice helps him get ready?',
    },
    {
      id: 'cq1-q5',
      type: 'multiple_choice',
      clueCard: {
        variant: 'focus_quest',
        label: 'FOCUS RESET CARD',
        tag: 'EMOTIONAL PAUSE',
        text: 'Caiden feels frustrated — a warm Focus Flame breath and B-4 nearby.',
        accent: 'focus-reset',
      },
      story:
        'Caiden gets frustrated when his answer is wrong. His face feels hot, and his hands squeeze into fists.',
      question: 'What is a strong focus move?',
      prompt: 'What is a strong focus move?',
      options: [
        { id: 'rip', label: 'Rip the paper' },
        { id: 'blame', label: 'Blame someone else' },
        { id: 'breath', label: 'Take a breath and try again' },
        { id: 'quit', label: 'Quit the activity forever' },
      ],
      correctId: 'breath',
      feedbackCorrect: 'Yes. A breath gives Caiden a moment to reset.',
      feedbackIncorrect: 'Caiden needs a move that helps him calm down and try again.',
    },
    {
      id: 'cq1-q6',
      type: 'multiple_choice',
      clueCard: {
        variant: 'focus_quest',
        label: 'WEEKLY PLAN CARD',
        tag: 'TIMELINE BUILDER',
        text: 'Monday through Friday with small daily focus steps.',
        accent: 'weekly-plan',
      },
      story: 'Caiden wants to finish a project before Friday. Today is Monday.',
      question: 'What should he do?',
      prompt: 'What should he do?',
      options: [
        { id: 'friday', label: 'Wait until Friday morning' },
        { id: 'plan', label: 'Make a small plan for each day' },
        { id: 'forget', label: 'Forget about it' },
        { id: 'fun', label: 'Do only the fun parts' },
      ],
      correctId: 'plan',
      feedbackCorrect: 'Exactly. Small steps across the week make the project easier.',
      feedbackIncorrect: 'Waiting until the last minute makes the task harder.',
    },
    {
      id: 'cq1-q7',
      type: 'multiple_choice',
      clueCard: {
        variant: 'focus_quest',
        label: 'PRIORITY SIGNAL',
        tag: 'MAIN TASK',
        text: 'The teacher explains directions while distractions pull Caiden away.',
        accent: 'priority',
      },
      story:
        'Caiden has three things to do: listen to directions, sharpen his pencil, and tell a joke. The teacher is explaining the challenge.',
      question: 'What should Caiden focus on first?',
      prompt: 'What should Caiden focus on first?',
      options: [
        { id: 'listen', label: 'Listening to directions' },
        { id: 'joke', label: 'Telling the joke' },
        { id: 'pencil', label: 'Sharpening his pencil loudly' },
        { id: 'look', label: 'Looking around the room' },
      ],
      correctId: 'listen',
      feedbackCorrect: 'Correct. Directions help Caiden know what to do next.',
      feedbackIncorrect: 'The teacher is explaining the challenge. That is the main task right now.',
    },
    {
      id: 'cq1-q8',
      type: 'multiple_choice',
      clueCard: {
        variant: 'focus_quest',
        label: 'FOCUS FLAME REFLECTION',
        tag: 'FOCUS REFLECTION',
        text: 'Caiden holds a Focus Flame badge with B-4 beside him.',
        accent: 'reflection',
      },
      story:
        'Caiden learns that focus does not mean being perfect. It means bringing your attention back when it wanders.',
      question: 'What did Caiden learn?',
      prompt: 'What did Caiden learn?',
      options: [
        { id: 'never', label: 'Focus means never getting distracted' },
        { id: 'control', label: 'Focus means trying to control everyone' },
        { id: 'return', label: 'Focus means noticing distractions and coming back' },
        { id: 'rush', label: 'Focus means rushing' },
      ],
      correctId: 'return',
      feedbackCorrect: 'Yes. Focus means returning your attention, not being perfect.',
      feedbackIncorrect: 'Focus is not about never getting distracted. It is about coming back.',
    },
  ],
};
