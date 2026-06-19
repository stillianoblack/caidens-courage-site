import type { NavigateFunction, To } from 'react-router-dom';
import { isKidPlayShellPath } from './kidPlayShellRoutes';

export type KidShellNavigateOptions = {
  replace?: boolean;
  state?: unknown;
  /** Skip router attempt and load the route directly. */
  forceAssign?: boolean;
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

export function logKidShellNav(from: string, to: string, method: 'router' | 'assign'): void {
  console.info('[KID_SHELL_NAV]', `${from} -> ${to}`, { method });
}

function assignPath(from: string, targetPath: string): void {
  logKidShellNav(from, normalizePath(targetPath), 'assign');
  window.location.assign(targetPath);
}

/**
 * Reliable navigation for kid play shell actions.
 * Prefers React Router, then falls back to a full route load when navigation stalls.
 */
export function kidPlayShellNavigate(
  navigate: NavigateFunction,
  to: To,
  options: KidShellNavigateOptions = {},
): void {
  const from = currentPath();
  const targetPath = resolveAbsolutePath(to);
  const targetNorm = normalizePath(targetPath);
  const inShell = isKidPlayShellPath(from);
  const targetInShell = isKidPlayShellPath(targetNorm);

  if (inShell || targetInShell) {
    logKidShellNav(from, targetNorm, 'router');
  }

  if (options.forceAssign) {
    assignPath(from, targetPath);
    return;
  }

  if (typeof window === 'undefined') {
    navigate(to, { replace: options.replace, state: options.state });
    return;
  }

  try {
    navigate(to, { replace: options.replace, state: options.state });
  } catch (error) {
    console.warn('[KID_SHELL_NAV] router navigation failed', error);
    if (inShell || targetInShell) {
      assignPath(from, targetPath);
    }
    return;
  }

  window.setTimeout(() => {
    const current = currentPath();
    if (current === targetNorm) return;

    const pathnameUnchanged =
      current.split('?')[0] === from.split('?')[0] && targetNorm.split('?')[0] !== from.split('?')[0];

    if (pathnameUnchanged || (inShell && current !== targetNorm)) {
      assignPath(from, targetPath);
    }
  }, NAV_VERIFY_MS);
}

/** Navigate into or within the kid shell from family portal entry points. */
export function kidShellAwareNavigate(
  navigate: NavigateFunction,
  to: To,
  options: KidShellNavigateOptions = {},
): void {
  const from = currentPath();
  const targetNorm = normalizePath(resolveAbsolutePath(to));

  if (isKidPlayShellPath(from) || isKidPlayShellPath(targetNorm)) {
    kidPlayShellNavigate(navigate, to, options);
    return;
  }

  navigate(to, { replace: options.replace, state: options.state });
}
