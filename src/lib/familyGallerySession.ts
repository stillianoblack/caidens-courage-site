const FAMILY_GALLERY_SUBMITTER_KEY = 'cc-family-gallery-submitter';

export function getFamilyGallerySubmitterKey(): string {
  try {
    let key = localStorage.getItem(FAMILY_GALLERY_SUBMITTER_KEY);
    if (!key) {
      key =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `family-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(FAMILY_GALLERY_SUBMITTER_KEY, key);
    }
    return key;
  } catch {
    return `family-session-${Date.now()}`;
  }
}
