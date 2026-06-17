import {
  readActivePilotProgram,
  recordToActivePilotProgram,
  writeActivePilotProgram,
} from '../config/activePilotProgram';
import type { ActivePilotProgram, PilotProgramRecord } from '../types/pilotProgram';
import {
  readActiveFamilyContext,
  writeActiveFamilyContext,
} from '../config/portalContext';
import {
  readLastPilotProgramForRole,
  writeLastPilotProgram,
} from '../config/lastPilotProgram';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type ProgramDisplayNameUpdateResult =
  | { success: true; program: ActivePilotProgram }
  | { success: false; message: string };

function trimDisplayName(value: string): string {
  return value.trim();
}

/** Sync display-only fields in local session after a rename — identifiers unchanged. */
export function syncLocalProgramDisplayName(
  programCode: string,
  displayName: string,
  groupName?: string,
): void {
  const code = programCode.trim().toUpperCase();
  const programName = trimDisplayName(displayName);
  const shouldUpdateGroupName = groupName !== undefined;
  const resolvedGroupName = shouldUpdateGroupName ? trimDisplayName(groupName) : undefined;

  const active = readActivePilotProgram();
  if (active?.programCode.trim().toUpperCase() === code) {
    writeActivePilotProgram({
      ...active,
      programName,
      ...(shouldUpdateGroupName ? { groupName: resolvedGroupName || programName } : {}),
    });
  }

  const familyContext = readActiveFamilyContext();
  if (familyContext?.programCode.trim().toUpperCase() === code) {
    writeActiveFamilyContext({
      ...familyContext,
      programName,
      ...(shouldUpdateGroupName ? { groupName: resolvedGroupName || programName } : {}),
    });
  }

  for (const role of ['family', 'facilitator'] as const) {
    const last = readLastPilotProgramForRole(role);
    if (last?.program_code.trim().toUpperCase() !== code) continue;

    const updatedProgram: ActivePilotProgram = {
      ...last.program,
      programName,
      ...(shouldUpdateGroupName ? { groupName: resolvedGroupName || programName } : {}),
    };
    writeLastPilotProgram(
      updatedProgram,
      role,
      last.admin_email,
      last.last_access_code,
    );
  }
}

/**
 * Update display-only name fields by stable program_code.
 * Does not change program_code, access codes, or internal IDs.
 * Duplicate display names across programs are allowed.
 */
export async function updateProgramDisplayNameByCode(
  programCode: string,
  input: { displayName: string; groupName?: string },
): Promise<ProgramDisplayNameUpdateResult> {
  const code = programCode.trim().toUpperCase();
  const programName = trimDisplayName(input.displayName);

  if (!code || !programName) {
    return { success: false, message: 'Display name is required.' };
  }

  if (programName.length > 80) {
    return { success: false, message: 'Display name must be 80 characters or fewer.' };
  }

  const shouldUpdateGroupName = input.groupName !== undefined;
  const groupName = shouldUpdateGroupName ? trimDisplayName(input.groupName ?? '') : undefined;

  if (!isSupabaseConfigured() || !supabase) {
    const active = readActivePilotProgram();
    if (active?.programCode.trim().toUpperCase() === code) {
      const updated: ActivePilotProgram = {
        ...active,
        programName,
        groupName: shouldUpdateGroupName ? groupName ?? programName : active.groupName,
      };
      syncLocalProgramDisplayName(code, programName, shouldUpdateGroupName ? groupName : undefined);
      return { success: true, program: updated };
    }
    return { success: false, message: 'Supabase is not configured.' };
  }

  const updatePayload: { program_name: string; group_name?: string } = {
    program_name: programName,
  };
  if (shouldUpdateGroupName) {
    updatePayload.group_name = groupName || programName;
  }

  const { data, error } = await supabase
    .from('pilot_programs')
    .update(updatePayload)
    .eq('program_code', code)
    .select('*')
    .maybeSingle();

  if (error) {
    return { success: false, message: error.message };
  }

  if (!data) {
    return { success: false, message: 'Program not found.' };
  }

  syncLocalProgramDisplayName(
    code,
    programName,
    shouldUpdateGroupName ? groupName : undefined,
  );

  const program = recordToActivePilotProgram(data as PilotProgramRecord);
  return { success: true, program };
}
