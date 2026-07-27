import type { PilotProgramRecord } from '../types/pilotProgram';

export type PilotSignupApiResponse = {
  success: boolean;
  program?: PilotProgramRecord;
  reused?: boolean;
  participantId?: string;
  redirectDestination?: string;
  code?: string;
  message?: string;
  correlationId?: string;
};

export async function requestPilotSignup(
  body: Record<string, unknown>,
  requestId: string,
): Promise<PilotSignupApiResponse> {
  const response = await fetch('/.netlify/functions/pilot-family-signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': requestId,
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as PilotSignupApiResponse | null;
  if (!response.ok || !payload?.success) {
    return {
      success: false,
      code: payload?.code || 'server_error',
      message: payload?.message || "We couldn't create your program. Please try again.",
      correlationId:
        payload?.correlationId || response.headers.get('X-Correlation-Id') || undefined,
    };
  }
  return payload;
}

export async function createCampParentProgram(input: {
  record: Omit<PilotProgramRecord, 'id' | 'created_at'>;
  requestedProgramCode: string;
  requestId: string;
}): Promise<PilotSignupApiResponse> {
  return requestPilotSignup(
    {
      flow: 'camp_parent_program',
      record: input.record,
      requestedProgramCode: input.requestedProgramCode,
    },
    input.requestId,
  );
}
