import { isPortalDebugEnabled } from './portalDebug';

export function isClickTestEnabled(): boolean {
  return isPortalDebugEnabled();
}

export function logClickTest(label: string, detail?: Record<string, unknown>): void {
  if (!isClickTestEnabled()) return;
  console.info('[CLICK_TEST]', label, detail ?? {});
}

export function logNavTest(from: string, to: string, detail?: Record<string, unknown>): void {
  if (!isClickTestEnabled()) return;
  console.info('[NAV_TEST]', `${from} -> ${to}`, detail ?? {});
}

export function logOverlayActive(overlayName: string, active: boolean): void {
  if (!isClickTestEnabled()) return;
  console.info('[OVERLAY_ACTIVE]', { overlayName, active });
}

export function installPortalClickDebug(): void {
  if (!isClickTestEnabled() || typeof document === 'undefined') return;
  if (window.__ccPortalClickDebugInstalled) return;

  document.addEventListener(
    'click',
    (event) => {
      if (!(event instanceof MouseEvent) || event.defaultPrevented) return;

      const target = event.target instanceof Element ? event.target : null;
      const interactive = target?.closest(
        'button, a[href], [role="tab"], input, select, textarea, [role="button"]',
      );

      if (!interactive) return;

      logClickTest('element clicked', {
        tag: interactive.tagName.toLowerCase(),
        id: interactive.id || null,
        className: interactive.className || null,
        text: interactive.textContent?.trim().slice(0, 80) || null,
        href: interactive instanceof HTMLAnchorElement ? interactive.getAttribute('href') : null,
      });
    },
    true,
  );

  window.__ccPortalClickDebugInstalled = true;
}

declare global {
  interface Window {
    __ccPortalClickDebugInstalled?: boolean;
  }
}
