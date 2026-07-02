import { useCallback, useEffect, useState } from 'react';

const MOBILE_NAV_MQ = '(max-width: 767px)';

function resolveIsMobileNav(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.(MOBILE_NAV_MQ)?.matches ?? false;
}

/** Family portal: hide left rail in document flow; open nav via drawer overlay. */
export function useFamilyMobileNav() {
  const [isMobileNav, setIsMobileNav] = useState(resolveIsMobileNav);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.(MOBILE_NAV_MQ);
    if (!mq) return;
    const update = () => {
      setIsMobileNav(mq.matches);
      if (!mq.matches) setMobileNavOpen(false);
    };
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  return { isMobileNav, mobileNavOpen, openMobileNav, closeMobileNav };
}
