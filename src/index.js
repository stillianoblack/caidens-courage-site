import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { initAnalytics } from './lib/analytics';
import { APP_VERSION, logAppVersion } from './lib/appVersion';
import { installInternalLinkReloadFallback } from './lib/internalLinkReloadFallback';
import { installPortalClickDebug } from './lib/portalClickDebug';
import App from './App';
import reportWebVitals from './reportWebVitals';

const SW_RELOAD_FLAG = 'cc-sw-reload-pending';
const CHUNK_RELOAD_FLAG = 'cc-chunk-reload-pending';

function isRecoverableChunkLoadError(reason) {
  const message = typeof reason?.message === 'string' ? reason.message : String(reason ?? '');
  return (
    reason?.name === 'ChunkLoadError' ||
    /Loading chunk [\d]+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /error loading dynamically imported module/i.test(message)
  );
}

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

async function clearLocalDevelopmentApplicationCache() {
  if (process.env.NODE_ENV !== 'development') return;
  if (!['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)) return;

  const registrations = 'serviceWorker' in navigator
    ? await navigator.serviceWorker.getRegistrations().catch(() => [])
    : [];
  const registrationResults = await Promise.all(
    registrations.map((registration) => registration.unregister().catch(() => false)),
  );
  const cacheNames = 'caches' in window ? await window.caches.keys().catch(() => []) : [];
  const cacheResults = await Promise.all(
    cacheNames.map((cacheName) => window.caches.delete(cacheName).catch(() => false)),
  );

  console.info('[LOCAL_DEV_CACHE_RESET]', JSON.stringify({
    serviceWorkersUnregistered: registrationResults.filter(Boolean).length,
    applicationCachesDeleted: cacheResults.filter(Boolean).length,
  }));
}

void clearLocalDevelopmentApplicationCache();

function installLocalDevelopmentChunkCacheBuster() {
  if (process.env.NODE_ENV !== 'development') return;
  if (!['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)) return;

  const originalAppendChild = document.head.appendChild.bind(document.head);
  document.head.appendChild = (node) => {
    if (node instanceof HTMLScriptElement && node.src.includes('.chunk.js')) {
      const chunkUrl = new URL(node.src, window.location.href);
      chunkUrl.searchParams.set('local-contract', APP_VERSION.signupContract);
      node.src = chunkUrl.toString();
    }
    return originalAppendChild(node);
  };
}

installLocalDevelopmentChunkCacheBuster();

function installChunkLoadRecovery() {
  if (typeof window === 'undefined') return;

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (!isRecoverableChunkLoadError(reason)) return;

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
    const workerVersion = encodeURIComponent(`${APP_VERSION.buildTime}:${APP_VERSION.commit}`);
    navigator.serviceWorker
      .register(`/sw.js?v=${workerVersion}`, { updateViaCache: 'none' })
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
