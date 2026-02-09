import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './debug/navDebug';
import './debug/navWatch';
import './perf/routePerf';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* BrowserRouter at root: all navigation is client-side; no document requests on link click */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// SERVICE WORKER SAFETY:
// Ensure no stale service worker can hijack navigation or cache old bundles.
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      registrations.forEach((reg) => reg.unregister());
    })
    .catch(() => {
      // Swallow errors – diagnostics only.
    });
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
