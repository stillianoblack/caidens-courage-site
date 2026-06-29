import { isSupabaseConfigured, supabase } from './supabaseClient.js';
import { normalizeAccessCodeForIdentity } from './portalCodeIdentity';
import { syncLocalProgramDisplayName } from './familyProgramDisplayNameService';
import {
  readActivePilotProgram,
  writeActivePilotProgram,
} from '../config/activePilotProgram';
import {
  readActiveFamilyContext,
  readActiveAccessCode,
  readActivePortalRole,
  writeActiveFamilyContext,
  writeActiveAccessCode,
} from '../config/portalContext';
import {
  readLastPilotProgramForRole,
  writeLastPilotProgram,
} from '../config/lastPilotProgram';
import {
  readRememberedDeviceSession,
  writeRememberedDeviceSession,
} from './rememberedDeviceSession';
import {
  readRememberedProgramAccessRecord,
  writeRememberedProgramAccess,
} from './rememberedProgramAccess';
import type { ActivePilotProgram } from '../types/pilotProgram';
import {
  queueProgramCodeChangeEmail,
  type ProgramCodeChangeEmailResult,
} from './programCodeChangeEmailService';

export type ProgramCodeUpdateTableCount = {
  table: string;
  column: string;
  rowsMatchingOldCode?: number;
  rowsUpdated?: number;
  willUpdate?: boolean;
};

export type ProgramCodeUpdateReport = {
  ok: boolean;
  reason?: string;
  oldProgramCode: string;
  newProgramCode: string;
  programId?: string;
  programName?: string;
  adminEmail?: string;
  familyAccessCode?: string;
  facilitatorAccessCode?: string | null;
  alreadyRenamed?: boolean;
  oldCodeAliasExists?: boolean;
  conflicts?: Array<Record<string, unknown>>;
  counts?: ProgramCodeUpdateTableCount[];
  rowsUpdated?: ProgramCodeUpdateTableCount[];
  familyScopePolicy?: string;
};

export type RenamePilotProgramTransactionInput = {
  oldProgramCode: string;
  newProgramCode: string;
  programName?: string;
  groupName?: string;
  familyAccessCode?: string;
  facilitatorAccessCode?: string | null;
};

export type RenamePilotProgramTransactionResult =
  | { success: true; report: ProgramCodeUpdateReport; email: ProgramCodeChangeEmailResult }
  | { success: false; message: string; report?: ProgramCodeUpdateReport };

type RenameProgramRpcClient = {
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

let rpcClientOverride: RenameProgramRpcClient | null = null;

export function __setRenamePilotProgramRpcClientForTests(client: RenameProgramRpcClient | null): void {
  rpcClientOverride = client;
}

function normalizeProgramCode(value: string): string {
  return normalizeAccessCodeForIdentity(value);
}

function normalizeOptionalCode(value?: string | null): string | null {
  const normalized = normalizeAccessCodeForIdentity(value);
  return normalized || null;
}

function parseReport(value: unknown): ProgramCodeUpdateReport {
  return value as ProgramCodeUpdateReport;
}

function resolveRpcClient(): RenameProgramRpcClient | null {
  if (rpcClientOverride) return rpcClientOverride;
  if (!isSupabaseConfigured() || !supabase) return null;
  return supabase as unknown as RenameProgramRpcClient;
}

function programWithRenamedCodes(
  program: ActivePilotProgram,
  input: RenamePilotProgramTransactionInput,
  newCode: string,
): ActivePilotProgram {
  const familyAccessCode = normalizeOptionalCode(input.familyAccessCode) ?? program.familyAccessCode;
  const facilitatorAccessCode =
    input.facilitatorAccessCode === undefined
      ? program.facilitatorAccessCode
      : normalizeOptionalCode(input.facilitatorAccessCode);

  return {
    ...program,
    programCode: newCode,
    programName: input.programName?.trim() || program.programName,
    groupName: input.groupName === undefined ? program.groupName : input.groupName.trim(),
    familyAccessCode,
    facilitatorAccessCode,
  };
}

function codeMatches(value: string | null | undefined, candidates: Array<string | null | undefined>): boolean {
  const normalized = normalizeOptionalCode(value);
  return Boolean(
    normalized &&
      candidates.some((candidate) => normalizeOptionalCode(candidate) === normalized),
  );
}

function accessCodeForRole(
  role: 'family' | 'facilitator' | null,
  program: ActivePilotProgram,
): string {
  if (role === 'family') return program.familyAccessCode;
  return program.facilitatorAccessCode?.trim() || program.programCode;
}

function syncLocalProgramIdentity(input: RenamePilotProgramTransactionInput, oldCode: string, newCode: string): void {
  const active = readActivePilotProgram();
  const activeBefore = active ?? null;
  const oldAccessCandidates = [
    oldCode,
    activeBefore?.programCode,
    activeBefore?.familyAccessCode,
    activeBefore?.facilitatorAccessCode,
  ];
  const activeRole = readActivePortalRole();

  if (active?.programCode.trim().toUpperCase() === oldCode || active?.programCode.trim().toUpperCase() === newCode) {
    const updatedActive = programWithRenamedCodes(active, input, newCode);
    writeActivePilotProgram(updatedActive);

    const currentAccessCode = readActiveAccessCode();
    if (codeMatches(currentAccessCode, oldAccessCandidates)) {
      writeActiveAccessCode(accessCodeForRole(activeRole, updatedActive));
    }
  }

  const familyContext = readActiveFamilyContext();
  if (
    familyContext?.programCode.trim().toUpperCase() === oldCode ||
    familyContext?.programCode.trim().toUpperCase() === newCode
  ) {
    writeActiveFamilyContext({
      ...familyContext,
      programCode: newCode,
      programName: input.programName?.trim() || familyContext.programName,
      groupName: input.groupName === undefined ? familyContext.groupName : input.groupName.trim(),
      familyAccessCode: normalizeOptionalCode(input.familyAccessCode) ?? familyContext.familyAccessCode,
    });
  }

  for (const role of ['family', 'facilitator'] as const) {
    const last = readLastPilotProgramForRole(role);
    if (
      last?.program_code.trim().toUpperCase() !== oldCode &&
      last?.program_code.trim().toUpperCase() !== newCode
    ) {
      continue;
    }
    const updatedProgram = programWithRenamedCodes(last.program, input, newCode);
    const lastAccessCode = codeMatches(last.last_access_code, [
      oldCode,
      last.program.programCode,
      last.program.familyAccessCode,
      last.program.facilitatorAccessCode,
    ])
      ? accessCodeForRole(role, updatedProgram)
      : last.last_access_code;
    writeLastPilotProgram(updatedProgram, role, last.admin_email, lastAccessCode);
  }

  const rememberedAccess = readRememberedProgramAccessRecord();
  if (
    rememberedAccess &&
    (rememberedAccess.program_code.trim().toUpperCase() === oldCode ||
      rememberedAccess.program_code.trim().toUpperCase() === newCode)
  ) {
    const updatedProgram = programWithRenamedCodes(rememberedAccess.program, input, newCode);
    const rememberedAccessCode = codeMatches(rememberedAccess.access_code, [
      oldCode,
      rememberedAccess.program.programCode,
      rememberedAccess.program.familyAccessCode,
      rememberedAccess.program.facilitatorAccessCode,
    ])
      ? accessCodeForRole(activeRole, updatedProgram)
      : rememberedAccess.access_code;
    writeRememberedProgramAccess(rememberedAccessCode, updatedProgram);
  }

  const deviceSession = readRememberedDeviceSession();
  if (
    deviceSession &&
    (deviceSession.program_code.trim().toUpperCase() === oldCode ||
      deviceSession.program_code.trim().toUpperCase() === newCode)
  ) {
    const updatedProgram = deviceSession.program
      ? programWithRenamedCodes(deviceSession.program, input, newCode)
      : undefined;
    const deviceRole =
      deviceSession.user_type === 'parent'
        ? 'family'
        : deviceSession.user_type === 'facilitator'
          ? 'facilitator'
          : activeRole;
    const deviceAccessCode =
      updatedProgram &&
      codeMatches(deviceSession.access_code, [
        oldCode,
        deviceSession.program?.programCode,
        deviceSession.program?.familyAccessCode,
        deviceSession.program?.facilitatorAccessCode,
      ])
        ? accessCodeForRole(deviceRole, updatedProgram)
        : deviceSession.access_code;
    writeRememberedDeviceSession({
      ...deviceSession,
      access_code: deviceAccessCode,
      program_code: newCode,
      program: updatedProgram,
    });
  }
}

export async function renamePilotProgramTransaction(
  input: RenamePilotProgramTransactionInput,
): Promise<RenamePilotProgramTransactionResult> {
  const oldCode = normalizeProgramCode(input.oldProgramCode);
  const newCode = normalizeProgramCode(input.newProgramCode);

  if (!oldCode || !newCode) {
    return { success: false, message: 'Old and new program codes are required.' };
  }

  const client = resolveRpcClient();
  if (!client) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const { data, error } = await client.rpc('rename_pilot_program_transaction', {
    old_program_code_input: oldCode,
    new_program_code_input: newCode,
    new_program_name_input: input.programName?.trim() || null,
    new_group_name_input: input.groupName === undefined ? null : input.groupName.trim(),
    new_family_access_code_input: normalizeOptionalCode(input.familyAccessCode),
    new_facilitator_access_code_input: normalizeOptionalCode(input.facilitatorAccessCode),
  });

  if (error) {
    return { success: false, message: error.message };
  }

  const report = parseReport(data);
  if (!report.ok) {
    return { success: false, message: report.reason ?? 'Program code update failed.', report };
  }

  if (input.programName?.trim()) {
    syncLocalProgramDisplayName(newCode, input.programName, input.groupName);
    if (oldCode !== newCode) {
      syncLocalProgramDisplayName(oldCode, input.programName, input.groupName);
    }
  }
  syncLocalProgramIdentity(input, oldCode, newCode);

  const email = await queueProgramCodeChangeEmail({
    adminEmail: report.adminEmail,
    programName: report.programName ?? input.programName,
    programCode: report.newProgramCode ?? newCode,
    familyAccessCode: report.familyAccessCode ?? input.familyAccessCode,
    facilitatorAccessCode: report.facilitatorAccessCode ?? input.facilitatorAccessCode,
    relatedProgramId: report.newProgramCode ?? newCode,
  });

  return { success: true, report, email };
}
