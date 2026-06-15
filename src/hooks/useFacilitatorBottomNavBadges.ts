import { useMemo } from 'react';
import { useFacilitatorGalleryPendingCount } from './useGalleryNavCounts';
import { usePilotRosterData } from './usePilotRosterData';
import { resolveFacilitatorRosterProgramCode } from '../lib/resolveFacilitatorRosterProgramCode';
import type { FacilitatorBottomNavId } from '../lib/facilitatorMobileNav';

export type FacilitatorBottomNavBadges = Partial<Record<FacilitatorBottomNavId, number>>;

/** Lightweight badge counts for facilitator mobile bottom nav. */
export function useFacilitatorBottomNavBadges(programCode?: string): FacilitatorBottomNavBadges {
  const resolvedCode = resolveFacilitatorRosterProgramCode(programCode);
  const { rows } = usePilotRosterData(resolvedCode, Boolean(resolvedCode));
  const galleryPending = useFacilitatorGalleryPendingCount(resolvedCode);

  return useMemo(() => {
    const missingBaseline = rows.filter((row) => row.baselineStatus === 'Not Started').length;
    const incompleteModules = rows.filter(
      (row) => row.baselineStatus !== 'Not Started' && row.moduleCompletions === 0,
    ).length;
    const certificateReady = rows.filter((row) => row.status === 'certificate-ready').length;

    const badges: FacilitatorBottomNavBadges = {};

    if (missingBaseline > 0) {
      badges.roster = missingBaseline;
    }

    const resultsCount = missingBaseline + incompleteModules + certificateReady;
    if (resultsCount > 0) {
      badges.results = resultsCount;
    }

    if (galleryPending > 0) {
      badges.more = galleryPending;
    }

    return badges;
  }, [galleryPending, rows]);
}
