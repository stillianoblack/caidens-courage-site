import { readActivePilotProgram } from '../config/activePilotProgram';
import {
  createKidPlaySession,
  findActiveKidPlaySessionForChild,
  readLocalKidPlaySessionId,
  writeLocalKidPlaySessionId,
} from './kidPlaySessionService';
import type { KidPlaySessionRow } from './kidPlaySessionTypes';
import { resolveLaunchedByUserId } from './resolveLaunchedByUserId';
import { hasFamilyCompatibilitySession } from './familyPortalChildrenApi';
import { launchFamilyCompatibilityChildSession } from './familyChildSessionApi';

export type FamilyKidPlayLaunchInput = {
  childId: string;
  launchedByUserId?: string | null;
};

export type FamilyKidPlayLaunchResult =
  | { kind: 'session'; session: KidPlaySessionRow }
  | { kind: 'resume'; session: KidPlaySessionRow }
  | { kind: 'error'; message: string; supportCode?: string | null };

export async function resolveFamilyKidPlayLaunch(
  input: FamilyKidPlayLaunchInput,
): Promise<FamilyKidPlayLaunchResult> {
  const childId = input.childId.trim();
  if (!childId) {
    return { kind: 'error', message: 'Choose a player before starting the child game.' };
  }

  if (hasFamilyCompatibilitySession()) {
    try {
      const result = await launchFamilyCompatibilityChildSession(childId);
      writeLocalKidPlaySessionId(result.session.id);
      return { kind: result.reused ? 'resume' : 'session', session: result.session };
    } catch (caught) {
      const error = caught as Error & { correlationId?: string | null };
      return {
        kind: 'error',
        message: 'Could not start child game. Try again.',
        supportCode: error.correlationId || null,
      };
    }
  }

  const existing = await findActiveKidPlaySessionForChild(childId);
  const localSessionId = readLocalKidPlaySessionId();

  if (
    existing &&
    existing.session_source === 'family_home' &&
    localSessionId &&
    existing.id === localSessionId
  ) {
    return { kind: 'resume', session: existing };
  }

  const program = readActivePilotProgram();
  const launchedByUserId =
    input.launchedByUserId?.trim() || (await resolveLaunchedByUserId());

  const session = await createKidPlaySession({
    childId,
    participantId: childId,
    organizationId: program?.id ?? null,
    launchedByUserId,
    sessionSource: 'family_home',
    deviceMode: 'home_device',
  });

  if (!session) {
    return { kind: 'error', message: 'Could not start child game. Try again.' };
  }

  console.info('[KID_PLAY_FAMILY_LAUNCH]', {
    sessionId: session.id,
    childId: session.child_id,
    launchedByUserId: session.launched_by_user_id,
    deviceMode: session.device_mode,
  });

  return { kind: 'session', session };
}
