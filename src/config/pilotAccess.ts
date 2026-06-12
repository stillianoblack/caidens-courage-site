import {
  B4_BASELINE_CHECK_PATH,
  B4_GUIDE_PATH,
  BMC_RESET_TOOLS_PATH,
  FOCUS_FLAME_LAB_PATH,
  WEEK_0_ASSESSMENT_PATH,
} from './courageRoutes';
import type { PilotInterestType } from '../types/pilotWaitlist';
import { hasFamilyPortalSession, hasFacilitatorPortalSession } from '../lib/portalSessionGuard';

/** Public marketing paths that require pilot portal access to play. */
export const PILOT_GATED_PUBLIC_PATHS: readonly string[] = [
  FOCUS_FLAME_LAB_PATH,
  WEEK_0_ASSESSMENT_PATH,
  B4_GUIDE_PATH,
  B4_BASELINE_CHECK_PATH,
  BMC_RESET_TOOLS_PATH,
];

export function hasPilotExperienceAccess(): boolean {
  if (typeof window === 'undefined') return false;
  return hasFamilyPortalSession() || hasFacilitatorPortalSession();
}

export function resolvePilotInterestForPath(pathname: string): PilotInterestType {
  if (
    pathname === B4_GUIDE_PATH ||
    pathname === B4_BASELINE_CHECK_PATH ||
    pathname === BMC_RESET_TOOLS_PATH
  ) {
    return 'b4_tools';
  }
  if (pathname === FOCUS_FLAME_LAB_PATH || pathname.startsWith(`${FOCUS_FLAME_LAB_PATH}/`)) {
    return 'focus_flame_lab';
  }
  return 'general_pilot';
}

export function isPilotGatedPublicPath(pathname: string): boolean {
  return PILOT_GATED_PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export const B4_PILOT_MODAL_DESCRIPTION =
  "B-4's focus tools are currently available through pilot programs.";
