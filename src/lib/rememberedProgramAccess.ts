import { readActivePilotProgram } from '../config/activePilotProgram';
import { readActiveAccessCode } from '../config/portalContext';
import { clearAllPortalAuthState } from './portalIdentityReset';
import { readLastPilotProgram } from '../config/lastPilotProgram';
import type { ActivePilotProgram } from '../types/pilotProgram';
import { clearRememberedDeviceSession, readRememberedDeviceSession } from './rememberedDeviceSession';

export const REMEMBERED_PROGRAM_ACCESS_KEY = 'cc-remembered-program-access';

export type RememberedProgramAccess = {
  access_code: string;
  program_code: string;
  program_id: string | null;
  program: ActivePilotProgram;
  saved_at: string;
  expires_at: string;
};

export type RememberedProgramContextSource =
  | 'program_access'
  | 'device_session'
  | 'last_pilot'
  | 'active_session';

export type RememberedProgramContext = {
  accessCode: string;
  program: ActivePilotProgram;
  source: RememberedProgramContextSource;
};

const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function parseRememberedProgramAccess(raw: string): RememberedProgramAccess | null {
  try {
    const parsed = JSON.parse(raw) as RememberedProgramAccess;
    if (!parsed?.access_code?.trim() || !parsed.program?.programCode) return null;
    if (!parsed.expires_at) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeRememberedProgramAccess(accessCode: string, program: ActivePilotProgram): void {
  if (!isBrowser()) return;
  const trimmedCode = accessCode.trim();
  if (!trimmedCode || !program.programCode?.trim()) return;

  const now = new Date();
  const payload: RememberedProgramAccess = {
    access_code: trimmedCode,
    program_code: program.programCode.trim(),
    program_id: program.id ?? null,
    program,
    saved_at: now.toISOString(),
    expires_at: new Date(now.getTime() + DEFAULT_TTL_MS).toISOString(),
  };

  try {
    window.localStorage.setItem(REMEMBERED_PROGRAM_ACCESS_KEY, JSON.stringify(payload));
  } catch {
    /* localStorage unavailable */
  }
}

export function readRememberedProgramAccessRecord(): RememberedProgramAccess | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(REMEMBERED_PROGRAM_ACCESS_KEY);
    if (!raw) return null;
    const parsed = parseRememberedProgramAccess(raw);
    if (!parsed) {
      clearRememberedProgramAccess();
      return null;
    }
    if (Date.now() >= new Date(parsed.expires_at).getTime()) {
      clearRememberedProgramAccess();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearRememberedProgramAccess(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(REMEMBERED_PROGRAM_ACCESS_KEY);
  } catch {
    /* localStorage unavailable */
  }
}

/** Clears remembered program access and optional full device session. */
export function switchRememberedProgram(clearDeviceSession = true): void {
  clearAllPortalAuthState('switch_program');
  clearRememberedProgramAccess();
  if (clearDeviceSession) {
    clearRememberedDeviceSession('switch_program');
  }
}

export function resolveRememberedProgramContext(): RememberedProgramContext | null {
  const record = readRememberedProgramAccessRecord();
  if (record) {
    return {
      accessCode: record.access_code,
      program: record.program,
      source: 'program_access',
    };
  }

  const device = readRememberedDeviceSession();
  if (device?.access_code?.trim() && device.program) {
    return {
      accessCode: device.access_code.trim(),
      program: device.program,
      source: 'device_session',
    };
  }

  const last = readLastPilotProgram();
  if (last?.last_access_code?.trim() && last.program) {
    return {
      accessCode: last.last_access_code.trim(),
      program: last.program,
      source: 'last_pilot',
    };
  }

  const activeCode = readActiveAccessCode();
  const activeProgram = readActivePilotProgram();
  if (activeCode?.trim() && activeProgram) {
    return {
      accessCode: activeCode.trim(),
      program: activeProgram,
      source: 'active_session',
    };
  }

  return null;
}

export function hasRememberedProgramAccess(): boolean {
  return Boolean(resolveRememberedProgramContext()?.accessCode);
}

export function readRememberedProgramAccessCode(): string {
  return resolveRememberedProgramContext()?.accessCode ?? '';
}

export function readRememberedProgramForContext(): ActivePilotProgram | null {
  return resolveRememberedProgramContext()?.program ?? null;
}

export const REMEMBERED_PROGRAM_ACCESS_TTL_MS = DEFAULT_TTL_MS;
