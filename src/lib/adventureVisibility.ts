import { readAdminSession } from '../config/adminAccess';
import type { AdventureModuleRecord } from '../types/adventureModule';

export const PREVIEW_ADVENTURE_PARAM = 'previewAdventureId';

export type AdventureVisibilityContext = {
  isAdmin?: boolean;
  previewAdventureId?: string | null;
  now?: Date;
};

export function readAdventureVisibilityContext(
  previewAdventureId?: string | null,
): AdventureVisibilityContext {
  return {
    isAdmin: readAdminSession(),
    previewAdventureId,
    now: new Date(),
  };
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
  return Boolean(ctx.isAdmin && ctx.previewAdventureId && ctx.previewAdventureId === adventure.id);
}

/** Whether families (non-preview) should see this adventure in the weekly flow. */
export function isFamilyVisibleAdventure(
  adventure: AdventureModuleRecord,
  ctx: AdventureVisibilityContext,
): boolean {
  if (isPreviewingAdventure(adventure, ctx)) return true;

  if (adventure.status === 'archived' || adventure.status === 'draft') {
    return false;
  }

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

/** Upcoming: draft or scheduled (not yet active featured). */
export function isAdminUpcomingAdventure(adventure: AdventureModuleRecord): boolean {
  return adventure.status === 'draft' || adventure.status === 'scheduled';
}

export function sortAdventures(modules: AdventureModuleRecord[]): AdventureModuleRecord[] {
  return [...modules].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.week_number - b.week_number;
  });
}

export function resolveFeaturedAdventure(
  modules: AdventureModuleRecord[],
  ctx: AdventureVisibilityContext,
  weekNumber = 1,
): AdventureModuleRecord | null {
  const sorted = sortAdventures(modules);

  if (ctx.previewAdventureId && ctx.isAdmin) {
    const preview = sorted.find((row) => row.id === ctx.previewAdventureId);
    if (preview) return preview;
  }

  const familyVisible = sorted.filter((row) => isFamilyVisibleAdventure(row, ctx));
  const activeForWeek = familyVisible.find(
    (row) => row.week_number === weekNumber && row.status === 'active',
  );
  if (activeForWeek) return activeForWeek;

  const anyActive = familyVisible.find((row) => row.status === 'active');
  if (anyActive) return anyActive;

  const scheduledUnlocked = familyVisible.find(
    (row) => row.status === 'scheduled' && row.week_number === weekNumber,
  );
  if (scheduledUnlocked) return scheduledUnlocked;

  return null;
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
