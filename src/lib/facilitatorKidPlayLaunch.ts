import { readActivePilotProgram } from '../config/activePilotProgram';
import {
  createKidPlaySession,
  endKidPlaySession,
  findActiveKidPlaySessionForChild,
  readLocalKidPlaySessionId,
} from './kidPlaySessionService';
import type { KidPlaySessionRow } from './kidPlaySessionTypes';

export type FacilitatorKidPlayLaunchInput = {
  childId: string;
  childName?: string;
  organizationId?: string | null;
  /** When set, ends the prior active session with status moved before creating a new one. */
  moveFromExistingSessionId?: string | null;
};

export type FacilitatorKidPlayLaunchConflict = {
  kind: 'active_elsewhere';
  existingSession: KidPlaySessionRow;
  childName: string;
};

export type FacilitatorKidPlayLaunchResult =
  | { kind: 'session'; session: KidPlaySessionRow }
  | { kind: 'resume'; session: KidPlaySessionRow }
  | { kind: 'conflict'; conflict: FacilitatorKidPlayLaunchConflict }
  | { kind: 'error'; message: string };

export async function resolveFacilitatorKidPlayLaunch(
  input: FacilitatorKidPlayLaunchInput,
): Promise<FacilitatorKidPlayLaunchResult> {
  const childId = input.childId.trim();
  if (!childId) {
    return { kind: 'error', message: 'Missing student.' };
  }

  const childName = input.childName?.trim() || 'This student';
  const existing = await findActiveKidPlaySessionForChild(childId);
  const localSessionId = readLocalKidPlaySessionId();

  if (existing && !input.moveFromExistingSessionId) {
    if (localSessionId && existing.id === localSessionId) {
      return { kind: 'resume', session: existing };
    }
    return {
      kind: 'conflict',
      conflict: { kind: 'active_elsewhere', existingSession: existing, childName },
    };
  }

  if (input.moveFromExistingSessionId) {
    await endKidPlaySession({
      sessionId: input.moveFromExistingSessionId,
      reason: 'moved',
      status: 'moved',
    });
  }

  const program = readActivePilotProgram();
  const session = await createKidPlaySession({
    childId,
    participantId: childId,
    organizationId: input.organizationId?.trim() || program?.id || null,
    sessionSource: 'facilitator_roster_launch',
    deviceMode: 'shared_camp_device',
  });

  if (!session) {
    return { kind: 'error', message: 'Could not start student session. Try again.' };
  }

  return { kind: 'session', session };
}
