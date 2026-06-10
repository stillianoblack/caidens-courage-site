import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './lib/supabaseClient';
import { initAnalytics } from './lib/analytics';
import { installInternalLinkReloadFallback } from './lib/internalLinkReloadFallback';
import App from './App';
import reportWebVitals from './reportWebVitals';

function initAnalyticsAfterFirstPaint() {
  const run = () => initAnalytics();

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 2500 });
    return;
  }

  window.setTimeout(run, 1500);
}

installInternalLinkReloadFallback();
initAnalyticsAfterFirstPaint();

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
