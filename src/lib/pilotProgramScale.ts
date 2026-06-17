import type { PilotProgramRecord } from '../types/pilotProgram';

export type ProgramScaleTier =
  | 'family'
  | 'small_group'
  | 'cohort'
  | 'organization'
  | 'school_district';

export type ProgramScaleLabel =
  | 'Family scale'
  | 'Small group'
  | 'Cohort'
  | 'Organization'
  | 'School/District scale';

/** Actual student count at or above this value recommends facilitator tools (family portal only). */
export const FACILITATOR_TOOLS_RECOMMENDATION_THRESHOLD = 5;

const SCALE_THRESHOLDS: Array<{ max: number; tier: ProgramScaleTier; label: ProgramScaleLabel }> = [
  { max: 4, tier: 'family', label: 'Family scale' },
  { max: 10, tier: 'small_group', label: 'Small group' },
  { max: 25, tier: 'cohort', label: 'Cohort' },
  { max: 50, tier: 'organization', label: 'Organization' },
  { max: Number.POSITIVE_INFINITY, tier: 'school_district', label: 'School/District scale' },
];

export function resolveProgramScaleFromCount(studentCount: number): {
  tier: ProgramScaleTier | null;
  label: ProgramScaleLabel | null;
} {
  if (!Number.isFinite(studentCount) || studentCount < 1) {
    return { tier: null, label: null };
  }
  const match = SCALE_THRESHOLDS.find((row) => studentCount <= row.max);
  return match ? { tier: match.tier, label: match.label } : { tier: null, label: null };
}

export function formatEstimatedStudentRange(
  program: Pick<PilotProgramRecord, 'estimated_student_count_range' | 'estimated_students' | 'program_type'>,
): string {
  const range = program.estimated_student_count_range?.trim();
  if (range) return range;
  if (typeof program.estimated_students === 'number' && program.estimated_students > 0) {
    return String(program.estimated_students);
  }
  return '—';
}

/** Admin-only note when live student count outgrows family-scale portal prep. */
export function shouldRecommendFacilitatorTools(
  program: Pick<PilotProgramRecord, 'portal_type'>,
  actualStudentCount: number,
): boolean {
  if (actualStudentCount < FACILITATOR_TOOLS_RECOMMENDATION_THRESHOLD) return false;
  const portalType = program.portal_type?.trim().toLowerCase();
  return portalType === 'family' || !portalType;
}

export const FACILITATOR_TOOLS_RECOMMENDATION_NOTE = 'Recommended: enable facilitator tools.';
