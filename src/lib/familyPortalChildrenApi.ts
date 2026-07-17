import { readActiveAccessCode, readActivePortalRole } from '../config/portalContext';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { readFamilyPortalSession } from '../config/familyPortalAccess';
import type { StudentParticipantRecord } from './pilotTrackingService';
import type { StudentFamilyLink } from './studentFamilyLinkService';

export type FamilyCompatibilityChildren = {
  participants: StudentParticipantRecord[];
  links: StudentFamilyLink[];
  sessionType: 'legacy_access_code';
  ownershipMode: 'server_validated_compatibility';
  programIdSuffix: string | null;
};

function sessionHeaders(): Record<string, string> {
  const program = readActivePilotProgram();
  const accessCode = readActiveAccessCode();
  if (
    !readFamilyPortalSession() ||
    readActivePortalRole() !== 'family' ||
    !program?.programCode?.trim() ||
    !accessCode?.trim()
  ) {
    throw new Error('Family session is unavailable.');
  }
  return {
    'Content-Type': 'application/json',
    'X-Family-Program-Code': program.programCode.trim(),
    'X-Family-Access-Code': accessCode.trim(),
  };
}

export function hasFamilyCompatibilitySession(): boolean {
  try { sessionHeaders(); return true; } catch { return false; }
}

export function familyCompatibilityHeaders(): Record<string, string> {
  return sessionHeaders();
}

export async function fetchFamilyCompatibilityChildren(): Promise<FamilyCompatibilityChildren> {
  const started = Date.now();
  const response = await fetch('/.netlify/functions/family-portal-children', {
    method: 'GET',
    headers: sessionHeaders(),
  });
  const body = await response.json().catch(() => null);
  if (process.env.NODE_ENV === 'development') {
    console.info('[FAMILY_SESSION_DIAGNOSTIC]', JSON.stringify({
      sessionType: body?.sessionType || 'legacy_access_code',
      familyIdSuffix: body?.programIdSuffix || null,
      programIdSuffix: body?.programIdSuffix || null,
      participantCount: Array.isArray(body?.participants) ? body.participants.length : 0,
      ownershipMode: body?.ownershipMode || 'server_validated_compatibility',
      status: response.status,
      durationMs: Date.now() - started,
    }));
  }
  if (!response.ok || !body?.success) throw new Error(body?.code || 'family_children_unavailable');
  return body as FamilyCompatibilityChildren;
}

export async function createFamilyCompatibilityChild(input: {
  firstName: string;
  nickname?: string;
  ageGrade?: string;
  requestId: string;
}): Promise<{ participant: StudentParticipantRecord; familyLink: StudentFamilyLink; reused: boolean }> {
  const response = await fetch('/.netlify/functions/family-portal-children', {
    method: 'POST',
    headers: { ...sessionHeaders(), 'X-Idempotency-Key': input.requestId },
    body: JSON.stringify({ firstName: input.firstName, nickname: input.nickname, ageGrade: input.ageGrade }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success || !body?.participant?.id || !body?.familyLink?.id) {
    throw new Error(body?.code || 'family_child_create_failed');
  }
  return { participant: body.participant, familyLink: body.familyLink, reused: Boolean(body.reused) };
}

export async function updateFamilyCompatibilityParticipantGrade(input: {
  participantId: string;
  gradeLevel: string;
  allowStretchLevel: boolean;
}): Promise<void> {
  const response = await fetch('/.netlify/functions/family-portal-children', {
    method: 'PATCH',
    headers: sessionHeaders(),
    body: JSON.stringify(input),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) {
    const error = new Error(body?.code || 'grade_update_failed') as Error & {
      status?: number;
      correlationId?: string | null;
    };
    error.status = response.status;
    error.correlationId = response.headers.get('X-Correlation-Id') || body?.correlationId || null;
    if (process.env.NODE_ENV === 'development') {
      console.warn('[FAMILY_GRADE_UPDATE]', {
        status: response.status,
        code: error.message,
        correlationId: error.correlationId,
        participantIdSuffix: input.participantId.slice(-6),
      });
    }
    throw error;
  }
}
