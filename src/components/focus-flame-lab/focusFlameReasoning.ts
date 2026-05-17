import type { FocusFlameMove } from './focusFlameMoves';
import type { FocusFlameSceneId } from './FocusFlameGame';
import type { BodySignal, Feeling } from './focusFlameSelTypes';

export type WhyStepKind = 'feeling' | 'body' | 'move';

export type WhyOption = {
  id: string;
  label: string;
  isCorrect: boolean;
};

export const STORY_CLUE_B4 = {
  wrongFirst: 'Try again. Look back at what happened in the story.',
  correct: 'Nice noticing. You found the story clue.',
  revealed: 'That was a good try. Let’s look at the clue together.',
} as const;

export function feelingWhyPrompt(feeling: Feeling): string {
  return `Why do you think Caiden feels ${feeling}?`;
}

const FEELING_WHY_BY_SCENE: Record<FocusFlameSceneId, WhyOption[]> = {
  move: [
    { id: 'path-new', label: 'Because he just stepped into a new place.', isCorrect: true },
    { id: 'path-lunch', label: 'Because he ate a bad lunch.', isCorrect: false },
    { id: 'path-stop', label: 'Because he wants to stop playing.', isCorrect: false },
    { id: 'path-shoes', label: 'Because he lost his shoes.', isCorrect: false },
  ],
  ceremony: [
    { id: 'camp-watch', label: 'Because everyone is watching him.', isCorrect: true },
    { id: 'camp-snack', label: 'Because he forgot his favorite snack.', isCorrect: false },
    { id: 'camp-snow', label: 'Because it started snowing.', isCorrect: false },
    { id: 'camp-backpack', label: 'Because B-4 turned into a backpack.', isCorrect: false },
  ],
  cave: [
    { id: 'cave-dark', label: 'Because the cave feels dark and unknown.', isCorrect: true },
    { id: 'cave-party', label: 'Because he is at a birthday party.', isCorrect: false },
    { id: 'cave-pencil', label: 'Because he dropped his pencil.', isCorrect: false },
    { id: 'cave-nap', label: 'Because he wants to take a nap.', isCorrect: false },
  ],
};

export function feelingWhyOptions(sceneId: FocusFlameSceneId): WhyOption[] {
  return FEELING_WHY_BY_SCENE[sceneId];
}

export function bodyWhyPrompt(body: BodySignal): string {
  return `What story clue helps us notice ${body}?`;
}

const BODY_WHY_BY_SCENE: Record<FocusFlameSceneId, WhyOption[]> = {
  move: [
    { id: 'path-thoughts', label: 'His thoughts are moving faster than his feet.', isCorrect: true },
    { id: 'path-lunch2', label: 'He is eating lunch.', isCorrect: false },
    { id: 'path-sleep', label: 'He is sleeping.', isCorrect: false },
    { id: 'path-swim', label: 'He is swimming.', isCorrect: false },
  ],
  ceremony: [
    { id: 'camp-flicker', label: 'His Focus Flame starts to flicker.', isCorrect: true },
    { id: 'camp-trophy', label: 'He is holding a trophy.', isCorrect: false },
    { id: 'camp-bike', label: 'He is riding a bike.', isCorrect: false },
    { id: 'camp-read', label: 'He is reading quietly.', isCorrect: false },
  ],
  cave: [
    {
      id: 'cave-listen',
      label: 'He has to listen closely to what his body is telling him.',
      isCorrect: true,
    },
    { id: 'cave-sing', label: 'He is singing on stage.', isCorrect: false },
    { id: 'cave-soccer', label: 'He is playing soccer.', isCorrect: false },
    { id: 'cave-sandwich', label: 'He is making a sandwich.', isCorrect: false },
  ],
};

export function bodyWhyOptions(sceneId: FocusFlameSceneId): WhyOption[] {
  return BODY_WHY_BY_SCENE[sceneId];
}

export function moveWhyPrompt(move: FocusFlameMove): string {
  return `Why could ${move} help Caiden?`;
}

const MOVE_WHY_BY_MOVE: Record<FocusFlameMove, WhyOption[]> = {
  'Spark Breath': [
    { id: 'spark-calm', label: 'Slow breaths can help big feelings calm down.', isCorrect: true },
    { id: 'spark-cave', label: 'It makes the cave disappear.', isCorrect: false },
    { id: 'spark-freeze', label: 'It makes everyone freeze.', isCorrect: false },
    { id: 'spark-invis', label: 'It turns B-4 invisible.', isCorrect: false },
  ],
  'Anchor Step': [
    { id: 'anchor-feet', label: 'Feeling your feet can help your body feel steady.', isCorrect: true },
    { id: 'anchor-run', label: 'It makes you run faster.', isCorrect: false },
    { id: 'anchor-shoes', label: 'It gives you new shoes.', isCorrect: false },
    { id: 'anchor-lights', label: 'It turns off the lights.', isCorrect: false },
  ],
  'B-4 Pause': [
    { id: 'pause-brain', label: 'Pausing gives your brain a moment before reacting.', isCorrect: true },
    { id: 'pause-skip', label: 'It skips the whole adventure.', isCorrect: false },
    { id: 'pause-vanish', label: 'It makes the feeling vanish forever.', isCorrect: false },
    { id: 'pause-loud', label: 'It makes Caiden louder.', isCorrect: false },
  ],
  'Flame Draw': [
    { id: 'draw-show', label: 'Drawing can help you show what you feel.', isCorrect: true },
    { id: 'draw-erase', label: 'It erases the story.', isCorrect: false },
    { id: 'draw-silent', label: 'It makes the camp silent forever.', isCorrect: false },
    { id: 'draw-sleep', label: 'It makes B-4 sleep.', isCorrect: false },
  ],
  'Brave Choice': [
    { id: 'brave-help', label: 'Asking for help means you don’t have to carry it alone.', isCorrect: true },
    { id: 'brave-giveup', label: 'It means Caiden gives up.', isCorrect: false },
    { id: 'brave-bad', label: 'It makes feelings bad.', isCorrect: false },
    { id: 'brave-hide', label: 'It hides the Focus Flame.', isCorrect: false },
  ],
};

export function moveWhyOptions(move: FocusFlameMove): WhyOption[] {
  return MOVE_WHY_BY_MOVE[move];
}

export function storyClueCorrectOption(options: readonly WhyOption[]): WhyOption {
  const correct = options.find((o) => o.isCorrect);
  if (!correct) throw new Error('Story clue options must include exactly one correct answer.');
  return correct;
}
