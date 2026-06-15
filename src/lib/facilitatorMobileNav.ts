import { BLUE_RIBBON_PILOT_PATH, PROGRAM_DASHBOARD_PATH } from '../config/courageRoutes';
import {
  PILOT_PAGE_SUBTITLES,
  PROGRAM_SIDEBAR_NAV,
  type PilotSidebarNavId,
} from '../data/pilotDashboardContent';
import { programDashboardTabPath, resolveProgramDashboardTab } from './programDashboardNav';

export type FacilitatorBottomNavId = 'home' | 'roster' | 'activities' | 'results' | 'more';

export type FacilitatorMoreNavItem = {
  id: PilotSidebarNavId;
  label: string;
  helper?: string;
};

export const FACILITATOR_BOTTOM_NAV: Array<{
  id: FacilitatorBottomNavId;
  label: string;
  tab: PilotSidebarNavId | 'more';
}> = [
  { id: 'home', label: 'Home', tab: 'overview' },
  { id: 'roster', label: 'Roster', tab: 'roster' },
  { id: 'activities', label: 'Activities', tab: 'activities-library' },
  { id: 'results', label: 'Results', tab: 'results' },
  { id: 'more', label: 'More', tab: 'more' },
];

const MORE_NAV_IDS: PilotSidebarNavId[] = [
  'weekly-modules',
  'assessments',
  'certificates',
  'student-gallery',
  'facilitator-center',
];

export const FACILITATOR_MORE_NAV_ITEMS: FacilitatorMoreNavItem[] = PROGRAM_SIDEBAR_NAV.filter(
  (item) => MORE_NAV_IDS.includes(item.id),
).map((item) => ({
  id: item.id,
  label: item.label,
  helper: PILOT_PAGE_SUBTITLES[item.id],
}));

export function isFacilitatorPortalPath(pathname: string): boolean {
  return (
    pathname === PROGRAM_DASHBOARD_PATH ||
    pathname.startsWith(`${PROGRAM_DASHBOARD_PATH}/`) ||
    pathname === BLUE_RIBBON_PILOT_PATH ||
    pathname.startsWith(`${BLUE_RIBBON_PILOT_PATH}/`)
  );
}

export function resolveFacilitatorActiveTab(pathname: string, hash: string): PilotSidebarNavId {
  if (pathname.startsWith(PROGRAM_DASHBOARD_PATH)) {
    return resolveProgramDashboardTab(pathname);
  }

  const hashTab = hash.replace('#', '') as PilotSidebarNavId;
  if (hashTab && PROGRAM_SIDEBAR_NAV.some((item) => item.id === hashTab)) {
    return hashTab;
  }

  return 'overview';
}

export function facilitatorTabPath(tab: PilotSidebarNavId, pathname: string): string {
  if (pathname.startsWith(PROGRAM_DASHBOARD_PATH)) {
    return programDashboardTabPath(tab);
  }

  if (pathname.startsWith(BLUE_RIBBON_PILOT_PATH) || pathname === BLUE_RIBBON_PILOT_PATH) {
    return tab === 'overview' ? BLUE_RIBBON_PILOT_PATH : `${BLUE_RIBBON_PILOT_PATH}#${tab}`;
  }

  return programDashboardTabPath(tab);
}

export function resolveFacilitatorBottomNavId(
  activeTab: PilotSidebarNavId,
): FacilitatorBottomNavId {
  switch (activeTab) {
    case 'overview':
      return 'home';
    case 'roster':
      return 'roster';
    case 'activities-library':
      return 'activities';
    case 'results':
      return 'results';
    default:
      return 'more';
  }
}

export function isFacilitatorMoreTab(activeTab: PilotSidebarNavId): boolean {
  return MORE_NAV_IDS.includes(activeTab);
}
