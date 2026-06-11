import type { GameAnswerValue } from './gameAssessment';

/** Interaction state machine for commit-before-feedback question flows. */
export type QuestionInteractionState =
  | 'idle'
  | 'selected'
  | 'submitted_correct'
  | 'submitted_incorrect'
  | 'hint_1_used'
  | 'hint_2_used'
  | 'completed';

/** Per-question attempt metadata stored in answers_json._attempts. */
export type QuestionAttemptRecord = {
  questionId: string;
  first_selected_answer: GameAnswerValue;
  final_selected_answer: GameAnswerValue;
  is_correct_first_try: boolean;
  is_correct_final: boolean;
  attempts_count: number;
  hints_used_count: number;
  completed_at: string;
};

export type QuestionContentHints = {
  hints?: string[];
  correctFeedback?: string;
  incorrectFeedback?: string;
  explainMore?: string;
  skillTags?: string[];
  gradeBand?: string;
  character?: string;
};

export type QuestionAttemptsMap = Record<string, QuestionAttemptRecord>;

/** Enriched answers_json shape with attempt metadata. */
export type EnrichedAnswersJson = {
  answers: Record<string, GameAnswerValue>;
  _attempts?: QuestionAttemptsMap;
};
