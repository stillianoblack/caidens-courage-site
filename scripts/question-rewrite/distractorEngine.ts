import type { NormalizedQuestion } from '../question-audit/types';
import { isJokeOrImpossible } from './jokePatterns';

const CHOICE_IDS = ['a', 'b', 'c', 'd'] as const;

type DistractorSet = {
  best: string;
  plausibleIncomplete: string;
  plausibleFlawed: string;
  obviousWrong: string;
};

function normalizeLength(text: string, targetLen: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= targetLen + 8) return trimmed;
  const cut = trimmed.slice(0, Math.max(targetLen - 3, 20));
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function balanceChoiceLengths(set: DistractorSet): DistractorSet {
  const target = Math.round(
    (set.best.length + set.plausibleIncomplete.length + set.plausibleFlawed.length + set.obviousWrong.length) / 4,
  );
  const clamp = (s: string) => (s.length > target * 1.6 ? normalizeLength(s, target) : s);
  return {
    best: clamp(set.best),
    plausibleIncomplete: clamp(set.plausibleIncomplete),
    plausibleFlawed: clamp(set.plausibleFlawed),
    obviousWrong: clamp(set.obviousWrong),
  };
}

function pickNonJoke(labels: string[], exclude: string): string | null {
  return labels.find((label) => label !== exclude && !isJokeOrImpossible(label)) ?? null;
}

function characterObviousWrong(question: NormalizedQuestion): string {
  const pools: Record<string, string[]> = {
    b4: [
      'Skip naming the feeling and move on',
      'React before checking any body clues',
      'Choose a coping step before naming the feeling',
      'Match the feeling to the loudest reaction only',
    ],
    charlie: [
      'Change two variables at the same time',
      'Skip observing and guess quickly',
      'Stop after one test without recording',
      'Pick the detail that sounds exciting but is unrelated',
    ],
    zeke: [
      'Decide the plan without hearing the group',
      'Step back when the team needs a voice',
      'Assign tasks without matching skills',
      'Speak over others to save time',
    ],
    caiden: [
      'Start the fun part before gathering supplies',
      'Begin at the last minute without a checklist',
      'Tackle every task at once without ordering steps',
      'Skip estimating how much time each step needs',
    ],
    miranda: [
      'Answer from memory without rereading the passage',
      'Pick the first familiar word in the text',
      'Choose a true statement that does not answer the question',
      'Focus on a detail from the wrong paragraph',
    ],
  };
  const pool = pools[question.character] ?? pools.caiden;
  const seed = question.questionId.length + question.missionId.length;
  return pool[seed % pool.length];
}

function characterPlausibleIncomplete(question: NormalizedQuestion, best: string): string {
  const templates: Record<string, string[]> = {
    b4: [
      'Name the feeling but wait before choosing a coping step',
      'Notice the body signal without checking what triggered it',
      'Suggest a calm-down tool before naming the feeling',
    ],
    charlie: [
      'Observe the setup but skip writing a prediction first',
      'Record the result without noting which variable changed',
      'Compare outcomes but test two changes at once',
    ],
    zeke: [
      'Invite one person to join but skip checking how others feel',
      'Share an idea without asking what the group already tried',
      'Offer help but decide the plan alone',
    ],
    caiden: [
      'Start with an easy task but skip the time check',
      'Pack supplies but leave out one required item',
      'Break work into steps but begin with the least urgent part',
    ],
    miranda: [
      'Find a related detail that does not answer the question',
      'Reread once but skip the sentence with the blank',
      'Use a clue from the wrong paragraph',
    ],
  };
  const pool = templates[question.character] ?? templates.caiden;
  const pick = pool[question.questionId.charCodeAt(question.questionId.length - 1) % pool.length];
  if (pick === best) return pool[(pool.indexOf(pick) + 1) % pool.length];
  return pick;
}

function characterPlausibleFlawed(question: NormalizedQuestion, best: string): string {
  const templates: Record<string, string[]> = {
    b4: [
      'Treat every big reaction as anger only',
      'Assume one body clue tells the whole story',
      'Jump to fixing the problem before naming the feeling',
    ],
    charlie: [
      'Assume the first result proves the hypothesis forever',
      'Focus on color or size instead of the tested variable',
      'Explain the outcome with a guess that ignores the data',
    ],
    zeke: [
      'Let the loudest voice choose for everyone',
      'Agree quickly to avoid conflict even if the plan is weak',
      'Split tasks randomly without matching strengths',
    ],
    caiden: [
      'Estimate time without subtracting from the deadline',
      'Buy the cheaper item even when both are required today',
      'Multitask two urgent jobs and finish neither well',
    ],
    miranda: [
      'Match a keyword from the passage without checking meaning',
      'Infer motive with no evidence from the text',
      'Choose the longest sentence as the answer',
    ],
  };
  const pool = templates[question.character] ?? templates.caiden;
  const pick = pool[(question.questionId.charCodeAt(0) + question.missionNumber) % pool.length];
  if (pick === best) return pool[(pool.indexOf(pick) + 1) % pool.length];
  return pick;
}

function refineBestAnswer(question: NormalizedQuestion): string {
  let best = question.correctAnswerLabel.trim();
  if (isJokeOrImpossible(best)) {
    const alt = question.choices.find(
      (c) => c.id !== question.correctAnswerId && !isJokeOrImpossible(c.label),
    );
    if (alt) best = alt.label;
  }
  return best;
}

function salvageFromExisting(question: NormalizedQuestion, best: string): DistractorSet {
  const others = question.choices
    .filter((c) => c.label !== best)
    .map((c) => c.label)
    .filter((label) => !isJokeOrImpossible(label));

  let plausibleIncomplete =
    pickNonJoke(others, best) ?? characterPlausibleIncomplete(question, best);
  let remaining = others.filter((l) => l !== plausibleIncomplete);
  let plausibleFlawed =
    pickNonJoke(remaining, best) ?? characterPlausibleFlawed(question, best);
  remaining = remaining.filter((l) => l !== plausibleFlawed);
  let obviousWrong =
    pickNonJoke(remaining, best) ?? characterObviousWrong(question);

  if (isJokeOrImpossible(plausibleIncomplete)) plausibleIncomplete = characterPlausibleIncomplete(question, best);
  if (isJokeOrImpossible(plausibleFlawed)) plausibleFlawed = characterPlausibleFlawed(question, best);
  if (isJokeOrImpossible(obviousWrong)) obviousWrong = characterObviousWrong(question);

  return balanceChoiceLengths({
    best,
    plausibleIncomplete,
    plausibleFlawed,
    obviousWrong,
  });
}

export function buildDistractorSet(question: NormalizedQuestion): DistractorSet {
  const best = refineBestAnswer(question);
  const nonBest = question.choices
    .filter((c) => c.label !== best)
    .map((c) => c.label);
  const cleanNonBest = nonBest.filter((label) => !isJokeOrImpossible(label));

  if (cleanNonBest.length >= 3) {
    const sorted = [...cleanNonBest].sort((a, b) => a.length - b.length);
    return balanceChoiceLengths({
      best,
      plausibleIncomplete: sorted[1],
      plausibleFlawed: sorted[2],
      obviousWrong: sorted[0],
    });
  }

  return salvageFromExisting(question, best);
}

export function choiceIdFromIndex(index: 0 | 1 | 2 | 3): 'a' | 'b' | 'c' | 'd' {
  return CHOICE_IDS[index];
}
