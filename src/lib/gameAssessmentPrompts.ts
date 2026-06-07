import type { GameQuestion } from '../types/gameAssessment';
import { isContextClueQuestion, isMissingLetterQuestion, isSequenceQuestion, isTrailNotebookQuestion, isTrueFalseQuestion } from '../types/gameAssessment';

export function getGamePromptHint(question: GameQuestion): string {
  if (isTrailNotebookQuestion(question)) {
    return 'Read the trail clue, think about what happened, then choose the best answer.';
  }
  if (isContextClueQuestion(question)) {
    return 'Detectives use context clues to understand words they don\'t know. Let\'s investigate.';
  }
  if (isMissingLetterQuestion(question)) {
    return 'Read the clue with missing letters. Choose the word that restores it, then tap Check.';
  }
  if (isSequenceQuestion(question)) {
    return 'Tap each event in the order they happened, then tap Check.';
  }
  if (isTrueFalseQuestion(question)) {
    return 'Choose True or False, then tap Check.';
  }
  return 'Choose the best answer, then tap Check.';
}
