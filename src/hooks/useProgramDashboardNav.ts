import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PilotSidebarNavId } from '../data/pilotDashboardContent';
import { programDashboardTabPath } from '../lib/programDashboardNav';
import { resetPortalScroll } from '../lib/portalScroll';

export function useProgramDashboardNav() {
  const navigate = useNavigate();

  return useCallback(
    (id: PilotSidebarNavId) => {
      resetPortalScroll();
      navigate(programDashboardTabPath(id), { replace: true });
    },
    [navigate],
  );
}
