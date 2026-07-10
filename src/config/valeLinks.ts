/** Absolute URLs for the Caiden Vale site (caidenvale.com). Use on Courage pages only. */
export const CAIDEN_VALE_SITE_ORIGIN = 'https://caidenvale.com';

export function valeSiteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${CAIDEN_VALE_SITE_ORIGIN}${normalized}`;
}

export const VALE_CLASSIC_HOME_URL = valeSiteUrl('/classic-home');
export const VALE_COMICBOOK_URL = valeSiteUrl('/story/books');
export const VALE_MISSION_URL = valeSiteUrl('/mission');
export const VALE_WORLD_URL = valeSiteUrl('/world');
export const VALE_CHARACTERS_URL = valeSiteUrl('/characters');
export const VALE_JOURNEY_URL = valeSiteUrl('/journey');
