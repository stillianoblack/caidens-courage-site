import type { ActivePilotProgram } from '../types/pilotProgram';

export type PortalProgramAccessIntent = 'student' | 'parent' | 'facilitator';

export type PortalProgramAccessClaimContext = {
  participantId: string;
  childDisplayName: string;
  campProgramCode: string;
};

export type PortalProgramAccessResult =
  | {
      status: 'found';
      role: 'facilitator' | 'family';
      program: ActivePilotProgram;
      claimCodeContext?: PortalProgramAccessClaimContext;
    }
  | { status: 'not_found' | 'invalid_credential' | 'unavailable' | 'error' };

export async function fetchPortalProgramAccess(input: {
  accessCode: string;
  intent?: PortalProgramAccessIntent;
  credential?: string;
}): Promise<PortalProgramAccessResult> {
  let response: Response;
  try {
    response = await fetch('/.netlify/functions/portal-program-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessCode: input.accessCode,
        intent: input.intent,
        credential: input.credential,
      }),
    });
  } catch {
    return { status: 'unavailable' };
  }

  const body = await response.json().catch(() => null);
  if (response.status === 404) return { status: 'not_found' };
  if (response.status === 403 && body?.code === 'credential_not_connected') {
    return { status: 'invalid_credential' };
  }
  if (!response.ok) return { status: response.status >= 500 ? 'unavailable' : 'error' };
  if (
    !body?.success ||
    !body?.program?.programCode ||
    !body?.program?.programName ||
    !['family', 'facilitator'].includes(body?.role)
  ) {
    return { status: 'error' };
  }

  return {
    status: 'found',
    role: body.role,
    program: body.program as ActivePilotProgram,
    ...(body.claimCodeContext ? { claimCodeContext: body.claimCodeContext } : {}),
  };
}
