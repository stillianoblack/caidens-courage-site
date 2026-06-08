import { useCallback } from 'react';
import type { PilotSidebarNavId } from '../data/pilotDashboardContent';
import { replaceWithPortalRoute } from '../lib/portalHardNavigation';
import { programDashboardTabPath } from '../lib/programDashboardNav';
import { resetPortalScroll } from '../lib/portalScroll';

export function useProgramDashboardNav() {
  return useCallback(
    (id: PilotSidebarNavId) => {
      resetPortalScroll();
      replaceWithPortalRoute(programDashboardTabPath(id));
    },
    [],
  );
}
