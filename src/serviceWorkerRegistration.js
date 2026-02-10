/**
 * Service worker registration — DISABLED by default.
 * We do not register a service worker so users do not receive stale cached bundles.
 * This file is kept so any future registration would go through here and remain off unless explicitly enabled.
 */

/**
 * Register service worker. Calls unregister() instead so we never register; users always get fresh bundles.
 */
export function register() {
  unregister().catch(() => {});
}

/**
 * Unregister all service workers and clear caches so users get fresh bundles.
 */
export async function unregister() {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  }
  if (typeof window !== 'undefined' && 'caches' in window) {
    const names = await window.caches.keys();
    await Promise.all(names.map((name) => window.caches.delete(name)));
  }
}
