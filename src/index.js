import React from 'react';
import "./styles/motion-safe.css";
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* BrowserRouter at root: all navigation is client-side; no document requests on link click */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

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

  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      })
      .catch(() => {});
  }
  if (typeof window !== 'undefined' && 'caches' in window) {
    window.caches.keys().then((keys) => Promise.all(keys.map((k) => window.caches.delete(k)))).catch(() => {});
  }

  import('./debug/navWatch').catch(() => {});
  import('./perf/routePerf').catch(() => {});
  import('./perf/longTasks').catch(() => {});

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
