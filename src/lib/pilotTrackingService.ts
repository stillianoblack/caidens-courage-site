import { readActivePilotProgram } from '../config/activePilotProgram';
import {
  logTrackingSaveBlocked,
  resolveTrackingProgramCode,
} from './activeProgramContext';
import type { FormalAssessmentType } from '../types/moduleTracking';
import { PORTAL_CONNECTION_ERROR_MESSAGE } from './portalAccessCodes';
import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from './fetchWithTimeout';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import {
  appendLocalAssessmentV2Result,
  appendLocalModuleResult,
  countLocalModuleAttempts,
  createLocalParticipant,
  findLocalAdultParticipant,
  findLocalStudentParticipant,
  loadLocalAssessmentV2Results,
  loadLocalModuleResults,
  saveLocalParticipant,
  type LocalAssessmentV2Record,
  type LocalModuleResultRecord,
  type LocalParticipantRecord,
} from './pilotTrackingLocalStorage';

export type TrackingSubmitResult = {
  success: boolean;
  source: 'supabase' | 'local';
  message?: string;
  participantId?: string;
  recordId?: string;
};

export type ParticipantPayload = {
  nickname?: string;
  first_name?: string;
  email?: string;
  role: string;
  adult_role?: string;
  program_code?: string;
  program_name?: string;
  group_name?: string;
  organization?: string;
  child_age_range?: string;
  email_opt_in?: boolean;
};

export type ModuleResultPayload = {
  participant_id: string;
  role: string;
  program_code: string;
  group_name?: string;
  module_id: string;
  module_title: string;
  character: string;
  skill_area?: string;
  score: number;
  max_score: number;
  percent_score?: number;
  time_spent_seconds?: number;
  attempt_number?: number;
  answers_json?: Record<string, unknown>;
  completed_at?: string;
};

export type AssessmentResultV2Payload = {
  participant_id: string;
  role: string;
  program_code: string;
  group_name?: string;
  assessment_type: FormalAssessmentType;
  reading_score?: number;
  focus_score?: number;
  confidence_score?: number;
  understanding_score?: number;
  support_score?: number;
  total_score?: number;
  max_score?: number;
  percent_score?: number;
  answers_json?: Record<string, unknown>;
  completed_at?: string;
};

function logParticipantSaved(participantId: string, programCode: string): void {
  console.log('[PARTICIPANT_SAVED]', participantId, programCode);
}

function logTrackingSaveFailed(context: string, detail?: unknown): void {
  console.warn('[TRACKING_SAVE_FAILED]', context, detail ?? '');
}

function resolveProgramName(name?: string): string | undefined {
  const program = readActivePilotProgram();
  return name?.trim() || program?.programName || undefined;
}

function isStudentRole(role: string): boolean {
  return role === 'student';
}

function computePercent(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return Math.round((score / maxScore) * 10000) / 100;
}

function isSupabaseParticipantId(participantId: string): boolean {
  return !participantId.startsWith('local-');
}

function participantToLocalRow(
  participant: ParticipantPayload,
  id: string,
  programCode: string,
): LocalParticipantRecord {
  const now = new Date().toISOString();
  return {
    id,
    nickname: participant.nickname,
    first_name: participant.first_name,
    email: participant.email,
    role: participant.role,
    adult_role: participant.adult_role,
    program_code: programCode,
    program_name: resolveProgramName(participant.program_name),
    group_name: participant.group_name,
    organization: participant.organization,
    child_age_range: participant.child_age_range,
    email_opt_in: participant.email_opt_in,
    created_at: now,
    updated_at: now,
  };
}

function applyStudentGroupFilter<T extends { eq: (col: string, val: string) => T; or: (filters: string) => T }>(
  query: T,
  groupName?: string,
): T {
  const trimmed = groupName?.trim();
  if (trimmed) {
    return query.eq('group_name', trimmed);
  }
  return query.or('group_name.is.null,group_name.eq.');
}

export async function findOrCreateParticipant(
  payload: ParticipantPayload,
): Promise<{ participantId: string; source: 'supabase' | 'local' }> {
  const programCode = resolveTrackingProgramCode();
  if (!programCode) {
    logTrackingSaveBlocked('findOrCreateParticipant requires active program context');
    throw new Error('Missing active program context');
  }

  const programName = resolveProgramName(payload.program_name);
  const normalizedPayload: ParticipantPayload = {
    ...payload,
    program_code: programCode,
    program_name: programName,
  };

  if (isStudentRole(payload.role)) {
    if (!payload.nickname?.trim()) {
      throw new Error('Student participants require nickname.');
    }
  } else if (!payload.first_name?.trim() || !payload.email?.trim()) {
    throw new Error('Adult participants require first_name and email.');
  }

  const existingLocal = isStudentRole(payload.role)
    ? findLocalStudentParticipant({
        nickname: payload.nickname ?? '',
        role: payload.role,
        programCode,
        groupName: payload.group_name,
      })
    : findLocalAdultParticipant({
        email: payload.email ?? '',
        programCode,
      });

  if (existingLocal && (!isSupabaseConfigured() || !supabase)) {
    return { participantId: existingLocal.id, source: 'local' };
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('participants').select('id').eq('program_code', programCode);

      if (isStudentRole(payload.role)) {
        query = query
          .eq('role', 'student')
          .eq('nickname', payload.nickname?.trim() ?? '');
        query = applyStudentGroupFilter(query, payload.group_name);
      } else {
        query = query
          .eq('email', payload.email?.trim() ?? '')
          .in('role', ['adult', 'facilitator', 'parent']);
      }

      const { data: existingRows, error: selectError } = await withTimeout(
        query.limit(1),
        DASHBOARD_FETCH_TIMEOUT_MS,
        'participant_lookup',
      );

      if (selectError) {
        logTrackingSaveFailed('participants lookup', selectError.message);
      } else if (existingRows && existingRows.length > 0) {
        const participantId = existingRows[0].id as string;
        saveLocalParticipant(participantToLocalRow(normalizedPayload, participantId, programCode));
        logParticipantSaved(participantId, programCode);
        return { participantId, source: 'supabase' };
      }

      const insertPayload: Record<string, unknown> = {
        nickname: payload.nickname?.trim() || null,
        first_name: payload.first_name?.trim() || null,
        email: payload.email?.trim() || null,
        role: isStudentRole(payload.role) ? 'student' : 'adult',
        program_code: programCode,
        program_name: programName ?? null,
        group_name: payload.group_name?.trim() || null,
        organization: payload.organization?.trim() || null,
        child_age_range: payload.child_age_range?.trim() || null,
        email_opt_in: payload.email_opt_in ?? false,
        updated_at: new Date().toISOString(),
      };

      if (payload.adult_role?.trim()) {
        insertPayload.adult_role = payload.adult_role.trim();
      }

      const { data, error } = await withTimeout(
        supabase.from('participants').insert(insertPayload).select('id').single(),
        DASHBOARD_FETCH_TIMEOUT_MS,
        'participant_insert',
      );

      if (!error && data?.id) {
        const participantId = data.id as string;
        saveLocalParticipant(participantToLocalRow(normalizedPayload, participantId, programCode));
        logParticipantSaved(participantId, programCode);
        return { participantId, source: 'supabase' };
      }

      logTrackingSaveFailed('participants insert', error?.message ?? error);
    } catch (err) {
      logTrackingSaveFailed('participants', err);
    }
  }

  if (existingLocal) {
    logTrackingSaveFailed('participants using cached local id', existingLocal.id);
    return { participantId: existingLocal.id, source: 'local' };
  }

  const localParticipant = createLocalParticipant({
    nickname: payload.nickname?.trim(),
    first_name: payload.first_name?.trim(),
    email: payload.email?.trim(),
    role: isStudentRole(payload.role) ? 'student' : 'adult',
    adult_role: payload.adult_role?.trim(),
    program_code: programCode,
    program_name: programName,
    group_name: payload.group_name?.trim(),
    organization: payload.organization?.trim(),
    child_age_range: payload.child_age_range?.trim(),
    email_opt_in: payload.email_opt_in,
  });

  logTrackingSaveFailed('participants saved locally only', localParticipant.id);
  return { participantId: localParticipant.id, source: 'local' };
}

export async function saveModuleResult(payload: ModuleResultPayload): Promise<TrackingSubmitResult> {
  const programCode = resolveTrackingProgramCode();
  if (!programCode) {
    return {
      success: false,
      source: 'local',
      message: 'Missing active program context.',
    };
  }

  const completedAt = payload.completed_at ?? new Date().toISOString();
  const percentScore = payload.percent_score ?? computePercent(payload.score, payload.max_score);
  const attemptNumber =
    payload.attempt_number ??
    countLocalModuleAttempts(payload.participant_id, payload.module_id) + 1;

  const localPayload: Omit<LocalModuleResultRecord, 'id'> = {
    participant_id: payload.participant_id,
    role: payload.role,
    program_code: programCode,
    group_name: payload.group_name,
    module_id: payload.module_id,
    module_title: payload.module_title,
    character: payload.character,
    skill_area: payload.skill_area,
    score: payload.score,
    max_score: payload.max_score,
    percent_score: percentScore,
    time_spent_seconds: payload.time_spent_seconds,
    attempt_number: attemptNumber,
    answers_json: payload.answers_json,
    completed_at: completedAt,
  };

  if (isSupabaseConfigured() && supabase) {
    if (!isSupabaseParticipantId(payload.participant_id)) {
      logTrackingSaveFailed(
        'module_results skipped: participant not synced to Supabase',
        payload.participant_id,
      );
    } else {
      try {
        const insertPayload = {
          participant_id: payload.participant_id,
          role: payload.role,
          program_code: programCode,
          group_name: payload.group_name ?? null,
          module_id: payload.module_id,
          module_title: payload.module_title,
          character: payload.character,
          skill_area: payload.skill_area ?? null,
          score: payload.score,
          max_score: payload.max_score,
          percent_score: percentScore,
          time_spent_seconds: payload.time_spent_seconds ?? null,
          attempt_number: attemptNumber,
          answers_json: payload.answers_json ?? null,
          completed_at: completedAt,
        };

        const { data, error } = await withTimeout(
          supabase.from('module_results').insert(insertPayload).select('id').single(),
          DASHBOARD_FETCH_TIMEOUT_MS,
          'module_result_insert',
        );

        if (!error && data?.id) {
          const localRecord = appendLocalModuleResult(localPayload);
          return {
            success: true,
            source: 'supabase',
            participantId: payload.participant_id,
            recordId: (data.id as string) ?? localRecord.id,
          };
        }

        logTrackingSaveFailed('module_results insert', error?.message ?? error);
      } catch (err) {
        logTrackingSaveFailed('module_results', err);
      }
    }
  }

  const localRecord = appendLocalModuleResult(localPayload);
  return {
    success: !isSupabaseConfigured(),
    source: 'local',
    participantId: payload.participant_id,
    recordId: localRecord.id,
    message: isSupabaseConfigured() ? 'Saved on this device only.' : 'Saved on this device.',
  };
}

export async function saveAssessmentResult(
  payload: AssessmentResultV2Payload,
): Promise<TrackingSubmitResult> {
  const programCode = resolveTrackingProgramCode();
  if (!programCode) {
    return {
      success: false,
      source: 'local',
      message: 'Missing active program context.',
    };
  }

  const completedAt = payload.completed_at ?? new Date().toISOString();
  const percentScore =
    payload.percent_score ??
    (payload.total_score != null && payload.max_score
      ? computePercent(payload.total_score, payload.max_score)
      : undefined);

  const localPayload: Omit<LocalAssessmentV2Record, 'id'> = {
    participant_id: payload.participant_id,
    role: payload.role,
    program_code: programCode,
    group_name: payload.group_name,
    assessment_type: payload.assessment_type,
    reading_score: payload.reading_score,
    focus_score: payload.focus_score,
    confidence_score: payload.confidence_score,
    understanding_score: payload.understanding_score,
    support_score: payload.support_score,
    total_score: payload.total_score,
    max_score: payload.max_score,
    percent_score: percentScore,
    answers_json: payload.answers_json,
    completed_at: completedAt,
  };

  if (isSupabaseConfigured() && supabase) {
    if (!isSupabaseParticipantId(payload.participant_id)) {
      logTrackingSaveFailed(
        'assessment_results_v2 skipped: participant not synced to Supabase',
        payload.participant_id,
      );
    } else {
      try {
        const insertPayload = {
          participant_id: payload.participant_id,
          role: payload.role,
          program_code: programCode,
          group_name: payload.group_name ?? null,
          assessment_type: payload.assessment_type,
          reading_score: payload.reading_score ?? null,
          focus_score: payload.focus_score ?? null,
          confidence_score: payload.confidence_score ?? null,
          understanding_score: payload.understanding_score ?? null,
          support_score: payload.support_score ?? null,
          total_score: payload.total_score ?? null,
          max_score: payload.max_score ?? null,
          percent_score: percentScore ?? null,
          answers_json: payload.answers_json ?? null,
          completed_at: completedAt,
        };

        const { data, error } = await withTimeout(
          supabase.from('assessment_results_v2').insert(insertPayload).select('id').single(),
          DASHBOARD_FETCH_TIMEOUT_MS,
          'assessment_result_insert',
        );

        if (!error && data?.id) {
          const localRecord = appendLocalAssessmentV2Result(localPayload);
          return {
            success: true,
            source: 'supabase',
            participantId: payload.participant_id,
            recordId: (data?.id as string) ?? localRecord.id,
          };
        }

        logTrackingSaveFailed('assessment_results_v2 insert', error?.message ?? error);
      } catch (err) {
        logTrackingSaveFailed('assessment_results_v2', err);
      }
    }
  }

  const localRecord = appendLocalAssessmentV2Result(localPayload);
  return {
    success: !isSupabaseConfigured(),
    source: 'local',
    participantId: payload.participant_id,
    recordId: localRecord.id,
    message: isSupabaseConfigured() ? 'Saved on this device only.' : 'Saved on this device.',
  };
}

export async function fetchModuleResultsFromSupabase(programCode?: string): Promise<{
  results: LocalModuleResultRecord[];
  error?: string;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return { results: loadLocalModuleResults(), error: 'missing_env' };
  }

  try {
    let query = supabase
      .from('module_results')
      .select('*')
      .order('completed_at', { ascending: false });

    if (programCode?.trim()) {
      query = query.eq('program_code', programCode.trim());
    }

    const { data, error } = await query;
    if (error) {
      return { results: loadLocalModuleResults(), error: error.message };
    }

    return { results: (data ?? []) as LocalModuleResultRecord[] };
  } catch {
    return { results: loadLocalModuleResults(), error: 'fetch_failed' };
  }
}

export async function fetchAssessmentV2FromSupabase(programCode?: string): Promise<{
  results: LocalAssessmentV2Record[];
  error?: string;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return { results: loadLocalAssessmentV2Results(), error: 'missing_env' };
  }

  try {
    let query = supabase
      .from('assessment_results_v2')
      .select('*')
      .order('completed_at', { ascending: false });

    if (programCode?.trim()) {
      query = query.eq('program_code', programCode.trim());
    }

    const { data, error } = await query;
    if (error) {
      return { results: loadLocalAssessmentV2Results(), error: error.message };
    }

    return { results: (data ?? []) as LocalAssessmentV2Record[] };
  } catch {
    return { results: loadLocalAssessmentV2Results(), error: 'fetch_failed' };
  }
}

export async function loadPilotTrackingData(programCode?: string): Promise<{
  moduleResults: LocalModuleResultRecord[];
  assessmentResults: LocalAssessmentV2Record[];
  source: 'supabase' | 'local' | 'hybrid';
  warning?: string;
}> {
  const normalizedCode = programCode?.trim();
  const scopedToProgram = Boolean(normalizedCode);
  const localModules = loadLocalModuleResults();
  const localAssessments = loadLocalAssessmentV2Results();

  if (!isSupabaseConfigured()) {
    if (scopedToProgram) {
      return { moduleResults: [], assessmentResults: [], source: 'supabase' };
    }
    return {
      moduleResults: localModules,
      assessmentResults: localAssessments,
      source: 'local',
    };
  }

  try {
    const [modulePayload, assessmentPayload] = await withTimeout(
      Promise.all([
        fetchModuleResultsFromSupabase(normalizedCode),
        fetchAssessmentV2FromSupabase(normalizedCode),
      ]),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'pilot_tracking',
    );

    const fetchWarning = modulePayload.error || assessmentPayload.error;

    if (scopedToProgram) {
      return {
        moduleResults: modulePayload.results,
        assessmentResults: assessmentPayload.results,
        source: 'supabase',
        warning: fetchWarning ? PORTAL_CONNECTION_ERROR_MESSAGE : undefined,
      };
    }

    const moduleResults =
      modulePayload.results.length > 0 ? modulePayload.results : localModules;
    const assessmentResults =
      assessmentPayload.results.length > 0 ? assessmentPayload.results : localAssessments;

    const source =
      modulePayload.results.length > 0 || assessmentPayload.results.length > 0
        ? localModules.length > 0 || localAssessments.length > 0
          ? 'hybrid'
          : 'supabase'
        : 'local';

    return {
      moduleResults,
      assessmentResults,
      source,
      warning: fetchWarning || undefined,
    };
  } catch {
    if (scopedToProgram) {
      return {
        moduleResults: [],
        assessmentResults: [],
        source: 'supabase',
        warning: PORTAL_CONNECTION_ERROR_MESSAGE,
      };
    }
    return {
      moduleResults: localModules,
      assessmentResults: localAssessments,
      source: 'local',
      warning: PORTAL_CONNECTION_ERROR_MESSAGE,
    };
  }
}
