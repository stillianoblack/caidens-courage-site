import { useCallback } from 'react';
import { useLocation, useNavigate, type NavigateFunction, type To } from 'react-router-dom';
import { kidPlayShellNavigate } from '../lib/kidShellNav';
import { isKidPlayShellPath } from '../lib/kidPlayShellRoutes';

export function useKidShellNavigate(): NavigateFunction {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    ((to: To, options?: { replace?: boolean; state?: unknown }) => {
      if (isKidPlayShellPath(location.pathname)) {
        kidPlayShellNavigate(navigate, to, {
          replace: options?.replace,
          state: options?.state,
        });
        return;
      }

      navigate(to, options);
    }) as NavigateFunction,
    [location.pathname, navigate],
  );
}
