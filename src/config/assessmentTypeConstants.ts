/** Internal database value for child before check-in / baseline assessment. */
export const CHILD_BASELINE_ASSESSMENT_TYPE = 'baseline';

/** Internal database value for adult pre-assessment. */
export const ADULT_PRE_ASSESSMENT_TYPE = 'adult_pre';

/** Internal database value for adult post-assessment. */
export const ADULT_POST_ASSESSMENT_TYPE = 'adult_post';

/** Family Portal UI label for child baseline — maps to {@link CHILD_BASELINE_ASSESSMENT_TYPE}. */
export const CHILD_BEFORE_CHECK_IN_LABEL = 'Before Check-In';

export function isChildBaselineAssessmentType(assessmentType?: string | null): boolean {
  return (assessmentType?.trim().toLowerCase() ?? '') === CHILD_BASELINE_ASSESSMENT_TYPE;
}

export function formatChildBaselineStatusLabel(status: 'Complete' | 'In Progress' | 'Not Started'): string {
  return `${CHILD_BEFORE_CHECK_IN_LABEL}: ${status}`;
}
