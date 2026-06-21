import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { initAnalytics } from './lib/analytics';
import { logAppVersion } from './lib/appVersion';
import { installInternalLinkReloadFallback } from './lib/internalLinkReloadFallback';
import { installPortalClickDebug } from './lib/portalClickDebug';
import App from './App';
import reportWebVitals from './reportWebVitals';

const SW_RELOAD_FLAG = 'cc-sw-reload-pending';
const CHUNK_RELOAD_FLAG = 'cc-chunk-reload-pending';

function initAnalyticsAfterFirstPaint() {
  const run = () => initAnalytics();

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 2500 });
    return;
  }

  window.setTimeout(run, 1500);
}

installInternalLinkReloadFallback();
installPortalClickDebug();
initAnalyticsAfterFirstPaint();
logAppVersion();

function installKidShellBackForwardRecovery() {
  if (typeof window === 'undefined') return;

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    if (!window.location.pathname.startsWith('/play/session/')) return;
    window.location.reload();
  });
}

installKidShellBackForwardRecovery();

function installChunkLoadRecovery() {
  if (typeof window === 'undefined') return;

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = typeof reason?.message === 'string' ? reason.message : String(reason ?? '');
    const isChunkError =
      reason?.name === 'ChunkLoadError' || /Loading chunk [\d]+ failed/i.test(message);

    if (!isChunkError) return;

    try {
      if (sessionStorage.getItem(CHUNK_RELOAD_FLAG) === '1') return;
      sessionStorage.setItem(CHUNK_RELOAD_FLAG, '1');
    } catch {
      /* sessionStorage unavailable */
    }

    window.location.reload();
  });
}

function installServiceWorkerUpdateReload() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  let refreshing = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;

    try {
      if (sessionStorage.getItem(SW_RELOAD_FLAG) !== '1') return;
      sessionStorage.removeItem(SW_RELOAD_FLAG);
    } catch {
      /* sessionStorage unavailable */
    }

    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener('statechange', () => {
            if (worker.state !== 'installed') return;
            if (!navigator.serviceWorker.controller) return;

            try {
              sessionStorage.setItem(SW_RELOAD_FLAG, '1');
            } catch {
              /* sessionStorage unavailable */
            }

            worker.postMessage({ type: 'SKIP_WAITING' });
          });
        });
      })
      .catch(() => {
        /* SW optional — installability degrades gracefully */
      });
  });
}

installChunkLoadRecovery();

if (process.env.NODE_ENV === 'production') {
  installServiceWorkerUpdateReload();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
