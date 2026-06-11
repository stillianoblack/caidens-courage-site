export type GuideCharacter = 'b4' | 'dr-victoria' | 'uncle-t' | 'reflection-coach';

export type PreSubmitGuideInput = {
  character?: GuideCharacter;
  hasSelection?: boolean;
  hasHints?: boolean;
  phase?: 'landing' | 'quiz';
};

const NEUTRAL_SELECTED = [
  'Ready? Press Check when you are set.',
  'You picked an answer — press Check to lock it in.',
];

const NEUTRAL_IDLE = [
  'Choose your answer, then press Check.',
  'Read the question, pick an answer, then press Check.',
];

const NEUTRAL_HINT_AVAILABLE = [
  'Need help? You can use a hint after you check.',
  'Stuck? A hint is available once you try.',
];

export function getPreSubmitGuideMessage(input: PreSubmitGuideInput = {}): string {
  const { hasSelection = false, hasHints = false, phase = 'quiz' } = input;

  if (phase === 'landing') {
    if (input.character === 'dr-victoria') {
      return 'Start training to unlock reflection guidance after each scenario.';
    }
    if (input.character === 'uncle-t') {
      return 'Start coaching to unlock guidance after each scenario.';
    }
    return 'Start the mission to unlock B-4 tips after you check your answers.';
  }

  if (hasSelection) {
    return NEUTRAL_SELECTED[0];
  }

  if (hasHints) {
    return NEUTRAL_HINT_AVAILABLE[0];
  }

  return NEUTRAL_IDLE[0];
}

export function getGuidePanelLabel(character: GuideCharacter = 'b4'): string {
  switch (character) {
    case 'dr-victoria':
      return 'Dr. Victoria Says';
    case 'uncle-t':
      return 'Uncle T Says';
    case 'reflection-coach':
      return 'Reflection Coach';
    default:
      return 'B-4 Lock-In Tips';
  }
}
