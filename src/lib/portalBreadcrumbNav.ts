import { PROGRAM_DASHBOARD_PATH } from '../config/courageRoutes';
import {
  getPortalRoute,
  resolveCaidenHubPath,
  resolveCharlieHubPath,
  resolveMirandaHubPath,
  resolveB4HubPath,
} from './portalGamePaths';
import { programDashboardTabPath, resolveProgramDashboardTab } from './programDashboardNav';
import {
  getPortalReturnFromQuery,
  getPortalReturnPath,
  isValidPortalReturnPath,
  resolvePortalReturnLabel,
} from './portalReturnNav';
import {
  readWeeklyAdventureRouteContext,
  resolveCharacterHubGameplayBack,
  resolveWeeklyAdventureGameplayBack,
  WEEKLY_CHARACTER_SOURCE_VALUE,
} from './weeklyAdventureRouteContext';

export type PortalBreadcrumbPortalType = 'family' | 'facilitator' | 'student' | 'admin';

export type PortalReturnState = {
  returnTo?: string;
  returnLabel?: string;
};

export const PORTAL_RETURN_TO_KEY = 'returnTo';
export const PORTAL_RETURN_LABEL_KEY = 'returnLabel';

const CHARACTER_DASHBOARD_LABELS: Record<string, string> = {
  caiden: 'Focus Flame Journey',
  miranda: 'Mystery Files',
  charlie: "Charlie's Science Lab",
  zeke: "Zeke's Team Quest",
  b4: 'B-4 Missions',
};

/** Full breadcrumb label — always includes “Back to …”. */
export function formatBackLabel(destination: string): string {
  const trimmed = destination.replace(/^←\s*/, '').trim();
  if (/^back to /i.test(trimmed)) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }
  return `Back to ${trimmed}`;
}

export function normalizeBreadcrumbLabel(label: string): string {
  return formatBackLabel(label.replace(/^←\s*/, '').trim());
}

export function buildPortalReturnState(returnTo: string, returnLabel: string): PortalReturnState {
  return {
    returnTo,
    returnLabel: normalizeBreadcrumbLabel(returnLabel),
  };
}

export function appendPortalReturnQuery(
  href: string,
  returnTo: string,
  returnLabel?: string,
): string {
  const url = new URL(href, 'https://placeholder.local');
  url.searchParams.set(PORTAL_RETURN_TO_KEY, returnTo);
  if (returnLabel) {
    url.searchParams.set(PORTAL_RETURN_LABEL_KEY, normalizeBreadcrumbLabel(returnLabel));
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

export function inferCharacterFromPath(pathname: string): string | null {
  if (pathname.includes('/caiden') || pathname.includes('focus-flame')) return 'caiden';
  if (pathname.includes('/miranda') || pathname.includes('mystery-files')) return 'miranda';
  if (pathname.includes('/charlie')) return 'charlie';
  if (pathname.includes('/zeke')) return 'zeke';
  if (pathname.includes('/b4') || pathname.includes('baseline-check')) return 'b4';
  return null;
}

export function resolveCharacterDashboardLabel(characterId: string): string {
  return CHARACTER_DASHBOARD_LABELS[characterId] ?? 'Character Hub';
}

export function resolveCharacterHubPath(characterId: string, pathname: string): string {
  switch (characterId) {
    case 'caiden':
      return resolveCaidenHubPath(pathname);
    case 'miranda':
      return resolveMirandaHubPath(pathname);
    case 'charlie':
      return resolveCharlieHubPath(pathname);
    case 'b4':
      return resolveB4HubPath(pathname);
    default:
      return getPortalRoute('characters', pathname);
  }
}

export function resolveCharacterGameplayBackLabel(characterId: string | null): string {
  if (!characterId) return formatBackLabel('Character Hub');
  return formatBackLabel(resolveCharacterDashboardLabel(characterId));
}

export function resolveDashboardBreadcrumb(pathname: string): { label: string; href: string } {
  return {
    label: formatBackLabel('Character Hub'),
    href: getPortalRoute('characters', pathname),
  };
}

function labelFromFacilitatorTab(tab: ReturnType<typeof resolveProgramDashboardTab>): string {
  switch (tab) {
    case 'activities-library':
      return formatBackLabel('Activities Library');
    case 'weekly-modules':
      return formatBackLabel('Weekly Modules');
    case 'overview':
      return formatBackLabel('Dashboard');
    default:
      return formatBackLabel('Dashboard');
  }
}

export function resolveFacilitatorReturnFallback(pathname: string): { label: string; href: string } {
  const stored = getPortalReturnPath();
  if (stored?.startsWith(PROGRAM_DASHBOARD_PATH)) {
    const tab = resolveProgramDashboardTab(stored);
    return {
      href: programDashboardTabPath(tab),
      label: labelFromFacilitatorTab(tab),
    };
  }

  if (pathname.startsWith(PROGRAM_DASHBOARD_PATH)) {
    return {
      href: programDashboardTabPath('overview'),
      label: formatBackLabel('Dashboard'),
    };
  }

  return {
    href: programDashboardTabPath('overview'),
    label: formatBackLabel('Dashboard'),
  };
}

export function readPortalReturnState(
  search: string,
  state: unknown,
): { label: string; href: string } | null {
  const routeState = state as PortalReturnState | null;
  if (routeState?.returnTo && isValidPortalReturnPath(routeState.returnTo)) {
    return {
      href: routeState.returnTo,
      label: routeState.returnLabel
        ? normalizeBreadcrumbLabel(routeState.returnLabel)
        : normalizeBreadcrumbLabel(resolvePortalReturnLabel(routeState.returnTo)),
    };
  }

  const params = new URLSearchParams(search);
  const queryReturnTo = params.get(PORTAL_RETURN_TO_KEY) ?? getPortalReturnFromQuery(search);
  const queryReturnLabel = params.get(PORTAL_RETURN_LABEL_KEY);

  if (queryReturnTo && isValidPortalReturnPath(queryReturnTo)) {
    return {
      href: queryReturnTo,
      label: queryReturnLabel
        ? normalizeBreadcrumbLabel(queryReturnLabel)
        : normalizeBreadcrumbLabel(resolvePortalReturnLabel(queryReturnTo)),
    };
  }

  const stored = getPortalReturnPath();
  if (stored && isValidPortalReturnPath(stored)) {
    return {
      href: stored,
      label: normalizeBreadcrumbLabel(resolvePortalReturnLabel(stored)),
    };
  }

  return null;
}

export function resolveGameplayBreadcrumb(options: {
  pathname: string;
  search: string;
  state?: unknown;
  characterId?: string | null;
  fallbackExitPath?: string;
  fallbackExitLabel?: string;
}): { label: string; href: string } {
  const weeklyCtx = readWeeklyAdventureRouteContext(options.search);
  const weeklyBack = resolveWeeklyAdventureGameplayBack(options.pathname, weeklyCtx);
  if (weeklyBack) {
    return weeklyBack;
  }

  if (weeklyCtx.source === WEEKLY_CHARACTER_SOURCE_VALUE) {
    return resolveCharacterHubGameplayBack(options.pathname);
  }

  const fromState = readPortalReturnState(options.search, options.state);
  if (fromState) {
    return fromState;
  }

  const isFacilitator =
    options.pathname.startsWith(PROGRAM_DASHBOARD_PATH) ||
    options.pathname.includes('/program-dashboard');

  if (isFacilitator) {
    return resolveFacilitatorReturnFallback(options.pathname);
  }

  const characterId =
    options.characterId ?? inferCharacterFromPath(options.pathname);

  if (options.fallbackExitPath && options.fallbackExitPath !== '/') {
    return {
      href: options.fallbackExitPath,
      label: options.fallbackExitLabel
        ? normalizeBreadcrumbLabel(options.fallbackExitLabel)
        : resolveCharacterGameplayBackLabel(characterId),
    };
  }

  if (characterId) {
    return {
      href: resolveCharacterHubPath(characterId, options.pathname),
      label: resolveCharacterGameplayBackLabel(characterId),
    };
  }

  return resolveDashboardBreadcrumb(options.pathname);
}

export function buildGameplayLinkTarget(
  href: string,
  pathname: string,
  dashboardLabel?: string,
): { pathname: string; search?: string; state?: PortalReturnState } {
  const characterId = inferCharacterFromPath(pathname);
  const label =
    dashboardLabel ??
    (characterId ? resolveCharacterGameplayBackLabel(characterId) : formatBackLabel('Character Hub'));

  return {
    pathname: href,
    state: buildPortalReturnState(pathname, label),
  };
}
