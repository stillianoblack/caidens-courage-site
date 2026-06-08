export const LAST_GALLERY_VIEWED_KEY = 'lastGalleryViewedAt';
export const GALLERY_COUNTS_REFRESH_EVENT = 'cc-gallery-counts-refresh';

export function galleryViewedStorageKey(programCode?: string): string {
  const code = programCode?.trim();
  return code ? `${LAST_GALLERY_VIEWED_KEY}:${code}` : LAST_GALLERY_VIEWED_KEY;
}

export function readLastGalleryViewedAt(programCode?: string): string | null {
  try {
    return localStorage.getItem(galleryViewedStorageKey(programCode));
  } catch {
    return null;
  }
}

export function markGalleryViewed(programCode?: string): void {
  try {
    localStorage.setItem(galleryViewedStorageKey(programCode), new Date().toISOString());
  } catch {
    /* localStorage unavailable */
  }
  requestGalleryCountsRefresh();
}

export function requestGalleryCountsRefresh(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(GALLERY_COUNTS_REFRESH_EVENT));
}

export function formatGalleryNavLabel(label: string, count: number): string {
  return count > 0 ? `${label} (${count})` : label;
}
