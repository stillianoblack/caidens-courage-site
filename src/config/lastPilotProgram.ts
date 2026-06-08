import type { ActivePilotProgram } from '../types/pilotProgram';
import type { PortalRole } from './portalContext';

export const LAST_PILOT_PROGRAM_KEY = 'lastPilotProgram';

export type LastPilotProgram = {
  program_name: string;
  program_code: string;
  facilitator_access_code: string;
  family_access_code: string;
  portal_role: PortalRole;
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

export function writeLastPilotProgram(
  program: ActivePilotProgram,
  role: PortalRole,
  adminEmail?: string,
): void {
  try {
    const payload: LastPilotProgram = {
      program_name: program.programName,
      program_code: program.programCode,
      facilitator_access_code: program.facilitatorAccessCode,
      family_access_code: program.familyAccessCode,
      portal_role: role,
      admin_email: adminEmail?.trim() ?? program.adminEmail ?? '',
      saved_at: new Date().toISOString(),
      program,
    };
    localStorage.setItem(LAST_PILOT_PROGRAM_KEY, JSON.stringify(payload));
  } catch {
    /* localStorage unavailable */
  }
}

export function readLastPilotProgram(): LastPilotProgram | null {
  try {
    const raw = localStorage.getItem(LAST_PILOT_PROGRAM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastPilotProgram;
    if (!parsed?.program_code || !parsed?.program?.programCode) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearLastPilotProgram(): void {
  try {
    localStorage.removeItem(LAST_PILOT_PROGRAM_KEY);
  } catch {
    /* localStorage unavailable */
  }
}

// TODO: Email facilitator_access_code and family_access_code after signup via Supabase Edge Function or external email service.
// TODO: Email recovery link when admin requests forgotten codes.
