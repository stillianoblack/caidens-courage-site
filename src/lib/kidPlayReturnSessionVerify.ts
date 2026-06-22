import { readActivePilotProgram } from '../config/activePilotProgram';
import { readLastPilotProgramForRole } from '../config/lastPilotProgram';
import { readParentClaimContext } from '../config/parentClaimContext';
import { isIndependentFamilyProgram } from './independentFamilyProgram';
import {
  programScopesMatch,
  resolvePortalProgramScope,
} from './portalProgramScope';
import { logSessionIsolationWarning } from './sessionIsolationLog';
import { readRememberedDeviceSession, type RememberedDeviceSession } from './rememberedDeviceSession';
import { readStudentPinSession } from './studentPinSession';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from './fetchWithTimeout';

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function deviceSessionMatchesActiveProgram(device: RememberedDeviceSession): boolean {
  const expected = resolvePortalProgramScope();
  if (!expected?.programCode) return false;
  return programScopesMatch(device.program_code, expected.programCode);
}

function lastPilotProgramMatchesActiveProgram(programCode?: string | null): boolean {
  const expected = resolvePortalProgramScope();
  if (!expected?.programCode || !programCode?.trim()) return false;
  return programScopesMatch(programCode, expected.programCode);
}

async function isParentEmailLinkedToActiveStudent(input: {
  email: string;
  studentId: string;
}): Promise<boolean> {
  const email = normalizeEmail(input.email);
  const studentId = input.studentId.trim();
  if (!email || !studentId || !isSupabaseConfigured() || !supabase) {
    return false;
  }

  const { data: links, error } = await withTimeout(
    supabase
      .from('student_family_links')
      .select('id, student_id, parent_email, camp_program_code, family_program_code')
      .eq('student_id', studentId),
    DASHBOARD_FETCH_TIMEOUT_MS,
    'return_session_parent_link_lookup',
  );

  if (error) {
    console.warn('[RETURN_SESSION_PARENT_VERIFY]', { reason: 'link_lookup_failed', message: error.message });
    return false;
  }

  if ((links || []).some((link) => normalizeEmail(String(link.parent_email || '')) === email)) {
    return true;
  }

  const { data: participant, error: participantError } = await withTimeout(
    supabase
      .from('participants')
      .select('id, guardian_email')
      .eq('id', studentId)
      .eq('role', 'student')
      .maybeSingle(),
    DASHBOARD_FETCH_TIMEOUT_MS,
    'return_session_guardian_lookup',
  );

  if (participantError || !participant) {
    return false;
  }

  return normalizeEmail(String(participant.guardian_email || '')) === email;
}

export function detectReturnSessionParentEmailMatch(email: string): boolean {
  const entered = normalizeEmail(email);
  if (!entered) return false;

  const expected = resolvePortalProgramScope();
  if (!expected?.programCode) {
    logSessionIsolationWarning('return_session_email_program_mismatch', {
      reason: 'missing_program_context',
      email: entered,
    });
    return false;
  }

  const claim = readParentClaimContext({ programCode: expected.programCode });
  if (claim?.email && normalizeEmail(claim.email) === entered) {
    return true;
  }

  const device = readRememberedDeviceSession();
  if (
    device?.user_type === 'parent' &&
    device.parent_id &&
    normalizeEmail(device.parent_id) === entered
  ) {
    if (deviceSessionMatchesActiveProgram(device)) {
      return true;
    }
    logSessionIsolationWarning('return_session_email_program_mismatch', {
      reason: 'device_session_program_mismatch',
      email: entered,
      device_program_code: device.program_code,
      expected_program_code: expected.programCode,
    });
    return false;
  }

  const lastFamily = readLastPilotProgramForRole('family');
  if (lastFamily?.admin_email && normalizeEmail(lastFamily.admin_email) === entered) {
    if (lastPilotProgramMatchesActiveProgram(lastFamily.program_code)) {
      return true;
    }
    logSessionIsolationWarning('return_session_email_program_mismatch', {
      reason: 'last_family_program_mismatch',
      email: entered,
      stored_program_code: lastFamily.program_code,
      expected_program_code: expected.programCode,
    });
    return false;
  }

  const program = readActivePilotProgram();
  if (
    program &&
    isIndependentFamilyProgram(program) &&
    program.adminEmail &&
    normalizeEmail(program.adminEmail) === entered &&
    programScopesMatch(program.programCode, expected.programCode)
  ) {
    return true;
  }

  return false;
}

/** Verify parent email against the active student's linked family record (DB-first). */
export async function verifyReturnSessionParentEmailMatch(input: {
  email: string;
  activeStudentId?: string | null;
}): Promise<boolean> {
  const entered = normalizeEmail(input.email);
  if (!entered) return false;

  const studentId =
    input.activeStudentId?.trim() ||
    readStudentPinSession()?.participantId?.trim() ||
    '';

  if (studentId) {
    const linked = await isParentEmailLinkedToActiveStudent({
      email: entered,
      studentId,
    });
    if (linked) return true;

    logSessionIsolationWarning('return_session_email_child_mismatch', {
      email: entered,
      student_id: studentId,
    });
    return false;
  }

  return detectReturnSessionParentEmailMatch(entered);
}

export function detectReturnSessionFacilitatorEmailMatch(email: string): boolean {
  const entered = normalizeEmail(email);
  if (!entered) return false;

  const expected = resolvePortalProgramScope();
  if (!expected?.programCode) {
    logSessionIsolationWarning('return_session_email_program_mismatch', {
      reason: 'missing_program_context',
      email: entered,
      role: 'facilitator',
    });
    return false;
  }

  const program = readActivePilotProgram();
  const adminEmail = program?.adminEmail?.trim().toLowerCase();
  if (
    adminEmail &&
    entered === adminEmail &&
    program &&
    programScopesMatch(program.programCode, expected.programCode)
  ) {
    return true;
  }

  const device = readRememberedDeviceSession();
  if (
    device?.user_type === 'facilitator' &&
    device.facilitator_id &&
    normalizeEmail(device.facilitator_id) === entered
  ) {
    if (deviceSessionMatchesActiveProgram(device)) {
      return true;
    }
    logSessionIsolationWarning('return_session_email_program_mismatch', {
      reason: 'device_session_program_mismatch',
      email: entered,
      role: 'facilitator',
      device_program_code: device.program_code,
      expected_program_code: expected.programCode,
    });
    return false;
  }

  const lastFacilitator = readLastPilotProgramForRole('facilitator');
  if (lastFacilitator?.admin_email && normalizeEmail(lastFacilitator.admin_email) === entered) {
    if (lastPilotProgramMatchesActiveProgram(lastFacilitator.program_code)) {
      return true;
    }
    logSessionIsolationWarning('return_session_email_program_mismatch', {
      reason: 'last_facilitator_program_mismatch',
      email: entered,
      stored_program_code: lastFacilitator.program_code,
      expected_program_code: expected.programCode,
    });
    return false;
  }

  return false;
}

/** Prefer explicit unlock role from remembered device session when available. */
export function readPreferredReturnSessionRole(): 'parent' | 'facilitator' | null {
  const device = readRememberedDeviceSession();
  if (!device) return null;
  if (!deviceSessionMatchesActiveProgram(device)) return null;
  if (device.user_type === 'parent') return 'parent';
  if (device.user_type === 'facilitator') return 'facilitator';
  return null;
}
