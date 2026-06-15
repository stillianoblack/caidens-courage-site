import { readAdminSession } from '../config/adminAccess';
import type { AdventureModuleRecord } from '../types/adventureModule';
import { getFeaturedAdventure } from './getFeaturedAdventure';

export const PREVIEW_ADVENTURE_PARAM = 'previewAdventureId';
export const ADMIN_PREVIEW_PARAM = 'adminPreview';
export const PREVIEW_MODE_LIVE = 'previewMode';

export type AdventurePreviewMode = 'admin' | 'live';

export type AdventureVisibilityContext = {
  isAdmin?: boolean;
  previewAdventureId?: string | null;
  previewMode?: AdventurePreviewMode | null;
  now?: Date;
};

const CMS_EARLY_UNLOCK_INTERVAL_DAYS = 4;

export function readAdventurePreviewMode(search: string): AdventurePreviewMode | null {
  const params = new URLSearchParams(search);
  const adventureId = params.get(PREVIEW_ADVENTURE_PARAM)?.trim();
  if (!adventureId || !readAdminSession()) return null;
  if (params.get(ADMIN_PREVIEW_PARAM) === 'true') return 'admin';
  if (params.get(PREVIEW_MODE_LIVE) === 'true') return 'live';
  return null;
}

export function readAdventureVisibilityContext(
  previewAdventureId?: string | null,
  search?: string,
): AdventureVisibilityContext {
  const previewMode = search ? readAdventurePreviewMode(search) : null;
  return {
    isAdmin: readAdminSession(),
    previewAdventureId,
    previewMode,
    now: new Date(),
  };
}

export function isAdminAdventurePreviewActive(search: string): boolean {
  return readAdventurePreviewMode(search) !== null;
}

export function isUnlockDatePassed(unlockDate: string | null, now = new Date()): boolean {
  if (!unlockDate) return true;
  const unlock = new Date(unlockDate);
  return !Number.isNaN(unlock.getTime()) && unlock <= now;
}

export function isPreviewingAdventure(
  adventure: AdventureModuleRecord,
  ctx: AdventureVisibilityContext,
): boolean {
  return Boolean(
    ctx.isAdmin &&
      ctx.previewMode === 'admin' &&
      ctx.previewAdventureId &&
      ctx.previewAdventureId === adventure.id,
  );
}

/** Whether families (non-preview) should see this adventure in the weekly flow. */
export function isFamilyVisibleAdventure(
  adventure: AdventureModuleRecord,
  ctx: AdventureVisibilityContext,
): boolean {
  if (isPreviewingAdventure(adventure, ctx)) return true;

  if (adventure.is_admin_preview && !ctx.isAdmin) {
    return false;
  }

  if (adventure.status === 'archived' || adventure.status === 'draft') {
    return adventure.is_live === true && isUnlockDatePassed(adventure.unlock_date, ctx.now);
  }

  if (adventure.is_live || adventure.status === 'active' || adventure.status === 'scheduled') {
    return isUnlockDatePassed(adventure.unlock_date, ctx.now);
  }

  return false;
}

/** Whether the adventure appears on the live family site right now. */
export function isVisibleOnLiveSite(
  adventure: AdventureModuleRecord,
  ctx: AdventureVisibilityContext,
): boolean {
  if (adventure.status === 'draft' || adventure.status === 'archived') return false;
  if (adventure.status === 'active') {
    return isUnlockDatePassed(adventure.unlock_date, ctx.now);
  }
  if (adventure.status === 'scheduled') {
    return isUnlockDatePassed(adventure.unlock_date, ctx.now);
  }
  return false;
}

/** Admin list includes draft, scheduled, active — not archived. */
export function isAdminListAdventure(adventure: AdventureModuleRecord): boolean {
  return adventure.status !== 'archived';
}

/** Upcoming in admin list: draft or scheduled (not yet published). */
export function isAdminUpcomingAdventure(adventure: AdventureModuleRecord): boolean {
  return adventure.status === 'draft' || adventure.status === 'scheduled';
}

/** Published/available to families when unlock rules pass. */
export function isPublishedAdventure(adventure: AdventureModuleRecord): boolean {
  return adventure.status === 'active' || adventure.status === 'scheduled';
}

export function formatAdminAdventureStatus(status: AdventureModuleRecord['status']): string {
  if (status === 'active') return 'Published';
  if (status === 'scheduled') return 'Scheduled';
  if (status === 'archived') return 'Archived';
  return 'Draft';
}

export function sortAdventures(modules: AdventureModuleRecord[]): AdventureModuleRecord[] {
  return [...modules].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.week_number - b.week_number;
  });
}

function findAdventureForWeek(
  modules: AdventureModuleRecord[],
  weekNumber: number,
): AdventureModuleRecord | null {
  return sortAdventures(modules).find((row) => row.week_number === weekNumber) ?? null;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** CMS unlock: active now, scheduled until unlock_date, early unlock on prior week completion or 4-day cadence. */
export function resolveCmsAdventureWeekStatus(
  adventure: AdventureModuleRecord,
  modules: AdventureModuleRecord[],
  ctx: AdventureVisibilityContext,
  completedWeekNumbers: number[] = [],
): 'available' | 'locked' {
  if (isPreviewingAdventure(adventure, ctx)) return 'available';

  if (adventure.status === 'draft' || adventure.status === 'archived') {
    return 'locked';
  }

  if (adventure.status === 'active') {
    if (adventure.week_number === 1) return 'available';
    return isUnlockDatePassed(adventure.unlock_date, ctx.now) ? 'available' : 'locked';
  }

  if (adventure.status === 'scheduled') {
    if (isUnlockDatePassed(adventure.unlock_date, ctx.now)) return 'available';
  }

  const prevWeek = adventure.week_number - 1;
  if (prevWeek >= 1 && completedWeekNumbers.includes(prevWeek)) {
    return 'available';
  }

  const previousAdventure = findAdventureForWeek(modules, prevWeek);
  if (previousAdventure?.unlock_date && ctx.now) {
    const cadenceUnlock = addDays(new Date(previousAdventure.unlock_date), CMS_EARLY_UNLOCK_INTERVAL_DAYS);
    if (cadenceUnlock <= ctx.now) return 'available';
  }

  if (adventure.status === 'scheduled' && adventure.unlock_date && ctx.now) {
    return isUnlockDatePassed(adventure.unlock_date, ctx.now) ? 'available' : 'locked';
  }

  return 'locked';
}

export function formatCmsAdventureUnlockStatus(
  adventure: AdventureModuleRecord,
  modules: AdventureModuleRecord[],
  ctx: AdventureVisibilityContext,
  completedWeekNumbers: number[] = [],
): string {
  const status = resolveCmsAdventureWeekStatus(adventure, modules, ctx, completedWeekNumbers);
  if (status === 'available') return 'Available now';

  if (adventure.unlock_date) {
    const unlock = new Date(adventure.unlock_date);
    if (!Number.isNaN(unlock.getTime())) {
      return `Unlocks ${unlock.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    }
  }

  return 'Locked';
}

export function resolveFeaturedAdventureModule(
  modules: AdventureModuleRecord[],
  ctx: AdventureVisibilityContext = {},
): AdventureModuleRecord | null {
  return getFeaturedAdventure(modules, ctx);
}

/** Hero/header week — featured when accessible, otherwise child's playable week. */
export function resolveHeroDisplayWeekNumber(input: {
  playableWeekNumber: number;
  featuredAdventure: AdventureModuleRecord | null;
  cmsModules: AdventureModuleRecord[];
  visibilityCtx: AdventureVisibilityContext;
  completedWeekNumbers: readonly number[];
}): number {
  if (
    input.visibilityCtx.previewAdventureId &&
    input.visibilityCtx.isAdmin &&
    input.visibilityCtx.previewMode === 'admin'
  ) {
    const preview = input.cmsModules.find(
      (row) => row.id === input.visibilityCtx.previewAdventureId,
    );
    if (preview) return preview.week_number;
  }

  const featured = input.featuredAdventure;
  if (featured && isPublishedAdventure(featured)) {
    return featured.week_number;
  }

  return input.playableWeekNumber;
}

export function resolveFeaturedAdventure(
  modules: AdventureModuleRecord[],
  ctx: AdventureVisibilityContext,
  weekNumber = 1,
): AdventureModuleRecord | null {
  const featured = resolveFeaturedAdventureModule(modules, ctx);
  if (featured) return featured;

  const sorted = sortAdventures(modules);
  const familyVisible = sorted.filter((row) => isFamilyVisibleAdventure(row, ctx));
  const forWeek = familyVisible.find((row) => row.week_number === weekNumber && isPublishedAdventure(row));
  if (forWeek) return forWeek;

  const anyPublished = familyVisible.find((row) => isPublishedAdventure(row));
  if (anyPublished) return anyPublished;

  return null;
}

function isAdventureLiveNow(
  adventure: AdventureModuleRecord,
  ctx: AdventureVisibilityContext,
): boolean {
  if (isPreviewingAdventure(adventure, ctx)) return true;
  if (!isUnlockDatePassed(adventure.unlock_date, ctx.now)) return false;
  return Boolean(adventure.is_live || adventure.status === 'active' || adventure.status === 'scheduled');
}

/** Current hero CMS module fallback when no featured flag is set. */
export function resolveCurrentFeaturedAdventure(
  modules: AdventureModuleRecord[],
  ctx: AdventureVisibilityContext,
  completedWeekNumbers: number[] = [],
): AdventureModuleRecord | null {
  const featured = resolveFeaturedAdventureModule(modules, ctx);
  if (featured) return featured;

  const sorted = sortAdventures(modules);

  if (ctx.previewAdventureId && ctx.isAdmin) {
    const preview = sorted.find((row) => row.id === ctx.previewAdventureId);
    if (preview) return preview;
  }

  const visible = sorted.filter(
    (row) => isFamilyVisibleAdventure(row, ctx) || isPreviewingAdventure(row, ctx),
  );

  const liveRows = visible.filter((row) => isAdventureLiveNow(row, ctx));
  if (liveRows.length > 0) {
    const incomplete = liveRows.filter((row) => !completedWeekNumbers.includes(row.week_number));
    const pool = incomplete.length > 0 ? incomplete : liveRows;
    return pool.sort((a, b) => b.week_number - a.week_number)[0];
  }

  const scheduledUnlocked = visible.filter(
    (row) => row.status === 'scheduled' && isUnlockDatePassed(row.unlock_date, ctx.now),
  );
  if (scheduledUnlocked.length > 0) {
    return scheduledUnlocked.sort((a, b) => b.week_number - a.week_number)[0];
  }

  return resolveFeaturedAdventure(modules, ctx, 1);
}

export function listFamilyAdventures(
  modules: AdventureModuleRecord[],
  ctx: AdventureVisibilityContext,
): AdventureModuleRecord[] {
  return sortAdventures(modules).filter((row) => isFamilyVisibleAdventure(row, ctx));
}

export function listAdminUpcomingAdventures(modules: AdventureModuleRecord[]): AdventureModuleRecord[] {
  return sortAdventures(modules).filter(isAdminUpcomingAdventure);
}

export function listCmsTrailAdventures(
  modules: AdventureModuleRecord[],
  ctx: AdventureVisibilityContext,
): AdventureModuleRecord[] {
  const sorted = sortAdventures(modules);
  return sorted.filter(
    (row) => isFamilyVisibleAdventure(row, ctx) || isPreviewingAdventure(row, ctx),
  );
}
