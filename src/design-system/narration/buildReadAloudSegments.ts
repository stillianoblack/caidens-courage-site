import { resolveGameplayQuestionPrompt } from '../../lib/gameplayQuestionDisplay';
import type { GameQuestion } from '../../types/gameAssessment';
import {
  isSequenceQuestion,
  isTrueFalseQuestion,
} from '../../types/gameAssessment';

const CHOICE_ORDINALS = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
];

function choiceLabel(index: number, text: string): string {
  const ordinal = CHOICE_ORDINALS[index] ?? String(index + 1);
  return `Choice ${ordinal}. ${text}`;
}

export type ReadAloudParts = {
  scenarioTitle?: string;
  scenarioDescription?: string;
  question?: string;
  choices?: string[];
};

export function buildReadAloudSegmentsFromParts(parts: ReadAloudParts): string[] {
  const segments: string[] = [];

  if (parts.scenarioTitle?.trim()) segments.push(parts.scenarioTitle.trim());
  if (parts.scenarioDescription?.trim()) segments.push(parts.scenarioDescription.trim());
  if (parts.question?.trim()) segments.push(parts.question.trim());

  for (const choice of parts.choices ?? []) {
    if (choice.trim()) segments.push(choice.trim());
  }

  return segments;
}

export function buildReadAloudSegmentsFromGameQuestion(question: GameQuestion): string[] {
  const scenarioTitle =
    question.clueCard?.tag?.trim() ||
    question.clueCard?.label?.trim() ||
    undefined;

  const scenarioDescription =
    question.clueCard?.text?.trim() ||
    question.story?.trim() ||
    question.detectiveNote?.trim() ||
    undefined;

  const questionText = resolveGameplayQuestionPrompt(question).trim();
  const choices: string[] = [];

  if (isTrueFalseQuestion(question)) {
    choices.push(choiceLabel(0, 'True.'));
    choices.push(choiceLabel(1, 'False.'));
  } else if (isSequenceQuestion(question)) {
    question.items.forEach((item, index) => {
      const ordinal = CHOICE_ORDINALS[index] ?? String(index + 1);
      choices.push(`Step ${ordinal}. ${item.label}`);
    });
  } else if ('options' in question && question.options?.length) {
    question.options.forEach((option, index) => {
      choices.push(choiceLabel(index, option.label));
    });
  }

  return buildReadAloudSegmentsFromParts({
    scenarioTitle,
    scenarioDescription,
    question: questionText,
    choices,
  });
}

export type ReadAloudScope = 'full' | 'coach_only';

/**
 * Before Check: scenario, question, choices, and coach hint.
 * After Check (Continue visible): coach feedback only — no repeating the question.
 */
export function buildGameplayReadAloudSegments(
  questionSegments: string[],
  coachSegments: string[],
  scope: ReadAloudScope = 'full',
): string[] {
  if (scope === 'coach_only' && coachSegments.length > 0) {
    return coachSegments;
  }
  return [...questionSegments, ...coachSegments];
}
