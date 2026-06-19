import { navigateWithPageTransition } from './pageTransition';

export function replaceWithPortalRoute(path: string): void {
  if (typeof window === 'undefined') return;
  navigateWithPageTransition(path, 'replace');
}

export function assignPortalRoute(path: string): void {
  if (typeof window === 'undefined') return;
  navigateWithPageTransition(path);
}
