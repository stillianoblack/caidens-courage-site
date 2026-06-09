import {
  ADULT_POST_ASSESSMENT_TYPE,
  ADULT_PRE_ASSESSMENT_TYPE,
  isChildBaselineAssessmentType,
} from '../config/assessmentTypeConstants';
import {
  fetchAssessmentResultsFromSupabase,
  supabaseRowToRecord,
  type AssessmentResultRow,
} from './assessmentResultsService';
import { resolveTrackingProgramCode } from './activeProgramContext';
import type { B4BaselineCheckRecord } from './b4BaselineCheckStorage';
import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from './fetchWithTimeout';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import {
  fetchAssessmentV2ForParticipants,
  fetchAssessmentV2FromSupabase,
  fetchModuleResultsForParticipants,
  fetchModuleResultsFromSupabase,
  type StudentParticipantRecord,
} from './pilotTrackingService';
import {
  resolveFamilyVisibleChildren,
  type FamilyVisibleChild,
  type StudentFamilyLink,
} from './studentFamilyLinkService';

export const ADULT_BASELINE_ASSESSMENT_TYPES = new Set([
  ADULT_PRE_ASSESSMENT_TYPE,
  'adult_baseline',
]);

export const ADULT_GROWTH_ASSESSMENT_TYPES = new Set([
  ADULT_POST_ASSESSMENT_TYPE,
  'adult_growth',
]);

export type FamilyDashboardData = {
  programCode: string;
  studentParticipants: StudentParticipantRecord[];
  visibleChildren: FamilyVisibleChild[];
  allowedStudentIds: string[];
  familyLinks: StudentFamilyLink[];
  studentLegacyBaselines: B4BaselineCheckRecord[];
  adultLegacyAssessments: AssessmentResultRow[];
  v2Assessments: LocalAssessmentV2Record[];
  moduleResults: LocalModuleResultRecord[];
  errors: string[];
  claimRequired: boolean;
};

function filterStudentRowsByAllowedIds<T extends { participant_id?: string | null; role?: string }>(
  rows: T[],
  allowedStudentIds: string[],
): T[] {
  const allowed = new Set(allowedStudentIds);
  return rows.filter((row) => {
    if (row.role !== 'student') return true;
    if (!allowedStudentIds.length) return false;
    return allowed.has(row.participant_id?.trim() ?? '');
  });
}

function filterLegacyStudentBaselines(
  rows: B4BaselineCheckRecord[],
  allowedStudentIds: string[],
): B4BaselineCheckRecord[] {
  if (!allowedStudentIds.length) return [];
  const allowed = new Set(allowedStudentIds);
  return rows.filter((row) => {
    const participantId = row.participantId?.trim() || row.anonymousStudentId?.trim() || '';
    return participantId ? allowed.has(participantId) : false;
  });
}

function filterLegacyStudentRows(
  rows: AssessmentResultRow[],
  allowedStudentIds: string[],
): AssessmentResultRow[] {
  if (!allowedStudentIds.length) return [];
  const allowed = new Set(allowedStudentIds);
  return rows.filter((row) => {
    const studentId = row.student_id?.trim() ?? '';
    return studentId ? allowed.has(studentId) : false;
  });
}

function mergeUniqueById<T extends { id?: string; participant_id?: string; completed_at?: string }>(
  primary: T[],
  secondary: T[],
  keyFn: (row: T) => string,
): T[] {
  const seen = new Set<string>();
  const merged: T[] = [];
  for (const row of [...primary, ...secondary]) {
    const key = keyFn(row);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(row);
  }
  return merged;
}

function isStudentBaselineLegacyRow(row: AssessmentResultRow): boolean {
  const type = row.assessment_type?.toLowerCase() ?? '';
  if (ADULT_BASELINE_ASSESSMENT_TYPES.has(type) || ADULT_GROWTH_ASSESSMENT_TYPES.has(type)) {
    return false;
  }
  if (type.startsWith('adult')) return false;
  if (row.role === 'adult') return false;
  return isChildBaselineAssessmentType(type);
}

function isAdultLegacyRow(row: AssessmentResultRow): boolean {
  const type = row.assessment_type?.toLowerCase() ?? '';
  return (
    ADULT_BASELINE_ASSESSMENT_TYPES.has(type) ||
    ADULT_GROWTH_ASSESSMENT_TYPES.has(type) ||
    type.startsWith('adult') ||
    row.role === 'adult' ||
    Boolean(row.email?.trim())
  );
}

async function fetchAllLegacyAssessmentRows(programCode: string): Promise<{
  rows: AssessmentResultRow[];
  error?: string;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return { rows: [], error: 'missing_env' };
  }

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('assessment_results')
        .select('*')
        .eq('program_code', programCode.trim())
        .order('completed_at', { ascending: false }),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'family_assessment_results_all',
    );

    if (error) {
      return { rows: [], error: error.message };
    }

    return { rows: (data ?? []) as AssessmentResultRow[] };
  } catch {
    return { rows: [], error: 'fetch_failed' };
  }
}

export function hasAdultBaselineAssessment(
  v2Rows: LocalAssessmentV2Record[],
  legacyRows: AssessmentResultRow[],
): boolean {
  if (
    v2Rows.some(
      (row) => row.role === 'adult' && ADULT_BASELINE_ASSESSMENT_TYPES.has(row.assessment_type),
    )
  ) {
    return true;
  }
  return legacyRows.some((row) => ADULT_BASELINE_ASSESSMENT_TYPES.has(row.assessment_type?.toLowerCase() ?? ''));
}

export function hasAdultGrowthAssessment(
  v2Rows: LocalAssessmentV2Record[],
  legacyRows: AssessmentResultRow[],
): boolean {
  if (
    v2Rows.some(
      (row) => row.role === 'adult' && ADULT_GROWTH_ASSESSMENT_TYPES.has(row.assessment_type),
    )
  ) {
    return true;
  }
  return legacyRows.some((row) => ADULT_GROWTH_ASSESSMENT_TYPES.has(row.assessment_type?.toLowerCase() ?? ''));
}

export function logFamilyDashboardDebug(payload: {
  programCode: string;
  studentParticipants: StudentParticipantRecord[];
  visibleChildren: FamilyVisibleChild[];
  allowedStudentIds: string[];
  familyLinks: StudentFamilyLink[];
  studentLegacyBaselines: B4BaselineCheckRecord[];
  adultLegacyAssessments: AssessmentResultRow[];
  v2Assessments: LocalAssessmentV2Record[];
  moduleResults: LocalModuleResultRecord[];
  errors: string[];
}): void {
  console.info('[FAMILY_DASHBOARD]', {
    program_code: payload.programCode,
    allowed_student_ids: payload.allowedStudentIds,
    visible_children: payload.visibleChildren.map((child) => ({
      student_id: child.studentId,
      display_name: child.displayName,
      source: child.source,
    })),
    family_links: payload.familyLinks.length,
    children_loaded: payload.studentParticipants.map((row) => ({
      id: row.id,
      nickname: row.nickname,
      first_name: row.first_name,
    })),
    assessment_rows_loaded: {
      legacy_student_baselines: payload.studentLegacyBaselines.length,
      legacy_adult: payload.adultLegacyAssessments.length,
      v2: payload.v2Assessments.length,
      v2_student_baselines: payload.v2Assessments.filter(
        (row) => row.role === 'student' && isChildBaselineAssessmentType(row.assessment_type),
      ).length,
      v2_adult_baselines: payload.v2Assessments.filter(
        (row) => row.role === 'adult' && ADULT_BASELINE_ASSESSMENT_TYPES.has(row.assessment_type),
      ).length,
    },
    module_rows_loaded: payload.moduleResults.length,
    errors: payload.errors,
  });
}

export async function loadFamilyDashboardData(programCodeInput?: string): Promise<FamilyDashboardData> {
  const programCode = programCodeInput?.trim() || resolveTrackingProgramCode() || '';
  if (!programCode) {
    const empty: FamilyDashboardData = {
      programCode: '',
      studentParticipants: [],
      visibleChildren: [],
      allowedStudentIds: [],
      familyLinks: [],
      studentLegacyBaselines: [],
      adultLegacyAssessments: [],
      v2Assessments: [],
      moduleResults: [],
      errors: ['Missing active program context.'],
      claimRequired: true,
    };
    logFamilyDashboardDebug(empty);
    return empty;
  }

  const errors: string[] = [];
  const visibility = await resolveFamilyVisibleChildren(programCode);
  errors.push(...visibility.errors);

  const allowedStudentIds = visibility.allowedStudentIds;
  const visibleParticipants: StudentParticipantRecord[] = visibility.children.map((child) => {
    const participant = visibility.participants.find((row) => row.id === child.studentId);
    if (participant) return participant;
    return {
      id: child.studentId,
      nickname: child.displayName,
      first_name: child.displayName,
      role: 'student',
      program_code: child.source === 'camp_link' ? child.campProgramCode ?? programCode : programCode,
      created_at: new Date().toISOString(),
    };
  });

  const [legacyAllPayload, v2ByProgramPayload, moduleByProgramPayload, v2ByStudentsPayload, moduleByStudentsPayload] =
    await Promise.all([
      fetchAllLegacyAssessmentRows(programCode),
      fetchAssessmentV2FromSupabase(programCode),
      fetchModuleResultsFromSupabase(programCode),
      fetchAssessmentV2ForParticipants(allowedStudentIds),
      fetchModuleResultsForParticipants(allowedStudentIds),
    ]);

  if (legacyAllPayload.error) errors.push(legacyAllPayload.error);
  if (v2ByProgramPayload.error) errors.push(v2ByProgramPayload.error);
  if (moduleByProgramPayload.error) errors.push(moduleByProgramPayload.error);
  if (v2ByStudentsPayload.error) errors.push(v2ByStudentsPayload.error);
  if (moduleByStudentsPayload.error) errors.push(moduleByStudentsPayload.error);

  let studentLegacyBaselines = filterLegacyStudentRows(
    legacyAllPayload.rows.filter(isStudentBaselineLegacyRow),
    allowedStudentIds,
  ).map(supabaseRowToRecord);

  if (studentLegacyBaselines.length === 0 && legacyAllPayload.error) {
    const fallback = await fetchAssessmentResultsFromSupabase(programCode);
    if (fallback.error) {
      errors.push(fallback.error);
    } else {
      studentLegacyBaselines = filterLegacyStudentBaselines(fallback.results, allowedStudentIds);
    }
  }

  const v2Assessments = filterStudentRowsByAllowedIds(
    mergeUniqueById(
      v2ByProgramPayload.results,
      v2ByStudentsPayload.results,
      (row) => `${row.participant_id}-${row.assessment_type}-${row.completed_at}`,
    ),
    allowedStudentIds,
  );

  const moduleResults = filterStudentRowsByAllowedIds(
    mergeUniqueById(
      moduleByProgramPayload.results,
      moduleByStudentsPayload.results,
      (row) => `${row.participant_id}-${row.module_id}-${row.completed_at}`,
    ),
    allowedStudentIds,
  );

  const data: FamilyDashboardData = {
    programCode,
    studentParticipants: visibleParticipants,
    visibleChildren: visibility.children,
    allowedStudentIds,
    familyLinks: visibility.links,
    studentLegacyBaselines,
    adultLegacyAssessments: legacyAllPayload.rows.filter(isAdultLegacyRow),
    v2Assessments,
    moduleResults,
    errors,
    claimRequired: visibility.claimRequired,
  };

  logFamilyDashboardDebug(data);

  console.info('[PROGRESS_SYNC]', {
    program_code: data.programCode,
    allowed_student_ids: data.allowedStudentIds,
    child_count: data.visibleChildren.length,
    baseline_rows: data.v2Assessments.filter((row) => isChildBaselineAssessmentType(row.assessment_type))
      .length,
    module_rows: data.moduleResults.length,
    overall_child_sources: data.visibleChildren.map((child) => child.source),
  });

  return data;
}
