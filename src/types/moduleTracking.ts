export type TrackingRole = 'student' | 'parent' | 'facilitator' | 'teacher' | 'other';

export type TrackingAudience = 'student' | 'parent' | 'facilitator' | 'family' | 'public';

export type FormalAssessmentType = 'baseline' | 'final' | 'adult_pre' | 'adult_post';

/**
 * Reusable metadata every interactive module should declare.
 * Attach to GameAssessmentConfig.tracking or register in moduleTrackingRegistry.
 */
export type ModuleTrackingDefinition = {
  moduleId: string;
  moduleTitle: string;
  character: string;
  audience: TrackingAudience;
  role: TrackingRole;
  skillArea: string;
  /** When true, completion saves to assessment_results_v2 instead of module_results. */
  isFormalAssessment?: boolean;
  assessmentType?: FormalAssessmentType;
};

export type ModuleCompletionAnswers = Record<string, string | number | boolean | string[] | null>;
