import type { GameChoiceQuestion, GameTrueFalseQuestion } from '../../types/gameAssessment';
import { isChoiceQuestion } from '../../types/gameAssessment';
import {
  shuffleMissionQuestionChoices,
  stableMissionSeedHash,
} from '../missionAnswerShuffle';

function makeChoiceQuestion(correctId: string): GameChoiceQuestion {
  return {
    id: 'q-test',
    type: 'multiple_choice',
    prompt: 'Which task fits best?',
    feedbackCorrect: 'Nice!',
    feedbackIncorrect: 'Try again.',
    options: [
      { id: 'a', label: 'Option A' },
      { id: 'b', label: 'Option B' },
      { id: 'c', label: 'Option C' },
      { id: 'd', label: 'Option D' },
    ],
    correctId,
  };
}

describe('missionAnswerShuffle', () => {
  const seed = { childId: 'child-1', missionId: 'quest-1', questionId: 'q-test' };

  test('stableMissionSeedHash is deterministic', () => {
    const input = 'child-1::quest-1::q-test';
    expect(stableMissionSeedHash(input)).toBe(stableMissionSeedHash(input));
  });

  test('shuffle preserves option ids and correctId mapping', () => {
    const original = makeChoiceQuestion('b');
    const shuffled = shuffleMissionQuestionChoices(original, seed);
    expect(isChoiceQuestion(shuffled)).toBe(true);
    if (!isChoiceQuestion(shuffled)) return;

    expect(shuffled.options.map((option) => option.id).sort()).toEqual(['a', 'b', 'c', 'd']);
    expect(shuffled.correctId).toBe('b');
    expect(shuffled.prompt).toBe(original.prompt);
  });

  test('shuffle order is stable for the same seed', () => {
    const original = makeChoiceQuestion('a');
    const first = shuffleMissionQuestionChoices(original, seed);
    const second = shuffleMissionQuestionChoices(original, seed);
    expect(isChoiceQuestion(first) && isChoiceQuestion(second)).toBe(true);
    if (!isChoiceQuestion(first) || !isChoiceQuestion(second)) return;

    expect(first.options.map((option) => option.id)).toEqual(
      second.options.map((option) => option.id),
    );
  });

  test('different question ids produce different option orders', () => {
    const original = makeChoiceQuestion('a');
    const q1 = shuffleMissionQuestionChoices(original, { ...seed, questionId: 'q-1' });
    const q2 = shuffleMissionQuestionChoices(original, { ...seed, questionId: 'q-2' });
    expect(isChoiceQuestion(q1) && isChoiceQuestion(q2)).toBe(true);
    if (!isChoiceQuestion(q1) || !isChoiceQuestion(q2)) return;

    const order1 = q1.options.map((option) => option.id).join(',');
    const order2 = q2.options.map((option) => option.id).join(',');
    expect(order1).not.toBe(order2);
  });

  test('non-choice questions are unchanged', () => {
    const question: GameTrueFalseQuestion = {
      id: 'tf-1',
      type: 'true_false',
      prompt: 'True or false?',
      feedbackCorrect: 'Yes',
      feedbackIncorrect: 'No',
      correctAnswer: true,
    };
    expect(shuffleMissionQuestionChoices(question, seed)).toBe(question);
  });
});
