import type { GameAnswerValue } from '../types/gameAssessment';
import type { EnrichedAnswersJson, QuestionAttemptRecord, QuestionAttemptsMap } from '../types/questionInteraction';

export function mergeAttemptIntoAnswersJson(
  answers: Record<string, GameAnswerValue>,
  attempts: QuestionAttemptsMap,
): EnrichedAnswersJson {
  return {
    answers,
    _attempts: attempts,
  };
}

export function scoreFromFirstAttempts(attempts: QuestionAttemptsMap): number {
  return Object.values(attempts).filter((record) => record.is_correct_first_try).length;
}

export function scoreFromFinalAttempts(attempts: QuestionAttemptsMap): number {
  return Object.values(attempts).filter((record) => record.is_correct_final).length;
}

export function buildAttemptsMap(
  records: QuestionAttemptRecord[],
): QuestionAttemptsMap {
  return Object.fromEntries(records.map((record) => [record.questionId, record]));
}
