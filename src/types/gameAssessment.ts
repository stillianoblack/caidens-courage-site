export type GameQuestionType =
  | 'multiple_choice'
  | 'select_clue'
  | 'fill_blank'
  | 'grammar'
  | 'missing_letter'
  | 'sequence_order'
  | 'true_false'
  | 'observation'
  | 'final_mystery'
  | 'context_clue';

export type GameChoiceOption = {
  id: string;
  label: string;
};

export type MirandaClueAccent =
  | 'note'
  | 'ember'
  | 'magnifier'
  | 'timeline'
  | 'clue-stack'
  | 'emotion'
  | 'check'
  | 'flame'
  | 'pin';

export type MirandaTrailFocus =
  | 'gym_footprints'
  | 'footprints_library'
  | 'table_clue'
  | 'inference_trail'
  | 'character_miranda'
  | 'observation_skill'
  | 'prediction_next'
  | 'lesson_complete';

export type MirandaClueCardData = {
  variant: 'case_file' | 'grammar_board' | 'missing_letter' | 'trail_notebook';
  label: string;
  tag: string;
  text: string;
  accent?: MirandaClueAccent;
  /** missing_letter — word with underscores (auto-extracted from story when omitted) */
  clueWord?: string;
  /** trail_notebook — which part of the footprint trail to emphasize */
  trailFocus?: MirandaTrailFocus;
};

export type CaidenQuestAccent =
  | 'camp-pack'
  | 'small-step'
  | 'distraction'
  | 'timer'
  | 'focus-reset'
  | 'weekly-plan'
  | 'priority'
  | 'reflection'
  | 'ask-help'
  | 'attention-return'
  | 'take-turns'
  | 'healthy-break'
  | 'one-step'
  | 'responsible-choice'
  | 'recover-mistake'
  | 'growth-reflection';

export type GameScoreMessage = {
  min: number;
  max: number;
  message: string;
};

export type CaidenQuestClueCardData = {
  variant: 'focus_quest';
  label: string;
  tag: string;
  text: string;
  accent?: CaidenQuestAccent;
};

export type VictoriaReflectionAccent =
  | 'clipboard'
  | 'classroom'
  | 'thought-bubble'
  | 'behavior-need'
  | 'support-strategy';

export type VictoriaReflectionClueCardData = {
  variant: 'reflection_card';
  label: string;
  tag: string;
  text: string;
  accent?: VictoriaReflectionAccent;
};

export type ClueCardData = MirandaClueCardData | CaidenQuestClueCardData | VictoriaReflectionClueCardData;

export type GameQuestionBase = {
  id: string;
  type: GameQuestionType;
  prompt: string;
  story?: string;
  question?: string;
  /** Illustrated clue graphic above the question */
  clueCard?: ClueCardData;
  /** context_clue — sentence with the target word in context */
  detectiveNote?: string;
  /** context_clue — vocabulary word to define */
  vocabularyWord?: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
};

export type GameChoiceQuestion = GameQuestionBase & {
  options: GameChoiceOption[];
  correctId: string;
};

export type GameTrueFalseQuestion = GameQuestionBase & {
  correctAnswer: boolean;
};

export type GameSequenceQuestion = GameQuestionBase & {
  items: GameChoiceOption[];
  correctOrder: string[];
};

export type GameQuestion = GameChoiceQuestion | GameTrueFalseQuestion | GameSequenceQuestion;

export type GameAssessmentLanding = {
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  cta: string;
};

export type GameAssessmentComplete = {
  title: string;
  message: string;
  badges: string[];
  scoreMessages?: GameScoreMessage[];
};

export type GameAssessmentConfig = {
  id: string;
  /** Mystery file number shown in hub cards */
  fileNumber?: number;
  landing: GameAssessmentLanding;
  complete: GameAssessmentComplete;
  questions: GameQuestion[];
  /** Landing hero image */
  avatarSrc?: string;
  avatarAlt?: string;
  /** Circular avatar beside quiz prompt (falls back to avatarSrc) */
  quizAvatarSrc?: string;
  /** Decorative background variant for GameBackgroundDecor */
  decorVariant?: 'default' | 'miranda' | 'caiden' | 'victoria';
  /** Unique quiz presentation across Miranda mystery files */
  presentationStyle?:
    | 'default'
    | 'case_file'
    | 'grammar_board'
    | 'missing_letter'
    | 'detective_notebook'
    | 'trail_notebook'
    | 'focus_quest'
    | 'reflection_card';
  /** Optional guide avatar shown in prompt row (e.g. B-4) */
  guideAvatarSrc?: string;
  guideAvatarAlt?: string;
};

export type GameAnswerValue = string | string[] | boolean | null;

export function isChoiceQuestion(q: GameQuestion): q is GameChoiceQuestion {
  return q.type !== 'true_false' && q.type !== 'sequence_order';
}

export function isTrueFalseQuestion(q: GameQuestion): q is GameTrueFalseQuestion {
  return q.type === 'true_false';
}

export function isMissingLetterQuestion(q: GameQuestion): boolean {
  return q.type === 'missing_letter';
}

export function isContextClueQuestion(q: GameQuestion): boolean {
  return q.type === 'context_clue';
}

export function isSequenceQuestion(q: GameQuestion): q is GameSequenceQuestion {
  return q.type === 'sequence_order';
}

export function isTrailNotebookQuestion(q: GameQuestion): boolean {
  return q.clueCard?.variant === 'trail_notebook';
}
