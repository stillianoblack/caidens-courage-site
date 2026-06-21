import type { NavigateFunction } from 'react-router-dom';
import { readActivePortalRole } from '../config/portalContext';
import { STUDENT_PIN_LOGIN_PATH } from '../config/courageRoutes';
import { familyPortalPath } from './familyPortalPaths';
import { hasKidPlayReturnSessionContext } from './kidPlayReturnUnlock';
import { clearStudentPinSession } from './studentPinSession';
import { readKidPlayFamilyReturnBase } from './kidPlayShellRoutes';
import { clearChildSessionMemory } from './endProtectedChildSession';
import {
  endKidPlaySession,
  resolveKidPlaySessionBehaviorFromRow,
  updateKidPlaySessionActivity,
  writeLocalKidPlaySessionId,
} from './kidPlaySessionService';
import type { KidPlaySessionRow } from './kidPlaySessionTypes';
import { persistFacilitatorStudentContinuityFromSessionEnd } from './facilitatorSessionContinuity';
import { setKidPlayRosterLocked } from './kidPlayRosterLock';
import { setKidPlayFamilySoftLocked } from './kidPlayFamilySoftLock';
import {
  writeKidPlayFamilyResumePayload,
} from './kidPlayFamilyResume';
import type { KidPlayResumePayload } from './kidPlaySessionResume';
import { triggerParentPush } from './parentPushNotify';
import { buildSessionPausedPushDedupeKey } from './parentPushNotifyDedupe';
import { kidShellAwareNavigate } from './kidShellNav';
import { programDashboardTabPath } from './programDashboardNav';

export type EndKidPlayShellSessionOptions = {
  sessionId: string;
  reason?: string;
  resumePayload?: Record<string, unknown> | null;
  childDisplayName?: string;
  childId?: string;
};

async function persistKidPlaySessionEnd(
  sessionId: string,
  reason: string,
  resumePayload?: Record<string, unknown> | null,
): Promise<void> {
  if (resumePayload) {
    await updateKidPlaySessionActivity(sessionId, resumePayload);
  }

  await endKidPlaySession({
    sessionId,
    reason,
    status: 'ended',
  });

  writeLocalKidPlaySessionId(null);
}

/** Facilitator shared-device end — locked roster, no family portal cookies touched. */
export async function endKidPlayFacilitatorShellSession(
  navigate: NavigateFunction,
  options: EndKidPlayShellSessionOptions,
): Promise<void> {
  const sessionId = options.sessionId.trim();
  if (!sessionId) return;

  await persistKidPlaySessionEnd(
    sessionId,
    options.reason ?? 'idle_timeout',
    options.resumePayload,
  );

  clearChildSessionMemory();
  await persistFacilitatorStudentContinuityFromSessionEnd({
    childId: options.childId,
    childDisplayName: options.childDisplayName,
    resumePayload: options.resumePayload,
  });
  setKidPlayRosterLocked(true);
  kidShellAwareNavigate(navigate, programDashboardTabPath('roster'), { replace: true });
}

/**
 * Family/home soft end — preserve portal cookies; parent re-auth or child picker gate.
 * Does NOT force access-code reset.
 */
export async function endKidPlayFamilyShellSession(
  navigate: NavigateFunction,
  options: EndKidPlayShellSessionOptions,
): Promise<void> {
  const sessionId = options.sessionId.trim();
  if (!sessionId) return;

  await persistKidPlaySessionEnd(
    sessionId,
    options.reason ?? 'idle_timeout',
    options.resumePayload,
  );

  clearChildSessionMemory();
  setKidPlayFamilySoftLocked(true);

  if (options.resumePayload) {
    writeKidPlayFamilyResumePayload(options.resumePayload as KidPlayResumePayload);
  }

  const familyBase = readKidPlayFamilyReturnBase();
  const pausePath = familyPortalPath('play-pause', familyBase);
  triggerParentPush({
    trigger: 'child_session_paused',
    childName: options.childDisplayName,
    childId: options.childId,
    dedupeKey: buildSessionPausedPushDedupeKey(sessionId),
  });
  kidShellAwareNavigate(navigate, pausePath, { replace: true });
}

/** Student PIN end — clear PIN session and return to kid login. */
export async function endKidPlayStudentPinShellSession(
  navigate: NavigateFunction,
  options: EndKidPlayShellSessionOptions,
): Promise<void> {
  const sessionId = options.sessionId.trim();
  if (!sessionId) return;

  await persistKidPlaySessionEnd(
    sessionId,
    options.reason ?? 'signed_out',
    options.resumePayload,
  );

  clearChildSessionMemory();
  clearStudentPinSession();
  kidShellAwareNavigate(navigate, STUDENT_PIN_LOGIN_PATH, { replace: true });
}

/** Ends kid play shell using device_mode policy from the active session row. */
export async function endKidPlayShellSession(
  navigate: NavigateFunction,
  session: Pick<KidPlaySessionRow, 'id' | 'session_source' | 'device_mode'>,
  options: Omit<EndKidPlayShellSessionOptions, 'sessionId'> = {},
): Promise<void> {
  const behavior = resolveKidPlaySessionBehaviorFromRow(session);
  const payload: EndKidPlayShellSessionOptions = {
    sessionId: session.id,
    ...options,
  };

  if (process.env.NODE_ENV === 'development') {
    console.info('[KID_PLAY_SHELL_END]', {
      sessionId: session.id,
      sessionSource: session.session_source,
      deviceMode: session.device_mode,
      strictTimeout: behavior.strictTimeout,
      softReturn: behavior.softReturn,
      reason: payload.reason ?? 'idle_timeout',
    });
  }

  if (behavior.softReturn) {
    await endKidPlayFamilyShellSession(navigate, payload);
    return;
  }

  await endKidPlayFacilitatorShellSession(navigate, payload);
}

export function resolveKidPlaySessionExitPath(
  sessionSource?: KidPlaySessionRow['session_source'] | null,
): string {
  const familyBase = readKidPlayFamilyReturnBase();

  if (sessionSource === 'family_home') {
    return familyPortalPath('weekly-adventures', familyBase);
  }

  if (sessionSource === 'future_child_pin') {
    if (hasKidPlayReturnSessionContext()) {
      return familyPortalPath('play-pause', familyBase);
    }
    return STUDENT_PIN_LOGIN_PATH;
  }

  if (readActivePortalRole() === 'family') {
    return familyPortalPath('weekly-adventures', familyBase);
  }

  return programDashboardTabPath('roster');
}
