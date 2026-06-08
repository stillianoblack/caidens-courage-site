import type { NavigateFunction } from 'react-router-dom';
import { getPortalBasePath } from './portalGamePaths';

/** Whether the gameplay X should leave immediately instead of returning to an in-game landing screen. */
export function shouldGameplayExitImmediately(embedded: boolean, skipLanding = false): boolean {
  return embedded || skipLanding;
}

/** Navigate out of gameplay with an explicit route — never relies on history.back(). */
export function navigateGameExit(
  navigate: NavigateFunction,
  exitPath: string,
  pathname?: string,
): void {
  const fallback =
    typeof window !== 'undefined' ? getPortalBasePath(pathname ?? window.location.pathname) : '/';
  const target = exitPath?.trim() && exitPath !== '/' ? exitPath : fallback;
  navigate(target, { replace: true });
}
