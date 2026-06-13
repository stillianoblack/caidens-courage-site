import {
  FAMILY_HUB_PATH,
  FAMILY_PORTAL_PATH,
  CAIDEN_QUEST_HUB_PATH,
  KIDS_PORTAL_PATH,
  PROGRAM_DASHBOARD_PATH,
} from '../config/courageRoutes';
import {
  getPortalRoute,
  resolvePortalCharacterHubPath,
} from './portalGamePaths';

export const PORTAL_RETURN_KEY = 'cc-portal-return';

const PORTAL_RETURN_LABELS: Array<{ match: (path: string) => boolean; label: string }> = [
  {
    match: (path) => path.includes('/miranda') || path.includes('/caiden') || path.includes('/charlie') || path.includes('/zeke'),
    label: '← Back to Character Hub',
  },
  {
    match: (path) => path.includes('/b4'),
    label: '← Back to Character Hub',
  },
  {
    match: (path) =>
      path.startsWith(`${FAMILY_PORTAL_PATH}/continue-learning`) ||
      path.startsWith(`${FAMILY_HUB_PATH}/continue-learning`) ||
      path.startsWith(`${FAMILY_PORTAL_PATH}/weekly-adventures`) ||
      path.startsWith(`${FAMILY_HUB_PATH}/weekly-adventures`),
    label: '← Back to Adventure Map',
  },
  {
    match: (path) =>
      path.startsWith(`${FAMILY_PORTAL_PATH}/games`) || path.startsWith(`${FAMILY_HUB_PATH}/games`),
    label: '← Back to Character Hub',
  },
  {
    match: (path) =>
      path.startsWith(`${FAMILY_PORTAL_PATH}/characters`) ||
      path.startsWith(`${FAMILY_HUB_PATH}/characters`) ||
      path.startsWith(`${FAMILY_PORTAL_PATH}/children`) ||
      path.startsWith(`${FAMILY_HUB_PATH}/children`),
    label: '← Back to Character Hub',
  },
  {
    match: (path) => path.startsWith(`${FAMILY_HUB_PATH}/kids`) || path.startsWith(`${PROGRAM_DASHBOARD_PATH}/kids`),
    label: '← Back to Character Hub',
  },
  {
    match: (path) => path === '/portal/kids' || path.startsWith('/portal/kids/'),
    label: '← Back to Character Hub',
  },
  {
    match: (path) => path === FAMILY_PORTAL_PATH || path.startsWith(`${FAMILY_PORTAL_PATH}/`),
    label: '← Back to Home',
  },
  {
    match: (path) => path === FAMILY_HUB_PATH || path.startsWith(`${FAMILY_HUB_PATH}/`),
    label: '← Back to Home',
  },
  {
    match: (path) => path === PROGRAM_DASHBOARD_PATH || path.startsWith(`${PROGRAM_DASHBOARD_PATH}`),
    label: '← Back to Overview',
  },
];

export function isValidPortalReturnPath(path: string): boolean {
  return (
    path === FAMILY_PORTAL_PATH ||
    path.startsWith(`${FAMILY_PORTAL_PATH}/`) ||
    path === FAMILY_HUB_PATH ||
    path.startsWith(`${FAMILY_HUB_PATH}/`) ||
    path === PROGRAM_DASHBOARD_PATH ||
    path.startsWith(`${PROGRAM_DASHBOARD_PATH}`) ||
    path === CAIDEN_QUEST_HUB_PATH ||
    path.startsWith(`${CAIDEN_QUEST_HUB_PATH}/`) ||
    path === KIDS_PORTAL_PATH ||
    path.startsWith(`${KIDS_PORTAL_PATH}/`)
  );
}

export function setPortalReturnPath(path: string): void {
  try {
    if (isValidPortalReturnPath(path)) {
      sessionStorage.setItem(PORTAL_RETURN_KEY, path);
    }
  } catch {
    /* sessionStorage unavailable */
  }
}

export function getPortalReturnPath(): string | null {
  try {
    const stored = sessionStorage.getItem(PORTAL_RETURN_KEY);
    if (stored && isValidPortalReturnPath(stored)) {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function getPortalReturnFromQuery(search: string): string | null {
  const from = new URLSearchParams(search).get('from');
  if (from && isValidPortalReturnPath(from)) {
    return from;
  }
  return null;
}

export function resolvePortalReturnLabel(path: string): string {
  const match = PORTAL_RETURN_LABELS.find((entry) => entry.match(path));
  return match?.label ?? '← Back to Character Hub';
}

export function resolvePortalBackTarget(pathname: string): { path: string; hubName: string } {
  if (pathname.includes('/guide') || pathname.includes('/parent-corner')) {
    return { path: getPortalRoute('guide', pathname), hubName: 'Parent Corner' };
  }
  if (pathname.includes('/games')) {
    return { path: resolvePortalCharacterHubPath(pathname), hubName: 'Character Hub' };
  }
  if (
    pathname.includes('/miranda') ||
    pathname.includes('/caiden') ||
    pathname.includes('/b4') ||
    pathname.includes('/charlie') ||
    pathname.includes('/zeke') ||
    pathname.includes('/kids/')
  ) {
    return { path: resolvePortalCharacterHubPath(pathname), hubName: 'Character Hub' };
  }
  if (
    pathname.includes('/continue-learning') ||
    pathname.includes('/weekly-adventures')
  ) {
    return { path: getPortalRoute('continue-learning', pathname), hubName: 'Adventure Map' };
  }
  return { path: resolvePortalCharacterHubPath(pathname), hubName: 'Character Hub' };
}

export function resolvePortalBackTargetFromPath(path: string): { path: string; hubName: string } {
  const label = resolvePortalReturnLabel(path).replace(/^← Back to /, '').trim();
  return { path, hubName: label };
}

export function resolvePortalBackTargetLegacy(search: string): { path: string; label: string } {
  const fromQuery = getPortalReturnFromQuery(search);
  const stored = getPortalReturnPath();
  const path = fromQuery ?? stored ?? resolvePortalCharacterHubPath();
  return {
    path,
    label: resolvePortalReturnLabel(path),
  };
}

export function shouldUseHistoryBack(returnPath: string | null): boolean {
  if (returnPath) return false;
  try {
    if (window.history.length <= 1) return false;
    const referrer = document.referrer;
    if (!referrer) return false;
    const referrerUrl = new URL(referrer);
    if (referrerUrl.origin !== window.location.origin) return false;
    return isValidPortalReturnPath(referrerUrl.pathname);
  } catch {
    return false;
  }
}

export function isFamilyPortalGameHref(href: string): boolean {
  return (
    href.startsWith('/portal/kids') ||
    href.startsWith('/family-hub/kids') ||
    href.startsWith(`${PROGRAM_DASHBOARD_PATH}/kids`) ||
    href.startsWith('/miranda-mystery-files') ||
    href.startsWith('/focus-flame-lab') ||
    href.startsWith('/b4-guide') ||
    href.startsWith('/b4-baseline-check')
  );
}

/** @deprecated Use resolvePortalBackTargetLegacy */
export function resolvePortalBackTargetFromQuery(search: string): { path: string; label: string } {
  return resolvePortalBackTargetLegacy(search);
}

/** @deprecated Use resolvePortalBackTargetLegacy */
export function resolvePortalBackTargetOld(search: string): { path: string; label: string } {
  return resolvePortalBackTargetLegacy(search);
}

export function resolvePortalBackTargetQuery(search: string): { path: string; label: string } {
  return resolvePortalBackTargetLegacy(search);
}

export { resolvePortalBackTargetLegacy as resolvePortalBackTargetFromSearch };
