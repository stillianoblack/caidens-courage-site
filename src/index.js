import React from 'react';
import "./styles/motion-safe.css";
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// [prod-guard] import './debug/navDebug';
import './debug/navWatch';
import './perf/routePerf';
import './perf/longTasks';
import { SAFE_MODE } from './lib/safeMode';
// [prod-guard] import { installPerfDetective } from './lib/perfDetective';
// [disabled-prod] import './lib/historyGuard';
// [prod-guard] import { installClickBlockerFix } from './utils/clickBlockerFix';

// Perf Detective: run before first paint to catch nav freezes (production + dev).
if (typeof window !== 'undefined') {
  if (process.env.NODE_ENV !== "production") { try { const m2 = require("./perf/perfDetective"); m2 && m2.installPerfDetective && m2.installPerfDetective(); } catch (e) {} }
}

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

// SERVICE WORKER + CACHE SAFETY:
// Ensure no stale service worker or corrupted caches cause hangs.
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

// Defer non-critical work so navigation and first paint are not blocked.
// Run web vitals (and any analytics) after the browser is idle.
const scheduleWhenIdle = (fn) => {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(fn, { timeout: 3000 });
  } else {
    setTimeout(fn, 0);
  }
};
scheduleWhenIdle(() => {
  reportWebVitals();
});

/* [prod-guard] DEV ONLY: load debug tooling only in development */
if (process.env.NODE_ENV !== "production") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m1 = require("./utils/clickBlockerFix");
    m1?.installClickBlockerFix?.();
  } catch (e) {}
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m2 = require("./perf/perfDetective");
    m2?.installPerfDetective?.({ safe: true });
  } catch (e) {}
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m3 = require("./debug/navDebug");
    m3?.enableNavDebug?.();
  } catch (e) {}
}
