import type { NavigateFunction } from 'react-router-dom';
import {
  FAMILY_HUB_PATH,
  FAMILY_PORTAL_PATH,
  KIDS_PORTAL_PATH,
  PORTAL_PATH,
  PROGRAM_DASHBOARD_PATH,
} from '../config/courageRoutes';
import { clearLastPilotProgram } from '../config/lastPilotProgram';
import { clearRememberedDeviceSession } from './rememberedDeviceSession';
import { clearStalePortalRouteState, readActivePortalRole, signOutPortal } from '../config/portalContext';
import { clearActiveChild } from './activeChildContext';
import { RECENTLY_COMPLETED_HOTSPOT_KEY } from './courageMapReturnFeedback';
import {
  logInactivityContext,
  resolveInactivitySessionContext,
} from './inactivitySessionContext';
import { getPortalBasePath } from './portalGamePaths';
import { PORTAL_RETURN_KEY } from './portalReturnNav';

/** Clears in-memory child session state without touching Supabase progress or rewards. */
export function clearChildSessionMemory(): void {
  clearActiveChild();
  clearStalePortalRouteState();
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(RECENTLY_COMPLETED_HOTSPOT_KEY);
    window.sessionStorage.removeItem(PORTAL_RETURN_KEY);
  } catch {
    /* sessionStorage unavailable */
  }
}

/** Full shared-device sign-out — access-code gate with no remembered quick return. */
export function clearSharedDevicePortalSession(): void {
  clearChildSessionMemory();
  signOutPortal();
  clearLastPilotProgram();
  clearRememberedDeviceSession('shared_device_sign_out');
}

/** Safest portal landing screen after idle timeout for home/family quick-return users. */
export function resolveProtectedSessionExitPath(pathname?: string): string {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');

  if (
    path.startsWith(FAMILY_HUB_PATH) ||
    path.startsWith(FAMILY_PORTAL_PATH) ||
    path.startsWith(KIDS_PORTAL_PATH) ||
    path.startsWith(PROGRAM_DASHBOARD_PATH)
  ) {
    return getPortalBasePath(path);
  }

  const role = readActivePortalRole();
  if (role === 'family') {
    return getPortalBasePath(FAMILY_HUB_PATH);
  }
  if (role === 'facilitator') {
    return getPortalBasePath(PROGRAM_DASHBOARD_PATH);
  }

  return PORTAL_PATH;
}

/** End the active child gameplay session using context-aware portal rules. */
export function endProtectedChildSession(
  navigate: NavigateFunction,
  pathname?: string,
  reason: 'idle_timeout' | 'manual' = 'idle_timeout',
): void {
  const context = resolveInactivitySessionContext();
  logInactivityContext('INACTIVITY_END_SESSION', context, { reason });

  if (context.requiresAccessCodeReset) {
    clearSharedDevicePortalSession();
    navigate(PORTAL_PATH, {
      replace: true,
      state: {
        portalMessage: 'Your session ended due to inactivity. Enter your access code to continue.',
      },
    });
    return;
  }

  clearChildSessionMemory();
  navigate(resolveProtectedSessionExitPath(pathname), { replace: true });
}
