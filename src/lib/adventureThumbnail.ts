import type { AdventureModuleRecord } from '../types/adventureModule';
import { normalizeSelFocusLabel } from './adventureSelFocus';

const WEEK1_FALLBACK_THUMB = '/images/caidenscourage/Game-Hub/courage-in-the-dark.webp';

/** Comic / module thumbnail from Supabase CMS. Week 1 hardcoded fallback only when CMS field is empty. */
export function resolveAdventureComicThumbnailUrl(
  cmsModule: AdventureModuleRecord | null | undefined,
  weekNumber: number,
): string | null {
  const cmsThumb =
    cmsModule?.comic_thumbnail_url?.trim() ||
    cmsModule?.thumbnail_url?.trim() ||
    cmsModule?.thumbnail_image_url?.trim() ||
    null;

  if (cmsThumb) return cmsThumb;
  if (weekNumber === 1) return WEEK1_FALLBACK_THUMB;
  return null;
}

/** @deprecated Use resolveAdventureComicThumbnailUrl */
export function resolveAdventureThumbnailUrl(
  cmsModule: AdventureModuleRecord | null | undefined,
  weekNumber: number,
): string | null {
  return resolveAdventureComicThumbnailUrl(cmsModule, weekNumber);
}

export function resolveWeeklyCardSelFocus(
  cmsModule: AdventureModuleRecord | null | undefined,
  fallback?: string | null,
): string {
  const raw = cmsModule?.subtitle?.trim() || fallback?.trim() || '';
  return normalizeSelFocusLabel(raw);
}
