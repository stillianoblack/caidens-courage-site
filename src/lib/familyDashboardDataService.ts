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
  fetchAssessmentV2FromSupabase,
  fetchModuleResultsFromSupabase,
  fetchStudentParticipantsFromSupabase,
  type StudentParticipantRecord,
} from './pilotTrackingService';

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
  studentLegacyBaselines: B4BaselineCheckRecord[];
  adultLegacyAssessments: AssessmentResultRow[];
  v2Assessments: LocalAssessmentV2Record[];
  moduleResults: LocalModuleResultRecord[];
  errors: string[];
};

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
  studentLegacyBaselines: B4BaselineCheckRecord[];
  adultLegacyAssessments: AssessmentResultRow[];
  v2Assessments: LocalAssessmentV2Record[];
  moduleResults: LocalModuleResultRecord[];
  errors: string[];
}): void {
  console.info('[FAMILY_DASHBOARD]', {
    program_code: payload.programCode,
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
      studentLegacyBaselines: [],
      adultLegacyAssessments: [],
      v2Assessments: [],
      moduleResults: [],
      errors: ['Missing active program context.'],
    };
    logFamilyDashboardDebug(empty);
    return empty;
  }

  const errors: string[] = [];

  const [participantsPayload, legacyAllPayload, v2Payload, modulePayload] = await Promise.all([
    fetchStudentParticipantsFromSupabase(programCode),
    fetchAllLegacyAssessmentRows(programCode),
    fetchAssessmentV2FromSupabase(programCode),
    fetchModuleResultsFromSupabase(programCode),
  ]);

  if (participantsPayload.error) errors.push(participantsPayload.error);
  if (legacyAllPayload.error) errors.push(legacyAllPayload.error);
  if (v2Payload.error) errors.push(v2Payload.error);
  if (modulePayload.error) errors.push(modulePayload.error);

  let studentLegacyBaselines = legacyAllPayload.rows
    .filter(isStudentBaselineLegacyRow)
    .map(supabaseRowToRecord);

  if (studentLegacyBaselines.length === 0 && legacyAllPayload.error) {
    const fallback = await fetchAssessmentResultsFromSupabase(programCode);
    if (fallback.error) {
      errors.push(fallback.error);
    } else {
      studentLegacyBaselines = fallback.results;
    }
  }

  const data: FamilyDashboardData = {
    programCode,
    studentParticipants: participantsPayload.participants,
    studentLegacyBaselines,
    adultLegacyAssessments: legacyAllPayload.rows.filter(isAdultLegacyRow),
    v2Assessments: v2Payload.results,
    moduleResults: modulePayload.results,
    errors,
  };

  logFamilyDashboardDebug(data);
  return data;
}
