import { FAMILY_HUB_PATH, FAMILY_PORTAL_PATH } from '../config/courageRoutes';

export function resolveFamilyPortalBase(pathname?: string): string {
  if (pathname?.startsWith(FAMILY_PORTAL_PATH)) return FAMILY_PORTAL_PATH;
  return FAMILY_HUB_PATH;
}

export function familyPortalPath(segment: string, pathname?: string): string {
  const base = resolveFamilyPortalBase(pathname);
  const clean = segment.replace(/^\//, '');
  return clean ? `${base}/${clean}` : base;
}

export function familyGoalsPath(pathname?: string): string {
  return `${resolveFamilyPortalBase(pathname)}?openGoals=1`;
}
