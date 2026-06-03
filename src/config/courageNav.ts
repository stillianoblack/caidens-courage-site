import { CAIDEN_VALE_HOME_PATH } from './nav';

export type CourageNavLink = {
  label: string;
  href: string;
};

export const COURAGE_HOME_PATH = '/';

export const SCHOOLS_DROPDOWN: CourageNavLink[] = [
  { label: 'Focus Flame Academy', href: '/focus-flame-academy' },
  { label: 'Pilot Program', href: '/focus-flame-academy#pilot-program' },
  { label: 'Teacher Resources', href: '/focus-flame-academy#teacher-resources' },
];

export const RESOURCES_DROPDOWN: CourageNavLink[] = [
  { label: 'Activities', href: '/kids#activities' },
  { label: 'Coloring Pages', href: '/kids#coloring-pages' },
  { label: 'Comics', href: '/kids#comics' },
  { label: 'Caiden Vale', href: CAIDEN_VALE_HOME_PATH },
];

export const FOCUS_FLAME_LAB_PATH = '/focus-flame-lab';
