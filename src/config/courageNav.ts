import { schoolsHref, SCHOOLS_PATH } from './schoolsPaths';
import {
  BMC_ACTIVITIES_PATH,
  BMC_COLORING_PATH,
  BMC_RESET_TOOLS_PATH,
  BRAVE_MIND_CLUB_PATH,
  B4_GUIDE_PATH,
  FOCUS_FLAME_LAB_PATH,
  PARENTS_PATH,
  PORTAL_PATH,
  STORY_BOOKS_PATH,
  STORY_CHARACTERS_PATH,
  STORY_PATH,
  TEACHERS_PATH,
  CAMPS_PATH,
} from './courageRoutes';

import type { PilotInterestType } from '../types/pilotWaitlist';

export type CourageNavLink = {
  label: string;
  href: string;
  pilotInterest?: PilotInterestType;
};

export type CourageMegaNavSection = {
  heading: string;
  items: CourageNavLink[];
};

export type CourageKidsMegaNavColumn = {
  sections: CourageMegaNavSection[];
};

export type CourageKidsMegaNav = {
  intro?: {
    label: string;
    description: string;
  };
  columns: CourageKidsMegaNavColumn[];
};

export const COURAGE_HOME_PATH = '/';

export const COURAGE_LOGO_SRC = "/images/icons/caiden%27scourage_logo_1.png";

export {
  SCHOOLS_PATH,
  schoolsHref,
  BRAVE_MIND_CLUB_PATH,
  FOCUS_FLAME_LAB_PATH,
  B4_GUIDE_PATH,
  PORTAL_PATH,
  PARENTS_PATH,
  TEACHERS_PATH,
  CAMPS_PATH,
  STORY_PATH,
};

/** Story world — Caiden Vale graphic novel, characters, books. */
export const STORY_DROPDOWN: CourageNavLink[] = [
  { label: 'Caiden Vale', href: STORY_PATH },
  { label: 'Characters', href: STORY_CHARACTERS_PATH },
  { label: 'Books', href: STORY_BOOKS_PATH },
];

/** Kid-facing mega menu — decision-based CREATE / PRACTICE / PLAY. */
export const KIDS_MEGA_DROPDOWN: CourageKidsMegaNav = {
  intro: {
    label: 'Kids',
    description: 'Free games, activities, worksheets, and focus tools.',
  },
  columns: [
    {
      sections: [
        {
          heading: 'Create',
          items: [
            { label: 'Coloring Pages', href: BMC_COLORING_PATH },
            { label: 'Wallpapers', href: `${BRAVE_MIND_CLUB_PATH}?tab=wallpapers` },
          ],
        },
      ],
    },
    {
      sections: [
        {
          heading: 'Practice',
          items: [
            { label: 'SEL Worksheets', href: BMC_ACTIVITIES_PATH },
            {
              label: 'B-4 Focus Tools',
              href: BMC_RESET_TOOLS_PATH,
              pilotInterest: 'b4_tools',
            },
          ],
        },
      ],
    },
    {
      sections: [
        {
          heading: 'Play',
          items: [
            {
              label: 'B-4 Guide',
              href: B4_GUIDE_PATH,
              pilotInterest: 'b4_tools',
            },
            {
              label: 'Focus Flame Adventures',
              href: FOCUS_FLAME_LAB_PATH,
              pilotInterest: 'focus_flame_lab',
            },
          ],
        },
      ],
    },
  ],
};

/** Flat list derived from mega menu — active-state helpers, legacy consumers. */
export function flattenKidsMegaNav(mega: CourageKidsMegaNav = KIDS_MEGA_DROPDOWN): CourageNavLink[] {
  const links: CourageNavLink[] = [];
  for (const column of mega.columns) {
    for (const section of column.sections) {
      links.push(...section.items);
    }
  }
  return links;
}

/** @deprecated Use KIDS_MEGA_DROPDOWN */
export const KIDS_DROPDOWN: CourageNavLink[] = flattenKidsMegaNav();

/** Focus Flame Academy persona marketing pages. */
export const FOR_DROPDOWN: CourageNavLink[] = [
  { label: 'Parents', href: PARENTS_PATH },
  { label: 'Teachers', href: TEACHERS_PATH },
  { label: 'Camps', href: CAMPS_PATH },
  { label: 'Schools & Districts', href: SCHOOLS_PATH },
];

/** Educator & family resource discovery — no overlap with Kids dropdown. */
export const RESOURCES_DROPDOWN: CourageNavLink[] = [
  { label: 'B-4 Focus Tools', href: BMC_RESET_TOOLS_PATH, pilotInterest: 'b4_tools' },
  { label: 'Family Activities', href: PARENTS_PATH },
  { label: 'Download Center', href: BRAVE_MIND_CLUB_PATH },
];

/** @deprecated Use FOR_DROPDOWN */
export const SCHOOLS_DROPDOWN: CourageNavLink[] = [
  { label: "Caiden's Courage for Schools", href: SCHOOLS_PATH },
  { label: 'Classroom Pilot', href: schoolsHref('pilot') },
  { label: 'Teacher Resources', href: schoolsHref('teacher-resources') },
  { label: 'Training & Guides', href: schoolsHref('training-guides') },
];

/** @deprecated Use KIDS_DROPDOWN */
export const GAMES_DROPDOWN: CourageNavLink[] = [
  {
    label: 'Focus Flame Adventures',
    href: FOCUS_FLAME_LAB_PATH,
    pilotInterest: 'focus_flame_lab',
  },
];

/** Paths that activate each nav dropdown (includes legacy aliases). */
export const STORY_NAV_PATHS = [STORY_PATH, STORY_BOOKS_PATH, STORY_CHARACTERS_PATH, '/world', '/mission', '/comicbook', '/characters'];
export const KIDS_NAV_PATHS = [
  BRAVE_MIND_CLUB_PATH,
  BMC_COLORING_PATH,
  BMC_ACTIVITIES_PATH,
  BMC_RESET_TOOLS_PATH,
  FOCUS_FLAME_LAB_PATH,
  B4_GUIDE_PATH,
  '/kids',
  '/braveminds',
];
export const GAMES_NAV_PATHS = [FOCUS_FLAME_LAB_PATH, B4_GUIDE_PATH];
/** Hidden from top nav — routes remain active for bookmarks and footer links. */
export const RESOURCES_NAV_PATHS = [BMC_RESET_TOOLS_PATH, PARENTS_PATH, BRAVE_MIND_CLUB_PATH, '/braveminds'];

export function isNavPathActive(paths: string[], pathname: string): boolean {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Portal access entry points — used on portal sub-views; nav links directly to /portal. */
export const PORTAL_QUICK_LINKS: CourageNavLink[] = [
  { label: 'Kids Portal', href: '/portal?audience=kids' },
  { label: 'Parent Portal', href: '/portal?audience=parents' },
  { label: 'Educator Portal', href: '/portal?audience=educators' },
  { label: 'Camp Portal', href: '/portal?audience=camps' },
  { label: 'School Portal', href: '/portal?audience=schools' },
  { label: 'District Portal', href: '/portal?audience=districts' },
];

/** Legacy program route — redirects to /camps */
export const LEGACY_CAMP_COURAGE_PATH = '/camp-courage';

export const LEGACY_FOCUS_FLAME_ACADEMY_PATH = '/focus-flame-academy';
