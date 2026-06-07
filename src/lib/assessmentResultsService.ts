import type { BaselineModuleId } from '../data/b4BaselineCheckContent';
import { B4_BASELINE_ASSESSMENT_NAME } from '../data/b4BaselineCheckContent';
import type { B4BaselineCheckRecord } from './b4BaselineCheckStorage';
import { loadAllBaselineResults } from './b4BaselineCheckStorage';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type AssessmentResultRow = {
  id?: string;
  nickname: string;
  student_id: string;
  assessment_type: string;
  program_code: string;
  group_name: string;
  feelings_score: number;
  reading_score: number;
  focus_moves_score: number;
  modules_completed: string;
  completed_at?: string | null;
  created_at?: string | null;
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

const DEFAULT_PROGRAM_CODE = 'BlueRibbon2026';
const BASELINE_MODULES = 'feelings,reading,focus-moves';

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

export function recordToSupabaseRow(record: B4BaselineCheckRecord): Omit<AssessmentResultRow, 'id'> {
  return {
    nickname: record.nickname,
    student_id: record.anonymousStudentId,
    assessment_type: 'baseline',
    program_code: record.programCode.trim() || DEFAULT_PROGRAM_CODE,
    group_name: record.groupName,
    feelings_score: record.feelingsScore,
    reading_score: record.readingScore,
    focus_moves_score: record.focusMovesScore,
    modules_completed: BASELINE_MODULES,
    completed_at: record.completedAt || new Date().toISOString(),
  };
}

export function supabaseRowToRecord(row: AssessmentResultRow): B4BaselineCheckRecord {
  return {
    assessmentName: B4_BASELINE_ASSESSMENT_NAME,
    anonymousStudentId: row.student_id,
    nickname: row.nickname ?? '',
    programCode: row.program_code ?? '',
    groupName: row.group_name ?? '',
    completedModules: parseModulesCompleted(row.modules_completed),
    feelingsScore: row.feelings_score ?? 0,
    readingScore: row.reading_score ?? 0,
    focusMovesScore: row.focus_moves_score ?? 0,
    completedAt: resolveCompletedAt(row),
  };
}

export async function insertAssessmentResult(
  record: B4BaselineCheckRecord,
): Promise<BaselineSubmitResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      message: 'Saved on this device. Online pilot sync is unavailable right now.',
    };
  }

  try {
    const payload = recordToSupabaseRow(record);
    console.log('[submitBaselineResults] payload:', payload);

    const { data, error } = await supabase.from('assessment_results').insert(payload);

    console.log('[submitBaselineResults] data:', data);
    console.log('[submitBaselineResults] error:', error);

    if (error) {
      console.warn('[assessment_results] insert failed:', error.message);
      return {
        success: false,
        message: 'Saved on this device. Online pilot sync is unavailable right now.',
      };
    }

    return {
      success: true,
      message: "Baseline saved. You're ready to begin your Focus Flame journey.",
    };
  } catch (err) {
    console.warn('[assessment_results] insert error:', err);
    return {
      success: false,
      message: 'Saved on this device. Online pilot sync is unavailable right now.',
    };
  }
}

export async function fetchAssessmentResultsFromSupabase(): Promise<{
  results: B4BaselineCheckRecord[];
  error?: string;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return { results: [], error: 'missing_env' };
  }

  try {
    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .order('completed_at', { ascending: false });

    console.log('[DASHBOARD] Supabase query response:', { data, error });

    if (error) {
      console.warn('[assessment_results] select failed:', error.message);
      return { results: [], error: error.message };
    }

    const rows = (data ?? []) as AssessmentResultRow[];
    const results = rows.map(supabaseRowToRecord);

    console.log('[DASHBOARD] Supabase raw row count:', rows.length);
    console.log('[DASHBOARD] Supabase rows after completedAt filter:', results.length);

    return { results };
  } catch (err) {
    console.warn('[assessment_results] select error:', err);
    return { results: [], error: 'fetch_failed' };
  }
}

export async function loadAssessmentResults(): Promise<AssessmentResultsLoad> {
  const localResults = loadAllBaselineResults();
  console.log('[DASHBOARD] Local rows:', localResults.length, localResults);

  if (!isSupabaseConfigured()) {
    console.log('[DASHBOARD] Selected source:', 'local');
    console.log('[DASHBOARD] Reason:', 'Supabase env vars not configured');
    return { results: localResults, source: 'local' };
  }

  const { results: remoteResults, error } = await fetchAssessmentResultsFromSupabase();
  console.log('[DASHBOARD] Supabase rows:', remoteResults.length, remoteResults);

  if (error) {
    console.log('[DASHBOARD] Selected source:', 'local');
    console.log(
      '[DASHBOARD] Reason:',
      `Supabase SELECT failed (${error}); falling back to localStorage`,
    );
    return {
      results: localResults,
      source: 'local',
      warning: SUPABASE_SELECT_POLICY_HINT,
    };
  }

  if (remoteResults.length > 0) {
    console.log('[DASHBOARD] Selected source:', 'supabase');
    console.log('[DASHBOARD] Reason:', 'Supabase returned one or more valid rows');
    return { results: remoteResults, source: 'supabase' };
  }

  const source = localResults.length > 0 ? 'local' : 'supabase';
  const reason =
    localResults.length > 0
      ? 'Supabase returned zero rows; localStorage has data — hybrid fallback to local'
      : 'Supabase returned zero rows; no local data — source marked supabase with empty results';

  console.log('[DASHBOARD] Selected source:', source);
  console.log('[DASHBOARD] Reason:', reason);

  return {
    results: localResults,
    source,
  };
}
