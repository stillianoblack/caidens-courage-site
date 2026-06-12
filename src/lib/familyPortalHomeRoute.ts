import { FAMILY_HUB_PATH, FAMILY_PORTAL_PATH } from '../config/courageRoutes';

function isExactFamilyPath(pathname: string, basePath: string): boolean {
  return pathname === basePath || pathname === `${basePath}/`;
}

export function isFamilyHubHomePath(pathname: string): boolean {
  return isExactFamilyPath(pathname, FAMILY_HUB_PATH);
}

export function isFamilyPortalHomePath(pathname: string): boolean {
  return isExactFamilyPath(pathname, FAMILY_PORTAL_PATH);
}
