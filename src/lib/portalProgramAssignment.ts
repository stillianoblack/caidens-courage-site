import {
  readActivePilotProgram,
  writeActivePilotProgram,
} from '../config/activePilotProgram';
import {
  LAST_PORTAL_RETURN_ROLE_KEY,
  readLastPilotProgramForRole,
} from '../config/lastPilotProgram';
import type { ActivePilotProgram } from '../types/pilotProgram';
import { saveB4BaselineStudentProfile, loadB4BaselineState } from './b4BaselineCheckStorage';

const ACTIVE_PORTAL_ROLE_KEY = 'activePortalRole';
const ACTIVE_FAMILY_CONTEXT_KEY = 'activeFamilyContext';

const LEGACY_PROGRAM_CODES = new Set([
  'blueribbon2026',
  'blueribbon',
  'blueribbonfamily',
  'blueribbonkids',
]);

type PortalRole = 'facilitator' | 'family';

type ActiveFamilyContext = {
  programCode: string;
  programName: string;
  familyAccessCode: string;
  groupName: string;
};

export type ProgramCodeSource =
  | 'active_pilot_program'
  | 'family_context'
  | 'last_pilot_family'
  | 'last_pilot_facilitator'
  | 'none';

export type CanonicalProgramResolution = {
  code: string | null;
  program: ActivePilotProgram | null;
  source: ProgramCodeSource;
};

function isLegacyProgramCode(code: string): boolean {
  return LEGACY_PROGRAM_CODES.has(code.trim().toLowerCase());
}

function readPortalRoleFromStorage(): PortalRole | null {
  try {
    const raw = localStorage.getItem(ACTIVE_PORTAL_ROLE_KEY);
    return raw === 'facilitator' || raw === 'family' ? raw : null;
  } catch {
    return null;
  }
}

function readFamilyContextFromStorage(): ActiveFamilyContext | null {
  try {
    const raw = localStorage.getItem(ACTIVE_FAMILY_CONTEXT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveFamilyContext;
    if (!parsed?.programCode?.trim()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function buildProgramFromFamilyContext(
  context: ActiveFamilyContext,
  existing?: ActivePilotProgram | null,
): ActivePilotProgram {
  return {
    id: existing?.id ?? context.programCode,
    programName: context.programName,
    programCode: context.programCode,
    programType: existing?.programType ?? 'Homeschool Group',
    adminFirstName: existing?.adminFirstName ?? '',
    adminEmail: existing?.adminEmail ?? '',
    estimatedStudents: existing?.estimatedStudents ?? 0,
    ageRange: existing?.ageRange ?? 'Mixed Ages',
    groupName: context.groupName,
    familyAccessCode: context.familyAccessCode,
    facilitatorAccessCode: existing?.facilitatorAccessCode ?? '',
    pricingTier: existing?.pricingTier ?? 'family_group',
    paymentStatus: existing?.paymentStatus ?? 'paid',
    pilotStatus: existing?.pilotStatus ?? 'active',
    agreedAt: existing?.agreedAt ?? '',
    createdAt: existing?.createdAt ?? '',
  };
}

function syncBaselineProfileToProgram(program: ActivePilotProgram): void {
  const baseline = loadB4BaselineState();
  if (!baseline.profile) return;

  const nickname = baseline.profile.nickname;
  if (
    baseline.profile.programCode === program.programCode &&
    baseline.profile.groupName === program.groupName
  ) {
    return;
  }

  saveB4BaselineStudentProfile({
    nickname,
    programCode: program.programCode,
    groupName: program.groupName,
  });
}

function syncActivePilotProgram(program: ActivePilotProgram): void {
  const active = readActivePilotProgram();
  if (active?.programCode === program.programCode) {
    syncBaselineProfileToProgram(program);
    return;
  }

  writeActivePilotProgram(program);
  syncBaselineProfileToProgram(program);
}

function firstValidCandidate(
  candidates: Array<{
    code?: string | null;
    program?: ActivePilotProgram | null;
    source: ProgramCodeSource;
  }>,
): CanonicalProgramResolution | null {
  for (const candidate of candidates) {
    const code = candidate.code?.trim();
    if (!code || isLegacyProgramCode(code)) continue;
    const program = candidate.program ?? (readActivePilotProgram()?.programCode === code
      ? readActivePilotProgram()
      : null);
    return { code, program, source: candidate.source };
  }
  return null;
}

/** Role-aware program code — family and facilitator snapshots never bleed across portals. */
export function resolveCanonicalProgramCode(): CanonicalProgramResolution {
  const role = readPortalRoleFromStorage();
  const active = readActivePilotProgram();
  const familyContext = readFamilyContextFromStorage();
  const lastFamily = readLastPilotProgramForRole('family');
  const lastFacilitator = readLastPilotProgramForRole('facilitator');

  if (role === 'family') {
    const familyContextProgram = familyContext
      ? buildProgramFromFamilyContext(
          familyContext,
          active?.programCode === familyContext.programCode ? active : null,
        )
      : null;

    const resolved =
      firstValidCandidate([
        { code: familyContext?.programCode, program: familyContextProgram, source: 'family_context' },
        { code: lastFamily?.program_code, program: lastFamily?.program, source: 'last_pilot_family' },
        { code: active?.programCode, program: active, source: 'active_pilot_program' },
      ]) ?? { code: null, program: null, source: 'none' as const };

    if (resolved.program) {
      syncActivePilotProgram(resolved.program);
    }
    return resolved;
  }

  if (role === 'facilitator') {
    const resolved =
      firstValidCandidate([
        {
          code: lastFacilitator?.program_code,
          program: lastFacilitator?.program,
          source: 'last_pilot_facilitator',
        },
        { code: active?.programCode, program: active, source: 'active_pilot_program' },
      ]) ?? { code: null, program: null, source: 'none' as const };

    if (resolved.program) {
      syncActivePilotProgram(resolved.program);
    }
    return resolved;
  }

  const code = active?.programCode?.trim();
  if (code && !isLegacyProgramCode(code)) {
    return { code, program: active, source: 'active_pilot_program' };
  }

  return { code: null, program: null, source: 'none' };
}

export function logProgramAssignmentAudit(input: {
  saveContext?: string;
  participantId?: string | null;
  participantName?: string | null;
  payloadProgramCode?: string | null;
}): CanonicalProgramResolution & {
  portalRole: PortalRole | null;
  activeProgramCode: string | null;
  familyProgramCode: string | null;
  lastFamilyProgramCode: string | null;
  lastFacilitatorProgramCode: string | null;
  savedProgramCode: string | null;
  payloadProgramCode: string | null;
  participantId: string | null;
  participantName: string | null;
  saveContext: string | null;
} {
  const resolved = resolveCanonicalProgramCode();
  const active = readActivePilotProgram();
  const familyContext = readFamilyContextFromStorage();
  const lastFamily = readLastPilotProgramForRole('family');
  const lastFacilitator = readLastPilotProgramForRole('facilitator');

  const audit = {
    saveContext: input.saveContext ?? null,
    portalRole: readPortalRoleFromStorage(),
    activeProgramCode: active?.programCode ?? null,
    familyProgramCode: familyContext?.programCode ?? null,
    lastFamilyProgramCode: lastFamily?.program_code ?? null,
    lastFacilitatorProgramCode: lastFacilitator?.program_code ?? null,
    resolvedProgramCode: resolved.code,
    savedProgramCode: resolved.code,
    payloadProgramCode: input.payloadProgramCode ?? null,
    participantId: input.participantId ?? null,
    participantName: input.participantName ?? null,
    source: resolved.source,
    code: resolved.code,
    program: resolved.program,
  };

  console.log('[PROGRAM_ASSIGNMENT]', audit);
  return audit;
}

/** Align activePilotProgram with the family portal session on layout mount. */
export function ensureFamilyPortalProgramSync(): CanonicalProgramResolution {
  const role = readPortalRoleFromStorage();
  if (role !== 'family') {
    return { code: null, program: null, source: 'none' };
  }

  const resolved = resolveCanonicalProgramCode();
  logProgramAssignmentAudit({ saveContext: 'family_portal_mount' });
  return resolved;
}

/** Restore snapshot for a specific portal role — avoids cross-role bleed. */
export function readLastPilotProgramForRestore(role?: PortalRole | null) {
  const resolvedRole =
    role ??
    (() => {
      try {
        const raw = localStorage.getItem(LAST_PORTAL_RETURN_ROLE_KEY);
        return raw === 'family' || raw === 'facilitator' ? raw : null;
      } catch {
        return null;
      }
    })();

  if (resolvedRole) {
    return readLastPilotProgramForRole(resolvedRole);
  }

  const family = readLastPilotProgramForRole('family');
  const facilitator = readLastPilotProgramForRole('facilitator');
  return family ?? facilitator;
}
