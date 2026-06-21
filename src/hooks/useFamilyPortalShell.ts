import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { readParentClaimContext } from '../config/parentClaimContext';
import { resolveTrackingProgramCode } from '../lib/activeProgramContext';
import { resolveParentClaimState } from '../lib/familyParentClaimState';
import { useFamilyDashboardMetrics } from './useFamilyDashboardMetrics';
import { useFamilyPortalNotifications } from './useFamilyPortalNotifications';

export function useFamilyPortalShell(programCode?: string) {
  const location = useLocation();
  const resolvedCode = programCode?.trim() || resolveTrackingProgramCode() || '';
  const metrics = useFamilyDashboardMetrics(resolvedCode);
  const parentClaim = readParentClaimContext();

  const claimStatus = useMemo(
    () =>
      resolveParentClaimState({
        claimRequired: metrics.claimRequired,
        familyLinks: metrics.familyLinks,
        visibleChildrenCount: metrics.visibleChildren.length,
        parentClaim,
        programCode: resolvedCode,
      }),
    [metrics.claimRequired, metrics.familyLinks, metrics.visibleChildren.length, parentClaim, resolvedCode],
  );

  const linkedCampLabel = useMemo(() => {
    const name = metrics.campProgramName ?? metrics.campProgramCode;
    return name ? `Linked to ${name}` : null;
  }, [metrics.campProgramCode, metrics.campProgramName]);

  const notifications = useFamilyPortalNotifications(metrics, location.pathname);

  return {
    ...metrics,
    claimStatus,
    linkedCampLabel,
    notifications,
  };
}
