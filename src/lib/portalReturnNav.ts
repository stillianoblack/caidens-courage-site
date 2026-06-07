import { FAMILY_PORTAL_PATH, CAIDEN_QUEST_HUB_PATH, KIDS_PORTAL_PATH } from '../config/courageRoutes';

export const PORTAL_RETURN_KEY = 'cc-portal-return';

const PORTAL_RETURN_LABELS: Array<{ match: (path: string) => boolean; label: string }> = [
  {
    match: (path) => path.startsWith(`${FAMILY_PORTAL_PATH}/characters`),
    label: '← Back to Character Hub',
  },
  {
    match: (path) => path.startsWith(`${FAMILY_PORTAL_PATH}/games`),
    label: '← Back to Game Hub',
  },
  {
    match: (path) => path.startsWith(`${FAMILY_PORTAL_PATH}/continue-learning`),
    label: '← Back to Continue Learning',
  },
  {
    match: (path) => path.startsWith(`${KIDS_PORTAL_PATH}/miranda`),
    label: '← Back to Mystery Files',
  },
  {
    match: (path) => path.startsWith(`${KIDS_PORTAL_PATH}/b4/check-in`),
    label: '← Back to B-4 Missions',
  },
  {
    match: (path) => path.startsWith(`${KIDS_PORTAL_PATH}/b4/week-1`),
    label: '← Back to B-4 Missions',
  },
  {
    match: (path) => path.startsWith(`${KIDS_PORTAL_PATH}/b4`),
    label: '← Back to B-4 Missions',
  },
  {
    match: (path) => path.startsWith(CAIDEN_QUEST_HUB_PATH),
    label: '← Back to Focus Quest Map',
  },
  {
    match: (path) => path === '/portal/kids' || path.startsWith('/portal/kids/'),
    label: '← Back to Kids Hub',
  },
  {
    match: (path) => path === FAMILY_PORTAL_PATH || path.startsWith(`${FAMILY_PORTAL_PATH}/`),
    label: '← Back to Family Portal',
  },
];

export function isValidPortalReturnPath(path: string): boolean {
  return (
    path === FAMILY_PORTAL_PATH ||
    path.startsWith(`${FAMILY_PORTAL_PATH}/`) ||
    path === CAIDEN_QUEST_HUB_PATH ||
    path.startsWith(`${CAIDEN_QUEST_HUB_PATH}/`) ||
    path === '/portal/kids' ||
    path.startsWith('/portal/kids/')
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
  return match?.label ?? '← Back to Family Portal';
}

export function resolvePortalBackTarget(search: string): { path: string; label: string } {
  const fromQuery = getPortalReturnFromQuery(search);
  const stored = getPortalReturnPath();
  const path = fromQuery ?? stored ?? FAMILY_PORTAL_PATH;
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
    href.startsWith('/miranda-mystery-files') ||
    href.startsWith('/focus-flame-lab') ||
    href.startsWith('/b4-guide') ||
    href.startsWith('/b4-baseline-check')
  );
}
