import type { NavigateFunction, To } from 'react-router-dom';
import { logNavTest } from './portalClickDebug';

export type ReliableNavigateOptions = {
  replace?: boolean;
  state?: unknown;
};

const NAV_VERIFY_MS = 150;

function resolveAbsolutePath(to: To): string {
  if (typeof to === 'string') {
    return to.startsWith('/') ? to : `/${to}`;
  }

  const pathname = to.pathname ?? '/';
  const search = typeof to.search === 'string' ? to.search : '';
  const hash = typeof to.hash === 'string' ? to.hash : '';
  return `${pathname}${search}${hash}`;
}

function normalizePath(path: string): string {
  if (typeof window === 'undefined') return path;
  try {
    const url = new URL(path, window.location.origin);
    return url.pathname + url.search;
  } catch {
    return path.split('#')[0] ?? path;
  }
}

function currentPath(): string {
  if (typeof window === 'undefined') return '';
  return normalizePath(window.location.pathname + window.location.search);
}

function assignPath(from: string, targetPath: string): void {
  logNavTest(from, normalizePath(targetPath), { method: 'assign' });
  window.location.assign(targetPath);
}

/**
 * Router-first navigation with full-page fallback when navigation stalls.
 */
export function reliablePortalNavigate(
  navigate: NavigateFunction,
  to: To,
  options: ReliableNavigateOptions = {},
): void {
  const from = currentPath();
  const targetPath = resolveAbsolutePath(to);
  const targetNorm = normalizePath(targetPath);

  logNavTest(from, targetNorm, { method: 'router' });

  if (typeof window === 'undefined') {
    navigate(to, { replace: options.replace, state: options.state });
    return;
  }

  try {
    navigate(to, { replace: options.replace, state: options.state });
  } catch (error) {
    console.warn('[NAV_TEST] router navigation failed', error);
    assignPath(from, targetPath);
    return;
  }

  window.setTimeout(() => {
    const current = currentPath();
    if (current === targetNorm) return;

    const fromPath = from.split('?')[0];
    const targetPathOnly = targetNorm.split('?')[0];
    const currentPathOnly = current.split('?')[0];

    const pathnameStuck = currentPathOnly === fromPath && targetPathOnly !== fromPath;
    const searchStuck =
      currentPathOnly === fromPath &&
      targetPathOnly === fromPath &&
      current !== targetNorm;

    if (pathnameStuck || searchStuck) {
      assignPath(from, targetPath);
    }
  }, NAV_VERIFY_MS);
}
