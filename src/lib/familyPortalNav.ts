import {
  CAIDEN_QUEST_HUB_PATH,
  FAMILY_DR_VICTORIA_MISSION_1_PATH,
  FAMILY_PARENT_CORNER_PATH,
  FAMILY_PORTAL_PATH,
  KIDS_PORTAL_PATH,
} from '../config/courageRoutes';
import { FAMILY_NAV_TITLE, type FamilySidebarNavId } from '../data/familyPortalContent';

const MIRANDA_PORTAL_PREFIX = `${KIDS_PORTAL_PATH}/miranda`;
const B4_PORTAL_PREFIX = `${KIDS_PORTAL_PATH}/b4`;
const ZEKE_PORTAL_PREFIX = `${KIDS_PORTAL_PATH}/zeke`;

/** Routes that should keep Game Hub highlighted in the sidebar. */
export function isGameHubRoute(pathname: string): boolean {
  return (
    pathname.startsWith(CAIDEN_QUEST_HUB_PATH) ||
    pathname.startsWith(MIRANDA_PORTAL_PREFIX) ||
    pathname.startsWith(B4_PORTAL_PREFIX) ||
    pathname.startsWith(ZEKE_PORTAL_PREFIX)
  );
}

export function isWidePortalContentRoute(pathname: string): boolean {
  return (
    pathname.startsWith(CAIDEN_QUEST_HUB_PATH) ||
    pathname.startsWith(MIRANDA_PORTAL_PREFIX) ||
    pathname.startsWith(B4_PORTAL_PREFIX) ||
    pathname.startsWith(FAMILY_PARENT_CORNER_PATH) ||
    pathname.startsWith(FAMILY_DR_VICTORIA_MISSION_1_PATH)
  );
}

export function isInternalPortalRoute(href: string): boolean {
  return href.startsWith('/portal/');
}

export function resolvePortalNavId(pathname: string): FamilySidebarNavId {
  if (isGameHubRoute(pathname)) {
    return 'games';
  }
  if (pathname.startsWith(FAMILY_PARENT_CORNER_PATH) || pathname.startsWith(FAMILY_DR_VICTORIA_MISSION_1_PATH)) {
    return 'guide';
  }

  const match = [
    { id: 'overview' as const, path: FAMILY_PORTAL_PATH, exact: true },
    ...[
      'continue-learning',
      'characters',
      'games',
      'downloads',
      'gallery',
      'certificates',
      'guide',
      'parent-corner',
    ].map((segment) => ({
      id: segment as FamilySidebarNavId,
      path: `${FAMILY_PORTAL_PATH}/${segment}`,
      exact: false,
    })),
  ].find((item) =>
    item.exact
      ? pathname === item.path || pathname === `${item.path}/`
      : pathname.startsWith(item.path),
  );
  return match?.id ?? 'overview';
}

export function resolvePortalPageTitle(pathname: string): string {
  if (pathname.includes('/quest-') && pathname.startsWith(CAIDEN_QUEST_HUB_PATH)) {
    return "Caiden's Focus Quest";
  }
  if (pathname.startsWith(CAIDEN_QUEST_HUB_PATH)) {
    return "Caiden's Focus Flame Journey";
  }
  if (pathname.startsWith(MIRANDA_PORTAL_PREFIX) && pathname !== MIRANDA_PORTAL_PREFIX) {
    return "Miranda's Mystery Files";
  }
  if (pathname.startsWith(MIRANDA_PORTAL_PREFIX)) {
    return "Miranda's Mystery Files";
  }
  if (pathname.startsWith(B4_PORTAL_PREFIX)) {
    return 'B-4 Focus Missions';
  }
  if (pathname.startsWith(FAMILY_DR_VICTORIA_MISSION_1_PATH)) {
    return "Dr. Victoria\u2019s Understanding Different Minds";
  }
  if (pathname.startsWith(FAMILY_PARENT_CORNER_PATH)) {
    return 'Parent Corner';
  }
  return FAMILY_NAV_TITLE[resolvePortalNavId(pathname)];
}
