import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

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
