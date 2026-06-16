import type { NormalizedQuestion, WeakDistractorReason } from './types';

const JOKE_PATTERNS = [
  /\bday of the week\b/i,
  /\bdisappeared\b/i,
  /\bmagic\b/i,
  /\bafraid of\b/i,
  /\bforever\b/i,
  /\bhide (forever|under|behind)\b/i,
  /\bswimming pool\b/i,
  /\bbecome an orange\b/i,
  /\bcharge (its|his|her) phone\b/i,
];

const UNSAFE_PATTERNS = [
  /\byell\b/i,
  /\bpunch\b/i,
  /\bscream\b/i,
  /\bcheat\b/i,
  /\blie\b/i,
  /\brun away\b/i,
  /\bgive up\b/i,
  /\bignore (it|them|everyone)\b/i,
];

const VILLAIN_PATTERNS = [
  /\bignore\b/i,
  /\byell\b/i,
  /\bpunch\b/i,
  /\bcheat\b/i,
  /\blie\b/i,
  /\brun away\b/i,
  /\bgive up\b/i,
  /\bhide\b/i,
  /\bblame\b/i,
];

const MORAL_GIVEAWAY = /\b(kind|help|share|calm|brave|respect|listen|apologize|cooperat|support)\b/i;
const CLUE_WORDS = /\b(always|never|definitely|obviously|clearly|must|only)\b/i;

export function analyzeWeakDistractors(question: NormalizedQuestion): WeakDistractorReason[] {
  const reasons: WeakDistractorReason[] = [];
  const distractors = question.choices.filter((c) => c.id !== question.correctAnswerId);
  const correct = question.correctAnswerLabel;

  for (const distractor of distractors) {
    if (JOKE_PATTERNS.some((pattern) => pattern.test(distractor.label))) {
      reasons.push('joke_cartoony_distractor');
      break;
    }
  }

  for (const distractor of distractors) {
    if (UNSAFE_PATTERNS.some((pattern) => pattern.test(distractor.label))) {
      reasons.push('obviously_unsafe_wrong');
      break;
    }
  }

  const distractorLens = distractors.map((d) => d.label.length);
  if (distractorLens.length && correct.length > Math.max(...distractorLens) + 12) {
    reasons.push('correct_answer_too_long');
  }

  if (MORAL_GIVEAWAY.test(correct) && distractors.every((d) => !MORAL_GIVEAWAY.test(d.label))) {
    reasons.push('moral_giveaway');
  }

  const normalized = question.choices.map((c) => c.label.toLowerCase().trim());
  if (new Set(normalized).size !== normalized.length) {
    reasons.push('repeated_option');
  }

  if (CLUE_WORDS.test(correct)) {
    reasons.push('correct_answer_clue_words');
  }

  if (
    distractors.length >= 3 &&
    distractors.every((d) => VILLAIN_PATTERNS.some((pattern) => pattern.test(d.label)))
  ) {
    reasons.push('all_wrong_answers_villain');
  }

  return [...new Set(reasons)];
}

export function weakDistractorLabel(reason: WeakDistractorReason): string {
  const labels: Record<WeakDistractorReason, string> = {
    joke_cartoony_distractor: 'Joke/cartoony distractor',
    obviously_unsafe_wrong: 'Obviously unsafe/wrong distractor',
    correct_answer_too_long: 'Correct answer much longer than distractors',
    moral_giveaway: 'Moral giveaway in correct answer',
    repeated_option: 'Repeated answer option',
    correct_answer_clue_words: 'Correct answer has clue words',
    all_wrong_answers_villain: 'All wrong answers are villain answers',
  };
  return labels[reason];
}
