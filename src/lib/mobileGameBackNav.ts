import { isCharacterGameRoute } from './familyPortalNav';
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

export function resolveMobileGameBackTarget(pathname: string, search: string): MobileGameBackTarget {
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
