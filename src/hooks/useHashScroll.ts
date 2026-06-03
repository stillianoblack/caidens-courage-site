import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Smooth-scroll to hash anchor after route navigation. */
export default function useHashScroll(offset = 80) {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const sectionId = location.hash.replace('#', '');
    const timeoutId = window.setTimeout(() => {
      const target = document.getElementById(sectionId);
      if (!target) return;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }, 150);
    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, location.hash, offset]);
}
