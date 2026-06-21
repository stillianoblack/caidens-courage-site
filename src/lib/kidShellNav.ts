import type { NavigateFunction, To } from 'react-router-dom';
import { isKidPlayShellPath, parseKidPlayShellPath } from './kidPlayShellRoutes';
import { clearPageTransitionOverlay, navigateWithPageTransition } from './pageTransition';
import { logNavTest } from './portalClickDebug';

export type KidShellNavigateOptions = {
  replace?: boolean;
  state?: unknown;
  /** Skip router attempt and load the route directly. */
  forceAssign?: boolean;
};

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

export function resolveKidShellNavigationMethod(from: string, to: string): 'router' | 'assign' {
  return isKidPlayShellPath(from) || isKidPlayShellPath(to) ? 'assign' : 'router';
}

/** Same play session tab/module changes must hard-load immediately — no transition delay. */
export function shouldUseImmediateShellAssign(from: string, to: string): boolean {
  const fromCtx = parseKidPlayShellPath(from);
  const toCtx = parseKidPlayShellPath(to);
  return Boolean(fromCtx && toCtx && fromCtx.sessionId === toCtx.sessionId);
}

function assignPath(
  from: string,
  targetPath: string,
  mode: 'assign' | 'replace' = 'assign',
): void {
  const targetNorm = normalizePath(targetPath);
  logKidShellNav(from, targetNorm, 'assign');
  logNavTest(from, targetNorm, { method: 'assign', scope: 'kid-shell' });

  if (typeof window === 'undefined') return;

  const href = new URL(targetPath, window.location.origin).href;

  if (shouldUseImmediateShellAssign(from, targetNorm)) {
    clearPageTransitionOverlay();
    if (mode === 'replace') {
      window.location.replace(href);
      return;
    }
    window.location.assign(href);
    return;
  }

  navigateWithPageTransition(targetPath, mode);
}

/**
 * Reliable navigation for kid play shell actions.
 * The kid shell crosses several lazy portal/game panels. In production, soft
 * router transitions can leave the visible shell on stale content until a
 * manual refresh. Shell actions therefore load the final URL directly.
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
  const method = resolveKidShellNavigationMethod(from, targetNorm);
  const assignMode = options.replace ? 'replace' : 'assign';

  if ((inShell || targetInShell) && method === 'router') {
    logKidShellNav(from, targetNorm, method);
    logNavTest(from, targetNorm, { method, scope: 'kid-shell' });
  }

  if (options.forceAssign || method === 'assign') {
    assignPath(from, targetPath, assignMode);
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
      assignPath(from, targetPath, assignMode);
    }
    return;
  }
}

/** Navigate into or within the kid shell from family portal entry points. */
export function kidShellAwareNavigate(
  navigate: NavigateFunction,
  to: To,
  options: KidShellNavigateOptions = {},
): void {
  const from = currentPath();
  const targetNorm = normalizePath(resolveAbsolutePath(to));
  const fromShell = isKidPlayShellPath(from);
  const targetShell = isKidPlayShellPath(targetNorm);

  if (targetShell && !fromShell) {
    kidPlayShellNavigate(navigate, to, { ...options, forceAssign: true });
    return;
  }

  if (fromShell || targetShell) {
    kidPlayShellNavigate(navigate, to, options);
    return;
  }

  navigate(to, { replace: options.replace, state: options.state });
}
