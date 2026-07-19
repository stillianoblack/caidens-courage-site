import type { KidPlaySessionRow } from './kidPlaySessionTypes';
import { familyCompatibilityHeaders } from './familyPortalChildrenApi';
import { campCompatibilityHeaders, hasCampCompatibilitySession } from './campChildSessionApi';
import { hasFamilyCompatibilitySession } from './familyPortalChildrenApi';
import type { GradeLevel } from '../data/gradeLevelOptions';
import type { B4BaselineCheckRecord } from './b4BaselineCheckStorage';

export type FamilyChildSessionResult = {
  session: KidPlaySessionRow;
  reused: boolean;
  correlationId: string | null;
};

function childSessionHeaders(sessionId?: string): Record<string, string> {
  if (hasFamilyCompatibilitySession()) return familyCompatibilityHeaders();
  return campCompatibilityHeaders(sessionId);
}

export function hasServerMediatedChildSession(): boolean {
  return hasFamilyCompatibilitySession() || hasCampCompatibilitySession();
}

async function request(
  method: 'GET' | 'POST' | 'PATCH',
  input: { participantId?: string; sessionId?: string; action?: 'activity' | 'end'; reason?: string; resumePayload?: Record<string, unknown> | null },
): Promise<FamilyChildSessionResult> {
  const query = input.sessionId ? `?sessionId=${encodeURIComponent(input.sessionId)}` : '';
  const response = await fetch(`/.netlify/functions/family-child-session${query}`, {
    method,
    headers: childSessionHeaders(input.sessionId),
    body: method === 'GET' ? undefined : JSON.stringify(input),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success || !body?.session?.id) {
    const error = new Error(body?.code || 'family_child_session_failed') as Error & {
      status?: number;
      correlationId?: string | null;
    };
    error.status = response.status;
    error.correlationId = response.headers.get('X-Correlation-Id') || body?.correlationId || null;
    throw error;
  }
  return {
    session: body.session as KidPlaySessionRow,
    reused: Boolean(body.reused),
    correlationId: response.headers.get('X-Correlation-Id') || body.correlationId || null,
  };
}

export function launchFamilyCompatibilityChildSession(participantId: string) {
  return request('POST', { participantId });
}

export async function getFamilyCompatibilityChildSession(sessionId: string) {
  return (await request('GET', { sessionId })).session;
}

export async function updateFamilyCompatibilityChildSession(
  sessionId: string,
  resumePayload?: Record<string, unknown> | null,
) {
  return (await request('PATCH', { sessionId, action: 'activity', resumePayload })).session;
}

export async function endFamilyCompatibilityChildSession(
  sessionId: string,
  reason?: string,
) {
  return (await request('PATCH', { sessionId, action: 'end', reason })).session;
}

export async function saveFamilyCompatibilityChildGrade(
  sessionId: string,
  gradeLevel: GradeLevel,
): Promise<void> {
  const response = await fetch(
    `/.netlify/functions/family-child-session?sessionId=${encodeURIComponent(sessionId)}`,
    {
      method: 'PATCH',
      headers: childSessionHeaders(sessionId),
      body: JSON.stringify({ action: 'grade', gradeLevel }),
    },
  );
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success || body?.gradeLevel !== gradeLevel) {
    const error = new Error(body?.code || 'grade_update_failed') as Error & {
      status?: number;
      correlationId?: string | null;
    };
    error.status = response.status;
    error.correlationId = response.headers.get('X-Correlation-Id') || body?.correlationId || null;
    throw error;
  }
}

export async function saveFamilyCompatibilityChildBaseline(
  sessionId: string,
  record: B4BaselineCheckRecord,
): Promise<void> {
  const response = await fetch(
    `/.netlify/functions/family-child-session?sessionId=${encodeURIComponent(sessionId)}`,
    {
      method: 'PATCH',
      headers: childSessionHeaders(sessionId),
      body: JSON.stringify({
        action: 'baseline',
        record: {
          completedModules: record.completedModules,
          feelingsScore: record.feelingsScore,
          readingScore: record.readingScore,
          focusMovesScore: record.focusMovesScore,
          completedAt: record.completedAt,
        },
      }),
    },
  );
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success || body?.baselineComplete !== true) {
    throw new Error(body?.code || 'baseline_save_failed');
  }
}
