import { useCallback, useEffect, useState } from 'react';
import { readActivePilotProgram } from '../config/activePilotProgram';
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

export function useFacilitatorGalleryPendingCount(programCode?: string): number {
  const [count, setCount] = useState(0);
  const resolvedCode = programCode ?? readActivePilotProgram()?.programCode;

  const refresh = useCallback(() => {
    void fetchFacilitatorPendingGalleryCount(resolvedCode).then(setCount);
  }, [resolvedCode]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useGalleryCountRefresh(refresh);

  return count;
}

export function useFamilyGalleryNewApprovedCount(programCode?: string): number {
  const [count, setCount] = useState(0);
  const resolvedCode = programCode ?? readActivePilotProgram()?.programCode;

  const refresh = useCallback(() => {
    const lastViewedAt = readLastGalleryViewedAt(resolvedCode);
    void fetchFamilyNewApprovedGalleryCount(resolvedCode, lastViewedAt).then(setCount);
  }, [resolvedCode]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useGalleryCountRefresh(refresh);

  return count;
}
