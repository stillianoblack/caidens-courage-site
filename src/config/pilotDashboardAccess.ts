import type { PortalAccessType } from './portalAccess';
import { ensureFacilitatorPortalAccess } from './blueRibbonPortalAccess';

/**
 * MVP client-side gate for Focus Flame Academy Pilot Dashboard.
 *
 * TODO: Move pilot dashboard access to server-side auth and paid partner roles.
 * TODO: Support camp-specific partner tiers and per-program entitlements.
 */
export const PILOT_DASHBOARD_ALLOWED_TYPES: PortalAccessType[] = ['pilot', 'school', 'teacher'];

export function canAccessPilotDashboard(sessionType: PortalAccessType | null): boolean {
  if (!sessionType) return false;
  return PILOT_DASHBOARD_ALLOWED_TYPES.includes(sessionType);
}

export function readPilotDashboardSession(): PortalAccessType | null {
  return ensureFacilitatorPortalAccess();
}
