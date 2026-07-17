import {
  readLocalKidPlaySessionId,
  writeLocalKidPlaySessionId,
} from './kidPlaySessionService';
import type { KidPlaySessionRow } from './kidPlaySessionTypes';
import {
  launchCampCompatibilityChildSession,
  type CampChildSessionError,
} from './campChildSessionApi';

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
  | { kind: 'error'; message: string; supportCode?: string | null };

export async function resolveFacilitatorKidPlayLaunch(
  input: FacilitatorKidPlayLaunchInput,
): Promise<FacilitatorKidPlayLaunchResult> {
  const childId = input.childId.trim();
  if (!childId) {
    return { kind: 'error', message: 'Missing student.' };
  }

  const childName = input.childName?.trim() || 'This student';
  const localSessionId = readLocalKidPlaySessionId();
  try {
    const result = await launchCampCompatibilityChildSession({
      participantId: childId,
      localSessionId,
      moveFromExistingSessionId: input.moveFromExistingSessionId,
    });
    writeLocalKidPlaySessionId(result.session.id);
    return { kind: result.reused ? 'resume' : 'session', session: result.session };
  } catch (caught) {
    const error = caught as CampChildSessionError;
    if (error.status === 409 && error.conflictSession) {
      return {
        kind: 'conflict',
        conflict: {
          kind: 'active_elsewhere',
          existingSession: error.conflictSession,
          childName,
        },
      };
    }
    return {
      kind: 'error',
      message: 'Could not start student session. Try again.',
      supportCode: error.correlationId || null,
    };
  }
}
