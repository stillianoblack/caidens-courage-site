import type { BaselineModuleId } from '../data/b4BaselineCheckContent';
import { B4_BASELINE_ASSESSMENT_NAME } from '../data/b4BaselineCheckContent';
import type { B4BaselineCheckRecord } from './b4BaselineCheckStorage';
import { loadAllBaselineResults } from './b4BaselineCheckStorage';
import type { AdultAssessmentRecord } from './adultAssessmentStorage';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { PORTAL_CONNECTION_ERROR_MESSAGE } from './portalAccessCodes';
import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from './fetchWithTimeout';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { resolveTrackingProgramCode } from './activeProgramContext';
import { findOrCreateParticipant, saveAssessmentResult } from './pilotTrackingService';
import {
  logTrackingSave,
  logTrackingSaveError,
  TRACKING_SAVE_WARNING,
} from './trackingSaveLog';

export type AssessmentResultRow = {
  id?: string;
  nickname: string;
  child_nickname?: string;
  student_id?: string;
  assessment_type: string;
  program_code: string;
  program_name?: string;
  family_code?: string;
  group_name?: string;
  feelings_score?: number;
  reading_score?: number;
  focus_moves_score?: number;
  modules_completed?: string;
  completed_at?: string | null;
  created_at?: string | null;
  first_name?: string;
  email?: string;
  role?: string;
  child_age_range?: string;
  organization?: string;
  email_opt_in?: boolean;
  understanding_score?: number;
  support_score?: number;
  total_score?: number;
  total_questions?: number;
  adult_assessment_phase?: string;
};

export type BaselineSubmitResult = {
  success: boolean;
  message: string;
};

export type AssessmentResultsLoad = {
  results: B4BaselineCheckRecord[];
  source: 'supabase' | 'local';
  warning?: string;
};

const BASELINE_MODULES = 'feelings,reading,focus-moves';

export type StudentAssessmentSaveInput = {
  nickname: string;
  assessmentType: 'baseline' | 'final';
  groupName?: string;
  feelingsScore: number;
  readingScore: number;
  focusScore: number;
  maxScore: number;
  modulesCompleted: string;
  completedAt: string;
  answersJson?: Record<string, unknown>;
};

function buildLegacyStudentAssessmentRow(
  input: StudentAssessmentSaveInput,
  participantId: string,
  programCode: string,
): Omit<AssessmentResultRow, 'id'> {
  const program = readActivePilotProgram();
  const payload: Omit<AssessmentResultRow, 'id'> = {
    nickname: input.nickname,
    child_nickname: input.nickname,
    student_id: participantId,
    assessment_type: input.assessmentType,
    program_code: programCode,
    group_name: input.groupName,
    feelings_score: input.feelingsScore,
    reading_score: input.readingScore,
    focus_moves_score: input.focusScore,
    modules_completed: input.modulesCompleted,
    completed_at: input.completedAt || new Date().toISOString(),
    role: 'student',
  };

  if (program?.programName) {
    payload.program_name = program.programName;
  }
  if (program?.familyAccessCode) {
    payload.family_code = program.familyAccessCode;
  }

  return payload;
}

/** Single participant upsert, then writes to assessment_results_v2 and assessment_results. */
export async function saveStudentAssessmentToSupabase(
  input: StudentAssessmentSaveInput,
): Promise<BaselineSubmitResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, message: TRACKING_SAVE_WARNING };
  }

  const programCode = resolveTrackingProgramCode();
  if (!programCode) {
    return { success: false, message: TRACKING_SAVE_WARNING };
  }

  const participantName = input.nickname;
  const totalScore = input.feelingsScore + input.readingScore + input.focusScore;

  try {
    const { participantId, source: participantSource } = await findOrCreateParticipant({
      role: 'student',
      nickname: input.nickname,
      first_name: input.nickname,
      program_code: programCode,
      group_name: input.groupName || undefined,
    });

    const v2Result = await saveAssessmentResult({
      participant_id: participantId,
      role: 'student',
      program_code: programCode,
      group_name: input.groupName || undefined,
      assessment_type: input.assessmentType,
      reading_score: input.readingScore,
      focus_score: input.focusScore,
      confidence_score: input.feelingsScore,
      total_score: totalScore,
      max_score: input.maxScore,
      answers_json: input.answersJson,
      completed_at: input.completedAt,
    });

    const payload = buildLegacyStudentAssessmentRow(input, participantId, programCode);
    const { data, error } = await supabase.from('assessment_results').insert(payload).select('id').single();

    if (error) {
      logTrackingSaveError({
        table: 'assessment_results',
        operation: 'insert',
        participantId,
        participantName,
        role: 'student',
        programCode,
        assessmentType: input.assessmentType,
        response: data,
        error,
      });
    } else {
      logTrackingSave({
        table: 'assessment_results',
        operation: 'insert',
        participantId,
        participantName,
        role: 'student',
        programCode,
        assessmentType: input.assessmentType,
        response: data,
      });
    }

    if (!v2Result.success) {
      logTrackingSaveError({
        table: 'assessment_results_v2',
        operation: 'insert',
        participantId,
        participantName,
        role: 'student',
        programCode,
        assessmentType: input.assessmentType,
        error: v2Result.message,
      });
    }

    if (participantSource === 'local' || error || !v2Result.success) {
      return { success: false, message: TRACKING_SAVE_WARNING };
    }

    return {
      success: true,
      message:
        input.assessmentType === 'baseline'
          ? 'B-4 Check-In saved. Your Weekly Adventures are ready.'
          : 'Growth check saved.',
    };
  } catch (err) {
    logTrackingSaveError({
      table: 'assessment_results',
      operation: 'insert',
      participantName,
      role: 'student',
      programCode,
      assessmentType: input.assessmentType,
      error: err,
    });
    return { success: false, message: TRACKING_SAVE_WARNING };
  }
}

function isStudentBaselineRow(row: AssessmentResultRow): boolean {
  return row.assessment_type === 'baseline';
}

export const SUPABASE_SELECT_POLICY_HINT =
  'Supabase sync is connected, but results reading may need a SELECT policy or admin endpoint.';

function parseModulesCompleted(raw: string | null | undefined): BaselineModuleId[] {
  if (!raw) return ['feelings', 'reading', 'focus-moves'];
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean) as BaselineModuleId[];
}

function resolveCompletedAt(row: AssessmentResultRow): string {
  return row.completed_at || row.created_at || new Date().toISOString();
}

export function recordToSupabaseRow(
  record: B4BaselineCheckRecord,
  participantId?: string,
): Omit<AssessmentResultRow, 'id'> {
  const programCode = resolveTrackingProgramCode() ?? '';
  const program = readActivePilotProgram();
  const payload: Omit<AssessmentResultRow, 'id'> = {
    nickname: record.nickname,
    student_id: participantId || record.anonymousStudentId,
    assessment_type: 'baseline',
    program_code: programCode,
    group_name: record.groupName,
    feelings_score: record.feelingsScore,
    reading_score: record.readingScore,
    focus_moves_score: record.focusMovesScore,
    modules_completed: BASELINE_MODULES,
    completed_at: record.completedAt || new Date().toISOString(),
    role: 'student',
  };

  payload.child_nickname = record.nickname;
  if (program?.programName) {
    payload.program_name = program.programName;
  }
  if (program?.familyAccessCode) {
    payload.family_code = program.familyAccessCode;
  }

  return payload;
}

export function supabaseRowToRecord(row: AssessmentResultRow): B4BaselineCheckRecord {
  return {
    assessmentName: B4_BASELINE_ASSESSMENT_NAME,
    anonymousStudentId: row.student_id ?? '',
    nickname: row.nickname ?? row.child_nickname ?? row.first_name ?? '',
    programCode: row.program_code ?? '',
    groupName: row.group_name ?? '',
    completedModules: parseModulesCompleted(row.modules_completed),
    feelingsScore: row.feelings_score ?? 0,
    readingScore: row.reading_score ?? 0,
    focusMovesScore: row.focus_moves_score ?? 0,
    completedAt: resolveCompletedAt(row),
  };
}

export function adultRecordToSupabaseRow(
  record: AdultAssessmentRecord,
): Omit<AssessmentResultRow, 'id'> {
  const programCode = resolveTrackingProgramCode() ?? '';
  const program = readActivePilotProgram();
  const payload: Omit<AssessmentResultRow, 'id'> = {
    nickname: record.firstName,
    first_name: record.firstName,
    email: record.email,
    role: record.role,
    child_age_range: record.childAgeRange,
    organization: record.organization,
    email_opt_in: record.emailOptIn,
    assessment_type: record.assessmentType,
    adult_assessment_phase: record.phase,
    program_code: programCode,
    program_name: record.programName ?? program?.programName,
    understanding_score: record.understandingScore,
    support_score: record.supportScore,
    total_score: record.totalScore,
    total_questions: record.totalQuestions,
    completed_at: record.completedAt,
  };

  if (program?.familyAccessCode) {
    payload.family_code = program.familyAccessCode;
  }

  return payload;
}

export async function saveAdultAssessmentToSupabase(
  record: AdultAssessmentRecord,
): Promise<BaselineSubmitResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, message: TRACKING_SAVE_WARNING };
  }

  const programCode = resolveTrackingProgramCode();
  if (!programCode) {
    return { success: false, message: TRACKING_SAVE_WARNING };
  }

  const assessmentType = record.phase === 'baseline' ? 'adult_pre' : 'adult_post';
  const participantName = record.firstName;

  try {
    const { participantId, source: participantSource } = await findOrCreateParticipant({
      role: 'adult',
      first_name: record.firstName,
      email: record.email,
      adult_role: record.role,
      program_code: programCode,
      organization: record.organization,
      child_age_range: record.childAgeRange,
      email_opt_in: record.emailOptIn,
    });

    const v2Result = await saveAssessmentResult({
      participant_id: participantId,
      role: 'adult',
      program_code: programCode,
      assessment_type: assessmentType,
      understanding_score: record.understandingScore,
      support_score: record.supportScore,
      total_score: record.totalScore,
      max_score: record.totalQuestions,
      completed_at: record.completedAt,
    });

    const payload = adultRecordToSupabaseRow(record);
    const { data, error } = await supabase.from('assessment_results').insert(payload).select('id').single();

    if (error) {
      logTrackingSaveError({
        table: 'assessment_results',
        operation: 'insert',
        participantId,
        participantName,
        role: 'adult',
        programCode,
        assessmentType: record.assessmentType,
        response: data,
        error,
      });
      if (!v2Result.success) {
        return { success: false, message: TRACKING_SAVE_WARNING };
      }
    } else {
      logTrackingSave({
        table: 'assessment_results',
        operation: 'insert',
        participantId,
        participantName,
        role: 'adult',
        programCode,
        assessmentType: record.assessmentType,
        response: data,
      });
    }

    if (!v2Result.success) {
      logTrackingSaveError({
        table: 'assessment_results_v2',
        operation: 'insert',
        participantId,
        participantName,
        role: 'adult',
        programCode,
        assessmentType,
        error: v2Result.message,
      });
      if (error) {
        return { success: false, message: TRACKING_SAVE_WARNING };
      }
    }

    if (participantSource === 'local' || (!v2Result.success && error)) {
      return { success: false, message: TRACKING_SAVE_WARNING };
    }

    return {
      success: true,
      message:
        record.phase === 'baseline'
          ? 'Adult baseline saved. Training missions are now unlocked.'
          : 'Adult growth check saved. Your certificate is ready.',
    };
  } catch (err) {
    logTrackingSaveError({
      table: 'assessment_results',
      operation: 'insert',
      participantName,
      role: 'adult',
      programCode,
      assessmentType: record.assessmentType,
      error: err,
    });
    return { success: false, message: TRACKING_SAVE_WARNING };
  }
}

/** @deprecated Use saveAdultAssessmentToSupabase */
export async function insertAdultAssessmentResult(
  record: AdultAssessmentRecord,
): Promise<BaselineSubmitResult> {
  return saveAdultAssessmentToSupabase(record);
}

export async function saveStudentBaselineToSupabase(
  record: B4BaselineCheckRecord,
): Promise<BaselineSubmitResult> {
  const programCode = resolveTrackingProgramCode();
  if (!programCode) {
    return { success: false, message: TRACKING_SAVE_WARNING };
  }

  return saveStudentAssessmentToSupabase({
    nickname: record.nickname,
    assessmentType: 'baseline',
    groupName: record.groupName || undefined,
    feelingsScore: record.feelingsScore,
    readingScore: record.readingScore,
    focusScore: record.focusMovesScore,
    maxScore: 60,
    modulesCompleted: BASELINE_MODULES,
    completedAt: record.completedAt,
    answersJson: {
      completedModules: record.completedModules,
      feelingsScore: record.feelingsScore,
      readingScore: record.readingScore,
      focusMovesScore: record.focusMovesScore,
      nickname: record.nickname,
    },
  });
}

/** @deprecated Use saveStudentBaselineToSupabase */
export async function insertAssessmentResult(
  record: B4BaselineCheckRecord,
): Promise<BaselineSubmitResult> {
  return saveStudentBaselineToSupabase(record);
}

export async function fetchAssessmentResultsFromSupabase(programCode?: string): Promise<{
  results: B4BaselineCheckRecord[];
  error?: string;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return { results: [], error: 'missing_env' };
  }

  try {
    let query = supabase.from('assessment_results').select('*').order('completed_at', { ascending: false });

    if (programCode?.trim()) {
      query = query.eq('program_code', programCode.trim());
    }

    const { data, error } = await query;

    console.log('[DASHBOARD] Supabase query response:', { data, error });

    if (error) {
      console.warn('[assessment_results] select failed:', error.message);
      return { results: [], error: error.message };
    }

    const rows = (data ?? []) as AssessmentResultRow[];
    const studentRows = rows.filter(isStudentBaselineRow);
    const results = studentRows.map(supabaseRowToRecord);

    console.log('[DASHBOARD] Supabase raw row count:', rows.length);
    console.log('[DASHBOARD] Supabase rows after completedAt filter:', results.length);

    return { results };
  } catch (err) {
    console.warn('[assessment_results] select error:', err);
    return { results: [], error: 'fetch_failed' };
  }
}

export async function loadAssessmentResults(programCode?: string): Promise<AssessmentResultsLoad> {
  const localResults = loadAllBaselineResults();
  const normalizedCode = programCode?.trim();
  const scopedToProgram = Boolean(normalizedCode);
  const filteredLocal = scopedToProgram
    ? localResults.filter(
        (row) => row.programCode.trim().toUpperCase() === normalizedCode!.toUpperCase(),
      )
    : localResults;

  if (!isSupabaseConfigured()) {
    if (scopedToProgram) {
      return { results: [], source: 'supabase' };
    }
    return { results: filteredLocal, source: 'local' };
  }

  try {
    const { results: remoteResults, error } = await withTimeout(
      fetchAssessmentResultsFromSupabase(normalizedCode),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'assessment_results',
    );

    if (error) {
      if (scopedToProgram) {
        return {
          results: [],
          source: 'supabase',
          warning: PORTAL_CONNECTION_ERROR_MESSAGE,
        };
      }
      return {
        results: filteredLocal,
        source: 'local',
        warning: SUPABASE_SELECT_POLICY_HINT,
      };
    }

    if (remoteResults.length > 0) {
      return { results: remoteResults, source: 'supabase' };
    }

    if (scopedToProgram) {
      return { results: [], source: 'supabase' };
    }

    return {
      results: filteredLocal,
      source: filteredLocal.length > 0 ? 'local' : 'supabase',
    };
  } catch {
    if (scopedToProgram) {
      return {
        results: [],
        source: 'supabase',
        warning: PORTAL_CONNECTION_ERROR_MESSAGE,
      };
    }
    return {
      results: filteredLocal,
      source: 'local',
      warning: PORTAL_CONNECTION_ERROR_MESSAGE,
    };
  }
}
