/**
 * Four-choice authoring pattern:
 * - 1 best answer (correct)
 * - 2 plausible distractors (reasonable but weaker in context)
 * - 1 obvious wrong (clearly eliminable — keeps younger learners from shutting down)
 *
 * Correct answer slot rotates by question id so "always pick A" does not work.
 */
export type FourChoiceSet = {
  best: string;
  plausible: readonly [string, string];
  obvious: string;
};

export type FourChoiceResult = {
  choices: readonly [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function buildFourChoices(set: FourChoiceSet, questionId: string): FourChoiceResult {
  const hash = hashSeed(questionId);
  const correctIndex = (hash % 4) as 0 | 1 | 2 | 3;
  const obviousOffset = 1 + ((hash >>> 3) % 3);
  const obviousIndex = ((correctIndex + obviousOffset) % 4) as 0 | 1 | 2 | 3;

  const choices: string[] = ['', '', '', ''];
  choices[correctIndex] = set.best;
  choices[obviousIndex] = set.obvious;

  const openSlots = ([0, 1, 2, 3] as const).filter(
    (slot) => slot !== correctIndex && slot !== obviousIndex,
  );
  choices[openSlots[0]] = set.plausible[0];
  choices[openSlots[1]] = set.plausible[1];

  return {
    choices: choices as [string, string, string, string],
    correctIndex,
  };
}

export function choiceLabel(index: 0 | 1 | 2 | 3): 'a' | 'b' | 'c' | 'd' {
  return (['a', 'b', 'c', 'd'] as const)[index];
}
