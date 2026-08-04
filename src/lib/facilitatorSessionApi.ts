import type { ActivePilotProgram } from '../types/pilotProgram';
import { browserRuntimeHeaders } from './supabaseRuntimeContext';
import { programScopesMatch } from './portalProgramScope';

export type FacilitatorSessionResult =
  | { status: 'authenticated'; program: ActivePilotProgram }
  | { status: 'unauthenticated' | 'unavailable' };

export async function fetchCurrentFacilitatorSession(): Promise<FacilitatorSessionResult> {
  try {
    const response = await fetch('/.netlify/functions/facilitator-session', {
      method: 'GET',
      credentials: 'include',
      headers: browserRuntimeHeaders(),
      cache: 'no-store',
    });
    if (response.status === 401 || response.status === 403) return { status: 'unauthenticated' };
    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.success || !body?.program?.programCode) {
      return { status: 'unavailable' };
    }
    return { status: 'authenticated', program: body.program as ActivePilotProgram };
  } catch {
    return { status: 'unavailable' };
  }
}

export async function revokeCurrentFacilitatorSession(): Promise<void> {
  try {
    await fetch('/.netlify/functions/facilitator-session', {
      method: 'DELETE',
      credentials: 'include',
      headers: browserRuntimeHeaders(),
      cache: 'no-store',
    });
  } catch {
    // Local sign-out still completes if the network is unavailable. The server
    // session remains bounded by its expiry and can be revoked on the next request.
  }
}

export type ScopedFacilitatorSessionResult =
  | { status: 'authorized'; program: ActivePilotProgram }
  | { status: 'unauthenticated' | 'unavailable' | 'wrong_program' };

/**
 * Authorize a facilitator return using only the server-managed HttpOnly session.
 * Browser-cached email and access-code metadata are deliberately not credentials.
 */
export async function verifyFacilitatorSessionForProgram(
  expectedProgramCode: string,
): Promise<ScopedFacilitatorSessionResult> {
  const expected = expectedProgramCode.trim();
  if (!expected) return { status: 'wrong_program' };

  const result = await fetchCurrentFacilitatorSession();
  if (result.status !== 'authenticated') return result;

  return programScopesMatch(result.program.programCode, expected)
    ? { status: 'authorized', program: result.program }
    : { status: 'wrong_program' };
}
