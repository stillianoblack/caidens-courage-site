import { FAMILY_HUB_PATH, FAMILY_PORTAL_PATH } from '../config/courageRoutes';
import type { FamilyParentResourceCategoryId } from '../data/familyPortalContent';
import {
  DEFAULT_FAMILY_SETTINGS_TAB,
  type FamilySettingsTabId,
} from '../data/familySettingsContent';

export function resolveFamilyPortalBase(pathname?: string): string {
  if (pathname?.startsWith(FAMILY_PORTAL_PATH)) return FAMILY_PORTAL_PATH;
  return FAMILY_HUB_PATH;
}

export function familyPortalPath(segment: string, pathname?: string): string {
  const base = resolveFamilyPortalBase(pathname);
  const clean = segment.replace(/^\//, '');
  return clean ? `${base}/${clean}` : base;
}

export function familySettingsPath(pathname?: string): string {
  return familyPortalPath('settings', pathname);
}

export function resolveFamilySettingsTab(value: string | null): FamilySettingsTabId {
  const match = [
    'overview',
    'family-goals',
    'children',
    'parent-guardian',
    'family-access',
    'notifications',
    'plan',
    'privacy',
  ].find((tab) => tab === value);
  return (match as FamilySettingsTabId | undefined) ?? DEFAULT_FAMILY_SETTINGS_TAB;
}

export function familySettingsTabPath(tab: FamilySettingsTabId, pathname?: string): string {
  const base = familySettingsPath(pathname);
  if (tab === DEFAULT_FAMILY_SETTINGS_TAB) return base;
  return `${base}?tab=${encodeURIComponent(tab)}`;
}

export function familySettingsChildrenGradePath(pathname?: string): string {
  return `${familySettingsTabPath('children', pathname)}&focus=grade`;
}

export function familyGoalsPath(pathname?: string): string {
  return familySettingsTabPath('family-goals', pathname);
}

export function familyDownloadsTabPath(
  tab: FamilyParentResourceCategoryId,
  pathname?: string,
): string {
  const base = familyPortalPath('downloads', pathname);
  return `${base}?tab=${encodeURIComponent(tab)}`;
}
