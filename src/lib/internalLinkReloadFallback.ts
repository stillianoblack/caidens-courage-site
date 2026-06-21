import { navigateWithPageTransition } from './pageTransition';

declare global {
  interface Window {
    __ccInternalLinkReloadFallbackInstalled?: boolean;
  }
}

function isPlainLeftClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function isKidPlayShellPath(pathname: string) {
  return pathname === '/play/session' || pathname.startsWith('/play/session/');
}

export function shouldForceInternalLinkReload(
  anchor: HTMLAnchorElement,
  url: URL,
  currentPathname = typeof window !== 'undefined' ? window.location.pathname : '/',
) {
  if (anchor.target && anchor.target !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;
  if (url.origin !== window.location.origin) return false;
  if (url.pathname === currentPathname && url.search === window.location.search) return false;
  return isKidPlayShellPath(currentPathname) || isKidPlayShellPath(url.pathname);
}

function shouldLetBrowserHandleNormally(anchor: HTMLAnchorElement, url: URL) {
  return !shouldForceInternalLinkReload(anchor, url);
}

/**
 * Production safety net: internal links should never leave users on stale content.
 * Direct route loads are reliable, so route-changing anchor clicks fall back to a full page load.
 */
export function installInternalLinkReloadFallback() {
  if (typeof window === 'undefined' || window.__ccInternalLinkReloadFallbackInstalled) return;

  document.addEventListener(
    'click',
    (event) => {
      if (!(event instanceof MouseEvent) || event.defaultPrevented || !isPlainLeftClick(event)) {
        return;
      }

      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      const url = new URL(href, window.location.href);
      if (shouldLetBrowserHandleNormally(anchor, url)) return;

      event.preventDefault();
      navigateWithPageTransition(url.href);
    },
    true,
  );

  window.__ccInternalLinkReloadFallbackInstalled = true;
}
