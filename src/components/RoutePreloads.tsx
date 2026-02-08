import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_HERO_PRELOAD_ID = 'route-hero-preload';

/**
 * Map of pathname -> desktop hero image URL (1600w) for LCP preloading.
 * Only routes with a dedicated hero under /public/images/heroes are included.
 */
const ROUTE_TO_HERO: Record<string, string> = {
  '/': '/images/heroes/hero-bg_desktop_1600w.webp',
  '/world': '/images/heroes/world_hero_desktop_1600w.webp',
  '/mission': '/images/heroes/mission_hero_desktop_1600w.webp',
  '/characters': '/images/heroes/characters_hero_desktop_1600w.webp',
  '/meet-the-characters': '/images/heroes/characters_hero_desktop_1600w.webp',
};

/**
 * Injects a single <link rel="preload" as="image"> for the current route's hero
 * into document head. Removes or updates it when the route changes.
 */
const RoutePreloads: React.FC = () => {
  const location = useLocation();
  const currentHrefRef = useRef<string | null>(null);

  useEffect(() => {
    const heroUrl = ROUTE_TO_HERO[location.pathname] ?? null;

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
      if (link && link.parentNode) {
        link.parentNode.removeChild(link);
        currentHrefRef.current = null;
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      const link = document.getElementById(ROUTE_HERO_PRELOAD_ID);
      if (link && link.parentNode) link.parentNode.removeChild(link);
      currentHrefRef.current = null;
    };
  }, []);

  return null;
};

export default RoutePreloads;
