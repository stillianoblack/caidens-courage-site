export type GradeBand = 'K-1' | '2-3' | '4-5' | '6-8';

export type QuestionType =
  | 'multiple_choice'
  | 'math'
  | 'inference'
  | 'sel_decision'
  | 'sequencing'
  | 'comparison'
  | 'recall'
  | 'science_reasoning'
  | 'reading_comprehension';

export type AuditFlag =
  | 'correct_answer_too_obvious'
  | 'joke_or_impossible_distractor'
  | 'reading_level_below_band'
  | 'guessable_without_scenario'
  | 'answer_length_imbalance'
  | 'too_easy_for_grade_4_plus'
  | 'insufficient_scenario_evidence'
  | 'lacks_reasoning_skill'
  | 'caiden_needs_more_math_focus';

export type RewritePriority = 'high' | 'medium' | 'low';

export type NormalizedChoice = {
  id: string;
  label: string;
};

export type NormalizedQuestion = {
  character: string;
  missionId: string;
  missionTitle: string;
  missionNumber: number;
  week: number | null;
  gradeBand: GradeBand;
  questionType: QuestionType;
  questionId: string;
  scenarioText: string;
  questionText: string;
  choices: NormalizedChoice[];
  correctAnswerId: string;
  correctAnswerLabel: string;
  correctIndex: number;
  skillTags: string[];
  skillArea: string;
};

export type AuditedQuestion = NormalizedQuestion & {
  flags: AuditFlag[];
  difficultyScore: number;
  difficultyReason: string;
  recommendedRewrite: string;
  improvedDistractors: string[];
  suggestedCorrectAnswer: string;
  cognitiveNotes: string[];
  rewritePriority: RewritePriority;
};

export type PositionDistribution = {
  A: number;
  B: number;
  C: number;
  D: number;
  total: number;
  uneven: boolean;
  dominantPosition: string | null;
};

export type AuditSummary = {
  generatedAt: string;
  totalQuestions: number;
  averageDifficultyByCharacter: Record<string, number>;
  flagCounts: Record<AuditFlag, number>;
  positionDistributionByCharacter: Record<string, PositionDistribution>;
  positionDistributionByMission: Record<string, PositionDistribution>;
  topRewriteCandidates: AuditedQuestion[];
  rewritePriorityCounts: Record<RewritePriority, number>;
};

export type AuditReport = {
  summary: AuditSummary;
  questions: AuditedQuestion[];
};
