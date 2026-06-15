import { useCallback, useEffect, useState } from 'react';

const MOBILE_NAV_MQ = '(max-width: 767px)';

function resolveIsMobileNav(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_NAV_MQ).matches;
}

/** Facilitator portal: bottom nav on mobile; hide sidebar from document flow. */
export function useFacilitatorMobileNav() {
  const [isMobileNav, setIsMobileNav] = useState(resolveIsMobileNav);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_NAV_MQ);
    const update = () => {
      setIsMobileNav(mq.matches);
      if (!mq.matches) setMoreOpen(false);
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const openMore = useCallback(() => setMoreOpen(true), []);
  const closeMore = useCallback(() => setMoreOpen(false), []);

  return { isMobileNav, moreOpen, openMore, closeMore };
}
