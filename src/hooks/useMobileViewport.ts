import { useEffect, useState } from 'react';

const MOBILE_VIEWPORT_MQ = '(max-width: 767px)';

function resolveIsMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_VIEWPORT_MQ).matches;
}

/** Matches family portal mobile breakpoint (767px). */
export function useMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState(resolveIsMobileViewport);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_VIEWPORT_MQ);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isMobile;
}

export function isMobileViewport(): boolean {
  return resolveIsMobileViewport();
}
