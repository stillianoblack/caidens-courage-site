import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from './fetchWithTimeout';
import { generateFamilyClaimCode } from './familyClaimCode';
import {
  generateStudentPin,
  hashStudentPin,
  type StoredPinHash,
} from './studentPinCrypto';
import { isValidSupabaseParticipantId } from './pilotTrackingService';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type ParentConnectionStatus = 'unclaimed' | 'invited' | 'connected';

export type StudentPinAssignment = {
  pin: string;
  hash: string;
  fingerprint: string;
};

export type StudentAccessFields = {
  student_pin_enabled: boolean;
  parent_connection_status: ParentConnectionStatus;
  family_claim_code: string | null;
  hasPin: boolean;
};

const PIN_SELECT =
  'id, student_pin_hash, student_pin_fingerprint, student_pin_enabled, parent_connection_status, family_claim_code';

function isUniqueViolation(message: string): boolean {
  return /duplicate|unique|23505/i.test(message);
}

async function fingerprintTaken(
  programCode: string,
  fingerprint: string,
  exceptParticipantId?: string,
): Promise<boolean> {
  if (!supabase) return false;

  let query = supabase
    .from('participants')
    .select('id')
    .eq('program_code', programCode.trim())
    .eq('student_pin_fingerprint', fingerprint)
    .limit(1);

  if (exceptParticipantId) {
    query = query.neq('id', exceptParticipantId);
  }

  const { data } = await query;
  return Boolean(data?.length);
}

export async function generateUniqueStudentPin(
  programCode: string,
  exceptParticipantId?: string,
): Promise<StudentPinAssignment> {
  const code = programCode.trim();
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const pin = generateStudentPin(4);
    const stored = await hashStudentPin(code, pin);
    const taken = await fingerprintTaken(code, stored.fingerprint, exceptParticipantId);
    if (!taken) {
      return { pin, hash: stored.hash, fingerprint: stored.fingerprint };
    }
  }
  throw new Error('Could not generate a unique student PIN for this program.');
}

export async function assignStudentPinToParticipant(input: {
  participantId: string;
  programCode: string;
}): Promise<{ pin: string } | { error: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase is not configured.' };
  }

  const participantId = input.participantId.trim();
  const programCode = input.programCode.trim();
  if (!isValidSupabaseParticipantId(participantId) || !programCode) {
    return { error: 'Invalid participant or program.' };
  }

  try {
    const assignment = await generateUniqueStudentPin(programCode, participantId);
    const now = new Date().toISOString();
    const { error } = await withTimeout(
      supabase
        .from('participants')
        .update({
          student_pin_hash: assignment.hash,
          student_pin_fingerprint: assignment.fingerprint,
          student_pin_enabled: true,
          student_pin_last_rotated_at: now,
        })
        .eq('id', participantId)
        .eq('program_code', programCode),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'student_pin_assign',
    );

    if (error) {
      if (isUniqueViolation(error.message)) {
        return assignStudentPinToParticipant(input);
      }
      return { error: error.message };
    }

    return { pin: assignment.pin };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not assign student PIN.';
    return { error: message };
  }
}

export async function ensureFamilyClaimCodeForParticipant(input: {
  participantId: string;
}): Promise<{ code: string } | { error: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase is not configured.' };
  }

  const participantId = input.participantId.trim();
  if (!isValidSupabaseParticipantId(participantId)) {
    return { error: 'Invalid participant id.' };
  }

  try {
    const { data: existing, error: readError } = await withTimeout(
      supabase.from('participants').select('family_claim_code').eq('id', participantId).maybeSingle(),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'family_claim_code_read',
    );

    if (readError) {
      return { error: readError.message };
    }

    const current = String(existing?.family_claim_code || '').trim();
    if (current) {
      return { code: current };
    }

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const code = generateFamilyClaimCode();
      const now = new Date().toISOString();
      const { error } = await withTimeout(
        supabase
          .from('participants')
          .update({
            family_claim_code: code,
            family_claim_code_created_at: now,
          })
          .eq('id', participantId)
          .is('family_claim_code', null),
        DASHBOARD_FETCH_TIMEOUT_MS,
        'family_claim_code_write',
      );

      if (!error) {
        return { code };
      }
      if (!isUniqueViolation(error.message)) {
        return { error: error.message };
      }
    }

    return { error: 'Could not generate family claim code.' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not ensure family claim code.';
    return { error: message };
  }
}

export async function resetStudentPinViaFunction(input: {
  participantId: string;
  programCode: string;
}): Promise<{ pin: string } | { error: string }> {
  try {
    const response = await fetch('/.netlify/functions/reset-student-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantId: input.participantId.trim(),
        programCode: input.programCode.trim(),
      }),
    });

    const payload = (await response.json()) as { success?: boolean; pin?: string; error?: string };
    if (!response.ok || !payload.success || !payload.pin) {
      return { error: payload.error || 'Could not reset PIN.' };
    }

    return { pin: payload.pin };
  } catch {
    return assignStudentPinToParticipant(input);
  }
}

export async function verifyStudentPinLogin(input: {
  programCode: string;
  pin: string;
  firstNameHint?: string;
}): Promise<
  | { success: true; participantId: string; displayName: string; programCode: string }
  | { success: false; error: string }
> {
  try {
    const response = await fetch('/.netlify/functions/verify-student-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        programCode: input.programCode.trim(),
        pin: input.pin.trim(),
        firstNameHint: input.firstNameHint?.trim() || undefined,
      }),
    });

    const payload = (await response.json()) as {
      success?: boolean;
      participantId?: string;
      displayName?: string;
      programCode?: string;
      error?: string;
    };

    if (!response.ok || !payload.success || !payload.participantId) {
      return { success: false, error: payload.error || 'Program code or PIN did not match.' };
    }

    return {
      success: true,
      participantId: payload.participantId,
      displayName: payload.displayName || 'Player',
      programCode: payload.programCode || input.programCode.trim(),
    };
  } catch {
    return { success: false, error: 'Could not verify login. Try again.' };
  }
}

export function participantHasPin(row: {
  student_pin_hash?: string | null;
  student_pin_fingerprint?: string | null;
}): boolean {
  return Boolean(row.student_pin_hash?.trim() || row.student_pin_fingerprint?.trim());
}

export function resolveParentConnectionStatus(input: {
  parentConnectionStatus?: string | null;
  linkClaimed?: boolean;
  hasParentEmail?: boolean;
}): ParentConnectionStatus {
  if (input.linkClaimed || input.parentConnectionStatus === 'connected') {
    return 'connected';
  }
  if (input.parentConnectionStatus === 'invited') {
    return 'invited';
  }
  if (input.hasParentEmail && !input.linkClaimed) {
    return 'invited';
  }
  return 'unclaimed';
}

export function parentConnectionStatusLabel(status: ParentConnectionStatus): string {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'invited':
      return 'Invited';
    default:
      return 'Parent not connected';
  }
}

export async function fetchStudentAccessFieldsByIds(
  participantIds: string[],
): Promise<Map<string, StudentAccessFields>> {
  const map = new Map<string, StudentAccessFields>();
  if (!participantIds.length || !isSupabaseConfigured() || !supabase) {
    return map;
  }

  try {
    const { data, error } = await supabase.from('participants').select(PIN_SELECT).in('id', participantIds);
    if (error || !data) return map;

    for (const row of data) {
      const id = String(row.id);
      map.set(id, {
        student_pin_enabled: row.student_pin_enabled !== false,
        parent_connection_status: (row.parent_connection_status ||
          'unclaimed') as ParentConnectionStatus,
        family_claim_code: row.family_claim_code ? String(row.family_claim_code) : null,
        hasPin: participantHasPin(row),
      });
    }
  } catch {
    /* ignore */
  }

  return map;
}

export type StudentPinBootstrapPayload = {
  student_pin_hash: string;
  student_pin_fingerprint: string;
  student_pin_enabled: boolean;
  student_pin_last_rotated_at: string;
  family_claim_code?: string;
  family_claim_code_created_at?: string;
  parent_connection_status?: ParentConnectionStatus;
  guardian_email?: string | null;
  guardian_phone?: string | null;
};

export async function buildStudentPinBootstrapFields(input: {
  programCode: string;
  parentConnectionStatus: ParentConnectionStatus;
  guardianEmail?: string | null;
  guardianPhone?: string | null;
}): Promise<{ fields: StudentPinBootstrapPayload; pin: string; claimCode: string }> {
  const assignment = await generateUniqueStudentPin(input.programCode);
  const claimCode = generateFamilyClaimCode();
  const now = new Date().toISOString();

  return {
    pin: assignment.pin,
    claimCode,
    fields: {
      student_pin_hash: assignment.hash,
      student_pin_fingerprint: assignment.fingerprint,
      student_pin_enabled: true,
      student_pin_last_rotated_at: now,
      family_claim_code: claimCode,
      family_claim_code_created_at: now,
      parent_connection_status: input.parentConnectionStatus,
      guardian_email: input.guardianEmail ?? null,
      guardian_phone: input.guardianPhone ?? null,
    },
  };
}

export type { StoredPinHash };
