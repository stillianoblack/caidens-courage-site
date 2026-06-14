/** Internal database value for child B-4 Check-In / baseline assessment. */
export const CHILD_BASELINE_ASSESSMENT_TYPE = 'baseline';

/** Internal database value for adult pre-assessment. */
export const ADULT_PRE_ASSESSMENT_TYPE = 'adult_pre';

/** Internal database value for adult post-assessment. */
export const ADULT_POST_ASSESSMENT_TYPE = 'adult_post';

/** Family Portal UI label for child B-4 Check-In. */
export const CHILD_B4_CHECK_IN_LABEL = 'B-4 Check-In';

/** @deprecated Use CHILD_B4_CHECK_IN_LABEL */
export const CHILD_BEFORE_CHECK_IN_LABEL = CHILD_B4_CHECK_IN_LABEL;

/** Legacy Supabase / local assessment_type values that map to child B-4 Check-In. */
const CHILD_B4_CHECK_IN_ASSESSMENT_TYPES = new Set([
  CHILD_BASELINE_ASSESSMENT_TYPE,
  'before_check_in',
  'before',
  'b4_check_in',
]);

export function isChildBaselineAssessmentType(assessmentType?: string | null): boolean {
  return CHILD_B4_CHECK_IN_ASSESSMENT_TYPES.has(assessmentType?.trim().toLowerCase() ?? '');
}

export function formatB4CheckInStatusLabel(status: 'Complete' | 'In Progress' | 'Not Started'): string {
  return `${CHILD_B4_CHECK_IN_LABEL}: ${status}`;
}

/** Baseline assessment row on dashboard cards (distinct label from B-4 Check-In flows). */
export function formatBaselineAssessmentStatusLabel(
  status: 'Complete' | 'In Progress' | 'Not Started',
): string {
  if (status === 'Complete') return 'Baseline Complete';
  if (status === 'In Progress') return 'Baseline In Progress';
  return 'Baseline Not Started';
}

/** @deprecated Use formatB4CheckInStatusLabel */
export function formatChildBaselineStatusLabel(status: 'Complete' | 'In Progress' | 'Not Started'): string {
  return formatB4CheckInStatusLabel(status);
}
