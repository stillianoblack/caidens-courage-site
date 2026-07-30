export type CourageToolsPopupEligibilityInput = {
  pathname: string;
  authenticationLoading: boolean;
  authenticated: boolean;
  applicationSessionExists: boolean;
};

const PUBLIC_MARKETING_ROUTES = new Set([
  '/',
  '/about',
  '/contact',
  '/resources',
  '/parents',
  '/teachers',
  '/camps',
  '/schools',
  '/story',
  '/story/books',
  '/story/characters',
  '/brave-mind-club',
]);

const PUBLIC_MARKETING_PREFIXES = [
  '/resources/',
  '/parents/',
  '/teachers/',
  '/camps/',
  '/schools/',
  '/story/',
  '/brave-mind-club/',
];

export function isApprovedPopupMarketingRoute(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/';
  return (
    PUBLIC_MARKETING_ROUTES.has(path) ||
    PUBLIC_MARKETING_PREFIXES.some((prefix) => path.startsWith(prefix))
  );
}

export function isCourageToolsPopupEligible({
  pathname,
  authenticationLoading,
  authenticated,
  applicationSessionExists,
}: CourageToolsPopupEligibilityInput): boolean {
  if (authenticationLoading || authenticated || applicationSessionExists) return false;
  return isApprovedPopupMarketingRoute(pathname);
}

const APPLICATION_SESSION_KEYS = [
  'cc-admin-portal-session',
  'activePortalRole',
  'activePilotProgram',
  'activeAccessCode',
  'kidPlaySessionId',
  'activeChildParticipantId',
  'parentClaimContext',
];

export function browserApplicationSessionExists(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return APPLICATION_SESSION_KEYS.some(
      (key) => Boolean(window.sessionStorage.getItem(key) || window.localStorage.getItem(key)),
    );
  } catch {
    return true;
  }
}
