import type { MirandaGradeBand } from './mirandaAdaptiveQuest';

/** Kid/student grade bands used by adaptive quests */
export type StudentGradeBand = MirandaGradeBand;

/** All grade-band values including adult instructional content */
export type ContentGradeBand = StudentGradeBand | 'adult';

export type ContentAudience = 'kid' | 'family' | 'facilitator' | 'adult';

export type KidContentDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type AdultContentDifficulty = 'adult_reflection' | 'adult_guidance';

export type ContentDifficulty = KidContentDifficulty | AdultContentDifficulty;

export type ContentVersionTag =
  | 'legacy_reclassified'
  | 'adaptive_v1'
  | 'adaptive_v2'
  | 'adaptive_k1_seed'
  | 'static_unbanded'
  | 'adult_normalized';

export type GradeBandQuestionMetadata = {
  audience: ContentAudience;
  gradeBand: ContentGradeBand;
  difficulty: ContentDifficulty;
  character: string;
  skillTags: string[];
  skillArea?: string;
  contentVersion: ContentVersionTag;
  sourceId?: string;
  sourceFile?: string;
  classificationNote?: string;
};

export const STUDENT_GRADE_BANDS: StudentGradeBand[] = ['K-1', '2-3', '4-5', '6-8'];

export const KID_GRADE_BAND_ORDER: StudentGradeBand[] = ['K-1', '2-3', '4-5', '6-8'];

/** @deprecated Use KID_GRADE_BAND_ORDER */
export const GRADE_BAND_ORDER = KID_GRADE_BAND_ORDER;

export const ADULT_GRADE_BAND = 'adult' as const;

export function isKidGradeBand(band: ContentGradeBand): band is StudentGradeBand {
  return band !== 'adult';
}

export function isAdultGradeBand(band: ContentGradeBand): band is 'adult' {
  return band === 'adult';
}

export function isFacilitatorAudience(audience: ContentAudience): boolean {
  return audience === 'facilitator' || audience === 'adult';
}
