export type ProductionQualityOverride = {
  scenarioText?: string;
  choices?: [string, string, string, string];
  correctIndex?: 0 | 1 | 2 | 3;
  whyPrompt?: string;
  duplicateReviewStatus?: 'needs_review_duplicate' | 'keep_different_context' | 'resolved_overlay';
  duplicateNote?: string;
};

export type ProductionDuplicateRegistryEntry = {
  groupKey: string;
  questionIds: string[];
  action: 'needs_review_duplicate' | 'keep_different_context' | 'safe_to_merge';
  note: string;
};

export const PRODUCTION_WHY_PROMPT =
  'Why did you choose this answer? Use one detail from the scenario.';

export const PRODUCTION_QUALITY_VERSION = 'production_quality_v1';
