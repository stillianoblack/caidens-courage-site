import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchCurrentFacilitatorSession,
  type FacilitatorSessionResult,
} from '../lib/facilitatorSessionApi';
import { activateSecureFacilitatorSession } from '../lib/facilitatorSessionClient';
import type { ActivePilotProgram } from '../types/pilotProgram';

export type FacilitatorPortalBootState =
  | 'booting'
  | 'ready'
  | 'recoverable_error'
  | 'unauthenticated'
  | 'fatal_error';

export const FACILITATOR_BOOT_MINIMUM_MS = 600;
export const FACILITATOR_BOOT_TIMEOUT_MS = 12000;
export const FACILITATOR_BOOT_EXIT_MS = 240;

type SessionFetcher = () => Promise<FacilitatorSessionResult>;

export function useFacilitatorPortalBoot(
  fetchSession: SessionFetcher = fetchCurrentFacilitatorSession,
) {
  const [state, setState] = useState<FacilitatorPortalBootState>('booting');
  const [program, setProgram] = useState<ActivePilotProgram | null>(null);
  const [attempt, setAttempt] = useState(0);
  const settledAttemptRef = useRef(-1);

  const retry = useCallback(() => {
    setProgram(null);
    setState('booting');
    setAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();
    settledAttemptRef.current = -1;

    const settle = (
      nextState: FacilitatorPortalBootState,
      nextProgram: ActivePilotProgram | null = null,
    ) => {
      if (cancelled || settledAttemptRef.current === attempt) return;
      settledAttemptRef.current = attempt;
      const remaining = Math.max(0, FACILITATOR_BOOT_MINIMUM_MS - (Date.now() - startedAt));
      const commit = () => {
        if (cancelled) return;
        if (nextProgram) {
          activateSecureFacilitatorSession(nextProgram);
          setProgram(nextProgram);
        }
        setState(nextState);
      };
      if (remaining === 0) {
        commit();
      } else {
        window.setTimeout(commit, remaining);
      }
    };

    const timeout = window.setTimeout(
      () => settle('recoverable_error'),
      FACILITATOR_BOOT_TIMEOUT_MS,
    );

    void fetchSession()
      .then((result) => {
        if (result.status === 'authenticated') {
          settle('ready', result.program);
        } else if (result.status === 'unauthenticated') {
          settle('unauthenticated');
        } else {
          settle('recoverable_error');
        }
      })
      .catch(() => settle('recoverable_error'));

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [attempt, fetchSession]);

  return { state, program, retry };
}
