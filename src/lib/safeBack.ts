import type { NavigateFunction, NavigateOptions } from 'react-router-dom';
import { shouldUseHistoryBack } from './portalReturnNav';

type SafeBackOptions = {
  replace?: boolean;
  returnPath?: string | null;
  state?: NavigateOptions['state'];
};

/**
 * Navigate back when in-app history is safe; otherwise use an explicit fallback route.
 */
export function safeBack(
  navigate: NavigateFunction,
  fallbackPath: string,
  options?: SafeBackOptions,
): void {
  const returnPath = options?.returnPath ?? null;
  if (shouldUseHistoryBack(returnPath)) {
    navigate(-1);
    return;
  }

  navigate(fallbackPath, {
    replace: options?.replace ?? true,
    state: options?.state,
  });
}
