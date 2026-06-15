import type { AdventureModuleRecord } from '../types/adventureModule';
import {
  type AdventureVisibilityContext,
  isFamilyVisibleAdventure,
  isPreviewingAdventure,
  isPublishedAdventure,
  sortAdventures,
} from './adventureVisibility';

function compareFeaturedCandidates(a: AdventureModuleRecord, b: AdventureModuleRecord): number {
  if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
  return b.week_number - a.week_number;
}

function pickFeaturedCandidate(
  modules: AdventureModuleRecord[],
): AdventureModuleRecord | null {
  const sorted = sortAdventures(modules);
  const featuredRows = sorted.filter((row) => row.is_featured && isPublishedAdventure(row));
  if (featuredRows.length === 0) return null;

  // Published + featured always drives the hero (unlock rules gate missions, not the CMS hero).
  return [...featuredRows].sort(compareFeaturedCandidates)[0];
}

function pickFallbackPublishedAdventure(
  modules: AdventureModuleRecord[],
  ctx?: AdventureVisibilityContext,
): AdventureModuleRecord | null {
  const sorted = sortAdventures(modules);
  const published = sorted.filter((row) => {
    if (!isPublishedAdventure(row)) return false;
    if (!ctx) return true;
    return isFamilyVisibleAdventure(row, ctx) || isPreviewingAdventure(row, ctx);
  });
  return published[0] ?? null;
}

/**
 * Resolve the featured hero adventure from cached Supabase rows.
 * Never uses localStorage. Falls back to earliest published visible week — not hardcoded Week 1.
 */
export function getFeaturedAdventure(
  modules: AdventureModuleRecord[],
  ctx: AdventureVisibilityContext = {},
): AdventureModuleRecord | null {
  if (ctx.previewAdventureId && ctx.isAdmin && ctx.previewMode === 'admin') {
    return (
      sortAdventures(modules).find((row) => row.id === ctx.previewAdventureId) ?? null
    );
  }

  const featured = pickFeaturedCandidate(modules);
  if (featured) return featured;

  return pickFallbackPublishedAdventure(modules, ctx);
}

export function logFeaturedAdventureDiagnostics(
  modules: AdventureModuleRecord[],
  featured: AdventureModuleRecord | null,
  heroWeekNumber: number,
): void {
  if (process.env.NODE_ENV !== 'development') return;

  console.log('[FEATURED_ADVENTURE]', {
    selectedAdventureId: featured?.id ?? null,
    weekNumber: featured?.week_number ?? heroWeekNumber,
    heroWeekNumber,
    title: featured?.title ?? null,
    isFeatured: featured?.is_featured ?? false,
    status: featured?.status ?? null,
    mapBackgroundUrl: featured?.map_background_url ?? null,
    source: 'supabase',
    reason:
      featured == null
        ? 'no_published_featured_row_in_modules'
        : featured.week_number !== heroWeekNumber
          ? 'hero_week_mismatch'
          : 'ok',
  });

  console.log(
    '[ADVENTURE_LIST]',
    modules.map((adventure) => ({
      week: adventure.week_number,
      title: adventure.title,
      status: adventure.status,
      isFeatured: adventure.is_featured,
      liveSite: adventure.is_live,
    })),
  );
}
