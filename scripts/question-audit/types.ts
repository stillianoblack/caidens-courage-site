export type GradeBand = 'K-1' | '2-3' | '4-5' | '6-8' | 'adult';

export type QuestionSource = 'adaptive_mission' | 'staging_override' | 'adult_training';

export type QuestionMode = 'adaptive' | 'adaptive_staging' | 'adult_training' | 'legacy';

export type WeakDistractorReason =
  | 'joke_cartoony_distractor'
  | 'obviously_unsafe_wrong'
  | 'correct_answer_too_long'
  | 'moral_giveaway'
  | 'repeated_option'
  | 'correct_answer_clue_words'
  | 'all_wrong_answers_villain';

export type DuplicateAction =
  | 'safe_to_merge'
  | 'staging_duplicate_only'
  | 'needs_human_review'
  | 'keep_different_context';

export type IssueCategory =
  | 'production_content'
  | 'staging_override'
  | 'metadata_only'
  | 'true_duplicate'
  | 'weak_distractor';

export type DifficultyLabel = 'easy' | 'medium' | 'hard' | 'unknown';

export type CanonicalSkill =
  | 'Executive Function'
  | 'Self Regulation'
  | 'Communication'
  | 'Teamwork'
  | 'Problem Solving'
  | 'Empathy'
  | 'Focus Recovery'
  | 'Courage'
  | 'Reading Comprehension'
  | 'Math Reasoning'
  | 'Other';

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
  | 'caiden_needs_more_math_focus'
  | 'potentially_obvious_answer'
  | 'weak_distractor_set';

export type BankAuditCode =
  | 'exact_duplicate_question'
  | 'exact_duplicate_scenario'
  | 'exact_duplicate_answer_set'
  | 'same_question_text_different_ids'
  | 'near_duplicate_question'
  | 'caiden_spelling_issue'
  | 'invalid_character_name'
  | 'potentially_obvious_answer'
  | 'high_scenario_duplication'
  | 'correct_answer_longer_than_distractors'
  | 'correct_answer_clue_words'
  | 'obviously_wrong_distractors'
  | 'duplicate_answer_options'
  | 'missing_metadata'
  | 'poor_difficulty_distribution'
  | 'staging_production_duplicate';

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
  explanation?: string;
  hint?: string;
  source: QuestionSource;
  difficulty: DifficultyLabel;
  mode?: QuestionMode;
  contentVersion?: string;
  weekNumber?: number | null;
  excludedFromHealthScore?: boolean;
  metadataInferred?: boolean;
};

export type BankAuditFinding = {
  code: BankAuditCode;
  severity: 'info' | 'warning' | 'critical';
  questionId?: string;
  message: string;
  category?: IssueCategory;
  details?: Record<string, unknown>;
};

export type HealthScores = {
  overall: number;
  productionContent: number;
  metadataCompleteness: number;
  distractorQuality: number;
  scenarioVariety: number;
};

export type BankIssueCounts = {
  duplicateQuestions: number;
  duplicateScenarios: number;
  duplicateAnswerSets: number;
  sameQuestionDifferentIds: number;
  nearDuplicateQuestions: number;
  caidenSpellingIssues: number;
  obviousAnswerWarnings: number;
  highScenarioDuplication: number;
  weakDistractorWarnings: number;
  missingMetadata: number;
  skillsUnderMinimum: number;
};

export type ClassifiedIssueCounts = {
  production: BankIssueCounts;
  staging: Partial<BankIssueCounts>;
  metadataOnly: number;
  trueDuplicate: number;
  weakDistractor: number;
};

export type DuplicateGroupReport = {
  key: string;
  questionIds: string[];
  sampleText: string;
  sources: QuestionSource[];
  characters: string[];
  gradeBands: string[];
  action: DuplicateAction;
  rationale: string;
};

export type RewritePriorityEntry = {
  rank: number;
  questionId: string;
  character: string;
  missionId: string;
  gradeBand: GradeBand;
  week: number | null;
  source: QuestionSource;
  scenarioText: string;
  questionText: string;
  choices: NormalizedChoice[];
  correctAnswerLabel: string;
  issueReasons: string[];
  suggestedRewriteDirection: string;
  priorityScore: number;
};

export type AuditedQuestion = NormalizedQuestion & {
  flags: AuditFlag[];
  bankFindings: BankAuditFinding[];
  canonicalSkill: CanonicalSkill | 'Other';
  weakDistractorReasons: WeakDistractorReason[];
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

export type BankAuditSummary = {
  healthScore: number;
  healthScores: HealthScores;
  totalQuestions: number;
  productionQuestionCount: number;
  stagingQuestionCount: number;
  sourcesScanned: QuestionSource[];
  issueCounts: BankIssueCounts;
  classifiedCounts: ClassifiedIssueCounts;
  findings: BankAuditFinding[];
  difficultyCounts: Record<string, Record<string, Partial<Record<DifficultyLabel, number>>>>;
  skillCoverage: Array<{ skill: CanonicalSkill | 'Other'; character: string; count: number }>;
  skillTotals: Record<CanonicalSkill | 'Other', number>;
  skillsUnderMinimum: CanonicalSkill[];
  duplicateQuestions: Array<{ key: string; questionIds: string[]; sampleText: string }>;
  duplicateScenarios: Array<{ key: string; questionIds: string[]; sampleText: string }>;
  duplicateActionPlan: DuplicateGroupReport[];
  highDuplicationScenarios: Array<{ count: number; sample: string; questionIds: string[] }>;
  recommendations: string[];
  rewritePriority: RewritePriorityEntry[];
};

export type AuditSummary = {
  generatedAt: string;
  totalQuestions: number;
  questionHealthScore: number;
  sourcesScanned: QuestionSource[];
  issuesFound: BankIssueCounts;
  healthScores: HealthScores;
  averageDifficultyByCharacter: Record<string, number>;
  flagCounts: Record<AuditFlag, number>;
  positionDistributionByCharacter: Record<string, PositionDistribution>;
  positionDistributionByMission: Record<string, PositionDistribution>;
  topRewriteCandidates: AuditedQuestion[];
  rewritePriorityCounts: Record<RewritePriority, number>;
};

export type AuditReport = {
  summary: AuditSummary;
  bankAudit: BankAuditSummary;
  recommendations: string[];
  questions: AuditedQuestion[];
};
