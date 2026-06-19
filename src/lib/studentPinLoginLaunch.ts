import { kidPlaySessionStartPath } from '../config/courageRoutes';
import { setActiveChild } from './activeChildContext';
import { createKidPlaySession, findActiveKidPlaySessionForChild, readLocalKidPlaySessionId } from './kidPlaySessionService';
import type { KidPlaySessionRow } from './kidPlaySessionTypes';
import { writeStudentPinSession, type StudentPinSession } from './studentPinSession';

export type StudentPinLoginLaunchResult =
  | { kind: 'session'; session: KidPlaySessionRow; path: string }
  | { kind: 'resume'; session: KidPlaySessionRow; path: string }
  | { kind: 'error'; message: string };

export async function launchStudentPinKidPlay(input: {
  participantId: string;
  programCode: string;
  displayName: string;
  organizationId?: string | null;
}): Promise<StudentPinLoginLaunchResult> {
  const childId = input.participantId.trim();
  if (!childId) {
    return { kind: 'error', message: 'Missing student.' };
  }

  const sessionRecord: StudentPinSession = {
    participantId: childId,
    programCode: input.programCode.trim(),
    displayName: input.displayName.trim() || 'Player',
    verifiedAt: new Date().toISOString(),
  };
  writeStudentPinSession(sessionRecord);
  setActiveChild({
    participantId: childId,
    displayName: sessionRecord.displayName,
    firstName: sessionRecord.displayName,
  });

  const existing = await findActiveKidPlaySessionForChild(childId);
  const localSessionId = readLocalKidPlaySessionId();
  if (
    existing &&
    existing.session_source === 'future_child_pin' &&
    localSessionId &&
    existing.id === localSessionId
  ) {
    return {
      kind: 'resume',
      session: existing,
      path: kidPlaySessionStartPath(existing.id),
    };
  }

  const session = await createKidPlaySession({
    childId,
    participantId: childId,
    organizationId: input.organizationId?.trim() || null,
    sessionSource: 'future_child_pin',
    deviceMode: 'child_owned_device',
  });

  if (!session) {
    return { kind: 'error', message: 'Could not start game session. Try again.' };
  }

  console.info('[STUDENT_PIN_LAUNCH]', {
    sessionId: session.id,
    childId: session.child_id,
    programCode: input.programCode,
  });

  return {
    kind: 'session',
    session,
    path: kidPlaySessionStartPath(session.id),
  };
}
