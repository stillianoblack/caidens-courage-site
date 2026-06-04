import { VALE_CLASSIC_HOME_URL } from './valeLinks';

export type CourageNavLink = {
  label: string;
  href: string;
};

export const COURAGE_HOME_PATH = '/';

/** SEL, classroom, and program content — owned by Caiden's Courage nav. */
export const SCHOOLS_DROPDOWN: CourageNavLink[] = [
  { label: 'Focus Flame Academy', href: '/focus-flame-academy' },
  { label: 'Pilot Partnerships', href: '/focus-flame-academy#pilot-program' },
  { label: 'Training & Guides', href: '/training-guides' },
  { label: 'Educator Resources', href: '/focus-flame-academy#teacher-resources' },
];

export const RESOURCES_DROPDOWN: CourageNavLink[] = [
  { label: 'B-4 Reset Tools', href: '/b4-tools' },
  { label: 'Brave Mind Club Activities', href: '/braveminds' },
  { label: 'Coloring Pages', href: '/braveminds?type=coloring' },
  { label: 'FAQs', href: '/braveminds#faq' },
  { label: 'For Kids', href: '/braveminds#kids' },
  { label: 'For Parents', href: '/braveminds#parents' },
  { label: 'For Teachers', href: '/braveminds#teachers' },
  { label: 'All Resources', href: '/braveminds' },
];

export const FOCUS_FLAME_LAB_PATH = '/focus-flame-lab';

export const PORTAL_PATH = '/portal';

/** Portal path tabs — browse pricing on /portal without unlocking. */
export const PORTAL_QUICK_LINKS: CourageNavLink[] = [
  { label: 'Kids Portal', href: '/portal?audience=kids' },
  { label: 'Parent Portal', href: '/portal?audience=parents' },
  { label: 'Educator Portal', href: '/portal?audience=educators' },
  { label: 'School Portal', href: '/portal?audience=schools' },
];

export const GAMES_DROPDOWN: CourageNavLink[] = [
  { label: 'Focus Flame Lab', href: FOCUS_FLAME_LAB_PATH },
];

/**
 * Legacy program route — keep working; nav uses Focus Flame Academy instead of "Camp Courage".
 * @see App.tsx `/camp-courage` route TODO
 */
export const LEGACY_CAMP_COURAGE_PATH = '/camp-courage';

/** Story & shop hub — linked from Courage Resources for IP discovery only. */
export const CAIDEN_VALE_STORY_LINK: CourageNavLink = {
  label: 'Caiden Vale Story & Book',
  href: VALE_CLASSIC_HOME_URL,
};
