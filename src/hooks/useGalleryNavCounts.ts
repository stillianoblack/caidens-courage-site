import { useCallback, useEffect, useState } from 'react';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { afterIdle } from '../lib/defer';
import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from '../lib/fetchWithTimeout';
import {
  GALLERY_COUNTS_REFRESH_EVENT,
  readLastGalleryViewedAt,
} from '../lib/galleryNavCounts';
import {
  fetchFacilitatorPendingGalleryCount,
  fetchFamilyNewApprovedGalleryCount,
} from '../lib/studentGalleryService';

function useGalleryCountRefresh(refresh: () => void): void {
  useEffect(() => {
    const handleRefresh = () => refresh();
    window.addEventListener(GALLERY_COUNTS_REFRESH_EVENT, handleRefresh);
    return () => window.removeEventListener(GALLERY_COUNTS_REFRESH_EVENT, handleRefresh);
  }, [refresh]);
}

async function fetchGalleryCountWithTimeout<T>(
  label: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  try {
    return await withTimeout(fetcher(), DASHBOARD_FETCH_TIMEOUT_MS, label);
  } catch {
    return 0 as T;
  }
}

export function useFacilitatorGalleryPendingCount(programCode?: string): number {
  const [count, setCount] = useState(0);
  const resolvedCode = programCode ?? readActivePilotProgram()?.programCode;

  const refresh = useCallback(() => {
    void fetchGalleryCountWithTimeout('gallery_pending_count', () =>
      fetchFacilitatorPendingGalleryCount(resolvedCode),
    ).then(setCount);
  }, [resolvedCode]);

  useEffect(() => {
    afterIdle(refresh);
  }, [refresh]);

  useGalleryCountRefresh(refresh);

  return count;
}

export function useFamilyGalleryNewApprovedCount(programCode?: string): number {
  const [count, setCount] = useState(0);
  const resolvedCode = programCode ?? readActivePilotProgram()?.programCode;

  const refresh = useCallback(() => {
    const lastViewedAt = readLastGalleryViewedAt(resolvedCode);
    void fetchGalleryCountWithTimeout('gallery_approved_count', () =>
      fetchFamilyNewApprovedGalleryCount(resolvedCode, lastViewedAt),
    ).then(setCount);
  }, [resolvedCode]);

  useEffect(() => {
    afterIdle(refresh);
  }, [refresh]);

  useGalleryCountRefresh(refresh);

  return count;
}
