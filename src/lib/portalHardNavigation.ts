import { navigateWithPageTransition } from './pageTransition';

export function replaceWithPortalRoute(path: string): void {
  if (typeof window === 'undefined') return;
  navigateWithPageTransition(path, 'replace');
}

/**
 * Complete an authentication handoff without the recoverable page-transition
 * overlay. Signup has already persisted the new portal identity at this point;
 * a direct replace prevents the transition recovery screen from reloading the
 * completed signup route when navigation is delayed or interrupted.
 */
export function replaceWithAuthenticatedPortalRoute(path: string): void {
  if (typeof window === 'undefined') return;
  window.location.replace(new URL(path, window.location.origin).href);
}

export function assignPortalRoute(path: string): void {
  if (typeof window === 'undefined') return;
  navigateWithPageTransition(path);
}
