import {
  CHILD_BASELINE_ASSESSMENT_TYPE,
  isChildBaselineAssessmentType,
} from '../config/assessmentTypeConstants';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { hasAllBaselineModules } from '../data/b4BaselineCheckContent';
import {
  isBaselineFullyComplete,
  loadAllBaselineResults,
  loadB4BaselineState,
  type B4BaselineCheckRecord,
} from './b4BaselineCheckStorage';
import type { LocalAssessmentV2Record } from './pilotTrackingLocalStorage';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { hasFamilyCompatibilitySession } from './familyPortalChildrenApi';
import { getFamilyCompatibilityChildSession } from './familyChildSessionApi';
import { readLocalKidPlaySessionId } from './kidPlaySessionService';

export type B4CheckInStatus = 'not_started' | 'in_progress' | 'complete';
export type B4CheckInDisplayStatus = 'Not Started' | 'In Progress' | 'Complete';

export type B4CheckInStatusSource =
  | 'local_session'
  | 'local_archive'
  | 'local_partial'
  | 'assessment_results_v2'
  | 'assessment_results'
  | 'none';

export type B4CheckInStatusResult = {
  status: B4CheckInStatus;
  baselineComplete: boolean;
  displayStatus: B4CheckInDisplayStatus;
  source: B4CheckInStatusSource;
};

export type B4CheckInStatusInput = {
  participantId?: string;
  programCode?: string;
  assessments?: LocalAssessmentV2Record[];
  /** Dev-only debug context */
  selectedChildName?: string;
  gradeLevel?: string | null;
};

function normalizeCode(code?: string): string {
  return code?.trim().toUpperCase() ?? '';
}

function resolveParticipantId(participantId?: string): string {
  return (participantId ?? readActiveChildParticipantId()).trim();
}

function toDisplayStatus(status: B4CheckInStatus): B4CheckInDisplayStatus {
  if (status === 'complete') return 'Complete';
  if (status === 'in_progress') return 'In Progress';
  return 'Not Started';
}

export const toB4CheckInDisplayStatus = toDisplayStatus;

export function formatB4CheckInStatusLabel(status: B4CheckInDisplayStatus): string {
  return `B-4 Check-In: ${status}`;
}

export function formatBaselineAssessmentStatusLabel(status: B4CheckInDisplayStatus): string {
  if (status === 'Complete') return 'Baseline Complete';
  if (status === 'In Progress') return 'Baseline In Progress';
  return 'Baseline Not Started';
}

function archiveRowIsFullyComplete(
  row: B4BaselineCheckRecord,
  participantId: string,
  code?: string,
): boolean {
  if (!row.completedAt?.trim()) return false;
  const rowParticipant = row.participantId?.trim() ?? '';
  if (!rowParticipant || rowParticipant !== participantId) return false;
  if (code && normalizeCode(row.programCode) !== normalizeCode(code)) return false;
  return hasAllBaselineModules(row.completedModules ?? []);
}

function filterV2BaselineRows(
  participantId: string,
  assessments: LocalAssessmentV2Record[],
  code?: string,
): LocalAssessmentV2Record[] {
  return assessments.filter((row) => {
    if (row.participant_id?.trim() !== participantId) return false;
    if (!isChildBaselineAssessmentType(row.assessment_type)) return false;
    if (code && normalizeCode(row.program_code) !== normalizeCode(code)) return false;
    return true;
  });
}

function sessionMatchesParticipant(participantId: string): boolean {
  const session = loadB4BaselineState(participantId);
  const sessionParticipant = session.profile?.participantId ?? session.record?.participantId ?? '';
  return !sessionParticipant || sessionParticipant === participantId;
}

/** Formal baseline assessment (all 3 modules + completion timestamp). */
export function isBaselineAssessmentCompleteLocal(input: B4CheckInStatusInput = {}): boolean {
  const participantId = resolveParticipantId(input.participantId);
  const code = input.programCode?.trim();
  if (!participantId) return false;

  const session = loadB4BaselineState(participantId);
  if (isBaselineFullyComplete(session, participantId) && sessionMatchesParticipant(participantId)) {
    // A participant UUID is the authoritative identity for child progress. Family-linked
    // children can move between the family program context and their camp/school program
    // context without changing participants, so a program-code mismatch must not relock a
    // completed check-in stored under that exact participant ID.
    return true;
  }

  const archive = loadAllBaselineResults();
  if (archive.some((row) => archiveRowIsFullyComplete(row, participantId, code))) {
    return true;
  }

  const v2Rows = filterV2BaselineRows(participantId, input.assessments ?? [], code);
  if (v2Rows.some((row) => Boolean(row.completed_at?.trim()))) {
    return true;
  }

  return false;
}

function resolveB4CheckInFlowInProgress(input: B4CheckInStatusInput): B4CheckInStatusResult | null {
  const participantId = resolveParticipantId(input.participantId);
  const code = input.programCode?.trim();
  if (!participantId) return null;

  const session = loadB4BaselineState(participantId);
  if (sessionMatchesParticipant(participantId)) {
    if (session.profile || session.completedModules.length > 0) {
      return {
        status: 'in_progress',
        baselineComplete: false,
        displayStatus: 'In Progress',
        source: 'local_partial',
      };
    }
  }

  const archive = loadAllBaselineResults();
  const hasPartialArchive = archive.some((row) => {
    const rowParticipant = row.participantId?.trim() ?? '';
    if (rowParticipant && rowParticipant !== participantId) return false;
    if (code && normalizeCode(row.programCode) !== normalizeCode(code)) return false;
    return row.completedModules.length > 0 && !archiveRowIsFullyComplete(row, participantId, code);
  });
  if (hasPartialArchive) {
    return {
      status: 'in_progress',
      baselineComplete: false,
      displayStatus: 'In Progress',
      source: 'local_archive',
    };
  }

  const v2Rows = filterV2BaselineRows(participantId, input.assessments ?? [], code);
  if (v2Rows.some((row) => !row.completed_at?.trim())) {
    return {
      status: 'in_progress',
      baselineComplete: false,
      displayStatus: 'In Progress',
      source: 'assessment_results_v2',
    };
  }

  return null;
}

/** Baseline display status for dashboard cards (assessment completion only). */
export function resolveBaselineDisplayStatusLocal(
  input: B4CheckInStatusInput = {},
): B4CheckInDisplayStatus {
  const participantId = resolveParticipantId(input.participantId);
  if (!participantId) return 'Not Started';

  if (isBaselineAssessmentCompleteLocal(input)) {
    return 'Complete';
  }

  const inProgress = resolveB4CheckInFlowInProgress(input);
  if (inProgress) {
    return 'In Progress';
  }

  return 'Not Started';
}

/** B-4 Check-In flow status — never inferred from grade_level alone. */
export function resolveB4CheckInStatusLocal(input: B4CheckInStatusInput = {}): B4CheckInStatusResult {
  const participantId = resolveParticipantId(input.participantId);
  const baselineComplete = isBaselineAssessmentCompleteLocal(input);

  if (!participantId) {
    return {
      status: 'not_started',
      baselineComplete: false,
      displayStatus: 'Not Started',
      source: 'none',
    };
  }

  if (baselineComplete) {
    return {
      status: 'complete',
      baselineComplete: true,
      displayStatus: 'Complete',
      source: 'local_session',
    };
  }

  const inProgress = resolveB4CheckInFlowInProgress(input);
  if (inProgress) {
    return inProgress;
  }

  return {
    status: 'not_started',
    baselineComplete: false,
    displayStatus: 'Not Started',
    source: 'none',
  };
}

export async function isBaselineAssessmentCompleteRemote(
  input: B4CheckInStatusInput = {},
): Promise<boolean> {
  const code = input.programCode?.trim();
  const participantId = resolveParticipantId(input.participantId);

  if (participantId && hasFamilyCompatibilitySession()) {
    const familySessionId = readLocalKidPlaySessionId();
    if (!familySessionId) return false;
    try {
      const session = await getFamilyCompatibilityChildSession(familySessionId);
      const sessionParticipantId = session.participant_id || session.child_id;
      return Boolean(
        sessionParticipantId === participantId &&
        session.resume_payload?.participant_baseline_complete === true
      );
    } catch {
      return false;
    }
  }

  if (!isSupabaseConfigured() || !supabase || !code || !participantId) {
    return false;
  }

  try {
    const { data: v2Data, error: v2Error } = await supabase
      .from('assessment_results_v2')
      .select('participant_id, program_code, assessment_type, completed_at')
      .eq('assessment_type', CHILD_BASELINE_ASSESSMENT_TYPE)
      .eq('program_code', code)
      .eq('participant_id', participantId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1);

    if (!v2Error && v2Data?.length) {
      const row = v2Data[0] as { completed_at?: string | null };
      if (row.completed_at?.trim()) {
        return true;
      }
    }

    const { data, error } = await supabase
      .from('assessment_results')
      .select('student_id, completed_at')
      .eq('assessment_type', CHILD_BASELINE_ASSESSMENT_TYPE)
      .eq('program_code', code)
      .eq('student_id', participantId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1);

    if (error || !data?.length) {
      return false;
    }

    const row = data[0] as { completed_at?: string | null };
    return Boolean(row.completed_at?.trim());
  } catch {
    return false;
  }
}

export async function getB4CheckInStatus(input: B4CheckInStatusInput = {}): Promise<B4CheckInStatusResult> {
  const participantId = resolveParticipantId(input.participantId);
  const local = resolveB4CheckInStatusLocal(input);

  if (local.status === 'complete') {
    logB4CheckInDebug(input, local, participantId);
    return local;
  }

  const remoteBaselineComplete = await isBaselineAssessmentCompleteRemote(input);

  if (remoteBaselineComplete) {
    const resolved: B4CheckInStatusResult = {
      status: 'complete',
      baselineComplete: true,
      displayStatus: 'Complete',
      source: 'assessment_results_v2',
    };
    logB4CheckInDebug(input, resolved, participantId);
    return resolved;
  }

  logB4CheckInDebug(input, local, participantId);
  return local;
}

function logB4CheckInDebug(
  input: B4CheckInStatusInput,
  result: B4CheckInStatusResult,
  participantId: string,
): void {
  if (process.env.NODE_ENV !== 'development') return;

  console.info('[B4_CHECKIN_DEBUG]', {
    activeParticipantId: participantId || null,
    selectedChildName: input.selectedChildName ?? null,
    programCode: input.programCode ?? null,
    baselineStatus: result.baselineComplete ? 'complete' : 'not_complete',
    b4CheckInStatus: result.status,
    displayStatus: result.displayStatus,
    gradeLevel: input.gradeLevel ?? null,
    source: result.source,
  });
}

/** Whether B-4 Check-In is complete for a participant (local sources only). */
export function isB4CheckInCompleteLocal(input: B4CheckInStatusInput = {}): boolean {
  return resolveB4CheckInStatusLocal(input).status === 'complete';
}

/** Whether B-4 Check-In is complete, including remote Supabase fallback. */
export async function isB4CheckInCompleteAsync(input: B4CheckInStatusInput = {}): Promise<boolean> {
  const result = await getB4CheckInStatus(input);
  return result.status === 'complete';
}

export type B4CheckInAggregate = {
  complete: number;
  total: number;
  label: string | null;
};

/** Per-child aggregate for families with multiple participants. */
export function computeB4CheckInAggregate(
  children: Array<{ participantId: string | null; b4CheckInStatus: B4CheckInDisplayStatus }>,
): B4CheckInAggregate {
  const scoped = children.filter((child) => Boolean(child.participantId?.trim()));
  const total = scoped.length;
  const complete = scoped.filter((child) => child.b4CheckInStatus === 'Complete').length;
  const label =
    total > 1 ? `B-4 Check-In: ${complete} of ${total} complete` : null;
  return { complete, total, label };
}

/** @deprecated Use getB4CheckInStatus — kept for existing imports. */
export async function checkB4CheckInComplete(
  programCode?: string,
  participantId?: string,
  assessments?: LocalAssessmentV2Record[],
): Promise<boolean> {
  const result = await getB4CheckInStatus({ programCode, participantId, assessments });
  return result.status === 'complete';
}
