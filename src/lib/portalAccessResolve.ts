import { recordToActivePilotProgram } from '../config/activePilotProgram';
import { lookupStudentByFamilyClaimCode } from './familyClaimByCodeService';
import {
  lookupPilotProgramByAccessCodeDetailed,
  type PilotProgramLookupResponse,
} from './pilotProgramService';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from './fetchWithTimeout';
import type { PilotProgramRecord } from '../types/pilotProgram';

const CLAIM_CODE_RE = /^CLAIM-/i;

export type PortalClaimCodeContext = {
  participantId: string;
  childDisplayName: string;
};

export type PortalProgramLookupResponse = PilotProgramLookupResponse & {
  claimCodeContext?: PortalClaimCodeContext;
};

/** Resolve program from family access code, program code, or per-student family claim code. */
export async function lookupPortalProgramByAccessCodeDetailed(
  rawCode: string,
): Promise<PortalProgramLookupResponse> {
  const primary = await lookupPilotProgramByAccessCodeDetailed(rawCode);
  if (primary.status === 'found') {
    return primary;
  }

  const trimmed = rawCode.trim();
  if (!CLAIM_CODE_RE.test(trimmed)) {
    return primary;
  }

  const claimLookup = await lookupStudentByFamilyClaimCode(trimmed);
  if (!claimLookup.student?.programCode) {
    return primary;
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { status: 'unavailable', result: null };
  }

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('pilot_programs')
        .select('*')
        .eq('program_code', claimLookup.student.programCode)
        .eq('pilot_status', 'active')
        .maybeSingle(),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'portal_claim_code_program_lookup',
    );

    if (error || !data) {
      return primary;
    }

    return {
      status: 'found',
      result: {
        role: 'family',
        program: recordToActivePilotProgram(data as PilotProgramRecord),
      },
      claimCodeContext: {
        participantId: claimLookup.student.participantId,
        childDisplayName: claimLookup.student.childDisplayName,
      },
    };
  } catch {
    return primary;
  }
}
