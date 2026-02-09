import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { afterPaint } from '../lib/defer';

const ROUTE_HERO_PRELOAD_ID = 'route-hero-preload';

/**
 * Route -> desktop hero WebP URL (1600w) for <picture> LCP preloading.
 * One hero per route; desktop only (no mobile preload here).
 * Filenames match <picture><source> usage on each page.
 */
const ROUTE_TO_HERO: Record<string, string> = {
  '/': '/images/heroes/hero-bg_desktop_1600w.webp',
  '/mission': '/images/heroes/mission_hero_desktop_1600w.webp',
  '/world': '/images/heroes/world_hero_desktop_1600w.webp',
  '/characters': '/images/heroes/characters_hero_desktop_1600w.webp',
  '/meet-the-characters': '/images/heroes/characters_hero_desktop_1600w.webp',
};

/**
 * Injects or updates a single <link rel="preload" as="image"> in <head>
 * for the current route's desktop hero. Removes it when route has no hero.
 */
const RouteHeroPreload: React.FC = () => {
  const location = useLocation();
  const currentHrefRef = useRef<string | null>(null);

  // Defer preload DOM updates to after paint so they never run during nav click or before first paint.
  useEffect(() => {
    const pathname = location.pathname;
    afterPaint(() => {
      const heroUrl = ROUTE_TO_HERO[pathname] ?? null;
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
