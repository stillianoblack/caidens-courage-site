import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { afterPaint } from '../lib/defer';

const ROUTE_HERO_PRELOAD_ID = 'route-hero-preload';

/**
 * Preload only heroes that render immediately above the fold for that route.
 * Homepage LCP is preloaded in index.html (initial document) for early discovery; only other routes here.
 */
const ABOVE_THE_FOLD_HERO: Record<string, string> = {
  '/comicbook': '/images/Comic5_Coverpage_header_smaller.webp',
};

/**
 * Injects or updates a single <link rel="preload" as="image"> in <head>
 * for routes whose hero is above the fold. Removes preload on other routes.
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
