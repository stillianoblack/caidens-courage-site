declare global {
  interface Window {
    __ccHistoryNavigationEventsInstalled?: boolean;
  }
}

function dispatchHistoryNavigationEvent() {
  window.setTimeout(() => {
    try {
      window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
    } catch {
      window.dispatchEvent(new Event('popstate'));
    }
    window.dispatchEvent(new Event('cc:locationchange'));
  }, 0);
}

/** Keeps BrowserRouter in sync when code changes the address bar through history APIs. */
export function installHistoryNavigationEvents() {
  if (typeof window === 'undefined' || window.__ccHistoryNavigationEventsInstalled) return;

  const patchHistoryMethod = (method: 'pushState' | 'replaceState') => {
    const original = window.history[method];
    window.history[method] = function patchedHistoryMethod(...args) {
      const result = original.apply(this, args);
      dispatchHistoryNavigationEvent();
      return result;
    };
  };

  patchHistoryMethod('pushState');
  patchHistoryMethod('replaceState');
  window.__ccHistoryNavigationEventsInstalled = true;
}
