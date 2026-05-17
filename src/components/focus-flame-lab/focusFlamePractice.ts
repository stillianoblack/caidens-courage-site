import type { FocusFlameMove } from './focusFlameMoves';

export type PracticeInteraction = 'hold-breathe' | 'tap' | 'countdown';

export type FocusFlamePracticeContent = {
  title: string;
  copy: string;
  buttonLabel: string;
  successMessage: string;
  interaction: PracticeInteraction;
};

export const FOCUS_FLAME_PRACTICE_BY_MOVE: Record<FocusFlameMove, FocusFlamePracticeContent> = {
  'Spark Breath': {
    title: 'Breathe with B-4',
    copy: 'Take one slow breath in… then breathe out.',
    buttonLabel: 'Hold to breathe',
    successMessage: 'Nice. You can use slow breaths when your flame feels too loud.',
    interaction: 'hold-breathe',
  },
  'Anchor Step': {
    title: 'Feel your feet',
    copy: 'Press your feet down and notice the ground.',
    buttonLabel: 'I feel my feet',
    successMessage: 'Good. Your feet can help you feel steady.',
    interaction: 'tap',
  },
  'B-4 Pause': {
    title: 'Pause first',
    copy: 'Before reacting, take one quiet pause.',
    buttonLabel: 'Take a pause',
    successMessage: 'Nice pause. Small pauses can help big feelings slow down.',
    interaction: 'countdown',
  },
  'Flame Draw': {
    title: 'Draw your feelings',
    copy: 'Imagine drawing what your feeling looks like.',
    buttonLabel: 'I can draw it',
    successMessage: 'Great. Drawing can help your flame make sense.',
    interaction: 'tap',
  },
  'Brave Choice': {
    title: 'Ask for help',
    copy: 'Think of one person you trust.',
    buttonLabel: 'I know someone',
    successMessage: 'That’s brave. Asking for help can steady your flame.',
    interaction: 'tap',
  },
};

export const PRACTICE_BRIDGE_COPY =
  'You did it. Today, when you’re with friends, family, or teachers, remember to steady your flame.';

export const PRACTICE_BRIDGE_CTA_LEAD = 'Let’s see what you earned.';

export const PRACTICE_HOLD_MS = 3000;

export const PRACTICE_COUNTDOWN_SECONDS = 3;
