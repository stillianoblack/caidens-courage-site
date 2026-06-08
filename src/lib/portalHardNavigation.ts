export function replaceWithPortalRoute(path: string): void {
  if (typeof window === 'undefined') return;
  window.location.replace(new URL(path, window.location.origin).href);
}

export function assignPortalRoute(path: string): void {
  if (typeof window === 'undefined') return;
  window.location.assign(new URL(path, window.location.origin).href);
}
