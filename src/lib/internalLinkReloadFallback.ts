declare global {
  interface Window {
    __ccInternalLinkReloadFallbackInstalled?: boolean;
  }
}

function isPlainLeftClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function shouldLetBrowserHandleNormally(anchor: HTMLAnchorElement, url: URL) {
  if (anchor.target && anchor.target !== '_self') return true;
  if (anchor.hasAttribute('download')) return true;
  if (url.origin !== window.location.origin) return true;
  if (url.pathname === window.location.pathname && url.search === window.location.search) return true;
  return false;
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
      window.location.assign(url.href);
    },
    true,
  );

  window.__ccInternalLinkReloadFallbackInstalled = true;
}
