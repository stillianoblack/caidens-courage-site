import type { GameAnswerValue, GameQuestion } from '../types/gameAssessment';
import {
  isChoiceQuestion,
  isSequenceQuestion,
  isTrueFalseQuestion,
} from '../types/gameAssessment';

export function isGameAnswerComplete(question: GameQuestion, answer: GameAnswerValue): boolean {
  if (answer === null || answer === undefined) return false;

  if (isSequenceQuestion(question)) {
    return Array.isArray(answer) && answer.length === question.items.length;
  }

  if (isTrueFalseQuestion(question)) {
    return typeof answer === 'boolean';
  }

  if (isChoiceQuestion(question)) {
    return typeof answer === 'string' && answer.length > 0;
  }

  return false;
}

export function isGameAnswerCorrect(question: GameQuestion, answer: GameAnswerValue): boolean {
  if (!isGameAnswerComplete(question, answer)) return false;

  if (isSequenceQuestion(question)) {
    const order = answer as string[];
    return question.correctOrder.every((id, index) => order[index] === id);
  }

  if (isTrueFalseQuestion(question)) {
    return answer === question.correctAnswer;
  }

  if (isChoiceQuestion(question)) {
    return answer === question.correctId;
  }

  return false;
}

export function getCorrectFeedbackMessage(question: GameQuestion): string {
  return question.correctFeedback ?? question.feedbackCorrect;
}

export function getIncorrectFeedbackMessage(question: GameQuestion): string {
  return question.incorrectFeedback ?? question.feedbackIncorrect;
}

export function getGameQuestionFeedback(
  question: GameQuestion,
  answer: GameAnswerValue,
): { correct: boolean; message: string } {
  const correct = isGameAnswerCorrect(question, answer);
  return {
    correct,
    message: correct ? getCorrectFeedbackMessage(question) : getIncorrectFeedbackMessage(question),
  };
}
