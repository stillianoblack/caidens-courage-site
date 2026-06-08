import { readActivePilotProgram } from '../config/activePilotProgram';
import { readActivePortalRole, type PortalRole } from '../config/portalContext';

export { PORTAL_ROLE_MISMATCH_MESSAGE } from '../config/portalContext';

export function hasActiveProgramSession(): boolean {
  return Boolean(readActivePilotProgram());
}

export function hasFamilyPortalSession(): boolean {
  return readActivePortalRole() === 'family' && hasActiveProgramSession();
}

export function hasFacilitatorPortalSession(): boolean {
  return readActivePortalRole() === 'facilitator' && hasActiveProgramSession();
}

export function isPortalRoleAllowed(pathname: string): boolean {
  const role = readActivePortalRole();
  if (!role || !hasActiveProgramSession()) return false;

  if (pathname.startsWith('/family-hub')) {
    return role === 'family';
  }
  if (pathname.startsWith('/program-dashboard')) {
    return role === 'facilitator';
  }
  return true;
}

export function requiredRoleForPath(pathname: string): PortalRole | null {
  if (pathname.startsWith('/family-hub')) return 'family';
  if (pathname.startsWith('/program-dashboard')) return 'facilitator';
  return null;
}
