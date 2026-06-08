import React from 'react';
import './portal-route-loader.css';

type PortalRouteLoaderProps = {
  message?: string;
};

/**
 * Lightweight in-content loader for portal route transitions.
 * Renders inside the portal shell content frame (not a full-screen overlay).
 */
export default function PortalRouteLoader({
  message = 'Loading Focus Flame Academy...',
}: PortalRouteLoaderProps) {
  return (
    <div className="portal-routeLoader" aria-live="polite" aria-busy="true" aria-label={message}>
      <p className="portal-routeLoaderMessage">{message}</p>
      <div className="portal-routeLoaderSkeleton">
        <div className="portal-routeLoaderLine portal-routeLoaderLine--title" />
        <div className="portal-routeLoaderLine" />
        <div className="portal-routeLoaderLine portal-routeLoaderLine--short" />
        <div className="portal-routeLoaderBlock" />
      </div>
    </div>
  );
}
