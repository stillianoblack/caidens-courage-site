/**
 * Dependency-neutral family navigation metadata.
 *
 * Keep this module free of mission/content imports so routing, analytics, and
 * server-side audit tooling can resolve page titles without initializing the
 * character question banks.
 */
export type FamilySidebarNavId =
  | 'overview'
  | 'results'
  | 'continue-learning'
  | 'character-hub'
  | 'inventory'
  | 'downloads'
  | 'gallery'
  | 'certificates'
  | 'guide';

export const FAMILY_NAV_TITLE: Record<FamilySidebarNavId, string> = {
  overview: 'Headquarters',
  results: 'Results',
  'continue-learning': 'Play Adventures',
  'character-hub': 'Characters',
  inventory: 'Collections',
  downloads: 'Parent Resources',
  gallery: 'Gallery',
  certificates: 'Certificates',
  guide: 'Parents Corner',
};
