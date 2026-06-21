import type { ActivePilotProgram } from '../types/pilotProgram';
import { logSecurityAudit } from './securityAuditLog';

export const REMEMBERED_DEVICE_SESSION_KEY = 'cc-remembered-device-session';

export type RememberedDeviceUserType = 'student' | 'parent' | 'facilitator';

export type RememberedDeviceSession = {
  access_code: string;
  program_id: string | null;
  program_code: string;
  user_type: RememberedDeviceUserType;
  student_id?: string;
  parent_id?: string;
  facilitator_id?: string;
  display_name?: string;
  verified_at: string;
  expires_at: string;
  program?: ActivePilotProgram;
};

const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function parseSession(raw: string): RememberedDeviceSession | null {
  try {
    const parsed = JSON.parse(raw) as RememberedDeviceSession;
    if (!parsed?.access_code?.trim() || !parsed.program_code?.trim()) return null;
    if (
      parsed.user_type !== 'student' &&
      parsed.user_type !== 'parent' &&
      parsed.user_type !== 'facilitator'
    ) {
      return null;
    }
    if (!parsed.verified_at || !parsed.expires_at) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readRememberedDeviceSession(): RememberedDeviceSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(REMEMBERED_DEVICE_SESSION_KEY);
    if (!raw) return null;
    const parsed = parseSession(raw);
    if (!parsed) {
      clearRememberedDeviceSession();
      return null;
    }
    if (Date.now() >= new Date(parsed.expires_at).getTime()) {
      clearRememberedDeviceSession();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isRememberedDeviceSessionValid(): boolean {
  return Boolean(readRememberedDeviceSession());
}

export function writeRememberedDeviceSession(
  input: Omit<RememberedDeviceSession, 'verified_at' | 'expires_at'> & {
    verified_at?: string;
    expires_at?: string;
  },
): void {
  if (!isBrowser()) return;
  const now = new Date();
  const verifiedAt = input.verified_at ?? now.toISOString();
  const expiresAt =
    input.expires_at ?? new Date(now.getTime() + DEFAULT_TTL_MS).toISOString();

  const payload: RememberedDeviceSession = {
    ...input,
    access_code: input.access_code.trim(),
    program_code: input.program_code.trim(),
    verified_at: verifiedAt,
    expires_at: expiresAt,
  };

  try {
    window.localStorage.setItem(REMEMBERED_DEVICE_SESSION_KEY, JSON.stringify(payload));
    logSecurityAudit('remembered_device_created', {
      user_type: payload.user_type,
      program_code: payload.program_code,
    });
  } catch {
    /* localStorage unavailable */
  }
}

export function touchRememberedDeviceSession(): RememberedDeviceSession | null {
  const current = readRememberedDeviceSession();
  if (!current) return null;

  const now = new Date();
  const updated: RememberedDeviceSession = {
    ...current,
    verified_at: now.toISOString(),
    expires_at: new Date(now.getTime() + DEFAULT_TTL_MS).toISOString(),
  };

  try {
    window.localStorage.setItem(REMEMBERED_DEVICE_SESSION_KEY, JSON.stringify(updated));
  } catch {
    /* localStorage unavailable */
  }

  return updated;
}

export function clearRememberedDeviceSession(reason = 'manual'): void {
  if (!isBrowser()) return;
  try {
    const had = Boolean(window.localStorage.getItem(REMEMBERED_DEVICE_SESSION_KEY));
    window.localStorage.removeItem(REMEMBERED_DEVICE_SESSION_KEY);
    if (had) {
      logSecurityAudit('remembered_device_cleared', { reason });
    }
  } catch {
    /* localStorage unavailable */
  }
}

export function defaultRememberDeviceForUserType(userType: RememberedDeviceUserType): boolean {
  return userType === 'parent' || userType === 'facilitator';
}
