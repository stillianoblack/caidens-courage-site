import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { afterPaint } from '../lib/defer';

const ROUTE_HERO_PRELOAD_ID = 'route-hero-preload';

/**
 * Preload only the hero that renders immediately above the fold (homepage on first load).
 * Other routes do not get preload; their hero images load normally when the page renders.
 */
const ABOVE_THE_FOLD_HERO: Record<string, string> = {
  '/': '/images/heroes/hero-bg_desktop_1600w.webp',
};

/**
 * Injects or updates a single <link rel="preload" as="image"> in <head>
 * only for the homepage hero (above the fold on initial load). Removes preload on other routes.
 */
const RouteHeroPreload: React.FC = () => {
  const location = useLocation();
  const currentHrefRef = useRef<string | null>(null);

  // Defer preload DOM updates to after paint so they never run during nav click or before first paint.
  useEffect(() => {
    const pathname = location.pathname;
    afterPaint(() => {
      const heroUrl = ABOVE_THE_FOLD_HERO[pathname] ?? null;
      let link = document.getElementById(ROUTE_HERO_PRELOAD_ID) as HTMLLinkElement | null;

      if (heroUrl) {
        if (link) {
          if (currentHrefRef.current !== heroUrl) {
            link.href = heroUrl;
            currentHrefRef.current = heroUrl;
          }
        } else {
          link = document.createElement('link');
          link.id = ROUTE_HERO_PRELOAD_ID;
          link.rel = 'preload';
          link.as = 'image';
          link.href = heroUrl;
          link.type = 'image/webp';
          link.setAttribute('fetchpriority', 'high');
          document.head.appendChild(link);
          currentHrefRef.current = heroUrl;
        }
      } else {
        if (link?.parentNode) {
          link.parentNode.removeChild(link);
          currentHrefRef.current = null;
        }
      }
    });
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      const link = document.getElementById(ROUTE_HERO_PRELOAD_ID);
      if (link?.parentNode) link.parentNode.removeChild(link);
      currentHrefRef.current = null;
    };
  }, []);

  return null;
};

export default RouteHeroPreload;
