import { useEffect, useState } from 'react';

const MOBILE_HUB_MQ = '(max-width: 767px)';

export function useMobileHubLayout(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_HUB_MQ).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_HUB_MQ);
    const handleChange = () => setIsMobile(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}
