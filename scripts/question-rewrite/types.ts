import type { GradeBand } from '../question-audit/types';

export type StagingQuestionOverride = {
  questionId: string;
  character: string;
  missionId: string;
  gradeBand: GradeBand;
  scenarioText?: string;
  questionText: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation?: string;
  hint?: string;
  skillTags?: string[];
  scenarioTag?: string;
  scenarioAccent?: string;
  correctFeedback?: string;
  incorrectFeedback?: string;
  contentVersion: 'adaptive_staging_v3' | 'adaptive_staging_v3_final' | 'adaptive_staging_v4_difficulty';
  rewriteNotes: string;
};

export type RewriteSnapshot = {
  questionId: string;
  character: string;
  missionId: string;
  gradeBand: GradeBand;
  scenarioText: string;
  questionText: string;
  choices: string[];
  correctAnswerLabel: string;
  correctIndex: number;
};

export type StagingManifest = {
  generatedAt: string;
  version: 'adaptive_staging_v3' | 'adaptive_staging_v3_final' | 'adaptive_staging_v4_difficulty';
  totalQuestions: number;
  overrides: Record<string, StagingQuestionOverride>;
  beforeSnapshots: Record<string, RewriteSnapshot>;
};
