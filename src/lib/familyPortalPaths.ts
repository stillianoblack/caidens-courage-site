import { FAMILY_HUB_PATH, FAMILY_PORTAL_PATH } from '../config/courageRoutes';
import type { FamilyParentResourceCategoryId } from '../data/familyPortalContent';
import {
  DEFAULT_FAMILY_SETTINGS_TAB,
  type FamilySettingsTabId,
} from '../data/familySettingsContent';
import { isKidPlayShellPath, parseKidPlayShellPath } from './kidPlayShellRoutes';

export function resolveFamilyPortalBase(pathname?: string): string {
  if (pathname && isKidPlayShellPath(pathname)) {
    const ctx = parseKidPlayShellPath(pathname);
    if (ctx) return `/play/session/${ctx.sessionId}`;
  }
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

const FAMILY_SETTINGS_TAB_IDS: FamilySettingsTabId[] = [
  'overview',
  'family-goals',
  'children',
  'parent-guardian',
  'family-access',
  'notifications',
  'plan',
  'privacy',
];

export function resolveFamilySettingsTab(
  tab: string | null,
  section?: string | null,
): FamilySettingsTabId {
  const value = tab ?? section;
  const match = FAMILY_SETTINGS_TAB_IDS.find((id) => id === value);
  return match ?? DEFAULT_FAMILY_SETTINGS_TAB;
}

export function familyStudentAccessAnchorId(participantId: string): string {
  return `family-student-access-${participantId.trim()}`;
}

/** Settings → Children with Student Access focus (Updates "Manage PINs" CTA). */
export function familySettingsChildrenStudentAccessPath(pathname?: string): string {
  const base = familySettingsPath(pathname);
  return `${base}?section=children&focus=student-access`;
}

export function familySettingsTabPath(tab: FamilySettingsTabId, pathname?: string): string {
  const base = familySettingsPath(pathname);
  if (tab === DEFAULT_FAMILY_SETTINGS_TAB) return base;
  return `${base}?tab=${encodeURIComponent(tab)}`;
}

export function familySettingsChildrenGradePath(pathname?: string): string {
  return `${familySettingsTabPath('children', pathname)}&focus=grade`;
}

export function familySettingsAddChildPath(pathname?: string): string {
  return `${familySettingsTabPath('children', pathname)}&focus=add-child`;
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
