import React from 'react';
import { FOCUS_FLAME_ACADEMY_MARK_SRC } from '../../design-system/brand/brandLogos';
import './portal-route-loader.css';

type PortalRouteLoaderProps = {
  message?: string;
  /** Show Focus Flame Academy mark (weekly adventures launch, kid game routes). */
  academy?: boolean;
};

/**
 * Lightweight in-content loader for portal route transitions.
 * Renders inside the portal shell content frame (not a full-screen overlay).
 */
export default function PortalRouteLoader({
  message = 'Loading Focus Flame Academy...',
  academy = false,
}: PortalRouteLoaderProps) {
  if (academy) {
    return (
      <div
        className="portal-routeLoader portal-routeLoader--academy"
        aria-live="polite"
        aria-busy="true"
        aria-label={message}
      >
        <img
          className="focusFlameMark focusFlameMark--animate portal-routeLoaderMark"
          src={FOCUS_FLAME_ACADEMY_MARK_SRC}
          alt=""
          decoding="async"
        />
        <p className="portal-routeLoaderMessage portal-routeLoaderMessage--academy">{message}</p>
      </div>
    );
  }

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
