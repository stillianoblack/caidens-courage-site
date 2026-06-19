import {
  FAMILY_DR_VICTORIA_MISSION_BASE,
  FAMILY_HUB_KIDS_BASE,
  FAMILY_HUB_PATH,
  FAMILY_PARENT_CORNER_PATH,
  FAMILY_PORTAL_PATH,
  KIDS_PORTAL_PATH,
  PROGRAM_DASHBOARD_KIDS_BASE,
} from '../config/courageRoutes';
import { isKidPlayShellPath, parseKidPlayShellPath } from './kidPlayShellRoutes';
import { resolveCharacterProfileTitle } from '../data/characterProfiles';
import { FAMILY_NAV_TITLE, type FamilySidebarNavId } from '../data/familyPortalContent';
import { isWeeklyAdventureSource } from './weeklyAdventureRouteContext';

export function resolveFamilyBasePath(pathname: string): string {
  if (isKidPlayShellPath(pathname)) {
    const ctx = parseKidPlayShellPath(pathname);
    if (ctx) return `/play/session/${ctx.sessionId}`;
  }
  if (pathname.startsWith(FAMILY_HUB_PATH)) return FAMILY_HUB_PATH;
  return FAMILY_PORTAL_PATH;
}

export function resolveKidsBasePath(pathname: string): string {
  if (pathname.startsWith(FAMILY_HUB_KIDS_BASE) || pathname.startsWith(`${FAMILY_HUB_PATH}/kids`)) {
    return FAMILY_HUB_KIDS_BASE;
  }
  if (pathname.startsWith(PROGRAM_DASHBOARD_KIDS_BASE)) {
    return PROGRAM_DASHBOARD_KIDS_BASE;
  }
  return KIDS_PORTAL_PATH;
}

/** Kid game routes that should keep Character Hub highlighted in the sidebar. */
export function isCharacterGameRoute(pathname: string, basePath = resolveFamilyBasePath(pathname)): boolean {
  const kidsBase = resolveKidsBasePath(pathname);
  return (
    pathname.startsWith(`${kidsBase}/caiden`) ||
    pathname.startsWith(`${kidsBase}/miranda`) ||
    pathname.startsWith(`${kidsBase}/b4`) ||
    pathname.startsWith(`${kidsBase}/charlie`) ||
    pathname.startsWith(`${kidsBase}/zeke`)
  );
}

/** Mobile family portal routes that use the compact gameplay shell (no portal header / bottom nav). */
export function isMobileFamilyGameplayShellRoute(
  pathname: string,
  basePath = resolveFamilyBasePath(pathname),
): boolean {
  return (
    isCharacterGameRoute(pathname, basePath) ||
    pathname.startsWith(`${basePath}/baseline-check`)
  );
}

export function isCharacterHubRoute(pathname: string, basePath = resolveFamilyBasePath(pathname)): boolean {
  return (
    pathname === `${basePath}/characters` ||
    pathname.startsWith(`${basePath}/characters/`) ||
    pathname === `${basePath}/children` ||
    pathname.startsWith(`${basePath}/children/`) ||
    isCharacterGameRoute(pathname, basePath)
  );
}

export function isWidePortalContentRoute(
  pathname: string,
  _basePath = resolveFamilyBasePath(pathname),
): boolean {
  return false;
}

export function isInternalPortalRoute(href: string): boolean {
  return (
    href.startsWith('/portal/') ||
    href.startsWith('/family-hub') ||
    href.startsWith('/program-dashboard')
  );
}

/** True when the URL should render a nested child route (Outlet), not a main nav panel. */
export function isFamilyNestedRoute(pathname: string, basePath: string): boolean {
  if (!pathname.startsWith(basePath)) return false;

  const remainder = pathname.slice(basePath.length) || '';
  if (!remainder || remainder === '/') return false;

  const mainPanelPaths = new Set([
    '/continue-learning',
    '/weekly-adventures',
    '/results',
    '/downloads',
    '/gallery',
    '/certificates',
    '/guide',
    '/parent-corner',
    '/characters',
    '/inventory',
    '/collections',
    '/settings',
  ]);

  return !mainPanelPaths.has(remainder);
}

export function resolvePortalNavId(
  pathname: string,
  basePath = resolveFamilyBasePath(pathname),
  search = '',
): FamilySidebarNavId {
  if (isWeeklyAdventureSource(search)) {
    return 'continue-learning';
  }
  if (isCharacterHubRoute(pathname, basePath)) {
    return 'character-hub';
  }
  if (pathname.includes('/baseline-check')) {
    return 'continue-learning';
  }
  if (pathname.includes('/adult-assessment')) {
    return 'guide';
  }
  if (pathname.startsWith(FAMILY_PARENT_CORNER_PATH) || pathname.startsWith(FAMILY_DR_VICTORIA_MISSION_BASE)) {
    return 'guide';
  }
  if (pathname.startsWith(`${basePath}/guide`)) {
    return 'guide';
  }

  const segments: Array<{ id: FamilySidebarNavId; segment: string; exact?: boolean }> = [
    { id: 'overview', segment: basePath, exact: true },
    { id: 'results', segment: `${basePath}/results` },
    { id: 'continue-learning', segment: `${basePath}/weekly-adventures` },
    { id: 'continue-learning', segment: `${basePath}/continue-learning` },
    { id: 'character-hub', segment: `${basePath}/characters` },
    { id: 'inventory', segment: `${basePath}/collections` },
    { id: 'inventory', segment: `${basePath}/inventory` },
    { id: 'downloads', segment: `${basePath}/downloads` },
    { id: 'gallery', segment: `${basePath}/gallery` },
    { id: 'certificates', segment: `${basePath}/certificates` },
    { id: 'guide', segment: `${basePath}/guide` },
    { id: 'guide', segment: `${basePath}/parent-corner` },
  ];

  const match = segments.find((item) =>
    item.exact
      ? pathname === item.segment || pathname === `${item.segment}/`
      : pathname.startsWith(item.segment),
  );
  return match?.id ?? 'overview';
}

export function resolvePortalPageTitle(pathname: string, basePath = resolveFamilyBasePath(pathname)): string {
  const profileTitle = resolveCharacterProfileTitle(pathname);
  if (profileTitle) {
    return profileTitle;
  }

  const kidsBase = resolveKidsBasePath(pathname);

  if (pathname.includes('/quest-') && pathname.startsWith(`${kidsBase}/caiden`)) {
    return "Caiden's Focus Quest";
  }
  if (pathname.startsWith(`${kidsBase}/caiden`)) {
    return "Caiden's Focus Flame Journey";
  }
  if (pathname.startsWith(`${kidsBase}/miranda`)) {
    return "Miranda's Mystery Files";
  }
  if (pathname.startsWith(`${kidsBase}/b4`)) {
    return 'B-4 Focus Missions';
  }
  if (pathname.startsWith(`${kidsBase}/charlie`)) {
    return pathname === `${kidsBase}/charlie` || pathname === `${kidsBase}/charlie/`
      ? "Charlie Perk\u2019s Science Lab"
      : 'Turtle Trail Trouble';
  }
  if (pathname.startsWith(FAMILY_DR_VICTORIA_MISSION_BASE)) {
    return pathname === FAMILY_DR_VICTORIA_MISSION_BASE ||
      pathname === `${FAMILY_DR_VICTORIA_MISSION_BASE}/`
      ? 'Dr. Victoria Learning Hub'
      : "Dr. Victoria\u2019s Understanding Different Minds";
  }
  if (pathname.startsWith(`${basePath}/guide`)) {
    return 'Parent Corner';
  }
  if (pathname.includes('/adult-assessment/baseline')) {
    return 'Adult Baseline Assessment';
  }
  if (pathname.includes('/adult-assessment/growth')) {
    return 'Adult Growth Assessment';
  }
  if (pathname.includes('/baseline-check')) {
    return 'B-4 Check-In';
  }
  if (pathname.startsWith(`${basePath}/settings`)) {
    return 'Settings';
  }
  return FAMILY_NAV_TITLE[resolvePortalNavId(pathname, basePath)];
}

/** @deprecated Use isCharacterGameRoute */
export function isGameHubRoute(pathname: string, basePath = resolveFamilyBasePath(pathname)): boolean {
  return isCharacterGameRoute(pathname, basePath);
}
