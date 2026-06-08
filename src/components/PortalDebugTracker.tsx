import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logPortalRouteContext } from '../lib/portalDebug';

/** Dev-only pathname + activePortalRole logging on route changes. */
export default function PortalDebugTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    logPortalRouteContext(pathname);
  }, [pathname]);

  return null;
}
