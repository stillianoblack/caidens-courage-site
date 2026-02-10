import React from 'react';
import "./styles/motion-safe.css";
import "./styles/minimal-css-overrides.css";
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { SAFE_MODE } from './lib/safeMode';

// Minimal sync setup only; heavy and non-critical work runs after idle (see below).
// Enable extra navigation debug logs in development only.
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // eslint-disable-next-line no-underscore-dangle
  window.__NAV_DEBUG__ = true;
}

if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-underscore-dangle
  window.__SAFE_MODE__ = SAFE_MODE;
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[SAFE_MODE]', SAFE_MODE ? 'DEV' : 'OFF');
  }
}

const minimalCssMode = process.env.REACT_APP_MINIMAL_CSS_MODE === 'true';
const disableHeaderAnimations = process.env.REACT_APP_DISABLE_HEADER_ANIMATIONS === 'true';
if (typeof document !== 'undefined' && document.body) {
  if (minimalCssMode) document.body.classList.add('minimal-css');
  if (disableHeaderAnimations) document.body.classList.add('no-header-animations');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (typeof window !== 'undefined') {
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.get('debug') === '1') {
      // Patch setInterval/setTimeout/requestAnimationFrame to count active handles (dev-only).
      import('./debug/timerDebug').then((m) => m.installTimerDebug()).catch(() => {});
      const badge = document.createElement('div');
      badge.setAttribute('aria-hidden', 'true');
      badge.style.cssText =
        'position:fixed;bottom:8px;right:8px;z-index:9999;font:11px monospace;background:rgba(0,0,0,0.75);color:#fff;padding:4px 8px;border-radius:4px;pointer-events:none;';
      badge.textContent = `minimalCss=${minimalCssMode}`;
      document.body.appendChild(badge);
    }
  } catch (e) {}
}

// Defer all non-critical work so initial render and first paint are not blocked.
const scheduleWhenIdle = (fn) => {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(fn, { timeout: 3000 });
  } else {
    setTimeout(fn, 2000);
  }
};

scheduleWhenIdle(() => {
  reportWebVitals();
});

scheduleWhenIdle(() => {
  if (typeof document !== 'undefined' && document.body) {
    const setTabActive = () => {
      document.body.dataset.tabActive = document.hidden ? 'false' : 'true';
    };
    setTabActive();
    document.addEventListener('visibilitychange', setTabActive);
  }

  if (process.env.NODE_ENV !== 'production') {
    try {
      const m1 = require('./utils/clickBlockerFix');
      m1?.installClickBlockerFix?.();
    } catch (e) {}
    try {
      const m2 = require('./perf/perfDetective');
      m2?.installPerfDetective?.({ safe: true });
    } catch (e) {}
    try {
      const m3 = require('./debug/navDebug');
      m3?.enableNavDebug?.();
    } catch (e) {}
  }
});
