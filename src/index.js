import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './debug/navDebug';
import './debug/navWatch';
import './perf/routePerf';
import './perf/longTasks';
import { SAFE_MODE } from './lib/safeMode';
import { installPerfDetective } from './lib/perfDetective';
import './lib/historyGuard';

// Perf Detective: run before first paint to catch nav freezes (production + dev).
if (typeof window !== 'undefined') {
  installPerfDetective();
}

// Enable extra navigation debug logs in development only.
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // eslint-disable-next-line no-underscore-dangle
  window.__NAV_DEBUG__ = true;
}

if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.log('[SAFE_MODE]', SAFE_MODE ? 'ON' : 'OFF');
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
