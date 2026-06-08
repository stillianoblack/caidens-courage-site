import type { ActivePilotProgram } from '../types/pilotProgram';
import { isIndependentFamilyProgram } from '../lib/independentFamilyProgram';
import type { PortalRole } from './portalContext';

/** @deprecated Legacy single-key cache — migrated on read to role-specific keys. */
export const LAST_PILOT_PROGRAM_KEY = 'lastPilotProgram';
export const LAST_PILOT_PROGRAM_FAMILY_KEY = 'lastPilotProgram:family';
export const LAST_PILOT_PROGRAM_FACILITATOR_KEY = 'lastPilotProgram:facilitator';
export const LAST_PORTAL_RETURN_ROLE_KEY = 'lastPortalReturnRole';

export type LastPilotProgram = {
  program_name: string;
  program_code: string;
  facilitator_access_code: string | null;
  family_access_code: string;
  portal_role: PortalRole;
  /** Access code actually entered to unlock — never a higher-privilege code than portal_role. */
  last_access_code: string;
  admin_email: string;
  saved_at: string;
  /** Full program snapshot for one-click return without another lookup. */
  program: ActivePilotProgram;
};

export function maskAccessCode(code: string): string {
  const normalized = code.trim().toUpperCase();
  const parts = normalized.split('-');
  if (parts.length >= 3) {
    return `${parts[0]}-********-${parts.slice(-2).join('-')}`;
  }
  if (normalized.length <= 8) return '********';
  return `${normalized.slice(0, 4)}********${normalized.slice(-4)}`;
}

function storageKeyForRole(role: PortalRole): string {
  return role === 'family' ? LAST_PILOT_PROGRAM_FAMILY_KEY : LAST_PILOT_PROGRAM_FACILITATOR_KEY;
}

function resolveLastAccessCode(
  program: ActivePilotProgram,
  role: PortalRole,
  lastAccessCode?: string,
): string {
  const trimmed = lastAccessCode?.trim();
  if (trimmed) return trimmed;
  if (role === 'family') return program.familyAccessCode;
  return program.facilitatorAccessCode ?? program.familyAccessCode;
}

function normalizeIndependentFamilyReturn(entry: LastPilotProgram): LastPilotProgram {
  if (!isIndependentFamilyProgram(entry.program)) return entry;
  return {
    ...entry,
    portal_role: 'family',
    last_access_code: entry.family_access_code || entry.program.familyAccessCode,
  };
}

function parseLastPilotProgram(raw: string): LastPilotProgram | null {
  try {
    const parsed = JSON.parse(raw) as LastPilotProgram;
    if (!parsed?.program_code || !parsed?.program?.programCode) return null;
    if (parsed.portal_role !== 'family' && parsed.portal_role !== 'facilitator') return null;
    if (!parsed.last_access_code?.trim()) {
      parsed.last_access_code = resolveLastAccessCode(parsed.program, parsed.portal_role);
    }
    return normalizeIndependentFamilyReturn(parsed);
  } catch {
    return null;
  }
}

function migrateLegacyLastPilotProgram(): void {
  try {
    const raw = localStorage.getItem(LAST_PILOT_PROGRAM_KEY);
    if (!raw) return;
    const parsed = parseLastPilotProgram(raw);
    if (!parsed) {
      localStorage.removeItem(LAST_PILOT_PROGRAM_KEY);
      return;
    }
    localStorage.setItem(storageKeyForRole(parsed.portal_role), JSON.stringify(parsed));
    localStorage.setItem(LAST_PORTAL_RETURN_ROLE_KEY, parsed.portal_role);
    localStorage.removeItem(LAST_PILOT_PROGRAM_KEY);
  } catch {
    /* localStorage unavailable */
  }
}

export function writeLastPilotProgram(
  program: ActivePilotProgram,
  role: PortalRole,
  adminEmail?: string,
  lastAccessCode?: string,
): void {
  try {
    const resolvedRole: PortalRole = isIndependentFamilyProgram(program) ? 'family' : role;
    const payload: LastPilotProgram = {
      program_name: program.programName,
      program_code: program.programCode,
      facilitator_access_code: program.facilitatorAccessCode,
      family_access_code: program.familyAccessCode,
      portal_role: resolvedRole,
      last_access_code: resolveLastAccessCode(program, resolvedRole, lastAccessCode),
      admin_email: adminEmail?.trim() ?? program.adminEmail ?? '',
      saved_at: new Date().toISOString(),
      program,
    };
    localStorage.setItem(storageKeyForRole(resolvedRole), JSON.stringify(payload));
    localStorage.setItem(LAST_PORTAL_RETURN_ROLE_KEY, resolvedRole);
  } catch {
    /* localStorage unavailable */
  }
}

export function readLastPilotProgramForRole(role: PortalRole): LastPilotProgram | null {
  try {
    migrateLegacyLastPilotProgram();
    const raw = localStorage.getItem(storageKeyForRole(role));
    if (!raw) return null;
    const parsed = parseLastPilotProgram(raw);
    if (!parsed || parsed.portal_role !== role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readLastPilotProgram(): LastPilotProgram | null {
  try {
    migrateLegacyLastPilotProgram();
    const lastRole = localStorage.getItem(LAST_PORTAL_RETURN_ROLE_KEY);
    if (lastRole === 'family' || lastRole === 'facilitator') {
      const entry = readLastPilotProgramForRole(lastRole);
      if (entry && isIndependentFamilyProgram(entry.program)) {
        return readLastPilotProgramForRole('family') ?? normalizeIndependentFamilyReturn(entry);
      }
      return entry;
    }

    const family = readLastPilotProgramForRole('family');
    const facilitator = readLastPilotProgramForRole('facilitator');
    if (!family && !facilitator) return null;
    if (!family) {
      return facilitator && isIndependentFamilyProgram(facilitator.program)
        ? null
        : facilitator;
    }
    if (!facilitator) return family;
    if (isIndependentFamilyProgram(facilitator.program)) return family;
    return new Date(family.saved_at) >= new Date(facilitator.saved_at) ? family : facilitator;
  } catch {
    return null;
  }
}

export function clearLastPilotProgram(): void {
  try {
    localStorage.removeItem(LAST_PILOT_PROGRAM_KEY);
    localStorage.removeItem(LAST_PILOT_PROGRAM_FAMILY_KEY);
    localStorage.removeItem(LAST_PILOT_PROGRAM_FACILITATOR_KEY);
    localStorage.removeItem(LAST_PORTAL_RETURN_ROLE_KEY);
  } catch {
    /* localStorage unavailable */
  }
}

// TODO: Email facilitator_access_code and family_access_code after signup via Supabase Edge Function or external email service.
// TODO: Email recovery link when admin requests forgotten codes.
