import { resolveFamilyBasePath, isCharacterGameRoute } from './familyPortalNav';

const KID_FACING_SEGMENTS = new Set([
  'continue-learning',
  'weekly-adventures',
  'characters',
  'inventory',
  'baseline-check',
]);

/** Routes that receive the Kids Adventure visual system (not parent/admin pages). */
export function isKidFacingPortalRoute(pathname: string, basePath?: string): boolean {
  if (isCharacterGameRoute(pathname)) {
    return true;
  }

  const base = basePath ?? resolveFamilyBasePath(pathname);
  if (!pathname.startsWith(base)) {
    return false;
  }

  const remainder = pathname.slice(base.length).replace(/^\//, '');
  if (!remainder) {
    return false;
  }

  const segment = remainder.split('/')[0];
  return KID_FACING_SEGMENTS.has(segment);
}
