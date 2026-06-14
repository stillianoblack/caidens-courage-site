import { isCharacterGameRoute } from './familyPortalNav';
import {
  getPortalReturnFromQuery,
  getPortalReturnPath,
  isValidPortalReturnPath,
  resolvePortalReturnLabel,
} from './portalReturnNav';
import {
  readWeeklyAdventureRouteContext,
  resolveCharacterHubReturnHref,
  resolveWeeklyAdventureReturnHref,
  resolveWeeklyAdventuresPanelPath,
} from './weeklyAdventureRouteContext';

export type MobileGameBackTarget = {
  path: string;
  ariaLabel: string;
};

function resolvePortalReturnBackTarget(search: string): MobileGameBackTarget | null {
  const fromQuery = getPortalReturnFromQuery(search);
  const stored = getPortalReturnPath();
  const path = fromQuery ?? stored;
  if (!path || !isValidPortalReturnPath(path)) {
    return null;
  }
  const label = resolvePortalReturnLabel(path).replace(/^←\s*/, '').trim();
  return {
    path,
    ariaLabel: label.startsWith('Back to ') ? label : `Back to ${label}`,
  };
}

export function resolveMobileGameBackTarget(pathname: string, search: string): MobileGameBackTarget {
  const portalReturn = resolvePortalReturnBackTarget(search);
  if (portalReturn) {
    return portalReturn;
  }

  const weeklyCtx = readWeeklyAdventureRouteContext(search);

  if (weeklyCtx.source === 'weekly') {
    const week = weeklyCtx.week && weeklyCtx.week > 0 ? weeklyCtx.week : 1;
    return {
      path: resolveWeeklyAdventureReturnHref(pathname, week),
      ariaLabel: 'Back to Adventure Map',
    };
  }

  if (weeklyCtx.source === 'character' || isCharacterGameRoute(pathname)) {
    return {
      path: resolveCharacterHubReturnHref(pathname),
      ariaLabel: 'Back to Character Hub',
    };
  }

  return {
    path: resolveWeeklyAdventuresPanelPath(pathname),
    ariaLabel: 'Back to Weekly Adventures',
  };
}
