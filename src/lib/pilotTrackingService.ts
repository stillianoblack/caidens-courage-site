import { readActiveChildNickname } from '../config/activeChildNickname';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { loadB4BaselineState } from './b4BaselineCheckStorage';
import {
  logTrackingSaveBlocked,
  resolveTrackingProgramCode,
} from './activeProgramContext';
import {
  logProgramAssignmentAudit,
  logProgramAssignmentSave,
  shouldForceFamilyProgramResolution,
} from './portalProgramAssignment';
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
import {
  logTrackingSave,
  logTrackingSaveError,
} from './trackingSaveLog';

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
  /** When known, look up this participant before nickname/first_name matching. */
  participant_id?: string;
};

export type EnsureStudentParticipantInput = {
  participantId?: string;
  firstName?: string;
  nickname?: string;
  groupName?: string;
};

export type EnsureStudentParticipantResult = {
  participantId: string;
  firstName: string;
  nickname: string;
  programCode: string;
  source: 'supabase' | 'local';
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

const SUPABASE_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidSupabaseParticipantId(participantId?: string | null): boolean {
  const trimmed = participantId?.trim() ?? '';
  return Boolean(trimmed) && !trimmed.startsWith('local-') && SUPABASE_UUID_PATTERN.test(trimmed);
}

function isSupabaseParticipantId(participantId: string): boolean {
  return isValidSupabaseParticipantId(participantId);
}

/** Family portal students are not grouped by classroom — keep group_name null for lookups. */
export function resolveStudentGroupNameForSave(groupName?: string): string | undefined {
  if (shouldForceFamilyProgramResolution()) {
    return undefined;
  }
  const trimmed = groupName?.trim();
  return trimmed || undefined;
}

function buildStudentParticipantOrFilter(nickname?: string, firstName?: string): string | null {
  const names = new Set<string>();
  if (nickname?.trim()) names.add(nickname.trim());
  if (firstName?.trim()) names.add(firstName.trim());
  if (!names.size) return null;
  return Array.from(names)
    .flatMap((name) => [`nickname.eq.${name}`, `first_name.eq.${name}`])
    .join(',');
}

/** Resolve a Supabase student participant before module/assessment saves. */
export async function ensureStudentParticipantForSave(
  input: EnsureStudentParticipantInput = {},
): Promise<EnsureStudentParticipantResult> {
  const baselineState = loadB4BaselineState();
  const programCode = resolveTrackingProgramCode('student_participant_ensure');
  if (!programCode) {
    throw new Error('Missing active program context');
  }

  const nickname =
    input.nickname?.trim() ||
    baselineState.profile?.nickname?.trim() ||
    readActiveChildNickname()?.trim() ||
    '';
  const firstName =
    input.firstName?.trim() ||
    baselineState.profile?.firstName?.trim() ||
    nickname;
  const participantId =
    input.participantId?.trim() ||
    readActiveChildParticipantId()?.trim() ||
    baselineState.profile?.participantId?.trim() ||
    '';
  const groupName = resolveStudentGroupNameForSave(
    input.groupName?.trim() || baselineState.profile?.groupName?.trim(),
  );

  if (!nickname && !firstName) {
    throw new Error('Student participants require nickname or first_name.');
  }

  const resolvedNickname = nickname || firstName;
  const resolvedFirstName = firstName || resolvedNickname;

  const { participantId: ensuredId, source } = await findOrCreateParticipant({
    role: 'student',
    participant_id: isValidSupabaseParticipantId(participantId) ? participantId : undefined,
    nickname: resolvedNickname,
    first_name: resolvedFirstName,
    program_code: programCode,
    group_name: groupName,
  });

  console.info('[CHILD_PROFILE]', {
    action: 'ensure_for_save',
    participant_id: ensuredId,
    first_name: resolvedFirstName,
    nickname: resolvedNickname,
    program_code: programCode,
    source,
    had_known_id: isValidSupabaseParticipantId(participantId),
  });

  return {
    participantId: ensuredId,
    firstName: resolvedFirstName,
    nickname: resolvedNickname,
    programCode,
    source,
  };
}

function normalizeProgramCode(code?: string | null): string | null {
  const normalized = code?.trim();
  return normalized ? normalized : null;
}

function resolveResultProgramCode(
  payloadProgramCode: string,
  saveContext: string,
  table: 'module_results' | 'assessment_results_v2',
): string | null {
  const resolvedProgramCode = resolveTrackingProgramCode(saveContext);
  const payloadCode = normalizeProgramCode(payloadProgramCode);

  if (shouldForceFamilyProgramResolution()) {
    const finalProgramCode = resolvedProgramCode || payloadCode;
    logProgramAssignmentSave({ table, saveContext, finalProgramCode });
    return finalProgramCode;
  }

  if (payloadCode && resolvedProgramCode && payloadCode !== resolvedProgramCode) {
    const familyCode =
      payloadCode.toUpperCase().startsWith('FAMILY-')
        ? payloadCode
        : resolvedProgramCode.toUpperCase().startsWith('FAMILY-')
          ? resolvedProgramCode
          : null;
    console.warn('[PROGRAM_ASSIGNMENT_MISMATCH]', {
      save_context: saveContext,
      resolved_program_code: resolvedProgramCode,
      payload_program_code: payloadCode,
      saved_program_code: familyCode ?? resolvedProgramCode,
    });
    const finalProgramCode = familyCode ?? resolvedProgramCode;
    logProgramAssignmentSave({ table, saveContext, finalProgramCode });
    return finalProgramCode;
  }

  const finalProgramCode = resolvedProgramCode || payloadCode;
  logProgramAssignmentSave({ table, saveContext, finalProgramCode });
  return finalProgramCode;
}

function isMissingAdultRoleColumnError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const record = error as { message?: string; details?: string; hint?: string; code?: string };
  const text = `${record.message ?? ''} ${record.details ?? ''} ${record.hint ?? ''}`.toLowerCase();
  return text.includes('adult_role') || text.includes('schema cache');
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
  const programCode = resolveTrackingProgramCode('participant_upsert');
  if (!programCode) {
    logTrackingSaveBlocked('findOrCreateParticipant requires active program context');
    throw new Error('Missing active program context');
  }

  logProgramAssignmentSave({
    table: 'participants',
    saveContext: 'participant_upsert',
    finalProgramCode: programCode,
  });

  const programName = resolveProgramName(payload.program_name);
  const normalizedPayload: ParticipantPayload = {
    ...payload,
    program_code: programCode,
    program_name: programName,
  };

  logProgramAssignmentAudit({
    saveContext: 'participant_upsert',
    participantName: payload.nickname || payload.first_name || payload.email,
    participantRole: payload.role,
    participantNickname: payload.nickname,
    participantFirstName: payload.first_name,
    participantEmail: payload.email,
    payloadProgramCode: payload.program_code,
  });

  if (isStudentRole(payload.role)) {
    if (!payload.nickname?.trim() && !payload.first_name?.trim()) {
      throw new Error('Student participants require nickname or first_name.');
    }
  } else if (!payload.first_name?.trim() || !payload.email?.trim()) {
    throw new Error('Adult participants require first_name and email.');
  }

  const existingLocal = isStudentRole(payload.role)
    ? findLocalStudentParticipant({
        nickname: payload.nickname ?? '',
        firstName: payload.first_name,
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
      if (isStudentRole(payload.role) && isValidSupabaseParticipantId(payload.participant_id)) {
        const { data: byIdRows, error: byIdError } = await withTimeout(
          supabase
            .from('participants')
            .select('id')
            .eq('id', payload.participant_id!.trim())
            .eq('program_code', programCode)
            .eq('role', 'student')
            .limit(1),
          DASHBOARD_FETCH_TIMEOUT_MS,
          'participant_lookup_by_id',
        );

        if (byIdError) {
          logTrackingSaveError({
            table: 'participants',
            operation: 'select',
            participantId: payload.participant_id,
            participantName: payload.nickname || payload.first_name,
            role: payload.role,
            programCode,
            error: byIdError,
          });
        } else if (byIdRows && byIdRows.length > 0) {
          const participantId = byIdRows[0].id as string;
          saveLocalParticipant(participantToLocalRow(normalizedPayload, participantId, programCode));
          return { participantId, source: 'supabase' };
        }
      }

      let query = supabase.from('participants').select('id').eq('program_code', programCode);

      if (isStudentRole(payload.role)) {
        query = query.eq('role', 'student');
        const nickname = payload.nickname?.trim();
        const firstName = payload.first_name?.trim();
        const orFilter = buildStudentParticipantOrFilter(nickname, firstName);
        if (orFilter) {
          query = query.or(orFilter);
        }
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
        logTrackingSaveError({
          table: 'participants',
          operation: 'select',
          participantName: payload.nickname || payload.first_name,
          role: payload.role,
          programCode,
          error: selectError,
        });
      } else if (existingRows && existingRows.length > 0) {
        const participantId = existingRows[0].id as string;
        const updatePayload: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };
        if (payload.nickname?.trim()) updatePayload.nickname = payload.nickname.trim();
        if (payload.first_name?.trim()) updatePayload.first_name = payload.first_name.trim();
        if (programName) updatePayload.program_name = programName;
        if (payload.group_name?.trim()) updatePayload.group_name = payload.group_name.trim();

        const { error: updateError } = await withTimeout(
          supabase.from('participants').update(updatePayload).eq('id', participantId),
          DASHBOARD_FETCH_TIMEOUT_MS,
          'participant_update',
        );

        if (updateError) {
          logTrackingSaveError({
            table: 'participants',
            operation: 'update',
            participantId,
            participantName: payload.nickname || payload.first_name,
            role: payload.role,
            programCode,
            error: updateError,
          });
        } else {
          logTrackingSave({
            table: 'participants',
            operation: 'update',
            participantId,
            participantName: payload.nickname || payload.first_name,
            role: payload.role,
            programCode,
            response: { updated: true },
          });
        }

        saveLocalParticipant(participantToLocalRow(normalizedPayload, participantId, programCode));
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

      let { data, error } = await withTimeout(
        supabase.from('participants').insert(insertPayload).select('id').single(),
        DASHBOARD_FETCH_TIMEOUT_MS,
        'participant_insert',
      );

      if (error && 'adult_role' in insertPayload && isMissingAdultRoleColumnError(error)) {
        const retryPayload = { ...insertPayload };
        delete retryPayload.adult_role;
        const retry = await withTimeout(
          supabase.from('participants').insert(retryPayload).select('id').single(),
          DASHBOARD_FETCH_TIMEOUT_MS,
          'participant_insert_without_adult_role',
        );
        data = retry.data;
        error = retry.error;
      }

      if (!error && data?.id) {
        const participantId = data.id as string;
        saveLocalParticipant(participantToLocalRow(normalizedPayload, participantId, programCode));
        logTrackingSave({
          table: 'participants',
          operation: 'insert',
          participantId,
          participantName: payload.nickname || payload.first_name,
          role: payload.role,
          programCode,
          response: data,
        });
        return { participantId, source: 'supabase' };
      }

      logTrackingSaveError({
        table: 'participants',
        operation: 'insert',
        participantName: payload.nickname || payload.first_name,
        role: payload.role,
        programCode,
        error,
      });
    } catch (err) {
      logTrackingSaveError({
        table: 'participants',
        operation: 'insert',
        participantName: payload.nickname || payload.first_name,
        role: payload.role,
        programCode,
        error: err,
      });
    }
  }

  if (existingLocal) {
    logTrackingSaveError({
      table: 'participants',
      operation: 'insert',
      participantId: existingLocal.id,
      participantName: payload.nickname || payload.first_name,
      role: payload.role,
      programCode,
      error: 'using cached local participant id',
    });
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

  logTrackingSaveError({
    table: 'participants',
    operation: 'insert',
    participantId: localParticipant.id,
    participantName: payload.nickname || payload.first_name,
    role: payload.role,
    programCode,
    error: 'saved locally only',
  });
  return { participantId: localParticipant.id, source: 'local' };
}

export async function saveModuleResult(payload: ModuleResultPayload): Promise<TrackingSubmitResult> {
  let resolvedPayload = payload;

  if (payload.role === 'student') {
    try {
      const ensured = await ensureStudentParticipantForSave({
        participantId: payload.participant_id,
        groupName: payload.group_name,
      });
      resolvedPayload = {
        ...payload,
        participant_id: ensured.participantId,
        program_code: ensured.programCode,
        group_name: resolveStudentGroupNameForSave(payload.group_name),
      };
    } catch (err) {
      logTrackingSaveError({
        table: 'module_results',
        operation: 'insert',
        participantId: payload.participant_id,
        role: payload.role,
        programCode: payload.program_code,
        assessmentType: payload.module_id,
        error: err,
      });
      return {
        success: false,
        source: 'local',
        message: 'Missing active program context.',
      };
    }
  }

  const programCode = resolveResultProgramCode(
    resolvedPayload.program_code,
    'module_result_insert',
    'module_results',
  );
  if (!programCode) {
    return {
      success: false,
      source: 'local',
      message: 'Missing active program context.',
    };
  }

  const completedAt = resolvedPayload.completed_at ?? new Date().toISOString();
  const percentScore =
    resolvedPayload.percent_score ?? computePercent(resolvedPayload.score, resolvedPayload.max_score);
  const attemptNumber =
    resolvedPayload.attempt_number ??
    countLocalModuleAttempts(resolvedPayload.participant_id, resolvedPayload.module_id) + 1;

  logProgramAssignmentAudit({
    saveContext: 'module_result_insert',
    participantId: resolvedPayload.participant_id,
    participantRole: resolvedPayload.role,
    payloadProgramCode: resolvedPayload.program_code,
  });

  const answersJson = {
    ...(resolvedPayload.answers_json ?? {}),
    participant_id: resolvedPayload.participant_id,
  };

  const localPayload: Omit<LocalModuleResultRecord, 'id'> = {
    participant_id: resolvedPayload.participant_id,
    role: resolvedPayload.role,
    program_code: programCode,
    group_name: resolvedPayload.group_name,
    module_id: resolvedPayload.module_id,
    module_title: resolvedPayload.module_title,
    character: resolvedPayload.character,
    skill_area: resolvedPayload.skill_area,
    score: resolvedPayload.score,
    max_score: resolvedPayload.max_score,
    percent_score: percentScore,
    time_spent_seconds: resolvedPayload.time_spent_seconds,
    attempt_number: attemptNumber,
    answers_json: answersJson,
    completed_at: completedAt,
  };

  if (isSupabaseConfigured() && supabase) {
    if (!isSupabaseParticipantId(resolvedPayload.participant_id)) {
      logTrackingSaveError({
        table: 'module_results',
        operation: 'insert',
        participantId: resolvedPayload.participant_id,
        role: resolvedPayload.role,
        programCode,
        assessmentType: resolvedPayload.module_id,
        error: 'participant not synced to Supabase',
      });
    } else {
      try {
        const insertPayload = {
          participant_id: resolvedPayload.participant_id,
          role: resolvedPayload.role,
          program_code: programCode,
          group_name: resolvedPayload.group_name ?? null,
          module_id: resolvedPayload.module_id,
          module_title: resolvedPayload.module_title,
          character: resolvedPayload.character,
          skill_area: resolvedPayload.skill_area ?? null,
          score: resolvedPayload.score,
          max_score: resolvedPayload.max_score,
          percent_score: percentScore,
          time_spent_seconds: resolvedPayload.time_spent_seconds ?? null,
          attempt_number: attemptNumber,
          answers_json: answersJson,
          completed_at: completedAt,
        };

        const { data, error } = await withTimeout(
          supabase.from('module_results').insert(insertPayload).select('id').single(),
          DASHBOARD_FETCH_TIMEOUT_MS,
          'module_result_insert',
        );

        if (!error && data?.id) {
          const localRecord = appendLocalModuleResult(localPayload);
          logTrackingSave({
            table: 'module_results',
            operation: 'insert',
            participantId: resolvedPayload.participant_id,
            role: resolvedPayload.role,
            programCode,
            assessmentType: resolvedPayload.module_id,
            response: data,
          });
          console.info('[CHILD_MODULE_SAVE]', {
            participant_id: resolvedPayload.participant_id,
            program_code: programCode,
            module_id: resolvedPayload.module_id,
          });
          return {
            success: true,
            source: 'supabase',
            participantId: resolvedPayload.participant_id,
            recordId: (data.id as string) ?? localRecord.id,
          };
        }

        logTrackingSaveError({
          table: 'module_results',
          operation: 'insert',
          participantId: resolvedPayload.participant_id,
          role: resolvedPayload.role,
          programCode,
          assessmentType: resolvedPayload.module_id,
          response: data,
          error,
        });
      } catch (err) {
        logTrackingSaveError({
          table: 'module_results',
          operation: 'insert',
          participantId: resolvedPayload.participant_id,
          role: resolvedPayload.role,
          programCode,
          assessmentType: resolvedPayload.module_id,
          error: err,
        });
      }
    }
  }

  const localRecord = appendLocalModuleResult(localPayload);
  return {
    success: !isSupabaseConfigured(),
    source: 'local',
    participantId: resolvedPayload.participant_id,
    recordId: localRecord.id,
    message: isSupabaseConfigured() ? 'Saved on this device only.' : 'Saved on this device.',
  };
}

export async function saveAssessmentResult(
  payload: AssessmentResultV2Payload,
): Promise<TrackingSubmitResult> {
  let resolvedPayload = payload;

  if (payload.role === 'student') {
    try {
      const answers = payload.answers_json as
        | { nickname?: string; first_name?: string; participant_id?: string }
        | undefined;
      const ensured = await ensureStudentParticipantForSave({
        participantId: payload.participant_id || answers?.participant_id,
        firstName: answers?.first_name,
        nickname: answers?.nickname,
        groupName: payload.group_name,
      });
      resolvedPayload = {
        ...payload,
        participant_id: ensured.participantId,
        program_code: ensured.programCode,
        group_name: resolveStudentGroupNameForSave(payload.group_name),
        answers_json: {
          ...(payload.answers_json ?? {}),
          participant_id: ensured.participantId,
          first_name: ensured.firstName,
          nickname: ensured.nickname,
        },
      };
    } catch (err) {
      logTrackingSaveError({
        table: 'assessment_results_v2',
        operation: 'insert',
        participantId: payload.participant_id,
        role: payload.role,
        programCode: payload.program_code,
        assessmentType: payload.assessment_type,
        error: err,
      });
      return {
        success: false,
        source: 'local',
        message: 'Missing active program context.',
      };
    }
  }

  const programCode = resolveResultProgramCode(
    resolvedPayload.program_code,
    'assessment_result_v2_insert',
    'assessment_results_v2',
  );
  if (!programCode) {
    return {
      success: false,
      source: 'local',
      message: 'Missing active program context.',
    };
  }

  const completedAt = resolvedPayload.completed_at ?? new Date().toISOString();
  const percentScore =
    resolvedPayload.percent_score ??
    (resolvedPayload.total_score != null && resolvedPayload.max_score
      ? computePercent(resolvedPayload.total_score, resolvedPayload.max_score)
      : undefined);

  logProgramAssignmentAudit({
    saveContext: 'assessment_result_v2_insert',
    participantId: resolvedPayload.participant_id,
    participantRole: resolvedPayload.role,
    payloadProgramCode: resolvedPayload.program_code,
  });

  const localPayload: Omit<LocalAssessmentV2Record, 'id'> = {
    participant_id: resolvedPayload.participant_id,
    role: resolvedPayload.role,
    program_code: programCode,
    group_name: resolvedPayload.group_name,
    assessment_type: resolvedPayload.assessment_type,
    reading_score: resolvedPayload.reading_score,
    focus_score: resolvedPayload.focus_score,
    confidence_score: resolvedPayload.confidence_score,
    understanding_score: resolvedPayload.understanding_score,
    support_score: resolvedPayload.support_score,
    total_score: resolvedPayload.total_score,
    max_score: resolvedPayload.max_score,
    percent_score: percentScore,
    answers_json: resolvedPayload.answers_json,
    completed_at: completedAt,
  };

  if (isSupabaseConfigured() && supabase) {
    if (!isSupabaseParticipantId(resolvedPayload.participant_id)) {
      logTrackingSaveError({
        table: 'assessment_results_v2',
        operation: 'insert',
        participantId: resolvedPayload.participant_id,
        role: resolvedPayload.role,
        programCode,
        assessmentType: resolvedPayload.assessment_type,
        error: 'participant not synced to Supabase',
      });
    } else {
      try {
        const insertPayload = {
          participant_id: resolvedPayload.participant_id,
          role: resolvedPayload.role,
          program_code: programCode,
          group_name: resolvedPayload.group_name ?? null,
          assessment_type: resolvedPayload.assessment_type,
          reading_score: resolvedPayload.reading_score ?? null,
          focus_score: resolvedPayload.focus_score ?? null,
          confidence_score: resolvedPayload.confidence_score ?? null,
          understanding_score: resolvedPayload.understanding_score ?? null,
          support_score: resolvedPayload.support_score ?? null,
          total_score: resolvedPayload.total_score ?? null,
          max_score: resolvedPayload.max_score ?? null,
          percent_score: percentScore ?? null,
          answers_json: resolvedPayload.answers_json ?? null,
          completed_at: completedAt,
        };

        const { data, error } = await withTimeout(
          supabase.from('assessment_results_v2').insert(insertPayload).select('id').single(),
          DASHBOARD_FETCH_TIMEOUT_MS,
          'assessment_result_insert',
        );

        if (!error && data?.id) {
          const localRecord = appendLocalAssessmentV2Result(localPayload);
          logTrackingSave({
            table: 'assessment_results_v2',
            operation: 'insert',
            participantId: resolvedPayload.participant_id,
            role: resolvedPayload.role,
            programCode,
            assessmentType: resolvedPayload.assessment_type,
            response: data,
          });
          return {
            success: true,
            source: 'supabase',
            participantId: resolvedPayload.participant_id,
            recordId: (data?.id as string) ?? localRecord.id,
          };
        }

        logTrackingSaveError({
          table: 'assessment_results_v2',
          operation: 'insert',
          participantId: resolvedPayload.participant_id,
          role: resolvedPayload.role,
          programCode,
          assessmentType: resolvedPayload.assessment_type,
          response: data,
          error,
        });
      } catch (err) {
        logTrackingSaveError({
          table: 'assessment_results_v2',
          operation: 'insert',
          participantId: resolvedPayload.participant_id,
          role: resolvedPayload.role,
          programCode,
          assessmentType: resolvedPayload.assessment_type,
          error: err,
        });
      }
    }
  }

  const localRecord = appendLocalAssessmentV2Result(localPayload);
  return {
    success: !isSupabaseConfigured(),
    source: 'local',
    participantId: resolvedPayload.participant_id,
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
      return { results: programCode?.trim() ? [] : loadLocalModuleResults(), error: error.message };
    }

    return { results: (data ?? []) as LocalModuleResultRecord[] };
  } catch {
    return { results: programCode?.trim() ? [] : loadLocalModuleResults(), error: 'fetch_failed' };
  }
}

export type StudentParticipantRecord = {
  id: string;
  nickname: string | null;
  first_name: string | null;
  role: string;
  program_code: string;
  created_at: string;
};

export async function fetchStudentParticipantsFromSupabase(programCode: string): Promise<{
  participants: StudentParticipantRecord[];
  error?: string;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return { participants: [], error: 'missing_env' };
  }

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('participants')
        .select('id, nickname, first_name, role, program_code, created_at')
        .eq('program_code', programCode.trim())
        .eq('role', 'student')
        .order('created_at', { ascending: true }),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'student_participants',
    );

    if (error) {
      return { participants: [], error: error.message };
    }

    return { participants: (data ?? []) as StudentParticipantRecord[] };
  } catch {
    return { participants: [], error: 'fetch_failed' };
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
      return { results: programCode?.trim() ? [] : loadLocalAssessmentV2Results(), error: error.message };
    }

    return { results: (data ?? []) as LocalAssessmentV2Record[] };
  } catch {
    return { results: programCode?.trim() ? [] : loadLocalAssessmentV2Results(), error: 'fetch_failed' };
  }
}

export async function fetchModuleResultsForParticipants(
  participantIds: string[],
): Promise<{ results: LocalModuleResultRecord[]; error?: string }> {
  if (!participantIds.length) {
    return { results: [] };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { results: [], error: 'missing_env' };
  }

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('module_results')
        .select('*')
        .in('participant_id', participantIds)
        .order('completed_at', { ascending: false }),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'module_results_by_participants',
    );

    if (error) {
      return { results: [], error: error.message };
    }

    return { results: (data ?? []) as LocalModuleResultRecord[] };
  } catch {
    return { results: [], error: 'fetch_failed' };
  }
}

export async function fetchAssessmentV2ForParticipants(
  participantIds: string[],
): Promise<{ results: LocalAssessmentV2Record[]; error?: string }> {
  if (!participantIds.length) {
    return { results: [] };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { results: [], error: 'missing_env' };
  }

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('assessment_results_v2')
        .select('*')
        .in('participant_id', participantIds)
        .order('completed_at', { ascending: false }),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'assessment_v2_by_participants',
    );

    if (error) {
      return { results: [], error: error.message };
    }

    return { results: (data ?? []) as LocalAssessmentV2Record[] };
  } catch {
    return { results: [], error: 'fetch_failed' };
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
