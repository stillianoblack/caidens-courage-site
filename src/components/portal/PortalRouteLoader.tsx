import React, { useEffect, useState } from 'react';
import { FOCUS_FLAME_ACADEMY_MARK_SRC } from '../../design-system/brand/brandLogos';
import './portal-route-loader.css';

type PortalRouteLoaderProps = {
  message?: string;
  /** Retained for backwards compatibility; every portal loader is now branded. */
  academy?: boolean;
  /** Cover the viewport only during the initial app-level portal bootstrap. */
  fullScreen?: boolean;
};

/**
 * Lightweight in-content loader for portal route transitions.
 * Renders inside the portal shell content frame (not a full-screen overlay).
 */
export default function PortalRouteLoader({
  message = 'Loading Focus Flame Academy...',
  fullScreen = false,
}: PortalRouteLoaderProps) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setTimedOut(true), 8000);
    return () => window.clearTimeout(timer);
  }, []);

  const recovery = timedOut ? (
    <div className="portal-routeLoaderRecovery" role="alert">
      <p>We&apos;re having trouble loading this portal. Try refreshing or switch program.</p>
      <div className="portal-routeLoaderActions">
        <button type="button" onClick={() => window.location.reload()}>
          Refresh
        </button>
        <a href="/portal">Switch program</a>
      </div>
    </div>
  ) : null;

  return (
    <div
      className={[
        'portal-routeLoader',
        'portal-routeLoader--academy',
        fullScreen ? 'portal-routeLoader--fullScreen' : 'portal-routeLoader--inline',
      ].join(' ')}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
    >
      <img
        className="focusFlameMark focusFlameMark--animate portal-routeLoaderMark"
        src={FOCUS_FLAME_ACADEMY_MARK_SRC}
        alt=""
        decoding="sync"
      />
      <p className="portal-routeLoaderMessage portal-routeLoaderMessage--academy">{message}</p>
      {recovery}
    </div>
  );
}
