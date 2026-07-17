import { readActivePilotProgram } from '../config/activePilotProgram';
import { readActiveAccessCode, readActivePortalRole } from '../config/portalContext';
import type { KidPlaySessionRow } from './kidPlaySessionTypes';

export type CampChildSessionResult = {
  session: KidPlaySessionRow;
  reused: boolean;
  correlationId: string | null;
};

export type CampChildSessionError = Error & {
  status?: number;
  correlationId?: string | null;
  conflictSession?: KidPlaySessionRow | null;
};

export function campCompatibilityHeaders(sessionId?: string | null): Record<string, string> {
  const program = readActivePilotProgram();
  const accessCode = readActiveAccessCode();
  if (
    readActivePortalRole() !== 'facilitator' ||
    !program?.id?.trim() ||
    !program.programCode?.trim() ||
    !accessCode?.trim()
  ) {
    throw new Error('Camp facilitator session is unavailable.');
  }
  return {
    'Content-Type': 'application/json',
    'X-Camp-Program-Id': program.id.trim(),
    'X-Camp-Program-Code': program.programCode.trim(),
    'X-Camp-Access-Code': accessCode.trim(),
    ...(sessionId?.trim() ? { 'X-Kid-Session-Id': sessionId.trim() } : {}),
  };
}

export function hasCampCompatibilitySession(): boolean {
  try { campCompatibilityHeaders(); return true; } catch { return false; }
}

async function request(
  method: 'GET' | 'POST' | 'PATCH',
  input: {
    participantId?: string;
    sessionId?: string;
    localSessionId?: string | null;
    moveFromExistingSessionId?: string | null;
    action?: 'activity' | 'end';
    reason?: string;
    resumePayload?: Record<string, unknown> | null;
  },
): Promise<CampChildSessionResult> {
  const query = input.sessionId ? `?sessionId=${encodeURIComponent(input.sessionId)}` : '';
  const response = await fetch(`/.netlify/functions/family-child-session${query}`, {
    method,
    headers: campCompatibilityHeaders(input.sessionId),
    body: method === 'GET' ? undefined : JSON.stringify(input),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success || !body?.session?.id) {
    const error = new Error(body?.code || 'camp_child_session_failed') as CampChildSessionError;
    error.status = response.status;
    error.correlationId = response.headers.get('X-Correlation-Id') || body?.correlationId || null;
    error.conflictSession = body?.conflictSession?.id
      ? (body.conflictSession as KidPlaySessionRow)
      : null;
    throw error;
  }
  return {
    session: body.session as KidPlaySessionRow,
    reused: Boolean(body.reused),
    correlationId: response.headers.get('X-Correlation-Id') || body.correlationId || null,
  };
}

const launchRequests = new Map<string, Promise<CampChildSessionResult>>();

export function launchCampCompatibilityChildSession(input: {
  participantId: string;
  localSessionId?: string | null;
  moveFromExistingSessionId?: string | null;
}): Promise<CampChildSessionResult> {
  const key = [
    input.participantId.trim(),
    input.localSessionId?.trim() || '',
    input.moveFromExistingSessionId?.trim() || '',
  ].join(':');
  const existing = launchRequests.get(key);
  if (existing) return existing;
  const pending = request('POST', input).finally(() => {
    if (launchRequests.get(key) === pending) launchRequests.delete(key);
  });
  launchRequests.set(key, pending);
  return pending;
}

export async function getCampCompatibilityChildSession(sessionId: string) {
  return (await request('GET', { sessionId })).session;
}

export async function updateCampCompatibilityChildSession(
  sessionId: string,
  resumePayload?: Record<string, unknown> | null,
) {
  return (await request('PATCH', { sessionId, action: 'activity', resumePayload })).session;
}

export async function endCampCompatibilityChildSession(
  sessionId: string,
  reason?: string,
) {
  return (await request('PATCH', { sessionId, action: 'end', reason })).session;
}

export const _test = { launchRequests };
